import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap';
import { frameImages, FRAME_COUNT } from '../lib/frames';
import { EASE, prefersReducedMotion } from '../lib/motion';
import { getLenis } from './SmoothScroll';

/**
 * O ATO CENTRAL — uma única tomada de câmera contínua.
 *
 * Uma seção alta é pinada; conforme o usuário rola, o ScrollTrigger faz o
 * "scrub" dos 259 frames da sequência de câmera (renderizados em <canvas>),
 * enquanto sete capítulos de tipografia (o hero + o manifesto de 6 etapas)
 * entram e saem revelados por SplitText. A sensação é a de mover a câmera,
 * não de rolar uma página.
 */

interface Chapter {
  index: string;
  kicker: string;
  title: string;
  body: string;
  lens: string;
}

const CHAPTERS: Chapter[] = [
  {
    index: '01',
    kicker: 'visão',
    title: 'concepção criativa',
    body: 'desenhamos profundidade visual antes mesmo da câmera ligar. cada frame nasce como uma obra única.',
    lens: '24mm f/1.4',
  },
  {
    index: '02',
    kicker: 'roteiro',
    title: 'desenvolvimento',
    body: 'transformamos ideias soltas em arcos dramáticos consistentes e de alta ressonância emocional.',
    lens: '24mm f/1.4',
  },
  {
    index: '03',
    kicker: 'produção',
    title: 'direção criativa',
    body: 'traduzimos conceito em tela: direção de elenco e orquestração de toda a equipe no set.',
    lens: '50mm f/1.2',
  },
];

// Posições (0..1) na timeline scrubada onde cada capítulo do manifesto entra.
const CHAPTER_STARTS = [0.25, 0.50, 0.75];
const HOLD = 0.12; // quanto cada capítulo permanece antes de sair

// Janela de revelação do texto (em progresso). O reveal por caractere PRECISA
// caber aqui dentro, senão a frase aparece pela metade no ponto de descanso.
const REVEAL_DUR = 0.022;
const REVEAL_STAGGER = 0.0013; // ~18 chars → total ≈ 0.044 (< janela visível)

// Pontos de "descanso" do snap: hero (0) + o centro do "hold" de cada capítulo,
// já depois do texto estar 100% revelado. Ao parar de rolar, o scroll desliza
// sozinho para o mais próximo.
const SNAP_POINTS = [0, ...CHAPTER_STARTS.map((s) => s + 0.06)];

export function CinematicAct() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const seq = { frame: 0 };
      // Última imagem efetivamente pintada — evita redesenhar o mesmo frame a
      // cada onUpdate do scrub (o scroll dispara muito mais que 259 vezes).
      let lastDrawn = -1;

      // --- Renderização "cover" com device pixel ratio + leve respiração ---
      const resize = () => {
        // Os frames-fonte têm 1920px de largura; passar de dpr ~1.5 só faria o
        // canvas ficar maior que a fonte (upscale borrado e drawImage mais caro)
        // sem ganho real — os filtros/blur já suavizam. Cap conservador.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastDrawn = -1; // o canvas foi limpo pelo resize → força repintura
        render();
      };

      const render = () => {
        const i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(seq.frame)));
        if (i === lastDrawn) return; // nada mudou → não toca no canvas
        const img = frameImages[i];
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        if (!img) return;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        if (!iw || !ih) return;
        // cover com um leve zoom-out para dar "ar" cinematográfico
        const scale = Math.max(w / iw, h / ih) * 0.92;
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        lastDrawn = i;
      };

      resize();
      window.addEventListener('resize', resize);

      // Recalcula medidas quando as fontes carregam (evita SplitText medindo a
      // largura errada das letras e o pin com altura defasada).
      if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

      // --- Reveal de entrada do hero (não scrubado: acontece ao montar) ---
      const heroTitle = heroRef.current!.querySelector('.cine-hero-title');
      let heroSplit: SplitText | null = null;
      if (heroTitle) {
        heroSplit = new SplitText(heroTitle, { type: 'words,chars,lines', linesClass: 'mask-line' });
        gsap.from(heroSplit.chars, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.03,
          duration: 1,
          ease: EASE.reveal,
          delay: 0.2,
        });
      }
      gsap.from(heroRef.current!.querySelectorAll('.cine-hero-fade'), {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: EASE.in,
        delay: 0.5,
      });

      // --- Timeline mestre scrubada pelo scroll ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: pinRef.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
            if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
          },
        },
      });

      // frame scrub do início ao fim (duração normalizada = 1)
      tl.to(seq, { frame: FRAME_COUNT - 1, ease: 'none', duration: 1, onUpdate: render }, 0);

      // hero sai de cena logo no começo
      tl.to(heroRef.current, { autoAlpha: 0, yPercent: -12, duration: 0.07, ease: EASE.out }, 0.05);

      // capítulos do manifesto entram/saem + lente do HUD acompanha
      const chapterEls = gsap.utils.toArray<HTMLElement>('.cine-chapter');
      chapterEls.forEach((el, idx) => {
        const start = CHAPTER_STARTS[idx];
        const titleEl = el.querySelector('.cine-title');
        const split = titleEl
          ? new SplitText(titleEl, { type: 'words,chars,lines', linesClass: 'mask-line' })
          : null;

        gsap.set(el, { autoAlpha: 0 });
        tl.to(el, { autoAlpha: 1, duration: 0.025 }, start);
        if (split) {
          tl.from(
            split.chars,
            { yPercent: 110, opacity: 0, stagger: REVEAL_STAGGER, duration: REVEAL_DUR, ease: EASE.reveal },
            start,
          );
        }
        tl.from(
          el.querySelectorAll('.cine-fade'),
          { y: 24, opacity: 0, stagger: 0.006, duration: 0.025, ease: EASE.in },
          start + 0.01,
        );
        // atualiza a lente do HUD no início do capítulo
        tl.call(
          () => {
            if (lensRef.current) lensRef.current.textContent = `lente · ${CHAPTERS[idx].lens}`;
          },
          [],
          start,
        );
        // sai de cena (o último permanece até o fim)
        if (idx < chapterEls.length - 1) {
          tl.to(el, { autoAlpha: 0, yPercent: -8, duration: 0.03, ease: EASE.out }, start + HOLD);
        }
      });

      // float idle 3D dos índices "fantasma" (sobem/derivam para dar contraste)
      if (!prefersReducedMotion()) {
        gsap.to('.cine-ghost', {
          yPercent: -16,
          rotateX: 14,
          rotateY: (i: number) => (i % 2 === 0 ? 12 : -12),
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.8, from: 'random' },
        });
      }

      // --- Navegação por etapas (scroll-snapping discreto) ---
      // Enquanto a seção está pinada, cada gesto de scroll puxa a tela
      // EXATAMENTE até o próximo/anterior capítulo (mostrado completo), em vez
      // de um scrub livre onde dá para parar no meio.
      const st = tl.scrollTrigger!;
      const reduced = prefersReducedMotion();

      const nearestIndex = (p: number) => {
        let best = 0;
        let bestDist = Infinity;
        for (let i = 0; i < SNAP_POINTS.length; i++) {
          const d = Math.abs(SNAP_POINTS[i] - p);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        return best;
      };

      // Um gesto = no MÁXIMO um passo. `locked` cobre a animação do snap;
      // `cooling` é a janela de quietude logo depois — é ela que mata a cauda
      // inercial do trackpad/Lenis que antes disparava um passo PRA TRÁS sozinho.
      let locked = false;
      let cooling = false;

      const goToIndex = (idx: number) => {
        const target = st.start + SNAP_POINTS[idx] * (st.end - st.start);
        locked = true;
        cooling = true;
        const settle = () => {
          locked = false;
          // só reabre depois de um respiro sem eventos (a inércia já decaiu)
          window.setTimeout(() => { cooling = false; }, 200);
        };
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(target, {
            duration: 0.9,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            lock: true,
            onComplete: settle,
          });
        } else {
          window.scrollTo({ top: target, behavior: 'smooth' });
          window.setTimeout(settle, 620);
        }
      };

      const step = (dir: 1 | -1) => {
        const cur = nearestIndex(st.progress);
        const target = cur + dir;
        // nas bordas, deixa o scroll seguir para fora da seção
        if (target < 0 || target >= SNAP_POINTS.length) return false;
        // ocupado (animando ou na quietude pós-snap) → engole o gesto, sem agir.
        // Determinístico: nada de "voltar" por causa de evento residual.
        if (locked || cooling) return true;
        goToIndex(target);
        return true;
      };

      const onWheel = (e: WheelEvent) => {
        if (reduced || !st.isActive) return;
        // cauda fraca do gesto: engole sem virar passo (evita micro-disparos)
        const handled = Math.abs(e.deltaY) >= 8 ? step(e.deltaY > 0 ? 1 : -1) : true;
        if (handled) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      };

      let touchY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchY = e.touches[0].clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        if (reduced || !st.isActive) return;
        const dy = touchY - e.touches[0].clientY;
        if (Math.abs(dy) < 24) return;
        const handled = step(dy > 0 ? 1 : -1);
        if (handled) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      };

      // capture:true + passive:false → corremos ANTES do Lenis e o sobrepomos
      window.addEventListener('wheel', onWheel, { passive: false, capture: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions);
        heroSplit?.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative h-[540vh] bg-black">
      {/* Viewport pinado */}
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Sequência de câmera */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ filter: 'contrast(1.06) saturate(0.92) brightness(0.9)' }}
        />
        {/* Gradiente para legibilidade do texto */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* HERO (capítulo 00) */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          style={{ perspective: '1200px' }}
        >
          <div className="cine-hero-fade mb-5 flex items-center gap-2">
            <span className="font-display-tech text-[10px] font-semibold uppercase tracking-hud text-neutral-300">
              maria films
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink shadow-[0_0_6px_#ff007f]" />
          </div>

          <h1 className="cine-hero-title select-none leading-[0.82] tracking-tight">
            <span className="block font-serif-editorial text-[12vw] font-light italic lowercase text-neutral-300 md:text-[7vw]">
              esculpindo
            </span>
            <span className="block font-display-tech text-[15vw] font-extrabold uppercase tracking-tighter text-white md:text-[9vw]">
              o tempo
            </span>
          </h1>

          <p className="cine-hero-fade mt-6 max-w-md text-xs leading-relaxed lowercase text-white/70 md:text-sm">
            transformamos visões brutas em narrativas cinematográficas de alto impacto.
          </p>

          <div className="cine-hero-fade mt-8 flex items-center gap-8 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">
            <span><strong className="text-white">100</strong> filmes</span>
            <span className="h-3 w-px bg-white/15" />
            <span><strong className="text-white">100 mil</strong> views</span>
          </div>

          <div className="cine-hero-fade absolute bottom-10 flex flex-col items-center gap-1.5 opacity-50">
            {/* touch no mobile (sem mouse), cápsula de mouse no desktop */}
            <span className="font-display-tech text-[9px] uppercase tracking-hud text-white/60">
              <span className="sm:hidden">deslize para revelar</span>
              <span className="hidden sm:inline">role para revelar</span>
            </span>
            <div className="hidden h-7 w-4 justify-center rounded-full border border-white/25 p-1 sm:flex">
              <div className="h-1.5 w-1 animate-bounce rounded-full bg-white" />
            </div>
            <svg className="h-4 w-4 animate-bounce text-white/60 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* CAPÍTULOS DO MANIFESTO (01–06) */}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.index}
            className="cine-chapter absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            style={{ perspective: '1200px' }}
          >
            {/* índice gigante 3D "fantasma" — profundidade e contraste */}
            <span
              className="cine-ghost pointer-events-none absolute select-none font-display-tech font-extrabold leading-none"
              style={{
                fontSize: '40vw',
                top: '50%',
                [i % 2 === 0 ? 'left' : 'right']: '-2vw',
                transform: 'translateY(-50%)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.07)',
                zIndex: 0,
              }}
            >
              {c.index}
            </span>
            <span className="cine-fade relative z-[1] mb-3 block font-display-tech text-[10px] font-semibold uppercase tracking-hud text-neutral-500">
              {c.index} · {c.kicker}
            </span>
            <h2 className="cine-title hero-title relative z-[1] text-[9vw] font-medium lowercase leading-none tracking-tight text-white md:text-[6vw]">
              {c.title}
            </h2>
            <p className="cine-fade relative z-[1] mt-5 max-w-[440px] text-xs leading-relaxed lowercase text-white/70 md:text-sm">
              {c.body}
            </p>
          </div>
        ))}

        {/* HUD de câmera */}
        <div className="absolute bottom-8 left-6 z-20 flex items-center gap-4 font-display-tech text-[10px] uppercase tracking-widest text-neutral-500 md:left-10">
          <div className="hidden items-center gap-2 sm:flex">
            <span>camera-control · active</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink" />
          </div>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span ref={lensRef} className="text-white/80">lente · 24mm f/1.4</span>
        </div>

        {/* Barra de progresso */}
        <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
          <span className="font-display-tech text-[10px] tracking-wider text-neutral-500">00</span>
          <div className="relative h-[2px] w-28 overflow-hidden rounded-full bg-neutral-800">
            <div ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-pink" />
          </div>
          <span className="font-display-tech text-[10px] tracking-wider text-neutral-500">03</span>
          <span ref={pctRef} className="ml-1 font-display-tech text-[10px] tracking-widest text-neutral-400">0%</span>
        </div>
      </div>
    </section>
  );
}
