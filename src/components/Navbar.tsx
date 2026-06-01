import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { scrollToSection } from './SmoothScroll';
import { EASE } from '../lib/motion';

const LINKS = [
  { label: 'filmes', target: '#filmes' },
  { label: 'sobre', target: '#sobre' },
  { label: 'serviços', target: '#servicos' },
  { label: 'contato', target: '#contato' },
];

/** Botão com atração magnética do cursor. */
function MagneticCTA() {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.5, ease: EASE.micro });
  };
  const onLeave = () => {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
  };

  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => scrollToSection('#contato')}
      className="glass pointer-events-auto rounded-full px-6 py-3.5 font-display-tech text-sm font-medium text-white transition-colors duration-300 hover:border-pink-soft hover:text-pink md:px-8 md:py-4"
    >
      vamos conversar
    </button>
  );
}

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  // Esconde ao rolar para baixo, revela ao subir.
  useGSAP(() => {
    let lastY = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setHidden(y > 120 && y > lastY);
        lastY = y;
      },
    });
    return () => st.kill();
  });

  return (
    <nav
      ref={navRef}
      className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex items-center justify-between gap-4 px-4 pt-4 transition-transform duration-500 ease-in-cine md:px-10 md:pt-6"
      style={{ transform: hidden ? 'translateY(-130%)' : 'translateY(0)' }}
    >
      <button
        onClick={() => scrollToSection('body')}
        className="glass pointer-events-auto group flex items-center gap-2.5 rounded-full px-6 py-3"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-pink shadow-[0_0_8px_#ff007f] transition-transform duration-300 group-hover:scale-125" />
        <span className="font-serif-editorial text-2xl italic lowercase leading-none tracking-tight md:text-[28px]">
          <span className="text-white">maria</span>
          <span className="text-pink"> films</span>
        </span>
      </button>

      <div className="glass pointer-events-auto hidden items-center gap-1 rounded-full px-3 py-2.5 md:flex">
        {LINKS.map((l) => (
          <button
            key={l.target}
            onClick={() => scrollToSection(l.target)}
            className="rounded-full px-5 py-2 font-display-tech text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10 hover:text-pink"
          >
            {l.label}
          </button>
        ))}
        <a
          href="/proposta"
          className="ml-1 flex items-center gap-1 rounded-full bg-pink/10 px-5 py-2 font-display-tech text-sm font-medium text-pink transition-colors hover:bg-pink/20"
        >
          proposta <span className="text-xs">↗</span>
        </a>
      </div>

      <MagneticCTA />
    </nav>
  );
}
