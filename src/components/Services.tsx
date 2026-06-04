import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';

/**
 * FORMATOS — o que dá pra contratar (entregáveis concretos).
 *
 * Diferente do manifesto (que conta o PROCESSO), aqui são os formatos de
 * entrega. Grade de cards com reveal em cascata e hover elegante.
 */

interface Format {
  index: string;
  title: string;
  desc: string;
}

const FORMATS: Format[] = [
  { index: '01', title: 'eventos & shows', desc: 'aftermovies e captação multicâmera com energia de cinema.' },
  { index: '02', title: 'casamentos', desc: 'filme autoral da sua história, sem clichê de videomaker.' },
  { index: '03', title: 'branded content', desc: 'campanhas e comerciais que vendem sem parecer anúncio.' },
  { index: '04', title: 'clipes musicais', desc: 'direção e montagem no ritmo exato da sua faixa.' },
  { index: '05', title: 'documentário', desc: 'narrativas reais com olhar afetivo e tempo de escuta.' },
  { index: '06', title: 'social & reels', desc: 'cortes verticais pensados pro feed e pro algoritmo.' },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const title = sectionRef.current!.querySelector('.sv-title');
      if (title) {
        const split = new SplitText(title, { type: 'words,chars' });
        gsap.from(split.chars, {
          yPercent: 60,
          opacity: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: EASE.reveal,
          scrollTrigger: { trigger: title, start: 'top 85%' },
        });
      }
      gsap.from('.sv-card', {
        y: 50,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: EASE.in,
        scrollTrigger: { trigger: '.sv-grid', start: 'top 82%' },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="servicos" ref={sectionRef} className="relative z-10 bg-black px-4 py-28 md:px-10 md:py-40">
      <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">o que dá pra criar juntos</span>
          <h2 className="sv-title mt-3 font-serif-editorial text-6xl italic lowercase leading-none text-white md:text-8xl">
            formatos
          </h2>
        </div>
        <p className="max-w-xs font-display-tech text-xs lowercase leading-relaxed text-neutral-500">
          do registro de um evento à campanha de uma marca, sempre com direção de verdade.
        </p>
      </div>

      <div className="sv-grid grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((f) => (
          <div
            key={f.index}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            className="sv-card group relative flex min-h-[220px] cursor-pointer flex-col justify-between overflow-hidden bg-black p-8 transition-colors duration-500 hover:bg-neutral-950 md:min-h-[260px] md:p-10"
          >
            {/* spotlight do cursor */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(255,0,127,0.20), transparent 68%)' }}
            />
            <div className="relative flex items-start justify-between">
              <span className="font-display-tech text-xs text-neutral-600 transition-colors group-hover:text-pink">{f.index}</span>
              <span className="text-neutral-700 transition-all duration-500 group-hover:translate-x-1 group-hover:text-pink">↗</span>
            </div>
            <div className="relative">
              <h3 className="font-serif-editorial text-3xl italic lowercase leading-none text-white transition-colors group-hover:text-pink md:text-4xl">
                {f.title}
              </h3>
              <p className="mt-3 max-w-[260px] font-display-tech text-xs lowercase leading-relaxed text-neutral-500">
                {f.desc}
              </p>
            </div>
            {/* linha de destaque no hover */}
            <span className="absolute bottom-0 left-0 h-px w-0 bg-pink transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
