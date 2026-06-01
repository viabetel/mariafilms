import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';

/**
 * DIFERENCIAIS — grade de features com hover-expand e "reflexo no fundo".
 *
 * Ao passar o cursor sobre uma feature, a foto se expande e uma versão ampliada
 * e desfocada dela toma o fundo da seção (reflexo ambiente), banhando tudo com
 * a cor/luz daquela imagem. As outras features recuam levemente.
 */

interface Feature {
  title: string;
  desc: string;
  img: string;
}

const FEATURES: Feature[] = [
  { title: 'olhar autoral', desc: 'direção com assinatura — nada de fórmula pronta.', img: '/maria/work-veste.jpg' },
  { title: 'feito pra circular', desc: 'cada corte pensado para a tela grande e para o feed.', img: '/maria/work-raso.jpg' },
  { title: 'do conceito à pós', desc: 'uma equipe só, do roteiro ao color grading final.', img: '/maria/work-brasil.jpg' },
  { title: 'set ágil', desc: 'estrutura enxuta, captação rápida, zero burocracia.', img: '/maria/maria-2.jpg' },
];

function FeatureCard({
  feature,
  onEnter,
}: {
  feature: Feature;
  onEnter: (img: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="feat-card group relative cursor-pointer"
      onMouseEnter={() => {
        onEnter(feature.img);
        gsap.to(imgRef.current, { scale: 1.14, duration: 0.7, ease: EASE.micro });
        gsap.to(cardRef.current, { opacity: 1, duration: 0.5, ease: EASE.micro, overwrite: true });
      }}
      onMouseMove={(e) => {
        // spotlight: a luz rosa segue o cursor dentro do card
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
      onMouseLeave={() => {
        // só reseta o zoom da própria foto; o fundo some quando sai da grade
        gsap.to(imgRef.current, { scale: 1, duration: 0.6, ease: EASE.out });
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow duration-500 group-hover:shadow-pink-glow">
        <img
          ref={imgRef}
          src={feature.img}
          alt={feature.title}
          className="h-full w-full object-cover"
          style={{ filter: 'grayscale(0.45) contrast(1.05) brightness(0.8)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* spotlight do cursor */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(255,0,127,0.32), transparent 62%)' }}
        />
        <span className="absolute left-4 top-4 font-display-tech text-[10px] uppercase tracking-hud text-white/50 transition-colors group-hover:text-pink">
          0{FEATURES.indexOf(feature) + 1}
        </span>
      </div>
      <h3 className="mt-5 font-serif-editorial text-2xl italic lowercase leading-none text-white transition-colors group-hover:text-pink md:text-3xl">
        {feature.title}
      </h3>
      <p className="mt-2 max-w-[240px] font-display-tech text-xs lowercase leading-relaxed text-neutral-400">
        {feature.desc}
      </p>
    </div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const title = sectionRef.current!.querySelector('.feat-title');
      if (title) {
        const split = new SplitText(title, { type: 'chars,lines', linesClass: 'mask-line' });
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.02,
          duration: 0.9,
          ease: EASE.reveal,
          scrollTrigger: { trigger: title, start: 'top 85%' },
        });
      }
      gsap.from('.feat-card', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: EASE.in,
        scrollTrigger: { trigger: '.feat-grid', start: 'top 80%' },
      });
    },
    { scope: sectionRef },
  );

  const onEnter = (img: string) => {
    const bg = bgRef.current;
    if (!bg) return;
    bg.src = img;
    gsap.to(bg, { autoAlpha: 0.5, scale: 1.2, duration: 0.9, ease: EASE.micro });
    // escurece todas; a carta em hover se reacende no próprio onMouseEnter
    gsap.to('.feat-card', { opacity: 0.4, duration: 0.5, ease: EASE.micro });
  };
  const onLeave = () => {
    gsap.to(bgRef.current, { autoAlpha: 0, scale: 1, duration: 0.6, ease: EASE.out });
    gsap.to('.feat-card', { opacity: 1, duration: 0.5, ease: EASE.micro });
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black px-4 py-28 md:px-10 md:py-40">
      {/* Reflexo ambiente no fundo (imagem em hover, ampliada e desfocada) */}
      <img
        ref={bgRef}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-0 blur-3xl"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/50" />

      <div className="relative z-10">
        <div className="mb-16">
          <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">// por que a maria films</span>
          <h2 className="feat-title mt-3 font-serif-editorial text-6xl italic lowercase leading-none text-white md:text-8xl">
            diferenciais
          </h2>
        </div>

        <div
          className="feat-grid grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
          onMouseLeave={onLeave}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} onEnter={onEnter} />
          ))}
        </div>
      </div>
    </section>
  );
}
