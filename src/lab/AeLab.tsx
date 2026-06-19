// AE LAB — prova de conceito da linguagem de interação "AE vivo" da Maria Films.
// Rota isolada (#ae-lab), não toca nas seções reais. Demonstra a ESPINHA do
// sistema (cursor-lente, timecode, anamórfico, color grade) e UMA transição
// acontecendo ATRAVÉS do efeito (o botão expande e VIRA o fundo da próxima cena).
// Conteúdo é o que o site TEM (manifesto, trabalhos, formatos), não fotos.
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { EASE, DUR } from '../lib/motion';
import './ae-lab.css';

const PINK = '#ff007f';

// ——— timecode vivo (UI diegética de set) ———
function Timecode() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const ms = performance.now() - t0;
      const f = Math.floor((ms / 1000) * 24) % 24;
      const s = Math.floor(ms / 1000) % 60;
      const m = Math.floor(ms / 60000) % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      if (ref.current)
        ref.current.textContent = `00:${pad(m)}:${pad(s)}:${pad(f)}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="ae-hud">
      <span className="ae-rec" /> rec
      <span ref={ref} className="ae-tc">00:00:00:00</span>
    </div>
  );
}

export function AeLab() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<0 | 1>(0);

  // ——— cursor-lente: rack focus + anamórfico na velocidade ———
  useEffect(() => {
    const lens = lensRef.current!;
    const flare = flareRef.current!;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let lastX = px;
    let lastT = performance.now();

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const vx = Math.abs(e.clientX - lastX) / dt; // px/ms
      lastX = e.clientX;
      lastT = now;

      gsap.to(lens, { x: px, y: py, duration: 0.35, ease: 'power3.out' });

      // anamórfico: quanto mais rápido, mais RGB split + flare horizontal
      const energy = Math.min(1, vx / 2.2);
      gsap.to(rootRef.current, {
        '--split': `${energy * 6}px`,
        duration: 0.2,
        overwrite: true,
      } as gsap.TweenVars);
      gsap.to(flare, {
        opacity: energy * 0.5,
        scaleX: 1 + energy,
        duration: 0.2,
        y: py,
        overwrite: 'auto',
      });

      // rack focus: o card sob o cursor fica nítido, os outros desfocam
      const cards = rootRef.current!.querySelectorAll<HTMLElement>('.ae-foc');
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const inside =
          px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
        gsap.to(c, {
          filter: inside ? 'blur(0px)' : 'blur(5px)',
          opacity: inside ? 1 : 0.62,
          duration: DUR.micro,
          ease: EASE.micro,
        });
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [scene]);

  // ——— TRANSIÇÃO ATRAVÉS DO EFEITO: botão expande e vira o fundo da cena 2 ———
  const enter = (e: React.MouseEvent) => {
    const ov = overlayRef.current!;
    const x = e.clientX;
    const y = e.clientY;
    const rmax =
      Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;

    // o overlay (cena 2) nasce como um disco minúsculo no ponto do clique —
    // como a íris de uma lente abrindo — e cresce engolindo a tela.
    // Animamos um raio numérico e aplicamos o clip-path a cada frame (o GSAP
    // não interpola circle() sozinho), garantindo a abertura fluida.
    ov.style.display = 'block';
    ov.style.background = PINK;
    const proxy = { r: 0 };
    ov.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    gsap
      .timeline({
        onComplete: () => {
          setScene(1);
          gsap.set(ov, { display: 'none' });
        },
      })
      .to(proxy, {
        r: rmax,
        duration: DUR.slow,
        ease: EASE.camera,
        onUpdate: () => {
          ov.style.clipPath = `circle(${proxy.r}px at ${x}px ${y}px)`;
        },
      })
      // flash curto de exposição no pico (estouro de altas luzes)
      .to(ov, { backgroundColor: '#fff', duration: 0.12, yoyo: true, repeat: 1 }, '-=0.25');
  };

  const back = () => setScene(0);

  return (
    <div ref={rootRef} className="ae-lab">
      <Timecode />
      <div ref={lensRef} className="ae-lens" />
      <div ref={flareRef} className="ae-flare" />
      <div ref={overlayRef} className="ae-overlay" />
      <div className="ae-grade" />

      {scene === 0 ? (
        <section className="ae-scene">
          <p className="ae-kicker">manifesto</p>
          <h1 className="ae-h1">
            cada instante<br />vira <em>cinema</em>.
          </h1>
          <div className="ae-grid">
            <div className="ae-foc">visão</div>
            <div className="ae-foc">roteiro</div>
            <div className="ae-foc">luz</div>
            <div className="ae-foc">montagem</div>
          </div>
          <button className="ae-cta" onClick={enter}>
            entrar nos trabalhos
          </button>
          <p className="ae-hint">mexa o mouse rápido · passe sobre as palavras · clique no botão</p>
        </section>
      ) : (
        <section className="ae-scene ae-scene2">
          <p className="ae-kicker">trabalhos</p>
          <h1 className="ae-h1">formatos<br />que <em>eternizam</em>.</h1>
          <div className="ae-grid">
            <div className="ae-foc">eventos</div>
            <div className="ae-foc">casamentos</div>
            <div className="ae-foc">branded</div>
            <div className="ae-foc">clipes</div>
          </div>
          <button className="ae-cta ae-cta--ghost" onClick={back}>
            voltar
          </button>
        </section>
      )}
    </div>
  );
}
