import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { loadFrames, onFramesProgress } from '../lib/frames';
import { EASE, prefersReducedMotion } from '../lib/motion';

/**
 * Abertura editorial e sóbria: só o wordmark "maria films" e uma linha fina que
 * enche conforme a pré-carga real dos frames avança. Sem porcentagem, sem HUD,
 * sem jargão. Ao terminar, o painel preto sobe como uma cortina e revela o site.
 */
export function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Dispara a pré-carga e escuta o progresso.
  useEffect(() => {
    const off = onFramesProgress((loaded, total) => {
      setProgress(loaded / total);
    });
    loadFrames().then(() => setDone(true));
    return off;
  }, []);

  // Entrada do wordmark (sobe suave) ao montar.
  useGSAP(() => {
    gsap.from('.loader-mark', { y: 20, autoAlpha: 0, duration: 1.1, ease: EASE.in, delay: 0.1 });
    gsap.from('.loader-track', { autoAlpha: 0, duration: 1, ease: EASE.in, delay: 0.45 });
  }, []);

  // A linha acompanha o progresso real, sem saltos (transform = barato).
  useGSAP(() => {
    gsap.to(barRef.current, { scaleX: progress, duration: 0.6, ease: EASE.micro });
  }, [progress]);

  // Conclusão: completa a linha, o conteúdo sai e a cortina preta sobe.
  useGSAP(() => {
    if (!done) return;
    if (prefersReducedMotion()) {
      onComplete();
      return;
    }
    const tl = gsap.timeline({ onComplete });
    tl.to(barRef.current, { scaleX: 1, duration: 0.45, ease: EASE.out })
      .to('.loader-content', { autoAlpha: 0, y: -14, duration: 0.6, ease: EASE.out }, '+=0.2')
      .to(rootRef.current, { yPercent: -100, duration: 1, ease: EASE.camera }, '-=0.15')
      .set(rootRef.current, { display: 'none' });
  }, [done]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="loader-content flex flex-col items-center">
        <h1 className="loader-mark select-none font-serif-editorial text-5xl italic lowercase leading-none tracking-tight md:text-7xl">
          <span className="text-white">maria</span>
          <span className="text-pink"> films</span>
        </h1>
        <div className="loader-track mt-8 h-px w-40 overflow-hidden bg-white/15 md:mt-10 md:w-56">
          <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-pink" />
        </div>
      </div>
    </div>
  );
}
