import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { loadFrames, onFramesProgress } from '../lib/frames';
import { EASE, prefersReducedMotion } from '../lib/motion';

/**
 * Loader-claquete: mostra o progresso REAL da pré-carga dos 259 frames de
 * câmera (a sequência que o ato central precisa) e abre como um diafragma de
 * lente quando tudo está pronto.
 */
export function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Dispara a pré-carga e escuta o progresso.
  useEffect(() => {
    const off = onFramesProgress((loaded, total) => {
      setProgress(Math.round((loaded / total) * 100));
    });
    loadFrames().then(() => setDone(true));
    return off;
  }, []);

  // Anima o número de forma contínua, sem saltos por re-render.
  useGSAP(() => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: progress,
      duration: 0.6,
      ease: EASE.micro,
      onUpdate: () => {
        if (pctRef.current) pctRef.current.textContent = String(Math.round(obj.v)).padStart(3, '0');
      },
    });
  }, [progress]);

  // Sequência de abertura quando a carga termina.
  useGSAP(() => {
    if (!done) return;
    if (prefersReducedMotion()) {
      onComplete();
      return;
    }
    const tl = gsap.timeline({ onComplete });
    tl.to('.loader-content', { autoAlpha: 0, duration: 0.5, ease: EASE.out }, 0.3)
      .to(apertureRef.current, { scale: 14, duration: 1.1, ease: EASE.camera }, 0.4)
      .to(rootRef.current, { autoAlpha: 0, duration: 0.5, ease: EASE.out }, 1.1)
      .set(rootRef.current, { display: 'none' });
  }, [done]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="loader-content flex flex-col items-center gap-8">
        <div className="flex items-center gap-3 font-display-tech text-[10px] uppercase tracking-hud text-neutral-500">
          <span>maria films</span>
          <span className="h-1 w-1 animate-pulse rounded-full bg-pink" />
          <span>scene 01 / take 01</span>
        </div>

        <div className="font-display-tech text-7xl font-extrabold tabular-nums tracking-tighter text-white md:text-9xl">
          <span ref={pctRef}>000</span>
          <span className="text-pink">%</span>
        </div>

        <div className="h-px w-48 overflow-hidden bg-neutral-800">
          <div
            className="h-full bg-pink transition-[width] duration-500 ease-in-cine"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="font-display-tech text-[9px] uppercase tracking-hud text-neutral-600">
          carregando sequência de câmera
        </span>
      </div>

      {/* Diafragma que se abre ao final */}
      <div
        ref={apertureRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
        style={{ boxShadow: '0 0 0 100vmax #000', transform: 'scale(0)' }}
      />
    </div>
  );
}
