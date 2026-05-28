import { useEffect, useRef, useState } from 'react';

interface ScrollytellingCanvasProps {
  scrollProgress: number;
  frameCount?: number;
}

export function ScrollytellingCanvas({
  scrollProgress,
  frameCount = 130,
}: ScrollytellingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to hold image elements for the animation loop
  const framesRef = useRef<HTMLImageElement[]>([]);
  // Store target and current frame for interpolation (lerp)
  const animRef = useRef({
    currentFrame: 0,
    targetFrame: 0,
  });
  const isAnimatingRef = useRef(false);

  // Helper to draw image cover
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (iw === 0 || ih === 0) return;
    
    ctx.clearRect(0, 0, w, h);
    
    const isPortrait = w < h;
    
    if (isPortrait) {
      // Lógica intermediária para mobile: garante que a altura seja pelo menos 55% da tela,
      // evitando o corte agressivo do "cover" e a miniatura do "contain".
      const scale = Math.max(w / iw, (h * 0.55) / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      
      ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
    } else {
      // Lógica de "cover" com zoom-out para desktop
      const r = Math.max(w / iw, h / ih);
      
      const cx = (iw - w / r) / 2;
      const cy = (ih - h / r) / 2;
      const cw = w / r;
      const ch = h / r;
      
      const zoomOutFactor = 0.72;
      const dw = w * zoomOutFactor;
      const dh = h * zoomOutFactor;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      
      ctx.drawImage(img, cx, cy, cw, ch, dx, dy, dw, dh);
    }
  };

  // Start the animation loop when scroll updates
  const startAnimating = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        isAnimatingRef.current = false;
        return;
      }

      const ctx = canvas.getContext('2d');
      const frameList = framesRef.current;

      if (ctx && frameList.length > 0) {
        const diff = animRef.current.targetFrame - animRef.current.currentFrame;
        
        // Easing interpolation (0.08 catchup)
        animRef.current.currentFrame += diff * 0.08;

        // Apply a gentle breathing sway to prevent static look when scroll is idle
        const time = performance.now();
        const sway = Math.sin(time / 2200) * 3.2;

        const frameIndex = Math.max(
          0,
          Math.min(frameList.length - 1, Math.round(animRef.current.currentFrame + sway))
        );

        const currentImg = frameList[frameIndex];
        if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
          drawImageCover(ctx, currentImg);
        }

        // Always keep animating to display the idle sway
        requestAnimationFrame(render);
      } else {
        isAnimatingRef.current = false;
      }
    };

    requestAnimationFrame(render);
  };

  // Pre-load static frames on mount (as lightweight HTMLImageElements)
  useEffect(() => {
    let active = true;

    const loadFrames = async () => {
      try {
        const concurrency = 20;
        const results = new Array(frameCount);
        let loadedCount = 0;

        const loadFile = async (index: number) => {
          // Map index (0 to frameCount-1) uniformly across 259 frames (1 to 259)
          const frameIndex = Math.min(259, Math.round((index / (frameCount - 1)) * 258) + 1);
          const numStr = String(frameIndex).padStart(3, '0');
          const imgUrl = `/frames/frame_${numStr}.webp`;

          const img = new Image();
          img.src = imgUrl;

          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`falha ao carregar frame ${frameIndex}`);
              resolve(); // Resolve anyway
            };
          });

          if (!active) return;

          if (img.complete && img.naturalWidth > 0) {
            results[index] = img;
          }
          loadedCount++;
        };

        // Worker queue
        const indices = [...Array(frameCount).keys()];
        const worker = async () => {
          while (indices.length > 0 && active) {
            const idx = indices.shift()!;
            await loadFile(idx);
          }
        };

        // Run in parallel
        await Promise.all(Array(concurrency).fill(null).map(worker));

        if (active) {
          framesRef.current = results.filter((b): b is HTMLImageElement => !!b);
          // Draw initial frame once loaded
          setTimeout(() => {
            startAnimating();
          }, 50);
        }
      } catch (err) {
        console.error('erro ao carregar frames estáticos:', err);
        if (active) {
          setError(err instanceof Error ? err.message : 'erro ao carregar frames');
        }
      }
    };

    loadFrames();

    return () => {
      active = false;
      framesRef.current = [];
    };
  }, [frameCount]);

  // Update target frame when scrollProgress changes
  useEffect(() => {
    const target = scrollProgress * (frameCount - 1);
    animRef.current.targetFrame = target;
    
    startAnimating();
  }, [scrollProgress, frameCount]);

  // Handle canvas sizing and resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      startAnimating();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fallback wireframe rendering in case of error
  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Rotating lens aperture wireframe */}
        <div
          className="relative w-64 h-64 md:w-96 md:h-96 opacity-25"
          style={{
            transform: `rotate(${scrollProgress * 360}deg) scale(${1 + scrollProgress * 0.15})`,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white" strokeWidth="0.5">
            <circle cx="50" cy="50" r="45" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="35" />
            <circle cx="50" cy="50" r="25" />
            <circle cx="50" cy="50" r="10" strokeDasharray="1,1" />
            <path d="M 50 15 L 68 35 M 68 35 L 75 65 M 75 65 L 50 85 M 50 85 L 25 65 M 25 65 L 32 35 M 32 35 L 50 15" />
          </svg>
        </div>

        <div className="absolute bottom-24 text-center">
          <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-display-tech">
            [ rotação de câmera (fallback wireframe) ]
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover opacity-60 mix-blend-screen"
        style={{ filter: 'grayscale(1) contrast(1.1)' }}
      />
    </div>
  );
}
