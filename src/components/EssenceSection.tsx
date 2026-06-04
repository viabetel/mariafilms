import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE, prefersReducedMotion } from '../lib/motion';
import { hasWebGL } from '../lib/webgl';
import type { ShaderQuad } from '../lib/glQuad';

// Overlay (mix-blend: screen) que adiciona LUZ ao vídeo: bloom seletivo das
// altas-luzes, aberração cromática radial e grão. Não re-desenha o vídeo (só o
// brilho extra), então o vídeo + glow CSS seguem como base e fallback.
const ESSENCE_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform float uTime;
  uniform float uScale;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 sampleCover(vec2 uv){
    vec2 res = uResolution, img = uImageSize;
    float s = max(res.x / img.x, res.y / img.y);
    vec2 size = img * s;
    vec2 off = (size - res) * 0.5;
    vec2 c = (uv * res + off) / size;
    c = (c - 0.5) / uScale + 0.5;        // acompanha o dolly (mesma escala do vídeo)
    if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) return vec3(0.0);
    return texture2D(uTexture, c).rgb;
  }

  void main(){
    vec2 dir = vUv - 0.5;
    float ca = 0.003 + 0.010 * dot(dir, dir);  // aberração cresce nas bordas

    // bloom: borra (3x3) e mantém só o que passa do limiar de brilho
    vec3 bloom = vec3(0.0);
    for (int i = -1; i <= 1; i++){
      for (int j = -1; j <= 1; j++){
        vec2 o = vec2(float(i), float(j)) / uResolution * 9.0;
        vec3 s;
        s.r = sampleCover(vUv + o + dir * ca).r;
        s.g = sampleCover(vUv + o).g;
        s.b = sampleCover(vUv + o - dir * ca).b;
        float b = max(0.0, max(s.r, max(s.g, s.b)) - 0.45);
        bloom += s * b;
      }
    }
    bloom /= 9.0;
    bloom *= 2.8;
    bloom = mix(bloom, bloom * vec3(1.12, 0.72, 0.92), 0.35); // leve calor rosado

    float g = max(0.0, hash(vUv * uResolution + uTime) - 0.5) * 0.10; // grão (só clareia)

    gl_FragColor = vec4(max(bloom + g, 0.0), 1.0);
  }
`;

/**
 * ESSÊNCIA — interlúdio emocional.
 *
 * Seção pinada: o vídeo do Efeit Festa brilha ao fundo (blur + bloom + glow
 * rosa). Ao rolar, a "câmera afasta" — o vídeo começa ampliado e desfocado e
 * vai recuando e entrando em foco (dolly-out) — enquanto as frases se renovam,
 * uma de cada vez (sobem + fade).
 */

const PHRASES = [
  'todo filme começa muito antes da câmera ligar.',
  'começa num olhar que recusa o comum.',
  'a gente afasta a lente pra enxergar o todo.',
  'e se aproxima de novo pra eternizar o instante.',
];

const PHRASE_STARTS = [0.05, 0.3, 0.55, 0.78];
const PHRASE_HOLD = 0.18;

export function EssenceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quadRef = useRef<ShaderQuad | null>(null);
  const [useGL] = useState(() => !prefersReducedMotion() && hasWebGL());

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? false : 0.7,
          pin: pinRef.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            // mantém o bloom alinhado ao dolly: mesma escala do vídeo (1.7 → 1.0)
            const q = quadRef.current;
            if (q) q.uniforms.uScale.value = 1.7 - 0.7 * self.progress;
          },
        },
      });

      // shader de brilho sobre o vídeo. A `ogl` é importada SOB DEMANDA (code-
      // split): só baixa quando esta seção realmente vai montar o efeito, então
      // não pesa o carregamento inicial. Cai pro glow CSS se faltar WebGL.
      let disposed = false;
      if (useGL && canvasRef.current && videoRef.current) {
        const video = videoRef.current;
        const build = async () => {
          const { createShaderQuad } = await import('../lib/glQuad');
          if (disposed || !canvasRef.current) return; // a seção já desmontou
          quadRef.current = createShaderQuad(canvasRef.current, {
            fragment: ESSENCE_FRAGMENT,
            uniforms: {
              uScale: { value: 1.7 },
              uImageSize: { value: [video.videoWidth || 1920, video.videoHeight || 1080] },
            },
            textures: [{ name: 'uTexture', source: video, dynamic: true }],
          });
        };
        if (video.readyState >= 2) build();
        else video.addEventListener('loadeddata', build, { once: true });
      }

      // câmera afastando: vídeo recua (scale) e entra em foco (blur diminui)
      if (!reduced) {
        tl.fromTo(
          videoRef.current,
          { scale: 1.7, filter: 'blur(26px) brightness(1.5) saturate(1.35)' },
          { scale: 1.0, filter: 'blur(7px) brightness(1.12) saturate(1.2)', ease: 'none', duration: 1 },
          0,
        );
        tl.fromTo('.essence-glow', { opacity: 0.35 }, { opacity: 0.6, ease: 'none', duration: 1 }, 0);
      }

      // frases que se renovam (frase inteira sobe + fade — sem sobreposição)
      const phraseEls = gsap.utils.toArray<HTMLElement>('.essence-phrase');
      phraseEls.forEach((el, idx) => {
        const line = el.querySelector('.essence-line');
        const start = PHRASE_STARTS[idx];
        gsap.set(el, { autoAlpha: 0 });
        gsap.set(line, { yPercent: 30 });
        tl.to(el, { autoAlpha: 1, duration: 0.03 }, start);
        tl.to(line, { yPercent: 0, duration: 0.07, ease: EASE.reveal }, start);
        if (idx < phraseEls.length - 1) {
          tl.to(el, { autoAlpha: 0, duration: 0.04, ease: EASE.out }, start + PHRASE_HOLD);
          tl.to(line, { yPercent: -18, duration: 0.04, ease: EASE.out }, start + PHRASE_HOLD);
        }
      });

      return () => {
        disposed = true;
        quadRef.current?.dispose();
        quadRef.current = null;
      };
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative h-[420vh] bg-black">
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Vídeo Efeit Festa brilhando ao fundo */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ filter: 'blur(26px) brightness(1.5) saturate(1.35)' }}
        >
          <source src="/reel.webm" type="video/webm" />
          <source src="/reel.mp4" type="video/mp4" />
        </video>

        {/* Brilho cinematográfico (WebGL): bloom + aberração + grão, somados por
            mistura "screen" sobre o vídeo. Some sem WebGL (fica só o glow CSS). */}
        {useGL && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
          />
        )}

        {/* Glow rosa + escurecimento para contraste */}
        <div
          className="essence-glow pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: 'radial-gradient(60% 50% at 50% 45%, rgba(255,0,127,0.35), transparent 70%)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
        />

        {/* Frases que se renovam */}
        {PHRASES.map((p, i) => (
          <div
            key={i}
            className="essence-phrase absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
          >
            <p className="essence-line max-w-4xl font-serif-editorial text-4xl italic lowercase leading-tight text-white md:text-7xl">
              {p}
            </p>
          </div>
        ))}

        {/* HUD discreto de câmera afastando */}
        <div className="absolute bottom-8 left-6 z-20 flex items-center gap-3 font-display-tech text-[10px] uppercase tracking-widest text-white/50 md:left-10">
          <span>dolly out</span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink" />
          <span className="text-white/70">efeit festa</span>
        </div>
      </div>
    </div>
  );
}
