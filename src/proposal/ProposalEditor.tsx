import { useState } from 'react';
import { savePreview, defaultContent, type ProposalContent } from './api';
import {
  generateSchedule, defaultWeeks, kindOf, KIND_META, KIND_ORDER, WEEKDAYS,
  type Plan, type DeliverableKind, type Weekday, type DeliverableItem, type ScheduleEntry,
} from './plans';

// Editor de proposta: edita cliente, intro, validade, anotação interna e CADA
// versão (nome, tagline, preço, duração, entregáveis). Escreve o `content` que a
// página mostra E que o contrato usa — fonte única. Permite pré-visualizar,
// reordenar e restaurar as versões padrão.

const inp = 'w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';
const lbl = 'font-display-tech text-[10px] uppercase tracking-widest text-neutral-500';

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
  const [c, setC] = useState<ProposalContent>(initial);

  const set = <K extends keyof ProposalContent>(k: K, v: ProposalContent[K]) => setC((p) => ({ ...p, [k]: v }));
  const setPlan = (i: number, patch: Partial<Plan>) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === i ? { ...pl, ...patch } : pl)) }));
  const setItem = (pi: number, ii: number, patch: Partial<DeliverableItem>) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: pl.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : pl)),
    }));
  const addItem = (pi: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: [...pl.items, { label: 'novo entregável', n: 1, kind: 'reels' as DeliverableKind }] } : pl)) }));

  // ── cronograma da versão ──────────────────────────────────────────────────
  const patchPlanSched = (pi: number, sched: ScheduleEntry[]) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: sched } : pl)) }));
  const genSchedule = (pi: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: generateSchedule(pl) } : pl)) }));
  const clearSchedule = (pi: number) => patchPlanSched(pi, []);
  const setWeeks = (pi: number, weeks: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, weeks: Math.max(1, weeks || 1) } : pl)) }));
  const addEntry = (pi: number, week: number) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: [...(pl.schedule ?? []), { id: Math.random().toString(36).slice(2, 8), week, day: 'ter' as Weekday, kind: 'reels' as DeliverableKind }] } : pl)) }));
  const setEntry = (pi: number, id: string, patch: Partial<ScheduleEntry>) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: (pl.schedule ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)) } : pl)) }));
  const removeEntry = (pi: number, id: string) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, schedule: (pl.schedule ?? []).filter((s) => s.id !== id) } : pl)) }));
  const removeItem = (pi: number, ii: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: pl.items.filter((_, j) => j !== ii) } : pl)) }));
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
        { id: 'custom-' + Math.random().toString(36).slice(2, 7), code: 'V' + (p.plans.length + 1), name: 'nova versão', tagline: '', total: 0, totalLabel: 'conteúdos', items: [], duration: '', price: 'R$ 0', priceNote: '', perContent: '' },
      ],
    }));

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
            <input type="number" min={1} className={`${inp} w-24`} value={c.days} onChange={(e) => set('days', Math.max(1, +e.target.value || 7))} />
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

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div><label className={lbl}>preço</label><input className={inp} value={pl.price} onChange={(e) => setPlan(i, { price: e.target.value })} /></div>
                <div><label className={lbl}>obs. preço</label><input className={inp} value={pl.priceNote} onChange={(e) => setPlan(i, { priceNote: e.target.value })} /></div>
                <div><label className={lbl}>duração</label><input className={inp} value={pl.duration} onChange={(e) => setPlan(i, { duration: e.target.value })} /></div>
                <div><label className={lbl}>por conteúdo</label><input className={inp} value={pl.perContent} onChange={(e) => setPlan(i, { perContent: e.target.value })} /></div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label className={lbl}>total (nº)</label><input type="number" min={0} className={inp} value={pl.total} onChange={(e) => setPlan(i, { total: +e.target.value || 0 })} /></div>
                <div><label className={lbl}>rótulo do total</label><input className={inp} value={pl.totalLabel} onChange={(e) => setPlan(i, { totalLabel: e.target.value })} /></div>
              </div>

              {/* entregáveis */}
              <div className="mt-4">
                <label className={lbl}>entregáveis</label>
                <div className="mt-2 flex flex-col gap-2">
                  {pl.items.map((it, j) => (
                    <div key={j} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 sm:flex-1">
                        <input type="number" min={0} className={`${inp} !w-14 shrink-0 text-center`} value={it.n} onChange={(e) => setItem(i, j, { n: +e.target.value || 0 })} />
                        <input className={`${inp} flex-1`} value={it.label} onChange={(e) => setItem(i, j, { label: e.target.value })} placeholder="ex.: Reels" />
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={kindOf(it)} onChange={(e) => setItem(i, j, { kind: e.target.value as DeliverableKind })} className={`${inp} flex-1 sm:w-32 sm:flex-none`} title="tipo de conteúdo">
                          {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_META[k].label}</option>)}
                        </select>
                        <button onClick={() => removeItem(i, j)} className="shrink-0 font-display-tech text-[11px] text-neutral-500 hover:text-red-500">remover</button>
                      </div>
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
              />
            </div>
          ))}
          {c.plans.length === 0 && <p className="rounded-lg border border-dashed border-neutral-300 py-6 text-center font-display-tech text-sm text-neutral-500">sem versões. adicione uma ou restaure as padrão.</p>}
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
}: {
  plan: Plan;
  onWeeks: (w: number) => void;
  onGen: () => void;
  onClear: () => void;
  onAdd: (week: number) => void;
  onSet: (id: string, patch: Partial<ScheduleEntry>) => void;
  onRemove: (id: string) => void;
}) {
  const sched = plan.schedule ?? [];
  const wk = plan.weeks ?? defaultWeeks(plan);
  const weeks = Array.from({ length: wk }, (_, i) => i + 1);
  const cell = 'min-w-0 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';

  return (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={`${lbl} flex items-center gap-2`}>
          cronograma
          <span className="flex items-center gap-1 normal-case tracking-normal text-neutral-600">
            <input type="number" min={1} max={26} value={wk} onChange={(e) => onWeeks(+e.target.value)} className="w-14 rounded border border-neutral-300 px-2 py-1 text-center text-neutral-900" /> semanas
          </span>
        </label>
        <div className="flex items-center gap-2">
          <button onClick={onGen} className="rounded-full bg-pink px-3 py-1.5 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white hover:shadow">gerar automaticamente</button>
          {sched.length > 0 && <button onClick={onClear} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 hover:text-red-500">limpar</button>}
        </div>
      </div>

      {sched.length === 0 ? (
        <p className="mt-3 font-display-tech text-[11px] text-neutral-500">sem cronograma ainda. clique em "gerar automaticamente" pra distribuir os entregáveis pelas semanas, depois ajuste.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {weeks.map((w) => {
            const items = sched.filter((s) => s.week === w);
            return (
              <div key={w} className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{w}ª semana</span>
                  <button onClick={() => onAdd(w)} className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">+ post</button>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {items.length === 0 && <span className="font-display-tech text-[11px] text-neutral-300">sem posts nesta semana</span>}
                  {items.map((s) => (
                    <div key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND_META[s.kind].color }} />
                        <select value={s.day} onChange={(e) => onSet(s.id, { day: e.target.value as Weekday })} className={`${cell} flex-1 sm:w-20 sm:flex-none`}>
                          {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={s.kind} onChange={(e) => onSet(s.id, { kind: e.target.value as DeliverableKind })} className={`${cell} flex-1 sm:w-36 sm:flex-none`}>
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
