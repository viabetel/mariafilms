import { useEffect, useState } from 'react';
import {
  listProposals, createProposal, updateProposal, getStored, defaultContent,
  type ProposalSummary, type ProposalStatus, type ProposalContent,
} from './api';
import { ProposalEditor } from './ProposalEditor';

// PAINEL ADMIN (mock),a Maria CRIA/EDITA propostas (conteúdo dinâmico),
// gera o código único + link e acompanha o status. ⚠️ No real: exige login.

const STATUS_LABEL: Record<ProposalStatus, { txt: string; cls: string }> = {
  pendente: { txt: 'pendente', cls: 'bg-neutral-100 text-neutral-600' },
  aguardando_assinatura: { txt: 'aguardando assinatura', cls: 'bg-amber-100 text-amber-700' },
  assinada: { txt: 'assinada · aguard. pgto', cls: 'bg-blue-100 text-blue-700' },
  pago: { txt: 'pago', cls: 'bg-green-100 text-green-700' },
  expirada: { txt: 'expirada', cls: 'bg-red-100 text-red-600' },
};

export function AdminPanel() {
  const [rows, setRows] = useState<ProposalSummary[] | null>(null);
  const [editing, setEditing] = useState<ProposalContent | null>(null);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ token: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = () => listProposals().then(setRows);
  useEffect(() => { refresh(); }, []);

  const novo = () => { setEditingToken(null); setEditing(defaultContent()); };
  const editar = (token: string) => { const c = getStored(token); if (c) { setEditingToken(token); setEditing(c); } };

  const salvar = (content: ProposalContent) => {
    if (editingToken) {
      updateProposal(editingToken, content);
      setGenerated({ token: editingToken, link: `/proposta?c=${editingToken}` });
    } else {
      setGenerated(createProposal(content));
    }
    setCopied(false);
    setEditing(null);
    setEditingToken(null);
    refresh();
  };

  const copiar = () => {
    if (!generated) return;
    navigator.clipboard?.writeText(window.location.origin + generated.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="proposal-doc min-h-screen bg-bone px-4 py-12 text-neutral-900 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">painel · maria films</span>
            <h1 className="mt-2 font-serif-editorial text-4xl text-neutral-900 md:text-5xl">propostas</h1>
          </div>
          <button onClick={novo} className="rounded-full bg-pink px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg">+ nova proposta</button>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 font-display-tech text-[11px] text-amber-700">
          protótipo:quando for ao ar, esta página exige login (expõe dados de clientes).
        </div>

        {generated && (
          <div className="mt-6 rounded-xl border border-pink/30 bg-pink/[0.04] p-4">
            <div className="font-display-tech text-[10px] uppercase tracking-widest text-pink">proposta salva, mande o link pro cliente</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <code className="break-all rounded bg-white px-3 py-2 font-mono text-sm text-neutral-800 ring-1 ring-neutral-200">{window.location.origin}{generated.link}</code>
              <button onClick={copiar} className="rounded-full bg-neutral-900 px-4 py-2 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-pink">{copied ? 'copiado' : 'copiar'}</button>
              <a href={generated.link} target="_blank" rel="noopener noreferrer" className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">abrir</a>
            </div>
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 font-display-tech text-[10px] uppercase tracking-widest text-neutral-400">
                <th className="px-5 py-4">cliente</th>
                <th className="px-5 py-4">versão</th>
                <th className="px-5 py-4">status</th>
                <th className="px-5 py-4">código</th>
                <th className="px-5 py-4 text-right">ações</th>
              </tr>
            </thead>
            <tbody className="font-display-tech text-sm">
              {!rows && <tr><td colSpan={5} className="px-5 py-8 text-center text-neutral-400">carregando…</td></tr>}
              {rows?.map((r) => {
                const s = STATUS_LABEL[r.status];
                const temContrato = r.status === 'assinada' || r.status === 'pago';
                return (
                  <tr key={r.token} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-4 font-semibold text-neutral-900">{r.clienteNome}{!r.editable && <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-neutral-400">exemplo</span>}</td>
                    <td className="px-5 py-4 uppercase text-neutral-500">{r.planId}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${s.cls}`}>{s.txt}</span></td>
                    <td className="px-5 py-4"><a href={`/proposta?c=${r.token}`} target="_blank" rel="noopener noreferrer" className="text-pink hover:underline">{r.token}</a></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {r.editable && <button onClick={() => editar(r.token)} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">editar</button>}
                        {temContrato ? (
                          <button className="rounded-full bg-neutral-900 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-pink">baixar</button>
                        ) : (
                          <span className="text-[11px] uppercase tracking-widest text-neutral-300" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-display-tech text-[11px] text-neutral-400">[mock] propostas ficam no navegador (localStorage). com backend, vão pro Supabase; "baixar" pega o PDF assinado.</p>
      </div>

      {editing && (
        <ProposalEditor
          initial={editing}
          title={editingToken ? 'editar proposta' : 'nova proposta'}
          onSave={salvar}
          onCancel={() => { setEditing(null); setEditingToken(null); }}
        />
      )}
    </div>
  );
}
