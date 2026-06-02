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
    // 1) o conteúdo da claquete some
    tl.to('.loader-content', { autoAlpha: 0, duration: 0.5, ease: EASE.out }, 0.3)
      // 2) ÍRIS REAL: a máscara radial abre um furo crescente que revela o
      //    site por baixo (em vez do antigo círculo preto-sobre-preto, invisível)
      .to(rootRef.current, { '--iris': '160%', duration: 1.25, ease: EASE.camera }, 0.45)
      // 3) anel de lente acompanhando a borda do diafragma
      .fromTo(
        apertureRef.current,
        { scale: 0, opacity: 0.9 },
        { scale: 26, opacity: 0, duration: 1.25, ease: EASE.camera },
        0.45,
      )
      .set(rootRef.current, { display: 'none' });
  }, [done]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{
        // a íris (--iris) controla o raio do furo transparente na máscara;
        // começa em 0% (tudo preto) e abre revelando o site por baixo.
        ['--iris' as string]: '0%',
        WebkitMaskImage:
          'radial-gradient(circle at 50% 50%, transparent var(--iris), #000 calc(var(--iris) + 2%))',
        maskImage:
          'radial-gradient(circle at 50% 50%, transparent var(--iris), #000 calc(var(--iris) + 2%))',
      }}
    >
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

      {/* Anel de lente que expande junto com a íris (borda do diafragma) */}
      <div
        ref={apertureRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/60"
        style={{ transform: 'scale(0)', boxShadow: '0 0 24px 2px rgba(255,0,127,0.45)' }}
      />
    </div>
  );
}
