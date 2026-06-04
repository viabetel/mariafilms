import { useEffect, useMemo, useState } from 'react';
import {
  listProposals, createProposal, updateProposal, getStored, defaultContent,
  duplicateProposal, archiveProposal, renewProposal, deleteProposal,
  daysLeftOf, clientMessage,
  type ProposalSummary, type ProposalStatus, type ProposalContent,
} from './api';
import { ProposalEditor } from './ProposalEditor';
import { ProposalDetailDrawer } from './ProposalDetail';
import { ChevronRight } from './icons';

// PAINEL ADMIN (mock): a Maria CRIA/EDITA propostas, gera o código único + link,
// acompanha o ciclo de vida (que o cliente alimenta) e controla cada proposta.
// Expõe dados de clientes (CPF/CNPJ) → fica atrás do AdminGate (senha). No real,
// trocar por login de verdade no backend (Supabase Auth + RLS).

const STATUS_LABEL: Record<ProposalStatus, { txt: string; cls: string }> = {
  pendente: { txt: 'pendente', cls: 'bg-neutral-100 text-neutral-600' },
  aguardando_assinatura: { txt: 'aguardando assinatura', cls: 'bg-amber-100 text-amber-700' },
  assinada: { txt: 'assinada · aguard. pgto', cls: 'bg-blue-100 text-blue-700' },
  pago: { txt: 'pago', cls: 'bg-green-100 text-green-700' },
  expirada: { txt: 'expirada', cls: 'bg-red-100 text-red-600' },
};
const STATUS_ORDER: ProposalStatus[] = ['pendente', 'aguardando_assinatura', 'assinada', 'pago', 'expirada'];
type StatusFilter = 'todas' | ProposalStatus;
type Sort = 'recentes' | 'expira' | 'status';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export function AdminPanel() {
  const [rows, setRows] = useState<ProposalSummary[] | null>(null);
  const [editing, setEditing] = useState<ProposalContent | null>(null);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ token: string; link: string; days: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [rowCopied, setRowCopied] = useState<string | null>(null);
  const [detailToken, setDetailToken] = useState<string | null>(null);
  const [menuToken, setMenuToken] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // filtros
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [showArchived, setShowArchived] = useState(false);
  const [sort, setSort] = useState<Sort>('recentes');

  const refresh = () => listProposals().then(setRows);
  useEffect(() => { refresh(); }, []);

  // sync entre abas: quando o cliente age em /proposta (outra aba), o painel
  // atualiza ao vivo. É o "encontro" visível sem backend.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === 'mf_proposals') refresh(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const novo = () => { setEditingToken(null); setEditing(defaultContent()); };
  const editar = async (token: string) => { const c = await getStored(token); if (c) { setEditingToken(token); setEditing(c); setDetailToken(null); } };

  const salvar = async (content: ProposalContent) => {
    if (editingToken) {
      await updateProposal(editingToken, content);
      setGenerated({ token: editingToken, link: `/proposta?c=${editingToken}`, days: content.days });
    } else {
      const created = await createProposal(content);
      setGenerated({ ...created, days: content.days });
    }
    setCopied(false);
    setCopiedCode(false);
    setCopiedMsg(false);
    setEditing(null);
    setEditingToken(null);
    refresh();
  };

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 1800);
    });
  };
  const copiar = () => generated && copyText(window.location.origin + generated.link, setCopied);
  const copiarRow = (token: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/proposta?c=${token}`).then(() => {
      setRowCopied(token);
      setTimeout(() => setRowCopied((t) => (t === token ? null : t)), 1500);
    });
  };

  const act = async (fn: () => void | Promise<void>) => { await fn(); setMenuToken(null); refresh(); };

  // contagens (ignora arquivadas no resumo)
  const counts = useMemo(() => {
    const c: Record<ProposalStatus, number> = { pendente: 0, aguardando_assinatura: 0, assinada: 0, pago: 0, expirada: 0 };
    let archived = 0;
    rows?.forEach((r) => { if (r.archived) archived++; else c[r.status]++; });
    return { ...c, archived };
  }, [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => (showArchived ? r.archived : !r.archived));
    if (statusFilter !== 'todas') list = list.filter((r) => r.status === statusFilter);
    if (q) list = list.filter((r) => r.clienteNome.toLowerCase().includes(q) || r.token.toLowerCase().includes(q));
    const by: Record<Sort, (a: ProposalSummary, b: ProposalSummary) => number> = {
      recentes: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      expira: (a, b) => +new Date(a.expiresAt) - +new Date(b.expiresAt),
      status: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    };
    return [...list].sort(by[sort]);
  }, [rows, query, statusFilter, showArchived, sort]);

  const inp = 'rounded-full border border-neutral-300 bg-white px-4 py-2 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink';

  return (
    <div className="proposal-doc min-h-screen bg-bone px-4 py-12 text-neutral-900 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">painel · maria films</span>
            <h1 className="mt-2 font-serif-editorial text-4xl text-neutral-900 md:text-5xl">propostas</h1>
          </div>
          <button onClick={novo} className="rounded-full bg-pink px-6 py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg">+ nova proposta</button>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 font-display-tech text-[11px] text-amber-700">
          protótipo: quando for ao ar, esta página exige login (expõe dados de clientes).
        </div>

        {/* RESUMO — cards de contagem (clicar filtra) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            onClick={() => { setStatusFilter('todas'); setShowArchived(false); }}
            className={`rounded-xl border bg-white px-4 py-3 text-left transition-colors ${statusFilter === 'todas' && !showArchived ? 'border-pink ring-1 ring-pink' : 'border-neutral-200 hover:border-neutral-300'}`}
          >
            <div className="font-display-tech text-2xl font-bold text-neutral-900">{(rows ?? []).filter((r) => !r.archived).length}</div>
            <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">ativas</div>
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setShowArchived(false); }}
              className={`rounded-xl border bg-white px-4 py-3 text-left transition-colors ${statusFilter === s && !showArchived ? 'border-pink ring-1 ring-pink' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <div className="font-display-tech text-2xl font-bold text-neutral-900">{counts[s]}</div>
              <div className="font-display-tech text-[10px] uppercase leading-tight tracking-widest text-neutral-500">{STATUS_LABEL[s].txt}</div>
            </button>
          ))}
        </div>

        {/* link gerado/salvo */}
        {generated && (
          <div className="mt-6 rounded-xl border border-pink/30 bg-pink/[0.04] p-5">
            <div className="font-display-tech text-[10px] uppercase tracking-widest text-pink">proposta salva, mande pro cliente</div>

            {/* CÓDIGO DE ACESSO em destaque */}
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-0">
                <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">código de acesso</div>
                <code className="mt-1 block break-all rounded-lg bg-white px-3 py-2 font-mono text-xl font-bold tracking-tight text-neutral-900 ring-1 ring-neutral-300">{generated.token}</code>
              </div>
              <button onClick={() => copyText(generated.token, setCopiedCode)} className="rounded-full border border-neutral-400 px-4 py-2 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-neutral-800 transition-colors hover:border-neutral-900">{copiedCode ? 'copiado' : 'copiar código'}</button>
            </div>

            {/* link direto */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 break-all rounded bg-white px-3 py-1.5 font-mono text-xs text-neutral-700 ring-1 ring-neutral-200">{window.location.origin}{generated.link}</code>
              <button onClick={copiar} className="rounded-full border border-neutral-400 px-3 py-1.5 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-neutral-800 hover:border-neutral-900">{copied ? 'copiado' : 'copiar link'}</button>
              <a href={generated.link} target="_blank" rel="noopener noreferrer" className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">abrir</a>
            </div>

            {/* mensagem pronta pra colar */}
            <button onClick={() => copyText(clientMessage(generated.token, generated.days), setCopiedMsg)} className="mt-4 rounded-full bg-neutral-900 px-5 py-2.5 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-pink">{copiedMsg ? 'mensagem copiada' : 'copiar mensagem pro cliente'}</button>
            <p className="mt-2 font-display-tech text-[11px] text-neutral-500">a mensagem já vem com o link, o código e a validade, pronta pra colar no whatsapp ou e-mail.</p>
          </div>
        )}

        {/* controles de busca/filtro */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar por cliente ou código" className={`${inp} min-w-[220px] flex-1`} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={inp}>
            <option value="todas">todos os status</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s].txt}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={inp}>
            <option value="recentes">mais recentes</option>
            <option value="expira">a expirar primeiro</option>
            <option value="status">por status</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-4 w-4 accent-pink" />
            arquivadas {counts.archived > 0 && `(${counts.archived})`}
          </label>
        </div>

        {/* tabela (desktop) */}
        <div className="mt-4 hidden overflow-visible rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">
                <th className="px-5 py-4">cliente</th>
                <th className="px-5 py-4">versão</th>
                <th className="px-5 py-4">status</th>
                <th className="px-5 py-4">criada</th>
                <th className="px-5 py-4">validade</th>
                <th className="px-5 py-4 text-right">ações</th>
              </tr>
            </thead>
            <tbody className="font-display-tech text-sm">
              {!rows && <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-500">carregando…</td></tr>}
              {rows && visible.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                  {rows.length === 0 ? 'nenhuma proposta ainda. crie a primeira.' : 'nada encontrado com esses filtros.'}
                </td></tr>
              )}
              {visible.map((r) => {
                const s = STATUS_LABEL[r.status];
                const dleft = daysLeftOf(r.expiresAt);
                return (
                  <tr key={r.token} onClick={() => setDetailToken(r.token)} title="abrir o perfil da proposta" className="group cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-pink/[0.04]">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-neutral-900 underline-offset-4 group-hover:text-pink group-hover:underline">{r.clienteNome}</span>
                      {!r.editable && <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-neutral-500">exemplo</span>}
                      <div className="font-mono text-[11px] text-neutral-500">{r.token}</div>
                    </td>
                    <td className="px-5 py-4 uppercase text-neutral-600">{r.planId}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${s.cls}`}>{s.txt}</span></td>
                    <td className="px-5 py-4 text-neutral-600">{fmtDate(r.createdAt)}</td>
                    <td className="px-5 py-4">
                      {r.status === 'expirada'
                        ? <span className="text-red-500">expirada</span>
                        : <span className={dleft <= 2 ? 'text-amber-600' : 'text-neutral-600'}>{dleft} {dleft === 1 ? 'dia' : 'dias'}</span>}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setDetailToken(r.token)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-700 transition-colors group-hover:border-pink group-hover:text-pink">ver perfil <ChevronRight className="h-3 w-3" strokeWidth={2.5} /></button>
                        <button onClick={() => copiarRow(r.token)} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">{rowCopied === r.token ? 'copiado' : 'link'}</button>
                        {r.editable ? (
                          <div className="relative">
                            <button onClick={() => setMenuToken(menuToken === r.token ? null : r.token)} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">mais</button>
                            {menuToken === r.token && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuToken(null)} />
                                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl">
                                  <button onClick={() => act(() => editar(r.token))} className="block w-full px-4 py-2 text-left font-display-tech text-[12px] text-neutral-700 hover:bg-neutral-50">editar</button>
                                  <button onClick={() => act(() => { duplicateProposal(r.token); })} className="block w-full px-4 py-2 text-left font-display-tech text-[12px] text-neutral-700 hover:bg-neutral-50">duplicar</button>
                                  <button onClick={() => act(() => renewProposal(r.token))} className="block w-full px-4 py-2 text-left font-display-tech text-[12px] text-neutral-700 hover:bg-neutral-50">renovar validade</button>
                                  <button onClick={() => act(() => archiveProposal(r.token, true))} className="block w-full px-4 py-2 text-left font-display-tech text-[12px] text-neutral-700 hover:bg-neutral-50">arquivar</button>
                                  <button onClick={() => { setConfirmDel(r.token); setMenuToken(null); }} className="block w-full px-4 py-2 text-left font-display-tech text-[12px] text-red-500 hover:bg-red-50">excluir</button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          showArchived && r.archived && <button onClick={() => act(() => archiveProposal(r.token, false))} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">restaurar</button>
                        )}
                        {showArchived && r.editable && r.archived && <button onClick={() => act(() => archiveProposal(r.token, false))} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">restaurar</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* lista de cards (mobile) */}
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {!rows && <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-8 text-center font-display-tech text-sm text-neutral-500">carregando…</div>}
          {rows && visible.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-10 text-center font-display-tech text-sm text-neutral-500">
              {rows.length === 0 ? 'nenhuma proposta ainda. crie a primeira.' : 'nada encontrado com esses filtros.'}
            </div>
          )}
          {visible.map((r) => {
            const s = STATUS_LABEL[r.status];
            const dleft = daysLeftOf(r.expiresAt);
            return (
              <div key={r.token} onClick={() => setDetailToken(r.token)} className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors active:bg-pink/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="break-words font-display-tech font-semibold text-neutral-900">
                      {r.clienteNome}
                    </span>
                    {!r.editable && <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 font-display-tech text-[9px] uppercase tracking-widest text-neutral-500">exemplo</span>}
                    <div className="mt-0.5 break-all font-mono text-[11px] text-neutral-500">{r.token}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 font-display-tech text-[11px] font-semibold ${s.cls}`}>{s.txt}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-display-tech text-[11px] text-neutral-600">
                  <span>versão <span className="uppercase text-neutral-700">{r.planId}</span></span>
                  <span>criada {fmtDate(r.createdAt)}</span>
                  <span>
                    {r.status === 'expirada'
                      ? <span className="text-red-500">expirada</span>
                      : <span className={dleft <= 2 ? 'text-amber-600' : ''}>{dleft} {dleft === 1 ? 'dia' : 'dias'}</span>}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setDetailToken(r.token)} className="inline-flex items-center gap-1 rounded-full bg-pink px-4 py-2.5 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white">ver perfil <ChevronRight className="h-3 w-3" strokeWidth={2.5} /></button>
                  <button onClick={() => copiarRow(r.token)} className="rounded-full border border-neutral-300 px-4 py-2.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600">{rowCopied === r.token ? 'copiado' : 'link'}</button>
                  {r.editable && <button onClick={() => editar(r.token)} className="rounded-full border border-neutral-300 px-4 py-2.5 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600">editar</button>}
                </div>
                {r.editable && <p className="mt-2 font-display-tech text-[10px] text-neutral-500">duplicar, renovar, arquivar e excluir ficam no detalhe.</p>}
              </div>
            );
          })}
        </div>

        <p className="mt-6 font-display-tech text-[11px] text-neutral-500">[mock] propostas ficam no navegador (localStorage). com backend, vão pro Supabase; o ciclo de vida avança pelos webhooks (Autentique/Stripe). abra a proposta numa outra aba e aceite pra ver o painel atualizar sozinho.</p>
      </div>

      {/* confirmação de exclusão */}
      {confirmDel && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif-editorial text-2xl text-neutral-900">excluir proposta?</h3>
            <p className="mt-2 font-display-tech text-sm text-neutral-600">o link <span className="font-mono text-neutral-700">{confirmDel}</span> deixa de funcionar e a trilha se perde. essa ação não tem volta.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDel(null)} className="rounded-full border border-neutral-300 px-5 py-2 font-display-tech text-xs uppercase tracking-widest text-neutral-600 hover:border-neutral-400">cancelar</button>
              <button onClick={() => { deleteProposal(confirmDel); setConfirmDel(null); refresh(); }} className="rounded-full bg-red-600 px-5 py-2 font-display-tech text-xs font-semibold uppercase tracking-widest text-white hover:bg-red-700">excluir</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <ProposalEditor
          initial={editing}
          title={editingToken ? 'editar proposta' : 'nova proposta'}
          editToken={editingToken}
          onSave={salvar}
          onCancel={() => { setEditing(null); setEditingToken(null); }}
        />
      )}

      {detailToken && (
        <ProposalDetailDrawer
          token={detailToken}
          onClose={() => setDetailToken(null)}
          onChanged={refresh}
          onEdit={(t) => editar(t)}
        />
      )}
    </div>
  );
}
