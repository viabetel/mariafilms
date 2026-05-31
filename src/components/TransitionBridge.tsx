import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE, prefersReducedMotion } from '../lib/motion';

/**
 * PONTE NARRATIVA entre o ato cinematográfico e a prova social.
 *
 * O "corte final" (uma imagem de filme em tela cheia) se fragmenta em tiras
 * verticais 9:16 — reels — que se espalham e flutuam para fora, revelando o
 * preto. No meio, a frase "da tela grande ao seu feed". A imagem usada é a
 * mesma do fundo da seção social → continuidade perfeita na passagem.
 */

const STRIPS = 7;
const IMG = '/maria/work-veste.jpg';

export function TransitionBridge() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? false : 0.6,
          pin: pinRef.current,
          anticipatePin: 1,
        },
      });

      // leve push-in da imagem inteira (continuidade do movimento de câmera)
      tl.fromTo('.bridge-stage', { scale: 1.12 }, { scale: 1, ease: 'none', duration: 0.4 }, 0);

      // fragmentação: tiras se espalham do centro para fora
      tl.to(
        '.bridge-strip',
        {
          yPercent: (i: number) => (i % 2 === 0 ? -125 : 125),
          rotation: (i: number) => (i % 2 === 0 ? -10 : 10),
          scale: 0.55,
          autoAlpha: 0,
          ease: 'power2.in',
          duration: 0.5,
          stagger: { each: 0.05, from: 'center' },
        },
        0.35,
      );

      // bordas arredondadas surgindo enquanto separa (vira "card de reel")
      tl.to('.bridge-strip', { borderRadius: 18, duration: 0.3 }, 0.35);

      // frase no meio da passagem
      const title = sectionRef.current!.querySelector('.bridge-title');
      if (title) {
        const split = new SplitText(title, { type: 'lines', linesClass: 'mask-line' });
        tl.from(split.lines, { yPercent: 120, opacity: 0, stagger: 0.08, duration: 0.25, ease: EASE.reveal }, 0.4);
      }
      tl.to('.bridge-text', { autoAlpha: 1, duration: 0.15 }, 0.4)
        .to('.bridge-text', { autoAlpha: 0, yPercent: -30, duration: 0.2, ease: EASE.out }, 0.82);
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative h-[240vh] bg-black">
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Palco (escala uniforme no push-in) contendo as tiras verticais
            que, juntas e alinhadas, formam uma única imagem */}
        <div className="bridge-stage absolute inset-0">
          {Array.from({ length: STRIPS }).map((_, i) => {
            const w = 100 / STRIPS;
            return (
              <div
                key={i}
                className="bridge-strip absolute top-0 h-full overflow-hidden ring-1 ring-white/5 will-change-transform"
                style={{ left: `${i * w}vw`, width: `${w}vw`, transformOrigin: 'center' }}
              >
                <div className="absolute inset-0 h-full" style={{ width: '100vw', transform: `translateX(-${i * w}vw)` }}>
                  <img
                    src={IMG}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: 'grayscale(0.5) contrast(1.1) brightness(0.7)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Vinheta para foco no texto */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

        {/* Frase da passagem */}
        <div className="bridge-text absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center opacity-0">
          <span className="mb-4 font-display-tech text-[10px] uppercase tracking-hud text-pink">// o corte final ganha o mundo</span>
          <h2 className="bridge-title font-serif-editorial text-5xl italic lowercase leading-[1.05] text-white md:text-8xl">
            da tela grande<br />ao seu feed
          </h2>
        </div>
      </div>
    </div>
  );
}
