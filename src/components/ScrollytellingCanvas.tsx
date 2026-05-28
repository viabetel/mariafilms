import { useEffect, useRef, useState } from 'react';

interface ScrollytellingCanvasProps {
  scrollProgress: number;
  frameCount?: number;
}

export function ScrollytellingCanvas({
  scrollProgress,
  frameCount = 259,
}: ScrollytellingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    const tempFrames: ImageBitmap[] = [];

    const loadFrames = async () => {
      try {
        for (let i = 1; i <= frameCount; i++) {
          if (!active) break;
          // Format number as zero-padded 3-digit (e.g. 001, 002, ..., 259)
          const numStr = String(i).padStart(3, '0');
          const imgUrl = `/frames/frame_${numStr}.jpg`;

          const img = new Image();
          img.src = imgUrl;

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`erro ao carregar o frame ${i}`));
          });

          // Grab the image as an ImageBitmap
          const bitmap = await createImageBitmap(img);
          tempFrames.push(bitmap);
          setLoadingProgress(Math.round((i / frameCount) * 100));
        }

        if (active) {
          framesRef.current = tempFrames;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('erro ao carregar frames estáticos:', err);
        if (active) {
          setError(err instanceof Error ? err.message : 'erro ao carregar frames');
          setIsLoading(false);
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
    animRef.current.targetFrame = scrollProgress * (frameCount - 1);
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
      
      const r = Math.max(w / iw, h / ih);
      
      const cx = (iw - w / r) / 2;
      const cy = (ih - h / r) / 2;
      const cw = w / r;
      const ch = h / r;
      
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
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
  }, [isLoading]);

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
          <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-mono">
            [ rotação de câmera (fallback wireframe) ]
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-8 w-8 text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs tracking-widest text-neutral-400 uppercase font-mono">
              carregando experiência ({loadingProgress}%)
            </span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover opacity-60 mix-blend-screen"
        style={{ filter: 'grayscale(1) contrast(1.1)' }}
      />
    </div>
  );
}
