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
  
  // Ref to hold frames for the animation loop
  const framesRef = useRef<ImageBitmap[]>([]);
  // Store target and current frame for interpolation (lerp)
  const animRef = useRef({
    currentFrame: 0,
    targetFrame: 0,
  });

  // Pre-load static frames on mount
  useEffect(() => {
    let active = true;

    const loadFrames = async () => {
      try {
        const concurrency = 20;
        const results = new Array(frameCount);
        let loadedCount = 0;

        const loadFile = async (index: number) => {
          const i = index + 1;
          const numStr = String(i).padStart(3, '0');
          const imgUrl = `/frames/frame_${numStr}.webp`;

          const img = new Image();
          img.src = imgUrl;

          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`falha ao carregar frame ${i}`);
              resolve(); // Resolve anyway to avoid blocking the queue
            };
          });

          if (!active) return;

          // Only create bitmap if image loaded successfully
          if (img.complete && img.naturalWidth > 0) {
            try {
              const bitmap = await createImageBitmap(img);
              results[index] = bitmap;
            } catch (bitmapErr) {
              console.warn(`falha ao criar bitmap para o frame ${i}`, bitmapErr);
            }
          }

          loadedCount++;
        };

        // Create workers that pull indexes from a shared queue
        const indices = [...Array(frameCount).keys()];
        const worker = async () => {
          while (indices.length > 0 && active) {
            const idx = indices.shift()!;
            await loadFile(idx);
          }
        };

        // Start all workers in parallel
        await Promise.all(Array(concurrency).fill(null).map(worker));

        if (active) {
          // Keep only successfully loaded bitmaps
          framesRef.current = results.filter((b): b is ImageBitmap => !!b);
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
      // Clean up bitmaps
      framesRef.current.forEach((bitmap) => bitmap.close());
    };
  }, [frameCount]);

  // Update target frame when scrollProgress changes
  useEffect(() => {
    let target;
    if (scrollProgress <= 0.5) {
      // 0.0 -> 0.5 maps to 0 -> frameCount - 1
      target = (scrollProgress / 0.5) * (frameCount - 1);
    } else {
      // 0.5 -> 1.0 maps to frameCount - 1 -> 0
      target = ((1.0 - scrollProgress) / 0.5) * (frameCount - 1);
    }
    animRef.current.targetFrame = target;
  }, [scrollProgress, frameCount]);

  // Animate and draw loop
  useEffect(() => {
    let animationFrameId: number;
    
    const drawImageCover = (
      ctx: CanvasRenderingContext2D,
      img: ImageBitmap
    ) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const iw = img.width;
      const ih = img.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const isPortrait = w < h;
      
      if (isPortrait) {
        // Lógica de "contain" para mobile: ajusta pela largura da tela sem cortar as laterais
        const scale = (w * 0.94) / iw;
        const dw = w * 0.94;
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

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      const frameList = framesRef.current;

      if (ctx && frameList.length > 0) {
        // Smoothly interpolate current frame index towards the target
        const diff = animRef.current.targetFrame - animRef.current.currentFrame;
        // 0.08 creates a premium, slow-catching easing effect
        animRef.current.currentFrame += diff * 0.08;

        // Clamp the frame index
        const frameIndex = Math.max(
          0,
          Math.min(frameList.length - 1, Math.round(animRef.current.currentFrame))
        );

        const currentImg = frameList[frameIndex];
        if (currentImg) {
          drawImageCover(ctx, currentImg);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fallback rendering se houver erro ao carregar frames
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
