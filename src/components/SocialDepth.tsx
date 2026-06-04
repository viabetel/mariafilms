import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap';
import { EASE, prefersReducedMotion } from '../lib/motion';

/**
 * ATO DE PRESENÇA SOCIAL — três tempos, do impacto à prova concreta.
 *
 * 1) HERO em camadas de profundidade: várias camadas (.depth-layer) andam em
 *    velocidades diferentes ao rolar (parallax com scrub), criando profundidade
 *    de campo; por cima, um "float" idle leve faz os cards respirarem.
 * 2) MURAL DE REELS: a "aba reels" — grade de vídeos 9:16 com play + views; no
 *    desktop o vídeo toca ao passar o mouse.
 * 3) FAIXA DE MARCAS: marquee horizontal de quem já confiou.
 *
 * Conteúdo é placeholder editável (reels/números/marcas) sobre as fotos reais
 * da Maria — recebe os dados reais depois.
 */

const REELS = [
  { img: '/maria/work-veste.jpg', views: '2.4M', tag: 'se veste' },
  { img: '/maria/work-raso.jpg', views: '1.1M', tag: 'o raso' },
  { img: '/maria/work-brasil.jpg', views: '860K', tag: 'brasil' },
];

const STATS = [
  { n: '5 mil', l: 'views' },
  { n: '+1800', l: 'seguidores' },
  { n: '100', l: 'filmes entregues' },
  { n: '100', l: 'marcas atendidas' },
];

// Placeholder — trocar pelos nomes/logos reais das marcas (ver formulário).
const BRANDS = [
  'estúdio norte',
  'casa videira',
  'label prisma',
  'coletivo aurora',
  'optikal',
  'rosa records',
  'fábrica 9',
  'marca viva',
];

function PlayBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={`flex items-center justify-center rounded-full bg-black/35 ${box}`}>
      <svg viewBox="0 0 24 24" className={`ml-0.5 fill-white ${icon}`}>
        <path d="M5 4.5v15l13-7.5z" />
      </svg>
    </div>
  );
}

function ViewCount({ views, className }: { views: string; className?: string }) {
  return (
    <span className={`flex items-center gap-1 font-display-tech text-[10px] text-white/85 ${className ?? ''}`}>
      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white/85">
        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z" />
      </svg>
      {views}
    </span>
  );
}

function ReelCard({ img, views, tag, className }: { img: string; views: string; tag: string; className?: string }) {
  return (
    <div className={`float-inner overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/10 ${className ?? ''}`}>
      <div className="relative aspect-[9/16] w-full">
        <img src={img} alt={tag} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: 'contrast(1.05) brightness(0.9)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayBadge />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="font-serif-editorial text-lg italic lowercase text-white">{tag}</span>
          <ViewCount views={views} />
        </div>
      </div>
    </div>
  );
}

function Polaroid({ img, caption, className }: { img: string; caption: string; className?: string }) {
  return (
    <div className={`float-inner bg-bone p-2 pb-7 shadow-glass ${className ?? ''}`}>
      <div className="h-full w-full overflow-hidden bg-neutral-800">
        <img src={img} alt={caption} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ filter: 'grayscale(0.2) contrast(1.05)' }} />
      </div>
      <span className="mt-1.5 block text-center font-serif-editorial text-sm italic lowercase text-neutral-700">{caption}</span>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`float-inner flex items-center gap-2 rounded-full bg-black/65 px-4 py-2.5 font-display-tech text-xs text-white shadow-glass ring-1 ring-white/15 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function SocialDepth() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      if (!reduced) {
        // parallax das camadas: amplitude MENOR + scrub suave (não reage a cada
        // evento bruto de scroll). Tira o "estouro" e alivia a pintura por frame.
        // Escopado ao HERO (não à seção inteira, que agora é bem mais alta).
        gsap.utils.toArray<HTMLElement>('.depth-layer').forEach((layer) => {
          const speed = Number(layer.dataset.speed ?? 0);
          gsap.fromTo(
            layer,
            { yPercent: speed * 6 },
            {
              yPercent: -speed * 14,
              ease: 'none',
              scrollTrigger: { trigger: heroRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
            },
          );
        });

        // fundo desfocado: parallax leve no PARENT; o blur fica num filho
        // promovido a layer (translateZ), então o transform só MOVE o bitmap já
        // borrado em vez de re-desfocar a cada frame (era o maior gargalo).
        gsap.fromTo(
          '.sd-bg',
          { yPercent: -4 },
          { yPercent: 4, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 } },
        );

        // ENTRADA coreografada: os elementos das camadas revelam em cascata
        // quando a seção entra (antes apareciam cedo e sem ordem).
        gsap.from('.float-inner', {
          autoAlpha: 0,
          scale: 0.9,
          duration: 0.7,
          ease: EASE.in,
          stagger: { each: 0.07, from: 'random' },
          scrollTrigger: { trigger: heroRef.current, start: 'top 72%' },
        });

        // idle float só ENQUANTO o hero está na tela (pausa fora = zero custo
        // ocioso). Antes rodava pra sempre, mesmo longe da viewport.
        const idle = gsap.to('.float-inner', {
          y: '+=10',
          rotation: '+=0.5',
          duration: 3.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.5, from: 'random' },
          paused: true,
        });
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
        });
      }

      // headline + números entram com reveal
      const title = sectionRef.current!.querySelector('.sd-title');
      if (title) {
        const split = new SplitText(title, { type: 'words,chars,lines', linesClass: 'mask-line' });
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

      // faixas cruzadas de marcas entram juntas
      gsap.from('.sd-marquee', {
        autoAlpha: 0,
        duration: 0.9,
        ease: EASE.in,
        scrollTrigger: { trigger: '.sd-marquee', start: 'top 92%' },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black">
      {/* ====================== 1) HERO EM PROFUNDIDADE ====================== */}
      <div ref={heroRef} className="relative min-h-[150vh]">
        {/* CAMADA 0 — fundo desfocado (uma cópia só, blur CACHEADO). O parallax fica
            no parent `.sd-bg`; o blur fica no filho promovido a layer (translateZ),
            então mover não re-desfoca. inset negativo dá overscan pro parallax. */}
        <div className="sd-bg absolute inset-0 z-0" style={{ willChange: 'transform' }}>
          <div
            className="absolute inset-[-6%] bg-center bg-cover bg-no-repeat md:bg-[length:auto_140%]"
            style={{ backgroundImage: "url('/maria/work-veste-blur.webp')", filter: 'grayscale(0.6) contrast(1.1) brightness(0.4) blur(14px)', transform: 'translateZ(0)' }}
          />
        </div>
        <div className="absolute inset-0 z-0 bg-black/45" />

        {/* CAMADA 1 — cards de reel flutuando (menores e mais nas bordas no mobile) */}
        <div className="depth-layer pointer-events-none absolute inset-0" data-speed="1.1">
          <ReelCard {...REELS[0]} className="absolute left-[2%] top-[7%] w-24 md:left-[4%] md:top-[14%] md:w-44" />
          <ReelCard {...REELS[1]} className="absolute right-[2%] top-[8%] w-20 md:right-[5%] md:top-[22%] md:w-40" />
          <ReelCard {...REELS[2]} className="absolute bottom-[5%] left-[3%] w-24 md:left-[12%] md:bottom-[10%] md:w-36" />
        </div>

        {/* CAMADA 2 — polaroids dos bastidores (só desktop: pesam demais no mobile) */}
        <div className="depth-layer pointer-events-none absolute inset-0" data-speed="1.7">
          <Polaroid img="/maria/maria-1.jpg" caption="no set" className="absolute right-[10%] bottom-[16%] hidden h-44 w-36 -rotate-6 md:block md:h-52 md:w-44" />
          <Polaroid img="/maria/maria-3.jpg" caption="direção" className="absolute left-[6%] top-[44%] hidden h-36 w-28 rotate-3 md:block md:h-44 md:w-36" />
        </div>

        {/* CAMADA 3 — elementos do Instagram (mais rápidos; 2 deles só no desktop) */}
        <div className="depth-layer pointer-events-none absolute inset-0" data-speed="2.4">
          <Chip className="absolute left-[5%] top-[3%] md:left-[40%] md:top-[12%]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-pink"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5.5 5.5 5.5c2 0 3.5 1.5 6.5 4.5 3-3 4.5-4.5 6.5-4.5 3.5 0 5 3.5 3 7C19 16.65 12 21 12 21z" /></svg>
            24.8k
          </Chip>
          <Chip className="absolute hidden md:flex md:right-[22%] md:top-[58%]">@mariaubaldino.films</Chip>
          <Chip className="absolute hidden md:flex md:left-[20%] md:top-[70%]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M21 6h-18v12h4v3l4-3h6z" /></svg>
            1.2k comentários
          </Chip>
          <Chip className="absolute right-[4%] bottom-[6%] md:right-[14%] md:top-[10%] md:bottom-auto">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-pink"><path d="M12 1l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" /></svg>
            verificada
          </Chip>
        </div>

        {/* CONTEÚDO CENTRAL */}
        <div className="relative z-10 mx-auto flex min-h-[150vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
          <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">presença & prova</span>
          <h2 className="sd-title mt-4 font-display-tech text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter text-white md:text-7xl">
            não é só<br />portfólio.<br />é audiência.
          </h2>
          <p className="mt-6 max-w-md font-display-tech text-sm lowercase leading-relaxed text-white/70">
            cada filme nasce pra circular. dirigimos pensando no impacto, da tela grande ao scroll do feed.
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

        {/* CAMADA 4 — flare/luz à frente (decorativa). Só desktop: no mobile o
            mix-blend-screen numa camada que ainda translada no parallax força
            recomposição da tela toda e engasga o scroll. */}
        <div
          className="depth-layer pointer-events-none absolute inset-0 mix-blend-screen hidden md:block"
          data-speed="1.4"
          style={{
            background:
              'radial-gradient(60% 40% at 70% 20%, rgba(255,0,127,0.12), transparent 60%), radial-gradient(50% 40% at 20% 80%, rgba(120,160,255,0.08), transparent 60%)',
          }}
        />
      </div>

      {/* =================== FITAS DE MARCAS CRUZADAS ====================== */}
      {/* Duas FITAS pretas se atravessam em X: ângulos e sentidos opostos. Cada
          fita é uma barra preta sólida com borda fina e sombra; a de cima cobre
          a de baixo no cruzamento, então o texto nunca colide (fica "feito").
          Bloco PRÓPRIO no fim da seção (sem sobrepor o conteúdo), com folga em
          cima e embaixo. Fontes premium do Fontshare (Boska + Switzer). */}
      <div className="sd-marquee relative z-10 bg-black pb-20 pt-16 md:pb-28 md:pt-24">
        <p className="mb-8 text-center font-display-tech text-[10px] uppercase tracking-hud text-neutral-500 md:mb-12">
          marcas & artistas que já confiaram
        </p>

        <div className="relative flex h-[220px] items-center justify-center overflow-hidden md:h-[300px]">
          {/* brilho rosa no ponto de cruzamento (peeks nos cantos) */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[55vw] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,0,127,0.18), transparent 70%)' }}
          />

          {/* FITA A (embaixo) — Boska (serifa de alto contraste), gira -7°,
              rola pra esquerda. Hairline e peso normal = bem fina e elegante. */}
          <div className="absolute left-1/2 top-1/2 z-[1] w-[200vw] -translate-x-1/2 -translate-y-1/2 -rotate-[7deg]">
            <div className="border-y border-white/10 bg-black py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] md:py-2">
              <div className="flex w-max sd-marquee-track">
                {[0, 1].map((dup) => (
                  <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                    {BRANDS.map((b) => (
                      <li key={b} className="whitespace-nowrap px-8 font-boska text-xl font-normal lowercase text-white md:px-12 md:text-3xl">
                        {b}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>

          {/* FITA B (em cima) — Switzer (grotesco), maiúscula e bem espaçada,
              peso leve, gira +7°, rola pra direita. */}
          <div className="absolute left-1/2 top-1/2 z-[2] w-[200vw] -translate-x-1/2 -translate-y-1/2 rotate-[7deg]">
            <div className="border-y border-white/10 bg-black py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] md:py-2">
              <div className="flex w-max sd-marquee-track-rev">
                {[0, 1].map((dup) => (
                  <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                    {BRANDS.map((b) => (
                      <li
                        key={b}
                        className="whitespace-nowrap px-8 font-switzer text-base font-light uppercase tracking-[0.28em] text-white md:px-12 md:text-2xl"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
