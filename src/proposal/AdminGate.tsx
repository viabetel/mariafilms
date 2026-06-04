import { useState, type ReactNode } from 'react';

// Portão do /admin. PRIMEIRA camada: impede acesso CASUAL ao painel (que expõe
// CPF/CNPJ e contatos dos clientes). NÃO é segurança forte por si só — a senha
// vai no bundle e os dados ainda vivem no localStorage. A proteção REAL entra
// com o backend: Supabase Auth (login de verdade) + RLS, e aí o painel só
// carrega dados quando autenticado. Até lá, isto evita que qualquer um que
// descubra a URL /admin veja tudo.

const SESSION_KEY = 'mf_admin_ok';
// senha via .env (VITE_ADMIN_PASSWORD). Fallback só pra dev local. Trocar antes
// de publicar — e, no real, substituir por login no backend.
const PASSWORD = (import.meta.env as Record<string, string | undefined>).VITE_ADMIN_PASSWORD ?? 'maria-admin';

export function AdminGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [pwd, setPwd] = useState('');
  const [erro, setErro] = useState(false);

  if (ok) return <>{children}</>;

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setOk(true);
    } else {
      setErro(true);
    }
  };

  return (
    <div className="proposal-doc flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
      <span className="font-display-tech text-[10px] uppercase tracking-hud text-pink">maria films · painel</span>
      <h1 className="mt-4 font-serif-editorial text-5xl italic lowercase text-neutral-900">acesso restrito</h1>
      <p className="mt-4 max-w-sm font-display-tech text-sm text-neutral-600">este painel tem dados de clientes. digite a senha para entrar.</p>
      <form onSubmit={entrar} className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setErro(false); }}
          placeholder="senha"
          autoFocus
          aria-label="senha do painel"
          className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-center font-display-tech text-base text-neutral-900 outline-none focus:border-pink"
        />
        {erro && <span className="font-display-tech text-xs text-red-500">senha incorreta.</span>}
        <button type="submit" className="rounded-full bg-pink py-3 font-display-tech text-xs font-semibold uppercase tracking-widest text-white transition-shadow hover:shadow-lg">entrar</button>
      </form>
      <a href="/" className="mt-6 font-display-tech text-[11px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-pink">voltar ao site</a>
    </div>
  );
}
