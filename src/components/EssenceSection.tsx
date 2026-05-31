import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { EASE, prefersReducedMotion } from '../lib/motion';

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
  'a gente afasta a lente pra enxergar o todo —',
  'e se aproxima de novo pra eternizar o instante.',
];

const PHRASE_STARTS = [0.05, 0.3, 0.55, 0.78];
const PHRASE_HOLD = 0.18;

export function EssenceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        },
      });

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
          preload="auto"
          style={{ filter: 'blur(26px) brightness(1.5) saturate(1.35)' }}
        >
          <source src="/reel.webm" type="video/webm" />
          <source src="/reel.mp4" type="video/mp4" />
        </video>

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
