import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE, prefersReducedMotion } from '../lib/motion';

/**
 * SEÇÃO DE PROVA SOCIAL — "camadas de profundidade".
 *
 * Várias camadas (.depth-layer) se movem em velocidades diferentes ao rolar
 * (parallax com scrub), criando profundidade de campo: o fundo quase parado,
 * os elementos da frente disparam e flutuam para fora. Por cima, um leve
 * "float" idle (sine yoyo) faz os cards respirarem.
 *
 * Conteúdo é placeholder editável (reels/números) sobre as fotos reais da Maria.
 */

const REELS = [
  { img: '/maria/work-veste.jpg', views: '2.4M', tag: 'se veste' },
  { img: '/maria/work-raso.jpg', views: '1.1M', tag: 'o raso' },
  { img: '/maria/work-brasil.jpg', views: '860K', tag: 'brasil' },
];

const STATS = [
  { n: '+2.4M', l: 'views no último reel' },
  { n: '+180K', l: 'seguidores' },
  { n: '+85', l: 'filmes entregues' },
  { n: '+30', l: 'marcas atendidas' },
];

function PlayBadge() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
      <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
        <path d="M5 4.5v15l13-7.5z" />
      </svg>
    </div>
  );
}

function ReelCard({ img, views, tag, className }: { img: string; views: string; tag: string; className?: string }) {
  return (
    <div className={`float-inner overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/10 ${className ?? ''}`}>
      <div className="relative aspect-[9/16] w-full">
        <img src={img} alt={tag} className="h-full w-full object-cover" style={{ filter: 'contrast(1.05) brightness(0.9)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayBadge />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="font-serif-editorial text-lg italic lowercase text-white">{tag}</span>
          <span className="flex items-center gap-1 font-display-tech text-[10px] text-white/85">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white/85"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z" /></svg>
            {views}
          </span>
        </div>
      </div>
    </div>
  );
}

function Polaroid({ img, caption, className }: { img: string; caption: string; className?: string }) {
  return (
    <div className={`float-inner bg-bone p-2 pb-7 shadow-glass ${className ?? ''}`}>
      <div className="h-full w-full overflow-hidden bg-neutral-800">
        <img src={img} alt={caption} className="h-full w-full object-cover" style={{ filter: 'grayscale(0.2) contrast(1.05)' }} />
      </div>
      <span className="mt-1.5 block text-center font-serif-editorial text-sm italic lowercase text-neutral-700">{caption}</span>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`float-inner flex items-center gap-2 rounded-full bg-black/50 px-4 py-2.5 font-display-tech text-xs text-white shadow-glass ring-1 ring-white/15 backdrop-blur ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function SocialDepth() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      // parallax: cada camada anda numa velocidade (data-speed)
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('.depth-layer').forEach((layer) => {
          const speed = Number(layer.dataset.speed ?? 0);
          gsap.fromTo(
            layer,
            { yPercent: speed * 18 },
            {
              yPercent: -speed * 42,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });

        // float idle sutil nos elementos internos
        gsap.to('.float-inner', {
          y: '+=14',
          rotation: '+=0.6',
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.5, from: 'random' },
        });
      }

      // headline + números entram com reveal
      const title = sectionRef.current!.querySelector('.sd-title');
      if (title) {
        const split = new SplitText(title, { type: 'chars,lines', linesClass: 'mask-line' });
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.02,
          duration: 0.9,
          ease: EASE.reveal,
          scrollTrigger: { trigger: title, start: 'top 80%' },
        });
      }
      gsap.from('.sd-stat', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: EASE.in,
        scrollTrigger: { trigger: '.sd-stats', start: 'top 85%' },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative min-h-[150vh] overflow-hidden bg-black">
      {/* CAMADA 0 — fundo (quase parado) */}
      <div className="depth-layer absolute inset-0" data-speed="0.4">
        <img
          src="/maria/work-veste.jpg"
          alt=""
          className="h-[120%] w-full object-cover"
          style={{ filter: 'grayscale(0.6) contrast(1.1) brightness(0.35)' }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* CAMADA 1 — cards de reel flutuando */}
      <div className="depth-layer pointer-events-none absolute inset-0" data-speed="1.1">
        <ReelCard {...REELS[0]} className="absolute left-[4%] top-[14%] w-36 md:w-44" />
        <ReelCard {...REELS[1]} className="absolute right-[5%] top-[22%] w-32 md:w-40" />
        <ReelCard {...REELS[2]} className="absolute left-[12%] bottom-[10%] w-28 md:w-36" />
      </div>

      {/* CAMADA 2 — polaroids dos bastidores */}
      <div className="depth-layer pointer-events-none absolute inset-0" data-speed="1.7">
        <Polaroid img="/maria/maria-1.jpg" caption="no set" className="absolute right-[10%] bottom-[16%] h-44 w-36 -rotate-6 md:h-52 md:w-44" />
        <Polaroid img="/maria/maria-3.jpg" caption="direção" className="absolute left-[6%] top-[44%] h-36 w-28 rotate-3 md:h-44 md:w-36" />
      </div>

      {/* CAMADA 3 — elementos do Instagram (mais rápidos) */}
      <div className="depth-layer pointer-events-none absolute inset-0" data-speed="2.4">
        <Chip className="absolute left-[40%] top-[12%]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-pink"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5.5 5.5 5.5c2 0 3.5 1.5 6.5 4.5 3-3 4.5-4.5 6.5-4.5 3.5 0 5 3.5 3 7C19 16.65 12 21 12 21z" /></svg>
          24.8k
        </Chip>
        <Chip className="absolute right-[22%] top-[58%]">@mariafilms</Chip>
        <Chip className="absolute left-[20%] top-[70%]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M21 6h-18v12h4v3l4-3h6z" /></svg>
          1.2k comentários
        </Chip>
        <Chip className="absolute right-[14%] top-[10%]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-pink"><path d="M12 1l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" /></svg>
          verificada
        </Chip>
      </div>

      {/* CONTEÚDO CENTRAL */}
      <div className="relative z-10 mx-auto flex min-h-[150vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">// presença & prova</span>
        <h2 className="sd-title mt-4 font-display-tech text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
          não é só<br />portfólio.<br />é audiência.
        </h2>
        <p className="mt-6 max-w-md font-display-tech text-sm lowercase leading-relaxed text-white/70">
          cada filme nasce pra circular. dirigimos pensando no impacto — da tela grande ao scroll do feed.
        </p>

        <div className="sd-stats mt-12 grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="sd-stat flex flex-col items-center">
              <span className="font-display-tech text-4xl font-bold text-white md:text-5xl">{s.n}</span>
              <span className="mt-1 max-w-[110px] font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CAMADA 4 — flare/luz à frente (mais rápida, decorativa) */}
      <div
        className="depth-layer pointer-events-none absolute inset-0 mix-blend-screen"
        data-speed="3"
        style={{
          background:
            'radial-gradient(60% 40% at 70% 20%, rgba(255,0,127,0.18), transparent 60%), radial-gradient(50% 40% at 20% 80%, rgba(120,160,255,0.12), transparent 60%)',
        }}
      />
    </section>
  );
}
