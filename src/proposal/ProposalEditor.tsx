import { useState } from 'react';
import type { ProposalContent } from './api';
import type { Plan } from './plans';

// Editor de proposta (nível B): edita cliente, intro, validade e CADA versão
// (nome, tagline, preço, duração, entregáveis). Escreve o `content` que a
// página mostra E que o contrato usa — fonte única.

const inp = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';
const lbl = 'font-display-tech text-[10px] uppercase tracking-widest text-neutral-400';

export function ProposalEditor({
  initial,
  title,
  onSave,
  onCancel,
}: {
  initial: ProposalContent;
  title: string;
  onSave: (c: ProposalContent) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<ProposalContent>(initial);

  const set = <K extends keyof ProposalContent>(k: K, v: ProposalContent[K]) => setC((p) => ({ ...p, [k]: v }));
  const setPlan = (i: number, patch: Partial<Plan>) =>
    setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === i ? { ...pl, ...patch } : pl)) }));
  const setItem = (pi: number, ii: number, patch: Partial<{ label: string; n: number }>) =>
    setC((p) => ({
      ...p,
      plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: pl.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : pl)),
    }));
  const addItem = (pi: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: [...pl.items, { label: 'novo entregável', n: 1 }] } : pl)) }));
  const removeItem = (pi: number, ii: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => (idx === pi ? { ...pl, items: pl.items.filter((_, j) => j !== ii) } : pl)) }));
  const removePlan = (i: number) => setC((p) => ({ ...p, plans: p.plans.filter((_, idx) => idx !== i) }));
  const setFeatured = (i: number) => setC((p) => ({ ...p, plans: p.plans.map((pl, idx) => ({ ...pl, featured: idx === i ? !pl.featured : false })) }));
  const addPlan = () =>
    setC((p) => ({
      ...p,
      plans: [
        ...p.plans,
        { id: 'custom-' + Math.random().toString(36).slice(2, 7), code: 'V' + (p.plans.length + 1), name: 'nova versão', tagline: '', total: 0, totalLabel: 'conteúdos', items: [], duration: '', price: 'R$ 0', priceNote: '', perContent: '' },
      ],
    }));

  const valido = c.clienteNome.trim().length >= 2 && c.plans.length >= 1;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-900/50 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-editorial text-2xl text-neutral-900">{title}</h2>
          <button onClick={onCancel} className="font-display-tech text-xs uppercase tracking-widest text-neutral-400 hover:text-pink">cancelar</button>
        </div>

        {/* dados gerais */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className={lbl}>cliente</label>
            <input className={inp} value={c.clienteNome} onChange={(e) => set('clienteNome', e.target.value)} placeholder="nome do cliente" />
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

        {/* versões */}
        <div className="mt-8 flex items-center justify-between">
          <h3 className="font-display-tech text-sm font-bold uppercase tracking-widest text-neutral-900">versões</h3>
          <button onClick={addPlan} className="rounded-full border border-neutral-300 px-3 py-1.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:border-pink hover:text-pink">+ versão</button>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {c.plans.map((pl, i) => (
            <div key={pl.id} className={`rounded-xl border p-5 ${pl.featured ? 'border-pink bg-pink/[0.03]' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input className={`${inp} w-16 text-center font-bold`} value={pl.code} onChange={(e) => setPlan(i, { code: e.target.value })} />
                  <input className={`${inp} w-44`} value={pl.name} onChange={(e) => setPlan(i, { name: e.target.value })} placeholder="nome" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFeatured(i)} className={`font-display-tech text-[10px] uppercase tracking-widest ${pl.featured ? 'text-pink' : 'text-neutral-400 hover:text-pink'}`}>{pl.featured ? 'em destaque' : 'destacar'}</button>
                  <button onClick={() => removePlan(i)} className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-500">remover</button>
                </div>
              </div>

              <input className={`${inp} mt-3`} value={pl.tagline} onChange={(e) => setPlan(i, { tagline: e.target.value })} placeholder="frase curta da versão" />

              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div><label className={lbl}>preço</label><input className={inp} value={pl.price} onChange={(e) => setPlan(i, { price: e.target.value })} /></div>
                <div><label className={lbl}>obs. preço</label><input className={inp} value={pl.priceNote} onChange={(e) => setPlan(i, { priceNote: e.target.value })} /></div>
                <div><label className={lbl}>duração</label><input className={inp} value={pl.duration} onChange={(e) => setPlan(i, { duration: e.target.value })} /></div>
                <div><label className={lbl}>por conteúdo</label><input className={inp} value={pl.perContent} onChange={(e) => setPlan(i, { perContent: e.target.value })} /></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><label className={lbl}>total (nº)</label><input type="number" min={0} className={inp} value={pl.total} onChange={(e) => setPlan(i, { total: +e.target.value || 0 })} /></div>
                <div><label className={lbl}>rótulo do total</label><input className={inp} value={pl.totalLabel} onChange={(e) => setPlan(i, { totalLabel: e.target.value })} /></div>
              </div>

              {/* entregáveis */}
              <div className="mt-4">
                <label className={lbl}>entregáveis</label>
                <div className="mt-2 flex flex-col gap-2">
                  {pl.items.map((it, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input type="number" min={0} className={`${inp} w-16 text-center`} value={it.n} onChange={(e) => setItem(i, j, { n: +e.target.value || 0 })} />
                      <input className={inp} value={it.label} onChange={(e) => setItem(i, j, { label: e.target.value })} placeholder="ex.: Reels" />
                      <button onClick={() => removeItem(i, j)} className="shrink-0 font-display-tech text-[11px] text-neutral-400 hover:text-red-500">remover</button>
                    </div>
                  ))}
                  <button onClick={() => addItem(i)} className="self-start font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">+ entregável</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-neutral-300 px-5 py-2.5 font-display-tech text-xs uppercase tracking-widest text-neutral-600 hover:border-neutral-400">cancelar</button>
          <button
            onClick={() => valido && onSave(c)}
            disabled={!valido}
            className={`rounded-full px-6 py-2.5 font-display-tech text-xs font-semibold uppercase tracking-widest text-white ${valido ? 'bg-pink hover:shadow-lg' : 'cursor-not-allowed bg-neutral-200 text-neutral-400'}`}
          >
            salvar proposta
          </button>
        </div>
      </div>
    </div>
  );
}
