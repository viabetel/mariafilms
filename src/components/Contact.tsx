import { useRef, useState } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';

const EMAIL = 'contato@mariafilms.com.br';

/**
 * CONTATO — o último take.
 *
 * Fechamento cinematográfico: chamada grande, formulário (→ mailto), e-mail,
 * redes e footer com o wordmark. Reveal por caractere na headline.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      const title = sectionRef.current!.querySelector('.ct-title');
      if (title) {
        const split = new SplitText(title, { type: 'chars' });
        gsap.from(split.chars, {
          yPercent: 80,
          opacity: 0,
          stagger: 0.015,
          duration: 0.9,
          ease: EASE.reveal,
          scrollTrigger: { trigger: title, start: 'top 85%' },
        });
      }
      gsap.from('.ct-fade', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: EASE.in,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
      });
    },
    { scope: sectionRef },
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`novo projeto — ${form.nome || 'contato pelo site'}`);
    const body = encodeURIComponent(`nome: ${form.nome}\ne-mail: ${form.email}\n\n${form.mensagem}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const field =
    'ct-fade w-full border-b border-white/15 bg-transparent py-4 font-display-tech text-lg text-white placeholder:text-neutral-600 outline-none transition-colors focus:border-pink';

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="relative z-10 overflow-hidden bg-black px-4 pt-28 md:px-10 md:pt-40"
    >
      {/* glow ambiente */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] mix-blend-screen"
        style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(255,0,127,0.18), transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Chamada */}
        <div className="mx-auto max-w-5xl text-center">
          <span className="ct-fade font-display-tech text-[10px] uppercase tracking-hud text-pink">// último take</span>
          <h2 className="ct-title mt-5 font-display-tech text-5xl font-extrabold uppercase leading-[0.88] tracking-tighter text-white md:text-8xl">
            vamos eternizar<br />o seu instante
          </h2>
          <p className="ct-fade mx-auto mt-7 max-w-md font-display-tech text-sm lowercase leading-relaxed text-neutral-400">
            tem um projeto, evento ou ideia que merece virar filme? conta pra gente — a resposta chega em até 24h.
          </p>
        </div>

        {/* Formulário */}
        <form className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2" onSubmit={submit}>
          <input
            className={field}
            placeholder="seu nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <input
            type="email"
            className={field}
            placeholder="seu e-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            className={`${field} min-h-[120px] resize-none md:col-span-2`}
            placeholder="conte sobre o projeto"
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            required
          />
          <button
            type="submit"
            className="ct-fade group mt-2 flex items-center justify-center gap-3 rounded-full bg-pink py-5 font-display-tech text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:shadow-pink-glow md:col-span-2"
          >
            {sent ? 'abrindo seu e-mail…' : 'enviar briefing'}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </form>

        {/* E-mail direto */}
        <div className="ct-fade mt-16 text-center">
          <span className="font-display-tech text-[10px] uppercase tracking-hud text-neutral-600">ou direto no e-mail</span>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-2 block font-serif-editorial text-2xl italic text-bone underline decoration-pink decoration-2 underline-offset-8 transition-colors hover:text-white md:text-4xl"
          >
            {EMAIL}
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-28 flex flex-col items-center gap-6 border-t border-white/10 py-10 md:flex-row md:justify-between">
          <span className="font-serif-editorial text-2xl italic lowercase text-white">maria films</span>
          <div className="flex items-center gap-6 font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">
            <a href="#" className="transition-colors hover:text-pink">instagram</a>
            <a href="#" className="transition-colors hover:text-pink">vimeo</a>
            <a href="#" className="transition-colors hover:text-pink">youtube</a>
          </div>
          <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-600">
            © {new Date().getFullYear()} — esculpindo o tempo
          </span>
        </footer>
      </div>
    </section>
  );
}
