// Fundação mínima de shaders (ogl) — monta um quad de tela cheia num <canvas>
// e roda um fragment shader. É a base dos efeitos WebGL "tasteful" do site
// (dissolve da ponte, retrato 2.5D, brilho da essência).
//
// Princípios:
// - Lazy: só é importado dentro do efeito que o usa (code-splitting do Vite).
// - Seguro: se o WebGL falhar, createShaderQuad() retorna null e o componente
//   cai no visual CSS de sempre. NUNCA quebra a página.
// - Econômico: o loop de render pausa quando o canvas sai da viewport.
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';

const DEFAULT_VERTEX = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export interface TextureSource {
  /** Nome do uniform sampler2D no shader (ex.: 'uTexture'). */
  name: string;
  source: HTMLImageElement | HTMLVideoElement;
  /** true = re-envia para a GPU a cada frame (vídeos). */
  dynamic?: boolean;
}

export interface ShaderQuadOptions {
  fragment: string;
  vertex?: string;
  /** Uniforms extras. uTime e uResolution são injetados automaticamente. */
  uniforms?: Record<string, { value: unknown }>;
  textures?: TextureSource[];
  /** Chamado a cada frame antes do render (para dirigir uniforms). */
  onFrame?: (uniforms: Record<string, { value: unknown }>, time: number) => void;
}

export interface ShaderQuad {
  uniforms: Record<string, { value: unknown }>;
  resize: () => void;
  dispose: () => void;
}

/**
 * Monta um shader de tela cheia no canvas. Retorna null se o WebGL não estiver
 * disponível (o chamador deve então manter o fallback CSS visível).
 */
export function createShaderQuad(
  canvas: HTMLCanvasElement,
  opts: ShaderQuadOptions,
): ShaderQuad | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      // Efeitos de glow/dissolve suaves em mix-blend — dpr 1.5 corta ~45% do
      // custo de fragment (importa no bloom 3×3 da essência) sem perda visível.
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    if (!renderer.gl) return null;
  } catch {
    return null;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const uniforms: Record<string, { value: unknown }> = {
    uTime: { value: 0 },
    uResolution: { value: [canvas.clientWidth, canvas.clientHeight] },
    ...(opts.uniforms ?? {}),
  };

  // Texturas (imagens estáticas ou vídeos dinâmicos).
  const dynamics: { tex: Texture; src: HTMLImageElement | HTMLVideoElement }[] = [];
  for (const t of opts.textures ?? []) {
    const texture = new Texture(gl, {
      image: t.source,
      generateMipmaps: false,
      flipY: true,
    });
    uniforms[t.name] = { value: texture };
    if (t.dynamic) dynamics.push({ tex: texture, src: t.source });
  }

  const program = new Program(gl, {
    vertex: opts.vertex ?? DEFAULT_VERTEX,
    fragment: opts.fragment,
    uniforms,
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    (uniforms.uResolution.value as number[])[0] = w;
    (uniforms.uResolution.value as number[])[1] = h;
  };
  resize();
  // re-mede após o layout assentar (clientWidth pode estar 0/errado na criação)
  requestAnimationFrame(resize);
  window.addEventListener('resize', resize);
  // re-mede sempre que o canvas mudar de tamanho de fato (corrige o aspecto)
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Loop de render — pausa quando o canvas não está visível.
  let raf = 0;
  let running = false;
  const start = performance.now();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const time = (performance.now() - start) / 1000;
    uniforms.uTime.value = time;
    for (const d of dynamics) {
      // vídeo precisa ter um frame disponível antes de subir pra GPU
      const v = d.src as HTMLVideoElement;
      if (v.readyState >= 2) d.tex.image = d.src;
    }
    opts.onFrame?.(uniforms, time);
    renderer.render({ scene: mesh });
  };

  const play = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? play() : pause()),
    { threshold: 0 },
  );
  io.observe(canvas);

  const dispose = () => {
    pause();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('resize', resize);
    const ext = gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  };

  return { uniforms, resize, dispose };
}
