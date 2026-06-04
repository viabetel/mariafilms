import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';

/**
 * SOBRE — a pessoa por trás da câmera.
 *
 * Retrato em parallax + uma declaração pessoal e curta. Foco no humano e no
 * ponto de vista — sem repetir os números já mostrados na seção social.
 */
export function Editorial() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.ab-portrait',
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
      gsap.fromTo(
        '.ab-portrait-wrap',
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: EASE.camera,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        },
      );

      const name = sectionRef.current!.querySelector('.ab-name');
      if (name) {
        const split = new SplitText(name, { type: 'words,chars' });
        gsap.from(split.chars, {
          yPercent: 80,
          opacity: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: EASE.reveal,
          scrollTrigger: { trigger: name, start: 'top 85%' },
        });
      }
      gsap.from('.ab-fade', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: EASE.in,
        scrollTrigger: { trigger: '.ab-copy', start: 'top 82%' },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="sobre" ref={sectionRef} className="relative z-10 overflow-hidden bg-neutral-950 px-4 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* Retrato */}
        <div className="md:col-span-5">
          <div className="ab-portrait-wrap relative h-[440px] overflow-hidden rounded-3xl ring-1 ring-white/10 md:h-[620px]">
            <img
              src="/maria/maria-2.jpg"
              alt="Maria Eduarda"
              loading="lazy"
              decoding="async"
              className="ab-portrait absolute inset-0 h-[124%] w-full object-cover"
              style={{ filter: 'grayscale(0.25) contrast(1.05)' }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
            <span className="absolute bottom-6 left-6 font-display-tech text-[10px] uppercase tracking-hud text-white/70">
              maria eduarda · diretora & fotógrafa
            </span>
          </div>
        </div>

        {/* Declaração */}
        <div className="ab-copy md:col-span-7 md:pl-8">
          <span className="ab-fade font-display-tech text-[10px] uppercase tracking-hud text-pink">quem dirige</span>
          <h2 className="ab-name mt-4 font-serif-editorial text-5xl italic lowercase leading-[0.9] text-bone md:text-7xl">
            prazer, maria.
          </h2>

          <p className="ab-fade mt-8 max-w-lg font-display-tech text-base leading-relaxed text-neutral-300 md:text-lg">
            diretora, videomaker, storymaker e fotógrafa. transformo encontros, marcas
            e histórias em filme, sempre atrás do instante que ninguém mais viu.
          </p>
          <p className="ab-fade mt-5 max-w-lg font-display-tech text-sm leading-relaxed text-neutral-500">
            não acredito em fórmula. cada projeto começa de uma escuta: o que essa
            história precisa sentir? a técnica vem depois, a serviço da emoção.
          </p>

          <div className="ab-fade mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 font-display-tech text-[11px] uppercase tracking-widest text-neutral-400">
            <span>juiz de fora · mg</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="text-pink">agenda 2026 / 2027</span>
          </div>

          <p className="ab-fade mt-10 font-serif-editorial text-3xl italic lowercase text-white/90">
            “eu não registro o momento. eu o esculpo.”
          </p>
        </div>
      </div>
    </section>
  );
}
