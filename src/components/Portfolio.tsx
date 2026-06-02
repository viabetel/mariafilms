import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';

/**
 * TRABALHOS — scrollytelling horizontal em camadas (MESMO efeito em todos os
 * tamanhos, inclusive mobile): a seção é pinada e o scroll vertical vira um
 * travelling LATERAL pelos filmes. Cada painel tem profundidade: a foto faz
 * parallax para um lado, o número gigante "fantasma" para o outro, e o texto se
 * revela ao centralizar.
 */

interface Film {
  index: string;
  title: string;
  category: string;
  year: string;
  role: string;
  desc: string;
  media: string;
  video?: boolean;
}

const FILMS: Film[] = [
  { index: '01', title: 'se veste', category: 'moda · editorial', year: '2024', role: 'direção + dop', desc: 'tecido e movimento viram coreografia de luz.', media: '/maria/work-veste.jpg' },
  { index: '02', title: 'o raso não me satisfaz', category: 'clipe musical', year: '2024', role: 'direção + montagem', desc: 'narrativa densa, cortada no ritmo exato da batida.', media: '/maria/work-raso.jpg' },
  { index: '03', title: 'brasil', category: 'documentário', year: '2023', role: 'direção', desc: 'um olhar afetivo sobre território, gente e pertencimento.', media: '/maria/work-brasil.jpg' },
  { index: '04', title: 'efeito festa', category: 'evento · aftermovie', year: '2023', role: 'direção + edição', desc: 'a energia de uma noite condensada em movimento e cor.', media: '/frames/frame_180.webp', video: true },
];

function Panel({ film }: { film: Film }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="tw-panel relative flex h-full w-screen shrink-0 items-center justify-center px-6 md:px-16">
      {/* número gigante "fantasma" (camada de fundo) */}
      <span
        className="tw-ghost pointer-events-none absolute select-none font-display-tech font-extrabold leading-none"
        style={{ fontSize: '46vh', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.06)', zIndex: 0 }}
      >
        {film.index}
      </span>

      <div className="tw-content relative z-[1] grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
        {/* mídia */}
        <div
          className="tw-imgwrap group relative mx-auto aspect-[4/5] w-full max-w-[78vw] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:max-w-sm md:aspect-[3/4] md:max-w-none"
          onMouseEnter={() => videoRef.current?.play().catch(() => {})}
          onMouseLeave={() => videoRef.current?.pause()}
        >
          <img
            src={film.media}
            alt={film.title}
            loading="lazy"
            decoding="async"
            className="tw-img absolute inset-0 h-full w-full scale-[1.15] object-cover"
            style={{ filter: 'grayscale(0.35) contrast(1.05) brightness(0.82)' }}
          />
          {film.video && (
            <video ref={videoRef} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" muted loop playsInline preload="none">
              <source src="/reel.webm" type="video/webm" />
              <source src="/reel.mp4" type="video/mp4" />
            </video>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* texto */}
        <div>
          <div className="flex items-baseline gap-4">
            <span className="font-display-tech text-xs text-pink">{film.index}</span>
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-neutral-400">{film.category}</span>
          </div>
          <h3 className="mt-3 font-serif-editorial text-4xl italic lowercase leading-[0.95] text-white md:text-7xl">
            {film.title}
          </h3>
          <p className="mt-5 max-w-sm font-display-tech text-sm lowercase leading-relaxed text-neutral-300">{film.desc}</p>
          <div className="mt-6 flex items-center gap-6 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">
            <span>{film.year}</span>
            <span className="h-3 w-px bg-white/15" />
            <span>{film.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // título da seção
      const title = sectionRef.current!.querySelector('.pf-title');
      if (title) {
        const split = new SplitText(title, { type: 'words,chars' });
        gsap.from(split.chars, {
          yPercent: 60,
          opacity: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: EASE.reveal,
          scrollTrigger: { trigger: title, start: 'top 90%' },
        });
      }

      // TRAVELLING horizontal pinado — MESMO efeito em qualquer tamanho.
      const track = trackRef.current!;
      const dist = () => track.scrollWidth - window.innerWidth;

      const horiz = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + dist(),
          scrub: 0.6,
          pin: pinRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(FILMS.length, Math.floor(self.progress * FILMS.length) + 1);
            if (counterRef.current) counterRef.current.textContent = String(idx).padStart(2, '0');
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      // parallax interno de cada painel, dirigido pelo travelling
      gsap.utils.toArray<HTMLElement>('.tw-panel').forEach((panel) => {
        gsap.fromTo(
          panel.querySelector('.tw-img'),
          { xPercent: -6, scale: 1.15 },
          { xPercent: 6, scale: 1.15, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: horiz, start: 'left right', end: 'right left', scrub: true } },
        );
        gsap.fromTo(
          panel.querySelector('.tw-ghost'),
          { xPercent: 35 },
          { xPercent: -35, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: horiz, start: 'left right', end: 'right left', scrub: true } },
        );
        gsap.fromTo(
          panel.querySelector('.tw-content'),
          { autoAlpha: 0, y: 50 },
          { autoAlpha: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: panel, containerAnimation: horiz, start: 'left center', end: 'center center', scrub: true } },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="filmes" ref={sectionRef} className="relative z-10 bg-black">
      <div ref={pinRef} className="relative h-screen overflow-hidden">
        {/* Cabeçalho — overlay sobre o travelling */}
        <div className="absolute left-6 top-20 z-20 md:left-16 md:top-24">
          <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">// trabalhos selecionados</span>
          <h2 className="pf-title mt-2 font-serif-editorial text-6xl italic lowercase leading-none text-white md:text-7xl">
            trabalhos
          </h2>
        </div>

        {/* Trilho de painéis */}
        <div ref={trackRef} className="flex h-full flex-row">
          {FILMS.map((film) => (
            <Panel key={film.index} film={film} />
          ))}
        </div>

        {/* HUD: contador + barra de progresso */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 md:bottom-10">
          <span ref={counterRef} className="font-display-tech text-xs tracking-widest text-white">01</span>
          <div className="relative h-[2px] w-24 overflow-hidden rounded-full bg-neutral-800 md:w-32">
            <div ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-pink" />
          </div>
          <span className="font-display-tech text-xs tracking-widest text-neutral-500">0{FILMS.length}</span>
        </div>
      </div>
    </section>
  );
}
