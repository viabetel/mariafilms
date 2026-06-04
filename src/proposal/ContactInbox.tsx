import { useEffect, useState } from 'react';
import { listContacts, markContactRead, deleteContact, type ContactMessage } from './api';

/**
 * Caixa de entrada do formulário do site (seção "eternizar o instante").
 * Lê as mensagens gravadas na Supabase via backend (admin protegido).
 */
function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function ContactInbox() {
  const [items, setItems] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const load = () => {
    setError(false);
    listContacts()
      .then(setItems)
      .catch(() => {
        setError(true);
        setItems([]);
      });
  };
  useEffect(load, []);

  const toggleRead = async (m: ContactMessage) => {
    setItems((prev) => prev?.map((x) => (x.id === m.id ? { ...x, lido: !m.lido } : x)) ?? prev);
    try {
      await markContactRead(m.id, !m.lido);
    } catch {
      load();
    }
  };

  const remove = async (id: string) => {
    setConfirmDel(null);
    setItems((prev) => prev?.filter((x) => x.id !== id) ?? prev);
    try {
      await deleteContact(id);
    } catch {
      load();
    }
  };

  if (items === null) {
    return <p className="mt-8 font-display-tech text-sm text-neutral-500">carregando mensagens…</p>;
  }

  if (error) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 font-display-tech text-sm text-amber-700">
        não consegui carregar as mensagens. o backend pode estar fora do ar ou sem
        o Supabase configurado. as mensagens só aparecem aqui com o backend ligado.
        <button onClick={load} className="ml-2 underline">tentar de novo</button>
      </div>
    );
  }

  const unread = items.filter((m) => !m.lido).length;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-500">
          {items.length} {items.length === 1 ? 'mensagem' : 'mensagens'}
          {unread > 0 && <span className="ml-2 text-pink">{unread} não {unread === 1 ? 'lida' : 'lidas'}</span>}
        </p>
        <button onClick={load} className="font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:text-pink">atualizar</button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-12 text-center font-display-tech text-sm text-neutral-500">
          nenhuma mensagem ainda. quando alguém enviar pelo site, aparece aqui.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${m.lido ? 'border-neutral-200' : 'border-pink/40 ring-1 ring-pink/20'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-display-tech font-semibold text-neutral-900">{m.nome}</span>
                  {!m.lido && <span className="ml-2 rounded-full bg-pink px-2 py-0.5 font-display-tech text-[9px] uppercase tracking-widest text-white">novo</span>}
                  <a href={`mailto:${m.email}`} className="mt-0.5 block break-all font-display-tech text-[12px] text-neutral-500 hover:text-pink">{m.email}</a>
                </div>
                <span className="shrink-0 font-display-tech text-[11px] text-neutral-400">{fmt(m.created_at)}</span>
              </div>

              <p className="mt-3 whitespace-pre-wrap font-display-tech text-sm leading-relaxed text-neutral-700">{m.mensagem}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent('sobre seu contato com a maria films')}`}
                  className="rounded-full bg-pink px-4 py-2 font-display-tech text-[11px] font-semibold uppercase tracking-widest text-white"
                >
                  responder
                </a>
                <button onClick={() => toggleRead(m)} className="rounded-full border border-neutral-300 px-4 py-2 font-display-tech text-[11px] uppercase tracking-widest text-neutral-600 hover:border-neutral-400">
                  {m.lido ? 'marcar não lida' : 'marcar lida'}
                </button>
                <button onClick={() => setConfirmDel(m.id)} className="font-display-tech text-[11px] uppercase tracking-widest text-red-500 hover:text-red-600">excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif-editorial text-2xl text-neutral-900">excluir mensagem?</h3>
            <p className="mt-2 font-display-tech text-sm text-neutral-600">essa ação não tem volta.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDel(null)} className="rounded-full border border-neutral-300 px-5 py-2 font-display-tech text-xs uppercase tracking-widest text-neutral-600 hover:border-neutral-400">cancelar</button>
              <button onClick={() => remove(confirmDel)} className="rounded-full bg-red-600 px-5 py-2 font-display-tech text-xs font-semibold uppercase tracking-widest text-white hover:bg-red-700">excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
