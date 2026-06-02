import { useEffect, useState } from 'react';
import {
  getProposalDetail, renewProposal, setStatus, addNote, archiveProposal,
  deleteProposal, duplicateProposal, clientMessage,
  EVENT_LABEL, type ProposalDetail as Detail, type ProposalStatus,
} from './api';

// Drawer lateral do admin: tudo sobre UMA proposta — conteúdo, versão escolhida
// pelo cliente, dados do signatário, linha do tempo e ações de controle.

const STATUS_LABEL: Record<ProposalStatus, { txt: string; cls: string }> = {
  pendente: { txt: 'pendente', cls: 'bg-neutral-100 text-neutral-600' },
  aguardando_assinatura: { txt: 'aguardando assinatura', cls: 'bg-amber-100 text-amber-700' },
  assinada: { txt: 'assinada · aguard. pgto', cls: 'bg-blue-100 text-blue-700' },
  pago: { txt: 'pago', cls: 'bg-green-100 text-green-700' },
  expirada: { txt: 'expirada', cls: 'bg-red-100 text-red-600' },
};

const ALL_STATUS: ProposalStatus[] = ['pendente', 'aguardando_assinatura', 'assinada', 'pago', 'expirada'];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-neutral-200 px-6 py-5">
      <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ProposalDetailDrawer({
  token,
  onClose,
  onChanged,
  onEdit,
}: {
  token: string;
  onClose: () => void;
  onChanged: () => void;
  onEdit: (token: string) => void;
}) {
  const [d, setD] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => {
    setLoading(true);
    getProposalDetail(token).then((res) => {
      setD(res);
      setNotes(res?.notes ?? '');
      setLoading(false);
    });
  };
  useEffect(load, [token]);

  // esc fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const after = () => { load(); onChanged(); };

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 1800);
    });
  };
  const copyLink = () => d && copyText(window.location.origin + d.link, setCopied);
  const saveNote = () => {
    if (!d) return;
    addNote(d.token, notes);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1600);
    onChanged();
  };
  const doRenew = () => { if (d) { renewProposal(d.token); after(); } };
  const doArchive = () => { if (d) { archiveProposal(d.token, !d.archived); after(); } };
  const doStatus = (s: ProposalStatus) => { if (d) { setStatus(d.token, s); after(); } };
  const doDuplicate = () => { if (d) { duplicateProposal(d.token); onChanged(); onClose(); } };
  const doDelete = () => { if (d) { deleteProposal(d.token); onChanged(); onClose(); } };

  // hierarquia de botões: escuro = aplicar/primário · vermelho = destrutivo ·
  // outline = secundário reversível. Decisões ficam óbvias.
  const btnBase = 'rounded-full px-4 py-2 font-display-tech text-[11px] font-semibold uppercase tracking-widest transition-colors';
  const btnDark = `${btnBase} bg-neutral-900 text-white hover:bg-pink`;
  const btnGhost = `${btnBase} border border-neutral-400 text-neutral-800 hover:border-neutral-900 hover:text-neutral-900`;
  const btnDanger = `${btnBase} border border-red-300 text-red-600 hover:bg-red-50`;
  const btnDangerSolid = `${btnBase} bg-red-600 text-white hover:bg-red-700`;
  const chosen = d?.plans.find((p) => p.id === d?.selectedPlanId);

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-neutral-900/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full overflow-y-auto overflow-x-hidden bg-white shadow-2xl sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <div className="flex h-full items-center justify-center font-display-tech text-xs uppercase tracking-widest text-neutral-500">carregando…</div>}
        {!loading && !d && <div className="flex h-full items-center justify-center font-display-tech text-xs uppercase tracking-widest text-neutral-500">proposta não encontrada</div>}

        {d && (
          <>
            {/* cabeçalho */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 font-display-tech text-[11px] font-semibold ${STATUS_LABEL[d.status].cls}`}>{STATUS_LABEL[d.status].txt}</span>
                  {d.archived && <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">arquivada</span>}
                  {!d.editable && <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-display-tech text-[9px] uppercase tracking-widest text-neutral-500">exemplo</span>}
                </div>
                <h2 className="mt-2 font-serif-editorial text-3xl text-neutral-900">{d.clienteNome}</h2>
                <div className="mt-1 font-display-tech text-[11px] uppercase tracking-widest text-neutral-500">{d.token}</div>
              </div>
              <button onClick={onClose} className="shrink-0 font-display-tech text-xs uppercase tracking-widest text-neutral-500 hover:text-pink">fechar</button>
            </div>

            {/* datas + link */}
            <Section title="proposta">
              <div className="grid grid-cols-3 gap-3 font-display-tech text-sm">
                <div><div className="text-[10px] uppercase tracking-widest text-neutral-500">criada</div><div className="mt-0.5 text-neutral-900">{fmtDate(d.createdAt)}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-neutral-500">validade</div><div className="mt-0.5 text-neutral-900">{fmtDate(d.expiresAt)}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-neutral-500">dias restantes</div><div className={`mt-0.5 font-semibold ${d.daysLeft <= 0 ? 'text-red-500' : d.daysLeft <= 2 ? 'text-amber-600' : 'text-neutral-900'}`}>{d.daysLeft <= 0 ? 'expirada' : d.daysLeft}</div></div>
              </div>
              {/* código de acesso em destaque */}
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="min-w-0">
                  <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">código de acesso</div>
                  <code className="mt-1 block break-all rounded-lg bg-neutral-50 px-3 py-2 font-mono text-lg font-bold text-neutral-900 ring-1 ring-neutral-300">{d.token}</code>
                </div>
                <button onClick={() => copyText(d.token, setCopiedCode)} className={btnGhost}>{copiedCode ? 'copiado' : 'copiar código'}</button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="min-w-0 break-all rounded bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 ring-1 ring-neutral-200">{window.location.origin}{d.link}</code>
                <button onClick={copyLink} className={btnGhost}>{copied ? 'copiado' : 'copiar link'}</button>
                <a href={d.link} target="_blank" rel="noopener noreferrer" className="font-display-tech text-[11px] uppercase tracking-widest text-pink hover:underline">pré-visualizar</a>
              </div>

              {/* mensagem pronta pra colar */}
              <button onClick={() => copyText(clientMessage(d.token, d.days), setCopiedMsg)} className={`${btnDark} mt-3`}>{copiedMsg ? 'mensagem copiada' : 'copiar mensagem pro cliente'}</button>
            </Section>

            {/* versão escolhida pelo cliente */}
            <Section title="versão escolhida pelo cliente">
              {chosen ? (
                <div className="rounded-xl border border-pink/30 bg-pink/[0.04] p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="font-serif-editorial text-2xl italic lowercase text-neutral-900">{chosen.code} · {chosen.name}</div>
                    <div className="font-display-tech text-xl font-bold text-neutral-900">{chosen.price}</div>
                  </div>
                  <div className="mt-1 font-display-tech text-xs text-neutral-600">{chosen.tagline}</div>
                </div>
              ) : (
                <p className="font-display-tech text-sm text-neutral-500">o cliente ainda não escolheu uma versão.</p>
              )}
            </Section>

            {/* signatário */}
            <Section title="dados do signatário">
              {d.signer ? (
                <div className="grid grid-cols-1 gap-2 font-display-tech text-sm sm:grid-cols-2">
                  <div><span className="text-[10px] uppercase tracking-widest text-neutral-500">nome</span><div className="text-neutral-900">{d.signer.nome}</div></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-neutral-500">cpf / cnpj</span><div className="text-neutral-900">{d.signer.documento}</div></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-neutral-500">e-mail</span><div className="text-neutral-900">{d.signer.email}</div></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-neutral-500">consentimento</span><div className="text-neutral-900">{fmtDateTime(d.signer.consentAt)}</div></div>
                </div>
              ) : (
                <p className="font-display-tech text-sm text-neutral-500">ninguém aceitou a proposta ainda.</p>
              )}
            </Section>

            {/* linha do tempo */}
            <Section title="linha do tempo">
              <ol className="relative ml-1 border-l border-neutral-200">
                {[...d.events].reverse().map((ev, i) => (
                  <li key={i} className="ml-4 pb-4 last:pb-0">
                    <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-pink" />
                    <div className="font-display-tech text-sm text-neutral-900">{EVENT_LABEL[ev.type]}{ev.meta?.planId ? ` (${ev.meta.planId})` : ''}{ev.meta?.para ? ` para ${ev.meta.para}` : ''}</div>
                    <div className="font-display-tech text-[11px] text-neutral-500">{fmtDateTime(ev.at)}</div>
                  </li>
                ))}
              </ol>
            </Section>

            {/* anotações internas */}
            {d.editable && (
              <Section title="anotações internas (só você vê)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="lembrete sobre esse cliente, combinados por fora, etc."
                  className="min-h-[70px] w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 font-display-tech text-sm text-neutral-900 outline-none focus:border-pink"
                />
                <button onClick={saveNote} className={`${btnDark} mt-2`}>{noteSaved ? 'salvo' : 'salvar nota'}</button>
              </Section>
            )}

            {/* ações de controle */}
            {d.editable ? (
              <Section title="ações">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onEdit(d.token)} className={btnDark}>editar conteúdo</button>
                  <button onClick={doRenew} className={btnGhost}>renovar validade</button>
                  <button onClick={doDuplicate} className={btnGhost}>duplicar</button>
                  <button onClick={doArchive} className={btnGhost}>{d.archived ? 'restaurar' : 'arquivar'}</button>
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} className={btnDanger}>excluir</button>
                  ) : (
                    <span className="flex items-center gap-2">
                      <button onClick={doDelete} className={btnDangerSolid}>confirmar exclusão</button>
                      <button onClick={() => setConfirmDelete(false)} className={`${btnBase} text-neutral-600 hover:text-neutral-900`}>cancelar</button>
                    </span>
                  )}
                </div>

                {/* status manual */}
                <div className="mt-5">
                  <div className="font-display-tech text-[10px] uppercase tracking-widest text-neutral-500">mudar status manualmente</div>
                  <p className="mt-1 font-display-tech text-[11px] text-neutral-500">use só pra corrigir ou registrar um acordo fechado por fora. o fluxo normal avança sozinho conforme o cliente age.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ALL_STATUS.map((s) => (
                      <button
                        key={s}
                        onClick={() => doStatus(s)}
                        className={`rounded-full px-3 py-1.5 font-display-tech text-[11px] font-semibold transition-colors ${d.rawStatus === s ? STATUS_LABEL[s].cls : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                      >
                        {STATUS_LABEL[s].txt}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            ) : (
              <Section title="ações">
                <p className="font-display-tech text-sm text-neutral-500">esta é uma proposta de exemplo (catálogo de teste). crie uma proposta de verdade pra editar, renovar e acompanhar.</p>
              </Section>
            )}
            <div className="h-8" />
          </>
        )}
      </aside>
    </div>
  );
}
