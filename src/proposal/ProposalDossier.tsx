import { useEffect, useRef, useState } from 'react';
import {
  PROCESS, DIFFS, CONTACT, KIND_META, KIND_ORDER, kindOf, generateSchedule, brl, planTotalValue, billingPlan,
  resolveKindMeta, THEMES, DEFAULT_FAQ, DEFAULT_INCLUSO, DEFAULT_CONDICOES, DEFAULT_SECTIONS,
  groupByMonth, discountAmount, planGrossValue,
  type Plan, type ProposalTheme, type FAQItem, type InclusoItem, type CondicoesConfig, type ProposalSections,
} from './plans';
import { getProposal, requestContract, requestPayment, markPaid, markViewed, selectPlan, markSigned, type ProposalInfo, type ContractResult, type PaymentResult, type ProposalStatus } from './api';
import { isValidDocumento, isValidEmail, isValidPhone } from './validation';
import { Target, TrendingUp, Clock, Pencil, Camera, Film, Check, MessageSquare, Calendar, CreditCard, X, Loader, FileText, Gift, type LucideIcon } from './icons';

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
// Usado como fallback quando a proposta não tem incluso customizado.
const INCLUSO_ICONS: Record<string, LucideIcon> = {
  roteiro: Pencil, captação: Camera, edição: Film,
  aprovação: Check, 'legenda + CTA': MessageSquare, consistência: Calendar,
};
const INCLUSO_FALLBACK: [LucideIcon, string, string][] = [
  [Pencil, 'roteiro estratégico', 'cada peça pensada pra prender nos 3 primeiros segundos.'],
  [Camera, 'captação profissional', 'luz, enquadramento e áudio com cara de cinema.'],
  [Film, 'edição que segura', 'cortes dinâmicos, legendas e trilha até o fim.'],
  [Check, 'sua aprovação', 'nada vai ao ar sem o seu ok, e você tem controle total.'],
  [MessageSquare, 'legenda + cta', 'copy persuasiva, hashtags e chamada pra ação.'],
  [Calendar, 'consistência', 'a frequência que o algoritmo recompensa.'],
];

const DIFF_ICONS: LucideIcon[] = [TrendingUp, Target, Clock];

// Como o pagamento acontece, por tipo: mensal = assinatura no cartão (débito
// automático recorrente); à vista = uma vez. Derivado do billingPlan.
function installmentLabel(plan: Plan): string {
  return billingPlan(plan).recurring ? 'cobrança automática no cartão todo mês' : 'pagamento único';
}

// ── Micro-animação de revelação (CSS fade-in no mount) ──────────────────────
const REVEAL_STYLE = `
.reveal-section {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function useReveal() {
  return useRef<HTMLDivElement>(null);
}

// ── Resolve o tema ──────────────────────────────────────────────────────────
function resolveTheme(themeId?: string): ProposalTheme {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0]; // fallback = pink
}

function themeVars(theme: ProposalTheme): React.CSSProperties {
  return {
    '--accent': theme.accent,
    '--accent-light': theme.accentLight,
    '--bg': theme.bg,
    '--surface': theme.surface,
    '--text': theme.text,
    '--text-muted': theme.textMuted,
  } as React.CSSProperties;
}

// ── PlanCard ────────────────────────────────────────────────────────────────
function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  const mensal = plan.paymentMode === 'mensal';
  const hasDiscount = plan.discount && plan.discount.value > 0;
  const gross = planGrossValue(plan);
  const total = planTotalValue(plan);
  const includedAddons = (plan.addons ?? []).filter((a) => a.included);

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`pp-reveal relative flex flex-col rounded-2xl border p-7 text-left transition-all duration-300 ${plan.featured ? 'md:-translate-y-3' : ''}`}
      style={{
        borderColor: selected ? 'var(--accent)' : undefined,
        background: selected ? 'color-mix(in srgb, var(--accent) 4%, var(--surface))' : 'var(--surface)',
        boxShadow: selected ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 0 0 1px var(--accent)' : undefined,
        color: 'var(--text)',
      }}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-7 rounded-full px-3 py-1 font-display-tech text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: 'var(--accent)' }}>{plan.badge}</span>
      )}
      <div className="flex items-baseline justify-between">
        <span className="font-display-tech text-3xl font-extrabold" style={{ color: 'var(--accent)' }}>{plan.code}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full border`} style={{ borderColor: selected ? 'var(--accent)' : undefined, background: selected ? 'var(--accent)' : 'transparent', color: selected ? 'white' : 'transparent' }}><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
      </div>
      <h3 className="mt-1 font-serif-editorial text-3xl italic lowercase" style={{ color: 'var(--text)' }}>{plan.name}</h3>
      <p className="mt-2 font-display-tech text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{plan.tagline}</p>
      <div className="mt-5 flex items-baseline gap-2 border-t pt-5" style={{ borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)' }}>
        <span className="font-display-tech text-4xl font-bold" style={{ color: 'var(--text)' }}>{plan.total}</span>
        <span className="font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{plan.totalLabel}</span>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        {plan.items.map((it) => {
          const meta = resolveKindMeta(kindOf(it), plan.customKindsMeta);
          const Ic = meta.icon;
          return (
            <div key={it.label}>
              <div className="flex items-center gap-2 font-display-tech text-sm" style={{ color: 'var(--text)' }}>
                <span style={{ color: meta.color }}><Ic className="h-4 w-4 shrink-0" strokeWidth={2} /></span>
                <span className="font-bold">{it.n}×</span> {it.label}
              </div>
              {it.description && (
                <div className="ml-6 mt-0.5 font-display-tech text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{it.description}</div>
              )}
            </div>
          );
        })}
      </div>
      {/* Add-ons inclusos (bônus) */}
      {includedAddons.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
          {includedAddons.map((addon) => (
            <div key={addon.id} className="flex items-center gap-2 font-display-tech text-sm" style={{ color: 'var(--accent)' }}>
              <Gift className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="font-bold">bônus</span> <span style={{ color: 'var(--text)' }}>{addon.label}</span>
            </div>
          ))}
        </div>
      )}
      {/* Preço com desconto */}
      {mensal ? (
        <div className="mt-5 border-t pt-4" style={{ borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)' }}>
          <div className="flex items-baseline gap-1">
            {hasDiscount && gross !== total && (
              <span className="font-display-tech text-lg line-through" style={{ color: 'var(--text-muted)' }}>{brl(gross / Math.max(1, plan.months ?? 1))}</span>
            )}
            <span className="font-display-tech text-3xl font-bold" style={{ color: 'var(--text)' }}>{brl((plan.monthlyValue ?? 0) - (hasDiscount ? discountAmount(plan.monthlyValue ?? 0, plan.discount) : 0))}</span>
            <span className="font-display-tech text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>/mês</span>
          </div>
          {hasDiscount && plan.discount && (
            <span className="mt-1 inline-block rounded-full px-2 py-0.5 font-display-tech text-[10px] font-bold uppercase" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {plan.discount.label || (plan.discount.type === 'percent' ? `-${plan.discount.value}%` : `-${brl(plan.discount.value)}`)}
            </span>
          )}
          <div className="mt-1 font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>por {plan.months ?? 1} {(plan.months ?? 1) === 1 ? 'mês' : 'meses'} · total {brl(total)}</div>
          <div className="mt-3 rounded-lg px-3 py-2 font-display-tech text-[11px] uppercase tracking-widest" style={{ background: 'color-mix(in srgb, var(--text) 5%, transparent)', color: 'var(--text-muted)' }}>{installmentLabel(plan)}</div>
        </div>
      ) : (
        <div className="mt-5 border-t pt-4" style={{ borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)' }}>
          {hasDiscount && gross !== total && plan.discount ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display-tech text-lg line-through" style={{ color: 'var(--text-muted)' }}>{brl(gross)}</span>
                <span className="rounded-full px-2 py-0.5 font-display-tech text-[10px] font-bold uppercase" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {plan.discount.label || (plan.discount.type === 'percent' ? `-${plan.discount.value}%` : `-${brl(plan.discount.value)}`)}
                </span>
              </div>
              <div className="font-display-tech text-3xl font-bold" style={{ color: 'var(--text)' }}>{brl(total)}</div>
            </>
          ) : (
            <div className="font-display-tech text-3xl font-bold" style={{ color: 'var(--text)' }}>{brl(total)}</div>
          )}
          <div className="mt-1 font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>pagamento único · à vista</div>
          {(plan.months ?? 1) > 1 && <div className="mt-2 font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>entrega ao longo de {plan.months} meses</div>}
        </div>
      )}
    </button>
  );
}

// indicador sutil do ciclo pós-aceite
function LifecycleSteps({ stage }: { stage: ProposalStatus }) {
  const steps = ['contrato', 'assinatura', 'pagamento', 'pronto'];
  const reached = stage === 'pago' ? 4 : stage === 'assinada' ? 3 : stage === 'aguardando_assinatura' ? 2 : 1;
  return (
    // gaps/conectores menores no mobile pra a régua das 4 etapas caber em 390px
    // (antes "contrato"/"pronto" eram cortados nas bordas).
    <div className="mb-8 flex items-center justify-center gap-0.5 sm:gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 sm:gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: i < reached ? 'var(--accent)' : '#d4d4d4' }} />
          <span className={`font-display-tech text-[8px] uppercase tracking-tight sm:tracking-widest sm:text-[9px] ${i < reached ? 'text-neutral-700' : 'text-neutral-300'}`}>{s}</span>
          {i < steps.length - 1 && <span className="mx-0.5 h-px w-2.5 sm:mx-1 sm:w-5" style={{ background: i < reached - 1 ? 'var(--accent)' : '#e5e5e5' }} />}
        </div>
      ))}
    </div>
  );
}

// Overlay enquanto o contrato é moldado (WeasyPrint) + criado na Autentique —
// leva alguns segundos. Sem isso, o cliente só via o texto do botão mudar e podia
// achar que travou. As etapas avançam sozinhas pra dar sensação de progresso.
const GEN_STEPS: [LucideIcon, string][] = [
  [FileText, 'moldando o seu contrato'],
  [Pencil, 'preparando a assinatura eletrônica'],
  [Check, 'quase lá, finalizando'],
];

function ContractGenerating() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, GEN_STEPS.length - 1)), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="proposal-doc fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 text-center backdrop-blur-sm" style={{ background: 'color-mix(in srgb, var(--bg) 95%, transparent)' }} role="status" aria-live="polite">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <Loader className="absolute h-20 w-20 animate-spin" style={{ color: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} strokeWidth={1.2} />
        <FileText className="h-8 w-8" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
      </div>
      <h2 className="mt-8 font-serif-editorial text-3xl" style={{ color: 'var(--text)' }}>gerando seu contrato</h2>
      <div className="mt-6 flex flex-col items-center gap-3">
        {GEN_STEPS.map(([Icon, label], i) => (
          <div key={label} className={`flex items-center gap-2.5 font-display-tech text-sm transition-all duration-500 ${i === step ? '' : i < step ? 'opacity-50' : 'opacity-30'}`} style={{ color: i === step ? 'var(--text)' : 'var(--text-muted)' }}>
            {i < step
              ? <Check className="h-4 w-4" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
              : <Icon className={`h-4 w-4`} style={{ color: i === step ? 'var(--accent)' : undefined }} strokeWidth={1.8} />}
            <span>{label}{i === step ? '…' : ''}</span>
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-xs font-display-tech text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>isso leva só alguns segundos. não feche esta página.</p>
    </div>
  );
}

export function ProposalDossier() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [proposal, setProposal] = useState<ProposalInfo | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [form, setForm] = useState({ nome: '', doc: '', email: '', tel: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ContractResult | null>(null);
  const [charge, setCharge] = useState<PaymentResult | null>(null); // cobrança Pix gerada (pendente até o webhook)
  const [stage, setStage] = useState<ProposalStatus>('pendente');
  const [notFound, setNotFound] = useState(false);
  const [codeInput, setCodeInput] = useState(TOKEN ?? '');

  // reveal refs para cada seção
  const revPorque = useReveal();
  const revVersoes = useReveal();
  const revIncluso = useReveal();
  const revProcesso = useReveal();
  const revCalendario = useReveal();
  const revResultados = useReveal();
  const revFaq = useReveal();
  const revCondicoes = useReveal();
  const revAceite = useReveal();

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
      // RELOAD: restaura o link de assinatura vindo do servidor → o iframe volta
      // (em vez de cair no "modo demonstração") e o demo fica false (proposta real).
      if (p.contract?.signingUrl) {
        setResult({ documentId: p.contract.documentId ?? '', signingUrl: p.contract.signingUrl, signerEmail: '', demo: false });
      }
      markViewed(TOKEN); // registra "cliente abriu" na trilha que o admin lê
    });
  }, []);

  // POLLING do status nas etapas que dependem de WEBHOOK (fonte da verdade no
  // servidor): 'aguardando_assinatura' → 'assinada' (webhook Autentique, só quando
  // os DOIS assinam) e 'assinada' → 'pago' (webhook do gateway). O cliente NUNCA
  // afirma "assinei"/"paguei": a página só observa o status e avança sozinha. Não
  // roda no modo demo (sem backend, getProposal não muda → seria polling à toa).
  useEffect(() => {
    const watching = stage === 'aguardando_assinatura' || stage === 'assinada';
    const demo = result?.demo ?? false;
    if (!TOKEN || !watching || demo) return;
    let alive = true;
    const id = setInterval(async () => {
      const p = await getProposal(TOKEN).catch(() => null);
      if (!alive || !p) return;
      // só AVANÇA (nunca regride): respeita a ordem do ciclo.
      const rank: Record<string, number> = { pendente: 0, aguardando_assinatura: 1, assinada: 2, pago: 3 };
      if ((rank[p.status] ?? 0) > (rank[stage] ?? 0)) setStage(p.status);
    }, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [stage, result]);

  // cliente escolhe uma versão: reflete na tela e grava a escolha (trilha do admin)
  const choose = (id: string) => {
    setSelected(id);
    selectPlan(TOKEN, id);
  };

  // abre a proposta pelo código digitado (recarrega com ?c=)
  const openCode = (e: React.FormEvent) => {
    e.preventDefault();
    // token é case-sensitive (gerado com secrets) → preservar a caixa digitada.
    const code = codeInput.trim();
    if (code) window.location.href = `/proposta?c=${encodeURIComponent(code)}`;
  };

  // Resolve tema e seções
  const theme = resolveTheme(proposal?.themeId);
  const sections: ProposalSections = { ...DEFAULT_SECTIONS, ...proposal?.sections };

  const daysLeft = proposal ? Math.ceil((new Date(proposal.expiresAt).getTime() - Date.now()) / 86400000) : null;
  const expired = !!proposal && (proposal.status === 'expirada' || (daysLeft !== null && daysLeft <= 0));

  const docOk = isValidDocumento(form.doc);
  const emailOk = isValidEmail(form.email);
  const telOk = isValidPhone(form.tel);
  const nomeOk = form.nome.trim().length >= 2;
  const canSubmit = !expired && nomeOk && docOk && emailOk && telOk && consent && status !== 'sending';

  const submit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await requestContract(TOKEN, { nome: form.nome.trim(), documento: form.doc.trim(), email: form.email.trim(), telefone: form.tel.trim(), planId: selected });
      setResult(res);
      setStage('aguardando_assinatura'); // contrato gerado → cliente assina na Autentique
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  // gera a cobrança Pix da 1ª parcela. NÃO avança pra 'pago': isso só acontece
  // quando o webhook do gateway confirma (aqui simulado por confirmPaid).
  const pay = async () => {
    setStatus('sending');
    try {
      const res = await requestPayment(TOKEN, selected);
      setCharge(res);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };
  // stand-in do webhook payment.received do gateway (no real, o front faz
  // polling/realtime do status; nunca afirma o pagamento por conta própria).
  const confirmPaid = () => {
    markPaid(TOKEN);
    setStage('pago');
  };

  const field = 'w-full border-b bg-transparent py-3 font-display-tech text-base placeholder:text-neutral-500 outline-none transition-colors';
  const fieldState = (ok: boolean, value: string) => `${field} ${value && !ok ? 'border-red-400' : 'border-neutral-300'}`;

  const backLink = (
    <a href="/" className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-4 py-2 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 shadow-sm backdrop-blur transition-colors hover:text-pink md:left-8 md:top-6">
      voltar ao site
    </a>
  );

  // PORTÃO DE CÓDIGO,sem código ou código inválido
  if (!TOKEN || notFound) {
    return (
      <div className="proposal-doc relative flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center" style={themeVars(resolveTheme('pink'))}>
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>portal de propostas</span>
        <h1 className="mt-4 font-serif-editorial text-5xl text-neutral-900 md:text-6xl">sua proposta</h1>
        <p className="mt-4 max-w-sm font-display-tech text-sm text-neutral-600">digite o código que a maria films te enviou para abrir a sua proposta.</p>
        <form onSubmit={openCode} className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="código de acesso"
            autoFocus
            aria-label="código de acesso"
            className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-center font-display-tech text-base uppercase tracking-widest text-neutral-900 outline-none placeholder:tracking-normal placeholder:text-neutral-500"
            style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          />
          {notFound && <span className="font-display-tech text-xs text-red-500">código não encontrado. confira com a maria films.</span>}
          <button type="submit" className="rounded-full py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg" style={{ background: 'var(--accent)' }}>ver minha proposta</button>
        </form>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-6 font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-pink">não tem código? fale com a gente</a>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-doc flex min-h-screen items-center justify-center bg-bone">
        <span className="font-display-tech text-xs uppercase tracking-hud text-neutral-500">carregando proposta…</span>
      </div>
    );
  }

  if (proposal.blocked) {
    return (
      <div className="proposal-doc flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ ...themeVars(theme), background: 'var(--bg)', color: 'var(--text)' }}>
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>proposta indisponível</span>
        <h1 className="mt-4 font-serif-editorial text-5xl italic lowercase md:text-7xl">esta proposta não está mais disponível</h1>
        <p className="mt-5 max-w-md font-display-tech text-sm lowercase" style={{ color: 'var(--text-muted)' }}>fale com a gente que retomamos a conversa com {proposal.clienteNome}.</p>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-8 rounded-full px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg" style={{ background: 'var(--accent)' }}>falar no whatsapp</a>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="proposal-doc flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ ...themeVars(theme), background: 'var(--bg)', color: 'var(--text)' }}>
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>proposta expirada</span>
        <h1 className="mt-4 font-serif-editorial text-5xl italic lowercase md:text-7xl">esta proposta expirou</h1>
        <p className="mt-5 max-w-md font-display-tech text-sm lowercase" style={{ color: 'var(--text-muted)' }}>as propostas valem por 7 dias. fale com a gente que preparamos uma nova para {proposal.clienteNome}.</p>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-8 rounded-full px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg" style={{ background: 'var(--accent)' }}>pedir nova proposta</a>
      </div>
    );
  }

  if (!proposal.plans || proposal.plans.length === 0) {
    return (
      <div className="proposal-doc flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ ...themeVars(theme), background: 'var(--bg)', color: 'var(--text)' }}>
        {backLink}
        <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>erro na proposta</span>
        <h1 className="mt-4 font-serif-editorial text-5xl italic lowercase md:text-7xl">esta proposta não possui planos válidos configurados</h1>
        <p className="mt-5 max-w-md font-display-tech text-sm lowercase" style={{ color: 'var(--text-muted)' }}>fale com a gente para que possamos corrigir a configuração da proposta.</p>
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} className="mt-8 rounded-full px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg" style={{ background: 'var(--accent)' }}>falar no whatsapp</a>
      </div>
    );
  }

  const chosen = proposal.plans.find((p) => p.id === selected) ?? proposal.plans[0];
  const hoje = new Date().toLocaleDateString('pt-BR');
  const validade = new Date(proposal.expiresAt).toLocaleDateString('pt-BR');
  const ref = (TOKEN ?? 'mf').toUpperCase();

  // DERIVADO: condições dinâmicas (do admin ou fallback)
  const condicoesConfig: CondicoesConfig = sections.condicoes ?? DEFAULT_CONDICOES;
  const condicoes: [LucideIcon, string, string][] = [
    [Clock, 'validade', condicoesConfig.validade.replace('{days}', String(daysLeft ?? 7))],
    [CreditCard, 'pagamento', condicoesConfig.pagamento],
    [Check, 'aprovação', condicoesConfig.aprovacao],
    [X, 'não inclui', condicoesConfig.naoInclui],
  ];

  // FAQ dinâmico
  const faqItems: FAQItem[] = sections.faq ?? DEFAULT_FAQ;

  // Incluso dinâmico
  const inclusoItems: InclusoItem[] = sections.incluso ?? DEFAULT_INCLUSO;

  // CRONOGRAMA da versão escolhida: usa o salvo no admin; se vazio, gera na hora
  // a partir dos entregáveis (toda proposta mostra um plano coerente).
  const schedule = chosen.schedule?.length ? chosen.schedule : generateSchedule(chosen);
  const useMonthView = chosen.scheduleViewMode === 'months';

  // Weeks view (original)
  const schedWeeks = Array.from(new Set(schedule.map((s) => s.week))).sort((a, b) => a - b);
  const kindsPresent = KIND_ORDER.filter((k) => schedule.some((s) => s.kind === k));

  // Months view
  const monthGroups = groupByMonth(schedule);
  const monthKeys = Array.from(monthGroups.keys()).sort((a, b) => a - b);

  // hero title
  const heroTitle = proposal.heroTitle || 'presença digital\nque vira cliente';

  // FLUXO PÓS-ACEITE: contrato → assinatura (Autentique) → pagamento (Stripe) → pronto
  if (stage !== 'pendente') {
    return (
      <div className="proposal-doc relative flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center" style={themeVars(theme)}>
        {backLink}
        <div className={`w-full ${stage === 'aguardando_assinatura' ? 'max-w-4xl' : 'max-w-md'} rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10`}>
          <LifecycleSteps stage={stage} />
          {stage === 'aguardando_assinatura' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Pencil className="h-7 w-7" strokeWidth={1.6} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">assine seu contrato</h1>
              <p className="mx-auto mt-3 max-w-lg font-display-tech text-sm text-neutral-600">revise e assine o contrato da versão <strong className="text-neutral-900">{chosen.code} · {chosen.name}</strong> aqui mesmo. a maria contrassina e, com o contrato fechado, o pagamento é liberado.</p>
              {result?.signingUrl ? (
                <div className="mt-6">
                  <iframe src={result.signingUrl} title="assinatura do contrato" className="h-[70vh] w-full rounded-2xl border border-neutral-200 bg-white" allow="camera; microphone" />
                  <a href={result.signingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 transition-colors" style={{ ['--hover-color' as string]: 'var(--accent)' }}>prefere tela cheia? abrir em nova aba</a>
                </div>
              ) : (
                // SEM signingUrl = backend fora (o link real vem JUNTO do contrato,
                // é síncrono). Não é loading — é modo demonstração. Antes ficava num
                // spinner eterno que parecia travado.
                <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
                  <p className="font-display-tech text-sm text-neutral-700">modo demonstração</p>
                  <p className="mx-auto mt-2 max-w-sm font-display-tech text-[12px] leading-relaxed text-neutral-500">o quadro de assinatura da autentique apareceria aqui. ele só é gerado com o backend no ar (<code className="rounded bg-neutral-200 px-1">uvicorn main:app</code> na pasta <code className="rounded bg-neutral-200 px-1">backend</code>). use o botão abaixo pra simular o avanço.</p>
                </div>
              )}
              {/* Botão de teste SÓ no modo demo (backend fora). Com backend real, a
                  proposta avança sozinha pelo webhook da Autentique (polling acima). */}
              {result?.demo && (
                <button onClick={() => { markSigned(TOKEN); setStage('assinada'); }} className="mt-5 block w-full rounded-full border border-neutral-300 py-2.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 transition-colors hover:border-pink hover:text-pink">[simular] assinatura concluída →</button>
              )}
            </>
          )}
          {stage === 'assinada' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-8 w-8" strokeWidth={2.5} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">assinado</h1>
              {!charge ? (
                <>
                  {chosen.paymentMode === 'mensal' ? (
                    <p className="mt-3 font-display-tech text-sm text-neutral-600">ative o plano <strong className="text-neutral-900">{chosen.code} · {chosen.name}</strong>. no cartão, a mensalidade de <strong className="text-neutral-900">{brl(chosen.monthlyValue ?? 0)}</strong> é debitada automaticamente todo mês por {chosen.months ?? 1} {(chosen.months ?? 1) === 1 ? 'mês' : 'meses'}. prefere Pix? dá pra pagar mês a mês com a gente.</p>
                  ) : (
                    <p className="mt-3 font-display-tech text-sm text-neutral-600">falta só o pagamento da versão <strong className="text-neutral-900">{chosen.code} · {chosen.name}</strong>.</p>
                  )}
                  <div className="mt-4 font-display-tech text-3xl font-bold text-neutral-900">{chosen.price}</div>
                  <div className="font-display-tech text-[11px] text-neutral-500">{chosen.priceNote} · {chosen.duration}</div>
                  {status === 'error' && <p className="mt-3 font-display-tech text-xs text-red-500">não foi possível gerar o pagamento. tente de novo.</p>}
                  <button onClick={pay} disabled={status === 'sending'} className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white" style={{ background: status === 'sending' ? '#d4d4d4' : 'var(--accent)' }}>
                    <CreditCard className="h-4 w-4" strokeWidth={2} /> {status === 'sending' ? 'abrindo…' : chosen.paymentMode === 'mensal' ? 'ativar plano' : 'gerar pix'}
                  </button>
                </>
              ) : (
                <>
                  {chosen.paymentMode === 'mensal' ? (
                    <p className="mt-3 font-display-tech text-sm text-neutral-600">pague a 1ª mensalidade de <strong className="text-neutral-900">{brl(chosen.monthlyValue ?? 0)}</strong> no app do seu banco. as próximas entram automático no cartão (ou combinamos o Pix mês a mês).</p>
                  ) : (
                    <p className="mt-3 font-display-tech text-sm text-neutral-600">pague no app do seu banco. assim que o pix cair, a gente começa.</p>
                  )}
                  <div className="mt-4 font-display-tech text-3xl font-bold text-neutral-900">{chosen.paymentMode === 'mensal' ? brl(chosen.monthlyValue ?? 0) : chosen.price}</div>
                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
                    <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{chosen.paymentMode === 'mensal' ? 'pix da 1ª mensalidade' : 'pix copia e cola'}</span>
                    <p className="mt-2 break-all font-display-tech text-xs text-neutral-700">{charge.pixCopiaECola}</p>
                    <button onClick={() => charge.pixCopiaECola && navigator.clipboard?.writeText(charge.pixCopiaECola)} className="mt-3 rounded-full border border-neutral-300 px-4 py-2 font-display-tech text-[10px] uppercase tracking-widest text-neutral-600 transition-colors hover:border-pink hover:text-pink">copiar código pix</button>
                  </div>
                  {/* Botão de teste SÓ no modo demo. Com gateway real, 'pago' chega
                      pelo webhook do gateway (polling do status), nunca por clique. */}
                  {charge?.demo && (
                    <button onClick={confirmPaid} className="mt-4 block w-full font-display-tech text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-pink">[simular] pagamento confirmado</button>
                  )}
                </>
              )}
            </>
          )}
          {stage === 'pago' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-8 w-8" strokeWidth={2.5} /></div>
              <h1 className="mt-6 font-serif-editorial text-4xl text-neutral-900">tudo certo!</h1>
              <p className="mt-3 font-display-tech text-sm text-neutral-600">obrigado{form.nome ? `, ${form.nome.split(' ')[0]}` : ''}! contrato assinado e pagamento confirmado. em breve o briefing inicial.</p>
              <button className="mt-6 rounded-full border border-neutral-300 px-6 py-3 font-display-tech text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:border-pink hover:text-pink">baixar contrato</button>
            </>
          )}
          {/* nota de protótipo SÓ no modo demo explícito (mock). Com backend real
              — inclusive ao recarregar uma proposta assinada — fica escondida. */}
          {(result?.demo || charge?.demo) && (
            <p className="mt-6 font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">[protótipo] autentique (assinatura) + gateway pix entram com o backend</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="proposal-doc min-h-screen" style={{ ...themeVars(theme), background: 'var(--bg)', color: 'var(--text)' }}>
      <style>{REVEAL_STYLE}</style>
      {status === 'sending' && <ContractGenerating />}
      {backLink}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-4 py-2 font-display-tech text-[10px] uppercase tracking-widest text-neutral-600 shadow-sm backdrop-blur md:right-8 md:top-6">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--accent)' }} />
        válida por mais {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
      </div>

      <div className="relative">
        {/* HERO */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <span className="font-display-tech text-[11px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>proposta comercial · maria films</span>
          <h1 className="pp-title mt-6 font-serif-editorial text-5xl italic lowercase leading-[0.95] md:text-8xl" style={{ color: 'var(--text)' }}>
            {heroTitle.split('\n').map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          {proposal.heroSubtitle && (
            <p className="mt-4 max-w-md font-display-tech text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>{proposal.heroSubtitle}</p>
          )}
          <p className="mt-7 max-w-lg font-display-tech text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>{proposal.intro}</p>
          <div className="mt-8 flex items-center gap-3 rounded-full border px-5 py-2.5 shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)', background: 'var(--surface)' }}>
            <span className="font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>preparada para</span>
            <span className="font-serif-editorial text-xl" style={{ color: 'var(--text)' }}>{proposal.clienteNome}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>proposta nº {ref}</span>
            <span style={{ color: 'color-mix(in srgb, var(--text) 25%, transparent)' }}>·</span>
            <span>{hoje}</span>
            <span style={{ color: 'color-mix(in srgb, var(--text) 25%, transparent)' }}>·</span>
            <span>válida até {validade}</span>
          </div>
          <div className="absolute bottom-10 flex flex-col items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="font-display-tech text-[9px] uppercase tracking-hud">role para ler</span>
            <div className="flex h-7 w-4 justify-center rounded-full border p-1" style={{ borderColor: 'color-mix(in srgb, var(--text) 25%, transparent)' }}><div className="h-1.5 w-1 animate-bounce rounded-full" style={{ background: 'var(--text-muted)' }} /></div>
          </div>
        </section>

        {/* POR QUE / CONTEXTO */}
        {sections.showPorque !== false && (
          <section ref={revPorque} className="reveal-section border-t px-4 py-24 md:px-10" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)', background: 'var(--surface)' }}>
            <div className="mx-auto max-w-5xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>por que agora</span>
              <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-6xl" style={{ color: 'var(--text)' }}>o jogo é de quem aparece</h2>
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                {PORQUE.map(([Icon, t, d]) => (
                  <div key={t} className="pp-reveal">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Icon className="h-6 w-6" strokeWidth={1.6} /></div>
                    <h3 className="mt-4 font-serif-editorial text-2xl italic lowercase" style={{ color: 'var(--text)' }}>{t}</h3>
                    <p className="mt-2 font-display-tech text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VERSÕES */}
        <section ref={revVersoes} className="reveal-section px-4 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>versões &amp; valores</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-6xl" style={{ color: 'var(--text)' }}>escolha sua versão</h2>
            <p className="mt-3 max-w-lg font-display-tech text-sm" style={{ color: 'var(--text-muted)' }}>cada versão inclui roteiro, captação, edição, legenda e aprovação antes de cada postagem.</p>
            <div className={`mt-12 grid grid-cols-1 gap-6 ${proposal.plans.length === 2 ? 'md:mx-auto md:max-w-3xl md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {proposal.plans.map((p) => <PlanCard key={p.id} plan={p} selected={selected === p.id} onSelect={() => choose(p.id)} />)}
            </div>
          </div>
        </section>

        {/* INCLUSO EM TODAS AS VERSÕES (vantagens) */}
        {sections.showIncluso !== false && (
          <section ref={revIncluso} className="reveal-section border-t px-4 py-24 md:px-10" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)', background: 'color-mix(in srgb, var(--accent) 3%, var(--bg))' }}>
            <div className="mx-auto max-w-6xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>incluso em qualquer versão</span>
              <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-6xl" style={{ color: 'var(--text)' }}>o que você ganha sempre</h2>
              <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
                {inclusoItems.map((item, idx) => {
                  // match icon by label, fallback to positional from INCLUSO_FALLBACK or generic
                  const Icon = INCLUSO_ICONS[item.label] ?? INCLUSO_FALLBACK[idx]?.[0] ?? Check;
                  return (
                    <div key={item.label} className="pp-reveal flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: 'var(--accent)' }}><Icon className="h-6 w-6" strokeWidth={1.7} /></div>
                      <div>
                        <h3 className="font-display-tech text-base font-semibold" style={{ color: 'var(--text)' }}>{item.label}</h3>
                        <p className="mt-1 font-display-tech text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* COMO FUNCIONA */}
        {sections.showProcesso !== false && (
          <section ref={revProcesso} className="reveal-section border-t px-4 py-24 md:px-10" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)', background: 'var(--surface)' }}>
            <div className="mx-auto max-w-6xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>como funciona</span>
              <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-6xl" style={{ color: 'var(--text)' }}>do roteiro ao post</h2>
              <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
                {([['reels / vídeo', PROCESS.reels], ['arte / carrossel', PROCESS.arte]] as const).map(([title, steps]) => (
                  <div key={title} className="pp-reveal">
                    <h3 className="font-display-tech text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{title}</h3>
                    <div className="mt-5 flex flex-col">
                      {steps.map(([t, d], i) => (
                        <div key={t} className="flex gap-4 border-b py-4" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
                          <span className="font-display-tech text-sm font-bold" style={{ color: 'color-mix(in srgb, var(--text) 25%, transparent)' }}>0{i + 1}</span>
                          <div>
                            <div className="font-display-tech text-sm font-semibold" style={{ color: 'var(--text)' }}>{t}</div>
                            <div className="mt-1 font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>{d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CALENDÁRIO */}
        {sections.showCalendario !== false && (
          <section ref={revCalendario} className="reveal-section px-4 py-24 md:px-10">
            <div className="mx-auto max-w-6xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>calendário de conteúdo</span>
              <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-6xl" style={{ color: 'var(--text)' }}>presença constante</h2>
              <p className="pp-reveal mt-4 max-w-xl font-display-tech text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>no plano <strong style={{ color: 'var(--text)' }}>{chosen.code} · {chosen.name}</strong> são <strong style={{ color: 'var(--text)' }}>{chosen.total} {chosen.totalLabel}</strong>, distribuídos pra manter ritmo constante sem saturar a audiência.</p>

              {/* legenda dos tipos presentes */}
              <div className="pp-reveal mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                {kindsPresent.map((k) => {
                  const M = KIND_META[k];
                  const Ic = M.icon;
                  return (
                    <span key={k} className="flex items-center gap-1.5 font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: M.color }}><Ic className="h-4 w-4" strokeWidth={2} /></span> {M.label}
                    </span>
                  );
                })}
              </div>

              {/* Monthly view */}
              {useMonthView ? (
                <div className="pp-reveal mt-8 flex flex-col gap-6">
                  {monthKeys.map((month) => {
                    const entries = monthGroups.get(month)!;
                    const weeksInMonth = Array.from(new Set(entries.map((e) => e.week))).sort((a, b) => a - b);
                    return (
                      <div key={month}>
                        <h3 className="mb-3 font-display-tech text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>mês {month}</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {weeksInMonth.map((w) => (
                            <div key={w} className="rounded-xl border p-5 shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--text) 12%, transparent)', background: 'var(--surface)' }}>
                              <div className="font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>semana {w}</div>
                              <div className="mt-4 flex flex-col gap-2.5">
                                {entries.filter((s) => s.week === w).map((s) => {
                                  const M = KIND_META[s.kind] ?? resolveKindMeta(s.kind, chosen.customKindsMeta);
                                  const Ic = M.icon;
                                  return (
                                    <div key={s.id} className="flex items-center gap-2 font-display-tech text-sm" style={{ color: 'var(--text)' }}>
                                      <span style={{ color: M.color }}><Ic className="h-4 w-4 shrink-0" strokeWidth={2} /></span>
                                      <span className="w-7 shrink-0 text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>{s.day}</span>
                                      <span className="truncate">{s.label || M.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Weeks view (original) */
                <div className="pp-reveal mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {schedWeeks.map((w) => (
                    <div key={w} className="rounded-xl border p-5 shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--text) 12%, transparent)', background: 'var(--surface)' }}>
                      <div className="font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{w}ª semana</div>
                      <div className="mt-4 flex flex-col gap-2.5">
                        {schedule.filter((s) => s.week === w).map((s) => {
                          const M = KIND_META[s.kind] ?? resolveKindMeta(s.kind, chosen.customKindsMeta);
                          const Ic = M.icon;
                          return (
                            <div key={s.id} className="flex items-center gap-2 font-display-tech text-sm" style={{ color: 'var(--text)' }}>
                              <span style={{ color: M.color }}><Ic className="h-4 w-4 shrink-0" strokeWidth={2} /></span>
                              <span className="w-7 shrink-0 text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>{s.day}</span>
                              <span className="truncate">{s.label || M.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* RESULTADOS */}
        {sections.showResultados !== false && (
          <section ref={revResultados} className="reveal-section border-t border-neutral-200 bg-neutral-900 px-4 py-24 text-bone md:px-10">
            <div className="mx-auto max-w-6xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>por que dá certo</span>
              <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
                {DIFFS.map(([n, d], i) => {
                  const Ic = DIFF_ICONS[i] ?? TrendingUp;
                  return (
                    <div key={n} className="pp-reveal">
                      <Ic className="h-8 w-8" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
                      <div className="mt-3 font-display-tech text-6xl font-bold md:text-7xl" style={{ color: 'var(--accent)' }}>{n}</div>
                      <p className="mt-3 max-w-xs font-display-tech text-sm leading-relaxed text-bone/70">{d}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {sections.showFaq !== false && (
          <section ref={revFaq} className="reveal-section px-4 py-24 md:px-10">
            <div className="mx-auto max-w-3xl">
              <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>perguntas frequentes</span>
              <h2 className="pp-title mt-3 font-serif-editorial text-4xl italic lowercase md:text-5xl" style={{ color: 'var(--text)' }}>o que costumam perguntar</h2>
              <div className="mt-10 flex flex-col">
                {faqItems.map((item) => (
                  <div key={item.q} className="pp-reveal border-b py-6" style={{ borderColor: 'color-mix(in srgb, var(--text) 12%, transparent)' }}>
                    <h3 className="font-display-tech text-base font-semibold" style={{ color: 'var(--text)' }}>{item.q}</h3>
                    <p className="mt-2 font-display-tech text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONDIÇÕES */}
        {sections.showCondicoes !== false && (
          <section ref={revCondicoes} className="reveal-section border-t px-4 py-20 md:px-10" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)', background: 'var(--surface)' }}>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4">
              {condicoes.map(([Icon, t, d]) => (
                <div key={t} className="pp-reveal">
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                  <div className="mt-3 font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--text)' }}>{t}</div>
                  <p className="mt-1 font-display-tech text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{d}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACEITE */}
        <section ref={revAceite} id="assinar" className="reveal-section border-t px-4 py-28 md:px-10" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-display-tech text-[10px] uppercase tracking-hud" style={{ color: 'var(--accent)' }}>aceite</span>
            <h2 className="pp-title mt-3 font-serif-editorial text-5xl italic lowercase md:text-7xl" style={{ color: 'var(--text)' }}>vamos começar?</h2>
            <p className="mt-5 font-display-tech text-sm" style={{ color: 'var(--text-muted)' }}>confirme a versão, preencha seus dados e aceite. o contrato é montado conforme sua escolha e enviado para você assinar pela autentique.</p>
          </div>

          <div className="pp-reveal mx-auto mt-12 max-w-3xl rounded-2xl border p-6" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 4%, var(--bg))' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="font-display-tech text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>versão escolhida</span>
                <div className="font-serif-editorial text-3xl italic lowercase" style={{ color: 'var(--text)' }}>{chosen.code} · {chosen.name}</div>
                <div className="mt-1 font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>{chosen.tagline}</div>
                {/* o que entra — confirma o pacote bem na hora de aceitar */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {chosen.items.map((it) => {
                    const M = resolveKindMeta(kindOf(it), chosen.customKindsMeta);
                    const Ic = M.icon;
                    return (
                      <span key={it.label} className="flex items-center gap-1.5 font-display-tech text-xs" style={{ color: 'var(--text)' }}>
                        <span style={{ color: M.color }}><Ic className="h-3.5 w-3.5" strokeWidth={2} /></span>
                        <span className="font-bold">{it.n}×</span> {it.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                {chosen.paymentMode === 'mensal' ? (
                  <>
                    <div className="font-display-tech text-3xl font-bold" style={{ color: 'var(--text)' }}>{brl(chosen.monthlyValue ?? 0)}<span className="text-base font-semibold" style={{ color: 'var(--text-muted)' }}>/mês</span></div>
                    <div className="font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>por {chosen.months ?? 1} {(chosen.months ?? 1) === 1 ? 'mês' : 'meses'} · total {brl(planTotalValue(chosen))}</div>
                  </>
                ) : (
                  <>
                    <div className="font-display-tech text-3xl font-bold" style={{ color: 'var(--text)' }}>{brl(planTotalValue(chosen))}</div>
                    <div className="font-display-tech text-xs" style={{ color: 'var(--text-muted)' }}>pagamento único</div>
                  </>
                )}
              </div>
            </div>
            {chosen.paymentMode === 'mensal' && (
              <div className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 font-display-tech text-[11px] ring-1" style={{ background: 'var(--surface)', color: 'var(--text-muted)', ringColor: 'color-mix(in srgb, var(--text) 15%, transparent)' } as React.CSSProperties}>
                <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={1.8} /> {installmentLabel(chosen)} · compromisso de {chosen.months ?? 1} {(chosen.months ?? 1) === 1 ? 'mês' : 'meses'}
              </div>
            )}
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <input aria-label="nome completo" className={fieldState(nomeOk, form.nome)} style={{ color: 'var(--text)' }} placeholder="nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <div>
              <input aria-label="telefone ou whatsapp" className={fieldState(telOk, form.tel)} style={{ color: 'var(--text)' }} type="tel" inputMode="tel" placeholder="telefone / whatsapp" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} />
              {form.tel && !telOk && <span className="mt-1 block font-display-tech text-[10px] text-red-500">telefone inválido (com ddd)</span>}
            </div>
            <div>
              <input aria-label="cpf ou cnpj" className={fieldState(docOk, form.doc)} style={{ color: 'var(--text)' }} placeholder="cpf / cnpj" value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} />
              {form.doc && !docOk && <span className="mt-1 block font-display-tech text-[10px] text-red-500">cpf/cnpj inválido</span>}
            </div>
            <div>
              <input aria-label="e-mail" className={fieldState(emailOk, form.email)} style={{ color: 'var(--text)' }} type="email" placeholder="e-mail (para o contrato)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {form.email && !emailOk && <span className="mt-1 block font-display-tech text-[10px] text-red-500">e-mail inválido</span>}
            </div>
            <label className="flex cursor-pointer items-start gap-3 md:col-span-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: 'var(--accent)' }} />
              <span className="font-display-tech text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {chosen.paymentMode === 'mensal'
                  ? `concordo com os termos da proposta e com o plano de ${chosen.months ?? 1} ${(chosen.months ?? 1) === 1 ? 'mês' : 'meses'} (${chosen.months ?? 1} ${(chosen.months ?? 1) === 1 ? 'mensalidade' : 'mensalidades'} de ${brl(chosen.monthlyValue ?? 0)}). `
                  : 'concordo com os termos da proposta. '}
                autorizo a geração do contrato e o envio para assinatura eletrônica. meus dados serão usados apenas para emissão e assinatura do documento (LGPD).
              </span>
            </label>
            {status === 'error' && <p className="font-display-tech text-xs text-red-500 md:col-span-2">não foi possível gerar o contrato. tente novamente em instantes.</p>}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="group mt-2 flex items-center justify-center gap-3 rounded-full py-5 font-display-tech text-sm font-semibold uppercase tracking-widest transition-all duration-300 md:col-span-2"
              style={{ background: canSubmit ? 'var(--accent)' : '#d4d4d4', color: canSubmit ? 'white' : '#737373', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              {status === 'sending' ? 'gerando contrato…' : 'aceitar e gerar contrato'}
            </button>
          </div>

          <footer className="mx-auto mt-24 flex max-w-3xl flex-col items-center gap-3 border-t pt-10 text-center font-display-tech text-[11px] uppercase tracking-widest" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)', color: 'var(--text-muted)' }}>
            <span className="font-serif-editorial text-xl italic lowercase" style={{ color: 'var(--text)' }}>maria films</span>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <span>{CONTACT.whatsapp}</span><span style={{ color: 'var(--accent)' }}>·</span>
              <span>{CONTACT.instagram}</span><span style={{ color: 'var(--accent)' }}>·</span>
              <span className="lowercase">{CONTACT.email}</span>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
