import { useEffect, useRef, useState } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { SmoothScroll } from '../components/SmoothScroll';
import { PROCESS, DIFFS, CONTACT, type Plan } from './plans';
import { getProposal, requestContract, requestPayment, type ProposalInfo, type ContractResult, type ProposalStatus } from './api';
import { isValidDocumento, isValidEmail } from './validation';
import { Target, TrendingUp, Clock, Pencil, Camera, Film, Check, MessageSquare, Calendar, CreditCard, X, type LucideIcon } from './icons';

// PROPOSTA NATIVA,tema CLARO/comercial (documento). É por cliente (token ?c=)
// e EXPIRA em 7 dias. Só o CONTRATO (gerado no aceite) vira PDF + Autentique.
const TOKEN = new URLSearchParams(window.location.search).get('c');

type Status = 'idle' | 'sending' | 'error';

const PORQUE: [LucideIcon, string, string][] = [
  [Target, 'atenção é o novo metro quadrado', 'quem não aparece com constância e qualidade some do feed. presença é ativo, não custo.'],
  [TrendingUp, 'conteúdo que vende, não que enfeita', 'cada peça tem objetivo: alcance, autoridade ou conversão, nada de postar por postar.'],
  [Clock, 'você no que importa', 'roteiro, captação, edição e legenda por nossa conta. você foca no negócio.'],
];

// Vantagens inclusas em QUALQUER versão,o "o que você ganha sempre".
const INCLUSO: [LucideIcon, string, string][] = [
  [Pencil, 'roteiro estratégico', 'cada peça pensada pra prender nos 3 primeiros segundos.'],
  [Camera, 'captação profissional', 'luz, enquadramento e áudio com cara de cinema.'],
  [Film, 'edição que segura', 'cortes dinâmicos, legendas e trilha até o fim.'],
  [Check, 'sua aprovação', 'nada vai ao ar sem o seu ok, e você tem controle total.'],
  [MessageSquare, 'legenda + cta', 'copy persuasiva, hashtags e chamada pra ação.'],
  [Calendar, 'consistência', 'a frequência que o algoritmo recompensa.'],
];

const DIFF_ICONS: LucideIcon[] = [TrendingUp, Target, Clock];

const FAQ: [string, string][] = [
  ['quando começa?', 'assim que o contrato é assinado e o briefing inicial é preenchido, normalmente em até 3 dias úteis.'],
  ['preciso aparecer nos vídeos?', 'não necessariamente. adaptamos o formato ao seu conforto: bastidores, produto, equipe ou narração.'],
  ['e se eu não gostar de um conteúdo?', 'nada vai ao ar sem a sua aprovação, e cada peça tem espaço para ajustes antes de publicar.'],
  ['os valores incluem tráfego pago?', 'não. o investimento cobre a produção orgânica; mídia paga é à parte e opcional.'],
];

function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`pp-reveal relative flex flex-col rounded-2xl border p-7 text-left transition-all duration-300 ${selected ? 'border-pink bg-pink/[0.04] shadow-lg ring-1 ring-pink' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'} ${plan.featured ? 'md:-translate-y-3' : ''}`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-7 rounded-full bg-pink px-3 py-1 font-display-tech text-[9px] font-bold uppercase tracking-widest text-white">{plan.badge}</span>
      )}
      <div className="flex items-baseline justify-between">
        <span className="font-display-tech text-3xl font-extrabold text-pink">{plan.code}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-pink bg-pink text-white' : 'border-neutral-300 text-transparent'}`}><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
      </div>
      <h3 className="mt-1 font-serif-editorial text-3xl italic lowercase text-neutral-900">{plan.name}</h3>
      <p className="mt-2 font-display-tech text-xs leading-relaxed text-neutral-500">{plan.tagline}</p>
      <div className="mt-5 flex items-baseline gap-2 border-t border-neutral-200 pt-5">
        <span className="font-display-tech text-4xl font-bold text-neutral-900">{plan.total}</span>
        <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{plan.totalLabel}</span>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        {plan.items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 font-display-tech text-sm text-neutral-700">
            <Check className="h-4 w-4 shrink-0 text-pink" strokeWidth={2.5} />
            <span className="font-bold">{it.n}×</span> {it.label}
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-neutral-200 pt-4">
        <div className="font-display-tech text-2xl font-bold text-neutral-900">{plan.price}</div>
        <div className="font-display-tech text-[11px] text-neutral-500">{plan.priceNote} · {plan.perContent}</div>
        <div className="mt-2 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">{plan.duration}</div>
      </div>
    </button>
  );
}

export function ProposalDossier() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [proposal, setProposal] = useState<ProposalInfo | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [form, setForm] = useState({ nome: '', doc: '', email: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ContractResult | null>(null);
  const [stage, setStage] = useState<ProposalStatus>('pendente');
  const [notFound, setNotFound] = useState(false);
  const [codeInput, setCodeInput] = useState(TOKEN ?? '');

  useEffect(() => {
    if (!TOKEN) return; // sem código → mostra o portão
    getProposal(TOKEN).then((p) => {
      if (!p) {
        setNotFound(true); // código inválido → portão com aviso
        return;
      }
      setProposal(p);
      const first = p.plans[0];
      if (first) setSelected((p.plans.find((x) => x.featured) ?? first).id);
      setStage(p.status); // o cliente pode chegar já num estágio avançado
    });
  }, []);

  // abre a proposta pelo código digitado (recarrega com ?c=)
  const openCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toLowerCase();
    if (code) window.location.href = `/proposta?c=${encodeURIComponent(code)}`;
  };

  const daysLeft = proposal ? Math.ceil((new Date(proposal.expiresAt).getTime() - Date.now()) / 86400000) : null;
  const expired = !!proposal && (proposal.status === 'expirada' || (daysLeft !== null && daysLeft <= 0));

  const docOk = isValidDocumento(form.doc);
  const emailOk = isValidEmail(form.email);
  const nomeOk = form.nome.trim().length >= 2;
  const canSubmit = !expired && nomeOk && docOk && emailOk && consent && status !== 'sending';

  useGSAP(
    () => {
      if (!proposal || expired) return;
      gsap.utils.toArray<HTMLElement>('.pp-title').forEach((t) => {
        const split = new SplitText(t, { type: 'chars' });
        gsap.from(split.chars, { yPercent: 60, opacity: 0, stagger: 0.02, duration: 0.8, ease: EASE.reveal, scrollTrigger: { trigger: t, start: 'top 90%' } });
      });
      gsap.utils.toArray<HTMLElement>('.pp-reveal').forEach((el) => {
        gsap.from(el, { y: 40, opacity: 0, duration: 0.8, ease: EASE.in, scrollTrigger: { trigger: el, start: 'top 90%' } });
      });
    },
    { dependencies: [proposal, expired], scope: rootRef },
  );

  const submit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await requestContract(TOKEN, { nome: form.nome.trim(), documento: form.doc.trim(), email: form.email.trim(), planId: selected });
      setResult(res);
      setStage('aguardando_assinatura'); // contrato gerado → cliente assina na Autentique
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const pay = async () => {
    setStatus('sending');
    try {
      await requestPayment(TOKEN, selected);
      setStage('pago');
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const field = 'w-full border-b bg-transparent py-3 font-display-tech text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors';
  const fieldState = (ok: boolean, value: string) => `${field} ${value && !ok ? 'border-red-400' : 'border-neutral-300 focus:border-pink'}`;

  const backLink = (
    <a href="/" className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-4 py-2 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 shadow-sm backdrop-blur transition-colors hover:text-pink md:left-8 md:top-6">
      voltar ao site
    </a>
  );

  // PORTÃO DE CÓDIGO,sem código ou código inválido
  if (!TOKEN || notFound) {
    return (
      <div className="proposal-doc relative flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">portal de propostas</span>
        <h1 className="mt-4 font-serif-editorial text-5xl text-neutral-900 md:text-6xl">sua proposta</h1>
        <p className="mt-4 max-w-sm font-display-tech text-sm text-neutral-500">digite o código que a maria films te enviou para abrir a sua proposta.</p>
        <form onSubmit={openCode} className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="código de acesso"
            autoFocus
            aria-label="código de acesso"
            className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-center font-display-tech text-base uppercase tracking-widest text-neutral-900 outline-none placeholder:tracking-normal placeholder:text-neutral-400 focus:border-pink"
          />
          {notFound && <span className="font-display-tech text-xs text-red-500">código não encontrado. confira com a maria films.</span>}
          <button type="submit" className="rounded-full bg-pink py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg">ver minha proposta</button>
        </form>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-6 font-display-tech text-[11px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-pink">não tem código? fale com a gente</a>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-doc flex min-h-screen items-center justify-center bg-bone">
        <span className="font-display-tech text-xs uppercase tracking-hud text-neutral-400">carregando proposta…</span>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="proposal-doc flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">proposta expirada</span>
        <h1 className="mt-4 font-serif-editorial text-5xl italic lowercase text-neutral-900 md:text-7xl">esta proposta expirou</h1>
        <p className="mt-5 max-w-md font-display-tech text-sm lowercase text-neutral-500">as propostas valem por 7 dias. fale com a gente que preparamos uma nova para {proposal.clienteNome}.</p>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-8 rounded-full bg-pink px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg">pedir nova proposta</a>
      </div>
    );
  }

  const chosen = proposal.plans.find((p) => p.id === selected) ?? proposal.plans[0];
  const hoje = new Date().toLocaleDateString('pt-BR');
  const validade = new Date(proposal.expiresAt).toLocaleDateString('pt-BR');
  const ref = (TOKEN ?? 'mf').toUpperCase();

  // DERIVADO: condições coerentes com os dados (validade = data real; pagamento
  // referencia a versão escolhida) → nunca contradiz o que foi editado no admin.
  const condicoes: [LucideIcon, string, string][] = [
    [Clock, 'validade', `proposta válida até ${validade}.`],
    [CreditCard, 'pagamento', `${chosen.priceNote || 'conforme a versão escolhida'}; primeira parcela na assinatura.`],
    [Check, 'aprovação', 'todo conteúdo passa pela sua aprovação antes de publicar.'],
    [X, 'não inclui', 'gestão de tráfego pago, criação de identidade visual e impressões físicas.'],
  ];

  // FLUXO PÓS-ACEITE: contrato → assinatura (Autentique) → pagamento (Stripe) → pronto
  if (stage !== 'pendente') {
    return (
      <div className="proposal-doc relative flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
        {backLink}
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm">
          {stage === 'aguardando_assinatura' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink/10 text-pink"><Pencil className="h-7 w-7" strokeWidth={1.6} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">contrato gerado</h1>
              <p className="mt-3 font-display-tech text-sm text-neutral-500">revise e assine o contrato da versão <strong className="text-neutral-900">{chosen.code} · {chosen.name}</strong> pela Autentique. assim que assinar, o pagamento é liberado.</p>
              <a href={result?.signingUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-full bg-pink px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white hover:shadow-lg">abrir assinatura</a>
              <button onClick={() => setStage('assinada')} className="mt-4 block w-full font-display-tech text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-pink">[simular] assinatura concluída</button>
            </>
          )}
          {stage === 'assinada' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-8 w-8" strokeWidth={2.5} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">assinado</h1>
              <p className="mt-3 font-display-tech text-sm text-neutral-500">falta só o pagamento da versão <strong className="text-neutral-900">{chosen.code} · {chosen.name}</strong>.</p>
              <div className="mt-4 font-display-tech text-3xl font-bold text-neutral-900">{chosen.price}</div>
              {status === 'error' && <p className="mt-3 font-display-tech text-xs text-red-500">não foi possível iniciar o pagamento. tente de novo.</p>}
              <button onClick={pay} disabled={status === 'sending'} className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white ${status === 'sending' ? 'bg-neutral-300' : 'bg-pink hover:shadow-lg'}`}>
                <CreditCard className="h-4 w-4" strokeWidth={2} /> {status === 'sending' ? 'abrindo pagamento…' : 'pagar com stripe'}
              </button>
            </>
          )}
          {stage === 'pago' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-8 w-8" strokeWidth={2.5} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">tudo certo!</h1>
              <p className="mt-3 font-display-tech text-sm text-neutral-500">obrigado{form.nome ? `, ${form.nome.split(' ')[0]}` : ''}! contrato assinado e pagamento confirmado. em breve o briefing inicial.</p>
              <button className="mt-6 rounded-full border border-neutral-300 px-6 py-3 font-display-tech text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-pink hover:text-pink">baixar contrato</button>
            </>
          )}
          <p className="mt-6 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">[protótipo] integração autentique + stripe entra com o backend</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="proposal-doc min-h-screen bg-bone text-neutral-900">
      {backLink}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-4 py-2 font-display-tech text-[10px] uppercase tracking-widest text-neutral-600 shadow-sm backdrop-blur md:right-8 md:top-6">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink" />
        válida por mais {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
      </div>

      <SmoothScroll>
        {/* HERO */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <span className="font-display-tech text-[11px] uppercase tracking-hud text-pink">proposta comercial · maria films</span>
          <h1 className="pp-title mt-6 font-serif-editorial text-5xl italic lowercase leading-[0.95] text-neutral-900 md:text-8xl">presença digital<br />que vira cliente</h1>
          <p className="mt-7 max-w-lg font-display-tech text-base leading-relaxed text-neutral-600">{proposal.intro}</p>
          <div className="mt-8 flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-2.5 shadow-sm">
            <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">preparada para</span>
            <span className="font-serif-editorial text-xl text-neutral-900">{proposal.clienteNome}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">
            <span>proposta nº {ref}</span>
            <span className="text-neutral-300">·</span>
            <span>{hoje}</span>
            <span className="text-neutral-300">·</span>
            <span>válida até {validade}</span>
          </div>
          <div className="absolute bottom-10 flex flex-col items-center gap-1.5 text-neutral-400">
            <span className="font-display-tech text-[9px] uppercase tracking-hud">role para ler</span>
            <div className="flex h-7 w-4 justify-center rounded-full border border-neutral-300 p-1"><div className="h-1.5 w-1 animate-bounce rounded-full bg-neutral-400" /></div>
          </div>
        </section>

        {/* POR QUE / CONTEXTO */}
        <section className="border-t border-neutral-200 bg-white px-4 py-24 md:px-10">
          <div className="mx-auto max-w-5xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">por que agora</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-6xl">o jogo é de quem aparece</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {PORQUE.map(([Icon, t, d]) => (
                <div key={t} className="pp-reveal">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink/10 text-pink"><Icon className="h-6 w-6" strokeWidth={1.6} /></div>
                  <h3 className="mt-4 font-serif-editorial text-2xl italic lowercase text-neutral-900">{t}</h3>
                  <p className="mt-2 font-display-tech text-sm leading-relaxed text-neutral-500">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VERSÕES */}
        <section className="px-4 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">versões & valores</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-6xl">escolha sua versão</h2>
            <p className="mt-3 max-w-lg font-display-tech text-sm text-neutral-500">cada versão inclui roteiro, captação, edição, legenda e aprovação antes de cada postagem.</p>
            <div className={`mt-12 grid grid-cols-1 gap-6 ${proposal.plans.length === 2 ? 'md:mx-auto md:max-w-3xl md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {proposal.plans.map((p) => <PlanCard key={p.id} plan={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />)}
            </div>
          </div>
        </section>

        {/* INCLUSO EM TODAS AS VERSÕES (vantagens) */}
        <section className="border-t border-neutral-200 bg-pink/[0.03] px-4 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">incluso em qualquer versão</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-6xl">o que você ganha sempre</h2>
            <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
              {INCLUSO.map(([Icon, t, d]) => (
                <div key={t} className="pp-reveal flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink text-white shadow-sm"><Icon className="h-6 w-6" strokeWidth={1.7} /></div>
                  <div>
                    <h3 className="font-display-tech text-base font-semibold text-neutral-900">{t}</h3>
                    <p className="mt-1 font-display-tech text-sm leading-relaxed text-neutral-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-t border-neutral-200 bg-white px-4 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">como funciona</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-6xl">do roteiro ao post</h2>
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
              {([['reels / vídeo', PROCESS.reels], ['arte / carrossel', PROCESS.arte]] as const).map(([title, steps]) => (
                <div key={title} className="pp-reveal">
                  <h3 className="font-display-tech text-sm font-bold uppercase tracking-widest text-pink">{title}</h3>
                  <div className="mt-5 flex flex-col">
                    {steps.map(([t, d], i) => (
                      <div key={t} className="flex gap-4 border-b border-neutral-200 py-4">
                        <span className="font-display-tech text-sm font-bold text-neutral-300">0{i + 1}</span>
                        <div>
                          <div className="font-display-tech text-sm font-semibold text-neutral-900">{t}</div>
                          <div className="mt-1 font-display-tech text-xs text-neutral-500">{d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALENDÁRIO */}
        <section className="px-4 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">calendário de conteúdo</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-6xl">presença constante</h2>
            <p className="pp-reveal mt-4 max-w-xl font-display-tech text-sm leading-relaxed text-neutral-500">no plano <strong className="text-neutral-700">{chosen.code} · {chosen.name}</strong> são <strong className="text-neutral-700">{chosen.total} {chosen.totalLabel}</strong>: reels para alcance na terça e conteúdo visual na quinta, nos dias de pico, sem saturar a audiência.</p>
            <div className="pp-reveal mt-10 grid grid-cols-1 gap-3 md:grid-cols-4">
              {['1ª semana', '2ª semana', '3ª semana', '4ª semana'].map((wk, i) => (
                <div key={wk} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">{wk}</div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-display-tech text-sm text-neutral-800"><span className="h-2 w-2 rounded-full bg-pink" /> ter · reels</div>
                    <div className="flex items-center gap-2 font-display-tech text-sm text-neutral-800"><span className="h-2 w-2 rounded-full" style={{ background: i % 2 === 0 ? '#8B5CF6' : '#10B981' }} /> qui · {i % 2 === 0 ? 'carrossel' : 'estático'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTADOS */}
        <section className="border-t border-neutral-200 bg-neutral-900 px-4 py-24 text-bone md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">por que dá certo</span>
            <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
              {DIFFS.map(([n, d], i) => {
                const Ic = DIFF_ICONS[i] ?? TrendingUp;
                return (
                  <div key={n} className="pp-reveal">
                    <Ic className="h-8 w-8 text-pink" strokeWidth={1.6} />
                    <div className="mt-3 font-display-tech text-6xl font-bold text-pink md:text-7xl">{n}</div>
                    <p className="mt-3 max-w-xs font-display-tech text-sm leading-relaxed text-bone/70">{d}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-24 md:px-10">
          <div className="mx-auto max-w-3xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">perguntas frequentes</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase text-neutral-900 md:text-5xl">o que costumam perguntar</h2>
            <div className="mt-10 flex flex-col">
              {FAQ.map(([q, a]) => (
                <div key={q} className="pp-reveal border-b border-neutral-200 py-6">
                  <h3 className="font-display-tech text-base font-semibold text-neutral-900">{q}</h3>
                  <p className="mt-2 font-display-tech text-sm leading-relaxed text-neutral-500">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONDIÇÕES */}
        <section className="border-t border-neutral-200 bg-white px-4 py-20 md:px-10">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4">
            {condicoes.map(([Icon, t, d]) => (
              <div key={t} className="pp-reveal">
                <Icon className="h-5 w-5 text-pink" strokeWidth={1.8} />
                <div className="mt-3 font-display-tech text-[10px] uppercase tracking-widest text-neutral-900">{t}</div>
                <p className="mt-1 font-display-tech text-sm leading-relaxed text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACEITE */}
        <section id="assinar" className="border-t border-neutral-200 px-4 py-28 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">aceite</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-5xl italic lowercase text-neutral-900 md:text-7xl">vamos começar?</h2>
            <p className="mt-5 font-display-tech text-sm text-neutral-500">confirme a versão, preencha seus dados e aceite. o contrato é montado conforme sua escolha e enviado para você assinar pela autentique.</p>
          </div>

          <div className="pp-reveal mx-auto mt-12 max-w-3xl rounded-2xl border border-pink/30 bg-pink/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-display-tech text-[10px] uppercase tracking-widest text-pink">versão escolhida</span>
                <div className="font-serif-editorial text-3xl italic lowercase text-neutral-900">{chosen.code} · {chosen.name}</div>
                <div className="mt-1 font-display-tech text-xs text-neutral-500">{chosen.tagline}</div>
              </div>
              <div className="text-right">
                <div className="font-display-tech text-3xl font-bold text-neutral-900">{chosen.price}</div>
                <div className="font-display-tech text-[11px] text-neutral-500">{chosen.priceNote}</div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <input aria-label="nome completo" className={fieldState(nomeOk, form.nome)} placeholder="nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <div>
              <input aria-label="cpf ou cnpj" className={fieldState(docOk, form.doc)} placeholder="cpf / cnpj" value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} />
              {form.doc && !docOk && <span className="mt-1 block font-display-tech text-[10px] text-red-500">cpf/cnpj inválido</span>}
            </div>
            <div className="md:col-span-2">
              <input aria-label="e-mail" className={fieldState(emailOk, form.email)} type="email" placeholder="e-mail (para receber o contrato pela autentique)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {form.email && !emailOk && <span className="mt-1 block font-display-tech text-[10px] text-red-500">e-mail inválido</span>}
            </div>
            <label className="flex cursor-pointer items-start gap-3 md:col-span-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-pink" />
              <span className="font-display-tech text-[11px] leading-relaxed text-neutral-500">concordo com os termos da proposta e autorizo a geração do contrato e o envio para assinatura eletrônica. meus dados serão usados apenas para emissão e assinatura do documento (LGPD).</span>
            </label>
            {status === 'error' && <p className="font-display-tech text-xs text-red-500 md:col-span-2">não foi possível gerar o contrato. tente novamente em instantes.</p>}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className={`group mt-2 flex items-center justify-center gap-3 rounded-full py-5 font-display-tech text-sm font-semibold uppercase tracking-widest transition-all duration-300 md:col-span-2 ${canSubmit ? 'bg-pink text-white hover:shadow-lg' : 'cursor-not-allowed bg-neutral-200 text-neutral-400'}`}
            >
              {status === 'sending' ? 'gerando contrato…' : 'aceitar e gerar contrato'}
            </button>
          </div>

          <footer className="mx-auto mt-24 flex max-w-3xl flex-col items-center gap-3 border-t border-neutral-200 pt-10 text-center font-display-tech text-[11px] uppercase tracking-widest text-neutral-400">
            <span className="font-serif-editorial text-xl italic lowercase text-neutral-900">maria films</span>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <span>{CONTACT.whatsapp}</span><span className="text-pink">·</span>
              <span>{CONTACT.instagram}</span><span className="text-pink">·</span>
              <span className="lowercase">{CONTACT.email}</span>
            </div>
          </footer>
        </section>
      </SmoothScroll>
    </div>
  );
}
