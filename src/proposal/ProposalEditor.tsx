import { useState } from 'react';
import { savePreview, defaultContent, type ProposalContent } from './api';
import {
  generateSchedule, defaultWeeks, kindOf, deriveDisplay, sumItems, brl, planTotalValue,
  KIND_META, KIND_ORDER, WEEKDAYS, duplicateWeek, fillFromWeekTemplate, weekToMonth,
  THEMES, DEFAULT_FAQ, DEFAULT_INCLUSO, DEFAULT_CONDICOES,
  type Plan, type DeliverableKind, type Weekday, type DeliverableItem, type ScheduleEntry, type PaymentMode,
  type ScheduleViewMode, type PlanDiscount, type PlanAddon,
  type ProposalSections,
} from './plans';
import { DEFAULT_SECTIONS } from './plans';

// Editor de proposta: edita cliente, intro, validade, anotação interna e CADA
// versão (nome, tagline, preço, duração, entregáveis). Escreve o `content` que a
// página mostra E que o contrato usa — fonte única. Permite pré-visualizar,
// reordenar e restaurar as versões padrão.

const inp = 'w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';
const lbl = 'font-display-tech text-[10px] uppercase tracking-widest text-neutral-500';

// Número que dá pra APAGAR e redigitar: 0/indefinido vira campo vazio em vez de
// travar num valor fixo. O valor real é coerido na hora de usar (deriveDisplay,
// totais), então um campo vazio durante a digitação nunca quebra a conta.
const numVal = (x: number | undefined) => (x ? String(x) : '');
const numParse = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
// Dropdown com a cara do projeto (sem o combobox cinza do sistema): tira a seta
// nativa (appearance-none) e desenha a nossa em SVG.
const selectBase = 'cursor-pointer appearance-none pr-9';
const selectChevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.6rem center',
  backgroundSize: '12px',
} as const;

// Toggle switch reutilizável
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center gap-2">
      <span className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${on ? 'bg-pink' : 'bg-neutral-300'}`}>
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
      </span>
      {label && <span className="font-display-tech text-[11px] text-neutral-700">{label}</span>}
    </button>
  );
}

export function ProposalEditor({
  initial,
  title,
  editToken,
  onSave,
  onCancel,
}: {
  initial: ProposalContent;
  title: string;
  editToken?: string | null;
  onSave: (c: ProposalContent) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<ProposalContent>(() => ({
    ...initial,
    heroTitle: initial.heroTitle ?? '',
    heroSubtitle: initial.heroSubtitle ?? '',
    themeId: initial.themeId ?? 'pink',
    sections: initial.sections ?? { ...DEFAULT_SECTIONS, faq: DEFAULT_FAQ.map((f) => ({ ...f })), incluso: DEFAULT_INCLUSO.map((i) => ({ ...i })), condicoes: { ...DEFAULT_CONDICOES } },
  }));

  const [showPersonalization, setShowPersonalization] = useState(false);

  const set = <K extends keyof ProposalContent>(k: K, v: ProposalContent[K]) => setC((p) => ({ ...p, [k]: v }));
  // Quando o cálculo automático está ligado, qualquer mudança em valor/meses/
  // entregáveis re-deriva preço, total, duração e "por conteúdo". É o "amarrar".
  const recalc = (pl: Plan): Plan => (pl.autoPrice === true ? { ...pl, ...deriveDisplay(pl) } : pl);
  const setPlan = (i: number, patch: Partial<Plan>) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === i ? recalc({ ...pl, ...patch }) : pl)) }));
  const setItem = (pi: number, ii: number, patch: Partial<DeliverableItem>) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) => (idx === pi ? recalc({ ...pl, items: pl.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) }) : pl)),
    }));
  const addItem = (pi: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? recalc({ ...pl, items: [...pl.items, { label: 'novo entregável', n: 1, kind: 'reels' as DeliverableKind }] }) : pl)) }));

  // ── cronograma da versão ──────────────────────────────────────────────────
  const patchPlanSched = (pi: number, sched: ScheduleEntry[]) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: sched } : pl)) }));
  const genSchedule = (pi: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: generateSchedule(pl) } : pl)) }));
  const clearSchedule = (pi: number) => patchPlanSched(pi, []);
  // guarda o valor cru (inclusive 0/vazio durante a digitação); o nº efetivo de
  // semanas é resolvido na renderização com piso no defaultWeeks.
  const setWeeks = (pi: number, weeks: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, weeks: Math.max(0, weeks | 0) } : pl)) }));
  const addEntry = (pi: number, week: number) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: [...(pl.schedule ?? []), { id: Math.random().toString(36).slice(2, 8), week, day: 'ter' as Weekday, kind: 'reels' as DeliverableKind }] } : pl)) }));
  const setEntry = (pi: number, id: string, patch: Partial<ScheduleEntry>) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: (pl.schedule ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)) } : pl)) }));
  const removeEntry = (pi: number, id: string) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: (pl.schedule ?? []).filter((s) => s.id !== id) } : pl)) }));
  const removeItem = (pi: number, ii: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? recalc({ ...pl, items: pl.items.filter((_, j) => j !== ii) }) : pl)) }));
  const removePlan = (i: number) => setC((p) => ({ ...p, plans: p.plans.filter((_, idx) => idx !== i) }));
  const setFeatured = (i: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => ({ ...pl, featured: idx === i ? !pl.featured : false })) }));
  const movePlan = (i: number, dir: -1 | 1) =>
    setC((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.plans.length) return p;
      const plans = [...p.plans];
      [plans[i], plans[j]] = [plans[j], plans[i]];
      return { ...p, plans };
    });
  const restoreDefaults = () => setC((p) => ({ ...p, plans: defaultContent().plans }));
  const addPlan = () =>
    setC((p) => ({
      ...p,
      plans: [
        ...p.plans,
        recalc({ id: 'custom-' + Math.random().toString(36).slice(2, 7), code: 'V' + (p.plans.length + 1), name: 'nova versão', tagline: '', total: 0, totalLabel: 'conteúdos', items: [], duration: '', price: 'R$ 0', priceNote: '', perContent: '', paymentMode: 'avista', totalValue: 0, months: 1, autoPrice: true }),
      ],
    }));

  // ── desconto helpers ──────────────────────────────────────────────────────
  const toggleDiscount = (i: number, on: boolean) => {
    if (on) {
      setPlan(i, { discount: { type: 'percent', value: 10, label: '' } });
    } else {
      setPlan(i, { discount: undefined });
    }
  };
  const setDiscount = (i: number, patch: Partial<PlanDiscount>) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) => (idx === i ? recalc({ ...pl, discount: { ...(pl.discount ?? { type: 'percent', value: 0 }), ...patch } }) : pl)),
    }));

  // ── addon helpers ─────────────────────────────────────────────────────────
  const addAddon = (i: number) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) =>
        idx === i
          ? recalc({ ...pl, addons: [...(pl.addons ?? []), { id: Math.random().toString(36).slice(2, 8), label: 'novo adicional', description: '', price: 0, included: false }] })
          : pl,
      ),
    }));
  const setAddon = (pi: number, ai: number, patch: Partial<PlanAddon>) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) =>
        idx === pi
          ? recalc({ ...pl, addons: (pl.addons ?? []).map((a, j) => (j === ai ? { ...a, ...patch } : a)) })
          : pl,
      ),
    }));
  const removeAddon = (pi: number, ai: number) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) =>
        idx === pi ? recalc({ ...pl, addons: (pl.addons ?? []).filter((_, j) => j !== ai) }) : pl,
      ),
    }));

  // ── sections helpers ──────────────────────────────────────────────────────
  const sec = c.sections ?? { ...DEFAULT_SECTIONS };
  const setSections = (patch: Partial<ProposalSections>) => set('sections', { ...sec, ...patch });

  const nomeOk = c.clienteNome.trim().length >= 2;
  const valido = nomeOk && c.plans.length >= 1;

  const preview = () => {
    const link = savePreview(c);
    window.open(link, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-900/50 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-editorial text-2xl text-neutral-900">{title}</h2>
          <div className="flex items-center gap-4">
            <button onClick={preview} className="font-display-tech text-xs uppercase tracking-widest text-pink hover:underline">pré-visualizar</button>
            <button onClick={onCancel} className="font-display-tech text-xs uppercase tracking-widest text-neutral-500 hover:text-pink">cancelar</button>
          </div>
        </div>
        {editToken && <div className="mt-1 font-mono text-[11px] text-neutral-500">{editToken}</div>}

        {/* dados gerais */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className={lbl}>cliente</label>
            <input className={inp} value={c.clienteNome} onChange={(e) => set('clienteNome', e.target.value)} placeholder="nome do cliente" />
            {!nomeOk && c.clienteNome.length > 0 && <span className="mt-1 block font-display-tech text-[10px] text-red-500">mínimo 2 letras</span>}
          </div>
          <div>
            <label className={lbl}>validade (dias)</label>
            <input type="number" min={1} className={`${inp} w-24`} value={numVal(c.days)} placeholder="7" onChange={(e) => set('days', numParse(e.target.value))} />
          </div>
        </div>
        <div className="mt-4">
          <label className={lbl}>introdução (texto do topo)</label>
          <textarea className={`${inp} min-h-[70px] resize-none`} value={c.intro} onChange={(e) => set('intro', e.target.value)} placeholder="frase de abertura personalizada para o cliente" />
        </div>
        <div className="mt-4">
          <label className={lbl}>anotação interna (só você vê, não vai pro cliente)</label>
          <textarea className={`${inp} min-h-[50px] resize-none`} value={c.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="contexto, combinados por fora, lembrete" />
        </div>

        {/* versões */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display-tech text-sm font-bold uppercase tracking-widest text-neutral-900">versões</h3>
          <div className="flex items-center gap-2">
            <button onClick={restoreDefaults} className="rounded-full border border-neutral-300 px-3 py-1.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:border-pink hover:text-pink">restaurar padrão</button>
            <button onClick={addPlan} className="rounded-full border border-neutral-300 px-3 py-1.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:border-pink hover:text-pink">+ versão</button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {c.plans.map((pl, i) => (
            <div key={pl.id} className={`rounded-xl border p-5 ${pl.featured ? 'border-pink bg-pink/[0.03]' : 'border-neutral-200'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-[180px] flex-1 items-center gap-2">
                  <input className={`${inp} !w-16 shrink-0 text-center font-bold`} value={pl.code} onChange={(e) => setPlan(i, { code: e.target.value })} />
                  <input className={`${inp} flex-1`} value={pl.name} onChange={(e) => setPlan(i, { name: e.target.value })} placeholder="nome" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => movePlan(i, -1)} disabled={i === 0} className={`font-display-tech text-[10px] uppercase tracking-widest ${i === 0 ? 'text-neutral-200' : 'text-neutral-500 hover:text-pink'}`}>subir</button>
                  <button onClick={() => movePlan(i, 1)} disabled={i === c.plans.length - 1} className={`font-display-tech text-[10px] uppercase tracking-widest ${i === c.plans.length - 1 ? 'text-neutral-200' : 'text-neutral-500 hover:text-pink'}`}>descer</button>
                  <button onClick={() => setFeatured(i)} className={`font-display-tech text-[10px] uppercase tracking-widest ${pl.featured ? 'text-pink' : 'text-neutral-500 hover:text-pink'}`}>{pl.featured ? 'em destaque' : 'destacar'}</button>
                  <button onClick={() => removePlan(i)} className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500 hover:text-red-500">remover</button>
                </div>
              </div>

              <input className={`${inp} mt-3`} value={pl.tagline} onChange={(e) => setPlan(i, { tagline: e.target.value })} placeholder="frase curta da versão" />

              {/* CONTEÚDO primeiro: o que entrega (entregáveis) define o nº de
                  conteúdos; o cronograma distribui esses mesmos itens. Ficam juntos
                  porque um amarra o outro. O comercial (valores) vem depois. */}
              <div className="mt-4">
                <label className={lbl}>entregáveis</label>
                <div className="mt-2 flex flex-col gap-2">
                  {pl.items.map((it, j) => (
                    <div key={j} className="flex flex-col gap-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 sm:flex-1">
                          <input type="number" min={0} className={`${inp} !w-14 shrink-0 text-center`} value={numVal(it.n)} placeholder="0" onChange={(e) => setItem(i, j, { n: numParse(e.target.value) })} />
                          <input className={`${inp} flex-1`} value={it.label} onChange={(e) => setItem(i, j, { label: e.target.value })} placeholder="ex.: Reels" />
                        </div>
                        <div className="flex items-center gap-2">
                          <select value={kindOf(it)} onChange={(e) => setItem(i, j, { kind: e.target.value as DeliverableKind })} className={`${inp} ${selectBase} flex-1 sm:w-32 sm:flex-none`} style={selectChevron} title="tipo de conteúdo">
                            {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_META[k].label}</option>)}
                          </select>
                          <button onClick={() => removeItem(i, j)} className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500">remover</button>
                        </div>
                      </div>
                      {/* descrição do entregável */}
                      <textarea
                        className={`${inp} ml-16 min-h-[36px] resize-none text-xs`}
                        value={it.description ?? ''}
                        onChange={(e) => setItem(i, j, { description: e.target.value })}
                        placeholder="detalhes do entregável (ex: vídeo de 30s, formato vertical)"
                        rows={1}
                      />
                    </div>
                  ))}
                  <button onClick={() => addItem(i)} className="self-start font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">+ entregável</button>
                </div>
              </div>

              {/* cronograma desta versão */}
              <ScheduleEditor
                plan={pl}
                onWeeks={(w) => setWeeks(i, w)}
                onGen={() => genSchedule(i)}
                onClear={() => clearSchedule(i)}
                onAdd={(week) => addEntry(i, week)}
                onSet={(id, patch) => setEntry(i, id, patch)}
                onRemove={(id) => removeEntry(i, id)}
                onViewMode={(mode) => setPlan(i, { scheduleViewMode: mode })}
                onDuplicateWeek={(fromWeek) => {
                  const sched = pl.schedule ?? [];
                  const newSched = duplicateWeek(sched, fromWeek, fromWeek + 1);
                  patchPlanSched(i, newSched);
                }}
                onFillTemplate={() => {
                  const sched = pl.schedule ?? [];
                  const week1 = sched.filter((s) => s.week === 1);
                  if (week1.length === 0) return;
                  const wk = pl.weeks && pl.weeks > 0 ? pl.weeks : defaultWeeks(pl);
                  const newSched = fillFromWeekTemplate(week1, wk);
                  patchPlanSched(i, newSched);
                }}
              />

              {/* COMO O CLIENTE PAGA — o botão que molda a versão. Único OU
                  mensalidade OU parcelado. Tudo que o cliente vê (preço, total,
                  duração) DERIVA daqui via deriveDisplay → nada de campo livre que
                  se contradiz. */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <label className={lbl}>como o cliente paga esta versão</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([
                    ['avista', 'pagamento único', 'paga uma vez'],
                    ['mensal', 'mensalidade', 'paga todo mês'],
                    ['parcelado', 'parcelado', 'divide sem juros'],
                  ] as const).map(([m, titulo, sub]) => {
                    const on = pl.paymentMode === m || (m === 'avista' && !pl.paymentMode);
                    return (
                      <button
                        key={m}
                        onClick={() => setPlan(i, { paymentMode: m as PaymentMode, autoPrice: true })}
                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${on ? 'border-pink bg-pink/[0.04] ring-1 ring-pink' : 'border-neutral-300 hover:border-neutral-400'}`}
                      >
                        <div className={`font-display-tech text-sm font-bold ${on ? 'text-pink' : 'text-neutral-800'}`}>{titulo}</div>
                        <div className="font-display-tech text-[11px] text-neutral-500">{sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* só os campos que esse tipo precisa — rótulos sem ambiguidade */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pl.paymentMode === 'mensal' ? (
                    <div>
                      <label className={lbl}>valor da mensalidade (R$)</label>
                      <input type="number" min={0} step="any" className={inp} value={numVal(pl.monthlyValue)} placeholder="0" onChange={(e) => setPlan(i, { monthlyValue: numParse(e.target.value), autoPrice: true })} />
                    </div>
                  ) : pl.paymentMode === 'parcelado' ? (
                    <div>
                      <label className={lbl}>valor total (R$)</label>
                      <input type="number" min={0} step="any" className={inp} value={numVal(pl.totalValue)} placeholder="0" onChange={(e) => setPlan(i, { totalValue: numParse(e.target.value), autoPrice: true })} />
                    </div>
                  ) : (
                    <div>
                      <label className={lbl}>valor total (R$)</label>
                      <input type="number" min={0} step="any" className={inp} value={numVal(pl.totalValue)} placeholder="0" onChange={(e) => setPlan(i, { totalValue: numParse(e.target.value), autoPrice: true })} />
                    </div>
                  )}
                  <div>
                    <label className={lbl}>{pl.paymentMode === 'mensal' ? 'por quantos meses' : 'período de entrega (meses)'}</label>
                    <input type="number" min={1} className={inp} value={numVal(pl.months)} placeholder="1" onChange={(e) => setPlan(i, { months: numParse(e.target.value), autoPrice: true })} />
                  </div>
                </div>

                {/* campos extras do parcelado */}
                {pl.paymentMode === 'parcelado' && (
                  <div className="mt-3">
                    <label className={lbl}>número de parcelas</label>
                    <input type="number" min={2} max={24} className={`${inp} w-24`} value={numVal(pl.installments)} placeholder="2" onChange={(e) => setPlan(i, { installments: numParse(e.target.value), autoPrice: true })} />
                    {(pl.installments ?? 2) > 0 && (pl.totalValue ?? 0) > 0 && (
                      <p className="mt-1 font-display-tech text-[11px] text-neutral-500">
                        {pl.installments ?? 2}× de {brl(Math.round((pl.totalValue ?? 0) / Math.max(1, pl.installments ?? 2)))}
                      </p>
                    )}
                  </div>
                )}

                {/* resumo humano + números derivados: a MESMA conta que o cliente vê */}
                <div className="mt-4 rounded-lg bg-white p-3 ring-1 ring-neutral-200">
                  <p className="font-display-tech text-xs text-neutral-700">
                    {pl.paymentMode === 'mensal' ? (
                      <>o cliente paga <strong>{brl(pl.monthlyValue ?? 0)}</strong> por mês durante <strong>{pl.months ?? 1} {(pl.months ?? 1) === 1 ? 'mês' : 'meses'}</strong>, somando <strong>{brl(planTotalValue(pl))}</strong>.</>
                    ) : pl.paymentMode === 'parcelado' ? (
                      <>o cliente paga <strong>{brl(planTotalValue(pl))}</strong> em <strong>{pl.installments ?? 2}× de {brl(Math.round(planTotalValue(pl) / Math.max(1, pl.installments ?? 2)))}</strong>{(pl.months ?? 1) > 1 ? <> (entrega ao longo de <strong>{pl.months} meses</strong>)</> : ''}.</>
                    ) : (
                      <>o cliente paga <strong>{brl(planTotalValue(pl))}</strong> uma única vez{(pl.months ?? 1) > 1 ? <> (entrega ao longo de <strong>{pl.months} meses</strong>)</> : ''}.</>
                    )}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div><div className="font-display-tech text-base font-bold text-neutral-900">{sumItems(pl.items)}</div><div className="font-display-tech text-[9px] uppercase tracking-widest text-neutral-500">conteúdos</div></div>
                    <div><div className="font-display-tech text-base font-bold text-neutral-900">{pl.paymentMode === 'mensal' ? `${brl(pl.monthlyValue ?? 0)}/mês` : brl(planTotalValue(pl))}</div><div className="font-display-tech text-[9px] uppercase tracking-widest text-neutral-500">{pl.paymentMode === 'mensal' ? 'mensalidade' : pl.paymentMode === 'parcelado' ? 'parcelado' : 'à vista'}</div></div>
                    <div><div className="font-display-tech text-base font-bold text-neutral-900">{brl(planTotalValue(pl))}</div><div className="font-display-tech text-[9px] uppercase tracking-widest text-neutral-500">total</div></div>
                  </div>
                </div>
                <p className="mt-2 font-display-tech text-[11px] text-neutral-500">o nº de conteúdos vem dos entregáveis acima. preço, total e duração da proposta se montam sozinhos a partir daqui.</p>
              </div>

              {/* DESCONTO */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between">
                  <label className={lbl}>desconto</label>
                  <Toggle on={!!pl.discount} onChange={(on) => toggleDiscount(i, on)} label="aplicar desconto" />
                </div>
                {pl.discount && (
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className={lbl}>tipo</label>
                        <select value={pl.discount.type} onChange={(e) => setDiscount(i, { type: e.target.value as 'percent' | 'fixed' })} className={`${inp} ${selectBase}`} style={selectChevron}>
                          <option value="percent">percentual (%)</option>
                          <option value="fixed">fixo (R$)</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>valor</label>
                        <input type="number" min={0} step="any" className={inp} value={numVal(pl.discount.value)} placeholder="0" onChange={(e) => setDiscount(i, { value: numParse(e.target.value) })} />
                      </div>
                      <div>
                        <label className={lbl}>rótulo (opcional)</label>
                        <input className={inp} value={pl.discount.label ?? ''} onChange={(e) => setDiscount(i, { label: e.target.value })} placeholder="ex.: desconto de lançamento" />
                      </div>
                    </div>
                    {/* preview do desconto */}
                    {pl.discount.value > 0 && (
                      <div className="rounded-lg bg-green-50 p-3 font-display-tech text-xs text-green-800">
                        {pl.discount.type === 'percent' ? (
                          <>{pl.discount.value}% off = {brl(Math.round((pl.totalValue ?? (pl.monthlyValue ?? 0) * Math.max(1, pl.months ?? 1)) * pl.discount.value) / 100)} de desconto</>
                        ) : (
                          <>desconto fixo de {brl(pl.discount.value)}</>
                        )}
                        {' · '}
                        <span className="line-through text-neutral-500">de {brl(pl.totalValue ?? (pl.monthlyValue ?? 0) * Math.max(1, pl.months ?? 1))}</span>
                        {' '}
                        por <strong>{brl(planTotalValue(pl))}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ADD-ONS */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between">
                  <label className={lbl}>adicionais</label>
                  <button onClick={() => addAddon(i)} className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">+ adicional</button>
                </div>
                {(pl.addons ?? []).length > 0 && (
                  <div className="mt-3 flex flex-col gap-3">
                    {(pl.addons ?? []).map((addon, ai) => (
                      <div key={addon.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input className={`${inp} flex-1`} value={addon.label} onChange={(e) => setAddon(i, ai, { label: e.target.value })} placeholder="nome do adicional" />
                          <div className="flex items-center gap-2">
                            <span className="font-display-tech text-[11px] text-neutral-500">R$</span>
                            <input type="number" min={0} step="any" className={`${inp} w-24`} value={numVal(addon.price)} onChange={(e) => setAddon(i, ai, { price: numParse(e.target.value) })} placeholder="0" />
                            <Toggle on={addon.included} onChange={(on) => setAddon(i, ai, { included: on })} label="incluso" />
                            <button onClick={() => removeAddon(i, ai)} className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500">remover</button>
                          </div>
                        </div>
                        <input className={`${inp} mt-2`} value={addon.description ?? ''} onChange={(e) => setAddon(i, ai, { description: e.target.value })} placeholder="descrição do adicional" />
                      </div>
                    ))}
                  </div>
                )}
                {(pl.addons ?? []).length === 0 && (
                  <p className="mt-2 font-display-tech text-[11px] text-neutral-400">nenhum adicional. clique em "+ adicional" para acrescentar.</p>
                )}
              </div>
            </div>
          ))}
          {c.plans.length === 0 && <p className="rounded-lg border border-dashed border-neutral-300 py-6 text-center font-display-tech text-sm text-neutral-500">sem versões. adicione uma ou restaure as padrão.</p>}
        </div>

        {/* ── PERSONALIZAÇÃO ─────────────────────────────────────────────── */}
        <div className="mt-8">
          <button
            onClick={() => setShowPersonalization(!showPersonalization)}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-3 transition-colors hover:border-pink"
          >
            <h3 className="font-display-tech text-sm font-bold uppercase tracking-widest text-neutral-900">personalização</h3>
            <span className={`font-display-tech text-lg text-neutral-400 transition-transform ${showPersonalization ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {showPersonalization && (
            <div className="mt-4 flex flex-col gap-6 rounded-xl border border-neutral-200 p-5">

              {/* 7a. Hero */}
              <div>
                <label className={lbl}>hero — título e subtítulo</label>
                <input className={`${inp} mt-2`} value={c.heroTitle ?? ''} onChange={(e) => set('heroTitle', e.target.value)} placeholder="presença digital que vira cliente" />
                <input className={`${inp} mt-2`} value={c.heroSubtitle ?? ''} onChange={(e) => set('heroSubtitle', e.target.value)} placeholder="subtítulo personalizado" />
              </div>

              {/* 7b. Theme selector */}
              <div>
                <label className={lbl}>tema de cores</label>
                <div className="mt-2 flex items-center gap-3">
                  {THEMES.map((t) => {
                    const sel = (c.themeId ?? 'pink') === t.id;
                    return (
                      <button key={t.id} onClick={() => set('themeId', t.id)} className="flex flex-col items-center gap-1" title={t.name}>
                        <span
                          className={`inline-block h-8 w-8 rounded-full transition-shadow ${sel ? 'ring-2 ring-pink ring-offset-2' : 'ring-1 ring-neutral-300 hover:ring-neutral-400'}`}
                          style={{ background: t.accent }}
                        />
                        <span className={`font-display-tech text-[10px] ${sel ? 'text-pink font-semibold' : 'text-neutral-500'}`}>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7c. Sections toggle */}
              <div>
                <label className={lbl}>seções visíveis</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {([
                    ['showPorque', 'por que agora'],
                    ['showIncluso', 'incluso'],
                    ['showProcesso', 'processo'],
                    ['showCalendario', 'calendário'],
                    ['showResultados', 'resultados'],
                    ['showFaq', 'FAQ'],
                    ['showCondicoes', 'condições'],
                  ] as const).map(([key, label]) => (
                    <Toggle key={key} on={sec[key] !== false} onChange={(on) => setSections({ [key]: on })} label={label} />
                  ))}
                </div>
              </div>

              {/* 7d. FAQ editor */}
              {sec.showFaq !== false && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className={lbl}>FAQ — perguntas frequentes</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSections({ faq: DEFAULT_FAQ.map((f) => ({ ...f })) })}
                        className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 hover:text-pink"
                      >restaurar padrão</button>
                      <button
                        onClick={() => setSections({ faq: [...(sec.faq ?? []), { q: '', a: '' }] })}
                        className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline"
                      >+ pergunta</button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-3">
                    {(sec.faq ?? DEFAULT_FAQ).map((faq, fi) => (
                      <div key={fi} className="rounded-lg border border-neutral-200 bg-white p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <input
                              className={inp}
                              value={faq.q}
                              onChange={(e) => {
                                const items = [...(sec.faq ?? DEFAULT_FAQ)];
                                items[fi] = { ...items[fi], q: e.target.value };
                                setSections({ faq: items });
                              }}
                              placeholder="pergunta"
                            />
                            <textarea
                              className={`${inp} mt-2 min-h-[50px] resize-none`}
                              value={faq.a}
                              onChange={(e) => {
                                const items = [...(sec.faq ?? DEFAULT_FAQ)];
                                items[fi] = { ...items[fi], a: e.target.value };
                                setSections({ faq: items });
                              }}
                              placeholder="resposta"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const items = [...(sec.faq ?? DEFAULT_FAQ)];
                              items.splice(fi, 1);
                              setSections({ faq: items });
                            }}
                            className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500"
                          >remover</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7e. Incluso editor */}
              {sec.showIncluso !== false && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className={lbl}>incluso — o que está incluído</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSections({ incluso: DEFAULT_INCLUSO.map((i) => ({ ...i })) })}
                        className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 hover:text-pink"
                      >restaurar padrão</button>
                      <button
                        onClick={() => setSections({ incluso: [...(sec.incluso ?? []), { label: '', description: '' }] })}
                        className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline"
                      >+ item</button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {(sec.incluso ?? DEFAULT_INCLUSO).map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <input
                          className={`${inp} w-36`}
                          value={item.label}
                          onChange={(e) => {
                            const items = [...(sec.incluso ?? DEFAULT_INCLUSO)];
                            items[ii] = { ...items[ii], label: e.target.value };
                            setSections({ incluso: items });
                          }}
                          placeholder="rótulo"
                        />
                        <input
                          className={`${inp} flex-1`}
                          value={item.description}
                          onChange={(e) => {
                            const items = [...(sec.incluso ?? DEFAULT_INCLUSO)];
                            items[ii] = { ...items[ii], description: e.target.value };
                            setSections({ incluso: items });
                          }}
                          placeholder="descrição"
                        />
                        <button
                          onClick={() => {
                            const items = [...(sec.incluso ?? DEFAULT_INCLUSO)];
                            items.splice(ii, 1);
                            setSections({ incluso: items });
                          }}
                          className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500"
                        >remover</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7f. Condições editor */}
              {sec.showCondicoes !== false && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className={lbl}>condições</label>
                    <button
                      onClick={() => setSections({ condicoes: { ...DEFAULT_CONDICOES } })}
                      className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 hover:text-pink"
                    >restaurar padrão</button>
                  </div>
                  <div className="mt-2 flex flex-col gap-3">
                    {([
                      ['validade', 'validade'],
                      ['pagamento', 'pagamento'],
                      ['aprovacao', 'aprovação'],
                      ['naoInclui', 'não inclui'],
                    ] as const).map(([key, label]) => (
                      <div key={key}>
                        <label className={lbl}>{label}</label>
                        <textarea
                          className={`${inp} min-h-[50px] resize-none`}
                          value={(sec.condicoes ?? DEFAULT_CONDICOES)[key]}
                          onChange={(e) => {
                            setSections({ condicoes: { ...(sec.condicoes ?? DEFAULT_CONDICOES), [key]: e.target.value } });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <span className="font-display-tech text-[11px] text-neutral-500">{!valido && (!nomeOk ? 'preencha o nome do cliente' : 'adicione ao menos uma versão')}</span>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="rounded-full border border-neutral-300 px-5 py-2.5 font-display-tech text-xs uppercase tracking-widest text-neutral-600 hover:border-neutral-400">cancelar</button>
            <button
              onClick={() => valido && onSave(c)}
              disabled={!valido}
              className={`rounded-full px-6 py-2.5 font-display-tech text-xs font-semibold uppercase tracking-widest text-white ${valido ? 'bg-pink hover:shadow-lg' : 'cursor-not-allowed bg-neutral-200 text-neutral-500'}`}
            >
              salvar proposta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Editor do cronograma de uma versão: semanas, gerar automático e ajuste manual.
function ScheduleEditor({
  plan,
  onWeeks,
  onGen,
  onClear,
  onAdd,
  onSet,
  onRemove,
  onViewMode,
  onDuplicateWeek,
  onFillTemplate,
}: {
  plan: Plan;
  onWeeks: (w: number) => void;
  onGen: () => void;
  onClear: () => void;
  onAdd: (week: number) => void;
  onSet: (id: string, patch: Partial<ScheduleEntry>) => void;
  onRemove: (id: string) => void;
  onViewMode: (mode: ScheduleViewMode) => void;
  onDuplicateWeek: (fromWeek: number) => void;
  onFillTemplate: () => void;
}) {
  const sched = plan.schedule ?? [];
  const viewMode: ScheduleViewMode = plan.scheduleViewMode ?? 'weeks';
  const wk = plan.weeks && plan.weeks > 0 ? plan.weeks : defaultWeeks(plan);
  const weeks = Array.from({ length: wk }, (_, i) => i + 1);
  const cell = 'min-w-0 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';

  // AMARRAÇÃO conteúdo ⇄ cronograma: o cronograma é a distribuição dos entregáveis.
  // Confere total E por tipo; se não bate (ex.: 12 artes nos entregáveis, 2 no
  // cronograma) avisa e oferece sincronizar num clique. Sem isso, o calendário que
  // o cliente vê pode contradizer o pacote.
  const itemsTotal = sumItems(plan.items);
  const kindRows = KIND_ORDER
    .map((k) => ({
      k,
      want: plan.items.filter((it) => kindOf(it) === k).reduce((s, it) => s + Math.max(0, it.n | 0), 0),
      have: sched.filter((s) => s.kind === k).length,
    }))
    .filter((r) => r.want > 0 || r.have > 0);
  const drift = sched.length > 0 && kindRows.some((r) => r.want !== r.have);

  // Months view: group weeks into months
  const monthCount = viewMode === 'months' ? Math.ceil(wk / 4) : 0;
  const months = viewMode === 'months' ? Array.from({ length: monthCount }, (_, i) => i + 1) : [];

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={`${lbl} flex items-center gap-2`}>
          cronograma
          <span className="flex items-center gap-1 normal-case tracking-normal text-neutral-600">
            {viewMode === 'months' ? (
              <>
                <input type="number" min={1} max={12} value={numVal(monthCount > 0 ? monthCount : undefined)} placeholder={String(Math.ceil(defaultWeeks(plan) / 4))} onChange={(e) => onWeeks(numParse(e.target.value) * 4)} className="w-14 rounded border border-neutral-300 px-2 py-1 text-center text-neutral-900" /> meses
              </>
            ) : (
              <>
                <input type="number" min={1} max={26} value={numVal(plan.weeks)} placeholder={String(defaultWeeks(plan))} onChange={(e) => onWeeks(numParse(e.target.value))} className="w-14 rounded border border-neutral-300 px-2 py-1 text-center text-neutral-900" /> semanas
              </>
            )}
          </span>
          {/* toggle weeks/months */}
          <span className="ml-1 inline-flex overflow-hidden rounded-full border border-neutral-300">
            <button
              onClick={() => onViewMode('weeks')}
              className={`px-2.5 py-1 font-display-tech text-[10px] uppercase tracking-widest transition-colors ${viewMode === 'weeks' ? 'bg-pink text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >semanas</button>
            <button
              onClick={() => onViewMode('months')}
              className={`px-2.5 py-1 font-display-tech text-[10px] uppercase tracking-widest transition-colors ${viewMode === 'months' ? 'bg-pink text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >meses</button>
          </span>
        </label>
        <div className="flex items-center gap-2">
          {sched.length > 0 && (
            <button onClick={onFillTemplate} className="rounded-full border border-neutral-300 px-3 py-1.5 font-display-tech text-[10px] uppercase tracking-widest text-neutral-600 hover:border-pink hover:text-pink">replicar semana 1</button>
          )}
          <button onClick={onGen} className="rounded-full bg-pink px-3 py-1.5 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white hover:shadow">gerar automaticamente</button>
          {sched.length > 0 && <button onClick={onClear} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 hover:text-red-500">limpar</button>}
        </div>
      </div>

      <div className="mt-2 font-display-tech text-[11px] text-neutral-500">{sched.length} de {itemsTotal} conteúdos distribuídos</div>
      {drift && (
        <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="font-display-tech text-[11px] font-semibold text-amber-700">o cronograma não bate com os entregáveis</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
            {kindRows.filter((r) => r.want !== r.have).map((r) => (
              <span key={r.k} className="font-display-tech text-[11px] text-amber-700">{KIND_META[r.k].label}: {r.have}/{r.want}</span>
            ))}
          </div>
          <button onClick={onGen} className="mt-2 rounded-full bg-amber-600 px-3 py-1.5 font-display-tech text-[10px] font-semibold uppercase tracking-widest text-white hover:bg-amber-700">sincronizar com os entregáveis</button>
        </div>
      )}

      {sched.length === 0 ? (
        <p className="mt-3 font-display-tech text-[11px] text-neutral-500">sem cronograma ainda. clique em "gerar automaticamente" pra distribuir os entregáveis pelas semanas, depois ajuste.</p>
      ) : viewMode === 'months' ? (
        /* ── view: meses ── */
        <div className="mt-3 flex flex-col gap-4">
          {months.map((m) => {
            const monthWeeks = weeks.filter((w) => weekToMonth(w) === m);
            return (
              <div key={m} className="rounded-lg border border-neutral-200 bg-white p-3">
                <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{m}º mês</span>
                <div className="mt-2 flex flex-col gap-3">
                  {monthWeeks.map((w) => {
                    const items = sched.filter((s) => s.week === w);
                    return (
                      <div key={w} className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-display-tech text-[10px] text-neutral-400">{w}ª semana</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => onDuplicateWeek(w)} className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-400 hover:text-pink">duplicar semana</button>
                            <button onClick={() => onAdd(w)} className="font-display-tech text-[10px] uppercase tracking-widest text-pink hover:underline">+ post</button>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col gap-1">
                          {items.length === 0 && <span className="font-display-tech text-[11px] text-neutral-300">sem posts</span>}
                          {items.map((s) => (
                            <div key={s.id} className="flex flex-col gap-1 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND_META[s.kind]?.color ?? '#9CA3AF' }} />
                                <select value={s.day} onChange={(e) => onSet(s.id, { day: e.target.value as Weekday })} className={`${cell} ${selectBase} flex-1 sm:w-20 sm:flex-none`} style={selectChevron}>
                                  {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={s.kind} onChange={(e) => onSet(s.id, { kind: e.target.value as DeliverableKind })} className={`${cell} ${selectBase} flex-1 sm:w-36 sm:flex-none`} style={selectChevron}>
                                  {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_META[k].label}</option>)}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 sm:flex-1">
                                <input value={s.label ?? ''} onChange={(e) => onSet(s.id, { label: e.target.value })} placeholder="observação (opcional)" className={`${cell} flex-1`} />
                                <button onClick={() => onRemove(s.id)} className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500">remover</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── view: semanas (original) ── */
        <div className="mt-3 flex flex-col gap-3">
          {weeks.map((w) => {
            const items = sched.filter((s) => s.week === w);
            return (
              <div key={w} className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{w}ª semana</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onDuplicateWeek(w)} className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-400 hover:text-pink">duplicar semana</button>
                    <button onClick={() => onAdd(w)} className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">+ post</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {items.length === 0 && <span className="font-display-tech text-[11px] text-neutral-300">sem posts nesta semana</span>}
                  {items.map((s) => (
                    <div key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND_META[s.kind]?.color ?? '#9CA3AF' }} />
                        <select value={s.day} onChange={(e) => onSet(s.id, { day: e.target.value as Weekday })} className={`${cell} ${selectBase} flex-1 sm:w-20 sm:flex-none`} style={selectChevron}>
                          {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={s.kind} onChange={(e) => onSet(s.id, { kind: e.target.value as DeliverableKind })} className={`${cell} ${selectBase} flex-1 sm:w-36 sm:flex-none`} style={selectChevron}>
                          {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_META[k].label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-1">
                        <input value={s.label ?? ''} onChange={(e) => onSet(s.id, { label: e.target.value })} placeholder="observação (opcional)" className={`${cell} flex-1`} />
                        <button onClick={() => onRemove(s.id)} className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500">remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
