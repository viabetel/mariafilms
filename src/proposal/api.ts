// Camada de serviço da proposta — ÚNICO ponto que conversa com o backend.
// Hoje é MOCK (com CATÁLOGO de teste); quando o backend (FastAPI + Supabase)
// existir, só estas funções viram fetch.
//
// CICLO DE VIDA (o fluxo combinado):
//   pendente → (aceita+contrato) aguardando_assinatura → (Autentique) assinada
//            → (Stripe) pago.  'expirada' = passou de 7 dias.
//
// Backend futuro:
//   GET  /api/proposta/{token}     → dados + status (Supabase)
//   POST /api/proposta/contrato    → WeasyPrint molda + Autentique cria documento
//   POST /api/proposta/pagamento   → Stripe Checkout Session (cobrar após assinar)
//   webhooks Autentique/Stripe     → avançam o status no Supabase
//   O navegador NUNCA fala com Autentique/Stripe direto (chaves no backend).
import { PLANS, type Plan } from './plans';

export type ProposalStatus = 'pendente' | 'aguardando_assinatura' | 'assinada' | 'pago' | 'expirada';

export interface SignerData {
  nome: string;
  documento: string; // CPF ou CNPJ
  email: string;
  planId: string;
}

export interface ContractResult {
  documentId: string;
  signingUrl: string | null; // link da Autentique (ou null = só por e-mail)
  signerEmail: string;
}

export interface PaymentResult {
  checkoutUrl: string | null; // link do Stripe Checkout (ou null no mock)
  status: 'pago';
}

export interface ProposalInfo {
  clienteNome: string;
  intro: string;
  plans: Plan[];
  status: ProposalStatus;
  expiresAt: string; // ISO
}

export interface ProposalSummary {
  token: string;
  clienteNome: string;
  planId: string;
  status: ProposalStatus;
  expiresAt: string;
  editable: boolean; // true = criada no admin (dá pra editar); false = exemplo
}

// ── CATÁLOGO MOCK (teste) — cada token = uma proposta/estado ────────────────
//   /proposta?c=studio-lumen        (pendente)
//   /proposta?c=padaria-aurora      (pendente, 2 versões)
//   /proposta?c=cliente-assinando   (aguardando assinatura)
//   /proposta?c=cliente-assinado    (assinado, aguardando pagamento)
//   /proposta?c=cliente-pago        (pago)
//   /proposta?c=cliente-expirado    (expirada)
interface CatalogEntry {
  clienteNome: string;
  intro: string;
  planIds: string[];
  priceOverrides?: Record<string, string>;
  days: number;
  status?: ProposalStatus;
}

const CATALOG: Record<string, CatalogEntry> = {
  'padaria-aurora': { clienteNome: 'Padaria Aurora', intro: 'um plano enxuto pra começar a aparecer no digital, sem peso.', planIds: ['v1', 'v2'], days: 7 },
  'studio-lumen': { clienteNome: 'Studio Lumen', intro: 'presença forte e constante pra uma marca que já tem audiência.', planIds: ['v2', 'v3'], priceOverrides: { v3: 'R$ 1.500' }, days: 5 },
  'cliente-assinando': { clienteNome: 'Marca Exemplo', intro: '', planIds: ['v1', 'v2', 'v3'], days: 6, status: 'aguardando_assinatura' },
  'cliente-assinado': { clienteNome: 'Marca Exemplo', intro: '', planIds: ['v1', 'v2', 'v3'], days: 6, status: 'assinada' },
  'cliente-pago': { clienteNome: 'Marca Exemplo', intro: '', planIds: ['v1', 'v2', 'v3'], days: 6, status: 'pago' },
  'cliente-expirado': { clienteNome: 'Cliente Exemplo', intro: '', planIds: ['v1', 'v2', 'v3'], days: -1 },
  'marca-teste': { clienteNome: 'Marca Teste', intro: '', planIds: ['v1', 'v2', 'v3'], days: 7 },
};

function buildPlans(entry: CatalogEntry): Plan[] {
  return entry.planIds
    .map((id) => PLANS.find((p) => p.id === id))
    .filter((p): p is Plan => !!p)
    .map((p) => (entry.priceOverrides?.[p.id] ? { ...p, price: entry.priceOverrides![p.id] } : p));
}

// ── Propostas criadas/editadas no admin (mock em localStorage) ─────────────
// Cada proposta guarda seu CONTEÚDO COMPLETO (intro + versões editáveis). No
// real isto vira a coluna `content` (jsonb) da tabela `proposals` (Supabase).
export interface ProposalContent {
  clienteNome: string;
  intro: string;
  days: number;
  plans: Plan[];
}
interface StoredProposal extends ProposalContent {
  token: string;
  status: ProposalStatus;
}
const STORE_KEY = 'mf_proposals';
// Normaliza qualquer entrada salva (inclusive formatos antigos sem `plans`) →
// nenhum consumidor recebe dado quebrado. Resolve "proposta/pacotes sumiram".
function normalizeEntry(raw: Partial<StoredProposal> & { planIds?: string[] }): StoredProposal {
  const plans =
    Array.isArray(raw.plans) && raw.plans.length
      ? raw.plans
      : Array.isArray(raw.planIds) && raw.planIds.length
        ? buildPlans({ clienteNome: raw.clienteNome ?? '', intro: '', planIds: raw.planIds, days: raw.days ?? 7 })
        : defaultContent().plans;
  return {
    token: raw.token ?? '',
    clienteNome: raw.clienteNome ?? 'cliente',
    intro: raw.intro ?? '',
    days: typeof raw.days === 'number' ? raw.days : 7,
    status: raw.status ?? 'pendente',
    plans,
  };
}
function readStore(): StoredProposal[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.map(normalizeEntry) : [];
  } catch {
    return [];
  }
}
function writeStore(v: StoredProposal[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(v));
  } catch {
    /* ignora (modo privado etc.) */
  }
}
function genCode(name: string): string {
  const slug =
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'cliente';
  // parte aleatória = torna o código INADIVINHÁVEL (segurança sem login)
  return `${slug}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Conteúdo inicial (template) de uma proposta nova: as 3 versões padrão (clone editável). */
export function defaultContent(): ProposalContent {
  return {
    clienteNome: '',
    intro: '',
    days: 7,
    plans: PLANS.map((p) => ({ ...p, items: p.items.map((it) => ({ ...it })) })),
  };
}

/** Cria uma proposta com conteúdo completo → gera código único + link. */
export function createProposal(content: ProposalContent): { token: string; link: string } {
  const token = genCode(content.clienteNome);
  const all = readStore();
  all.unshift({ token, status: 'pendente', ...content });
  writeStore(all);
  return { token, link: `/proposta?c=${token}` };
}

/** Edita uma proposta já criada (mantém código/link e status). */
export function updateProposal(token: string, content: ProposalContent): void {
  writeStore(readStore().map((e) => (e.token === token ? { ...e, ...content } : e)));
}

/** Carrega o conteúdo de uma proposta criada (para o editor). */
export function getStored(token: string): ProposalContent | undefined {
  const e = readStore().find((x) => x.token === token);
  return e && { clienteNome: e.clienteNome, intro: e.intro, days: e.days, plans: e.plans };
}

/** Carrega a proposta pelo CÓDIGO (token). Código inválido/ausente → null
 *  (o portão "digite seu código" aparece). Sem fallback: cada cliente tem o seu. */
export async function getProposal(token: string | null): Promise<ProposalInfo | null> {
  await new Promise((r) => setTimeout(r, 250));
  if (!token) return null;
  const key = token.toLowerCase();
  const fallbackIntro = 'conheça as versões e escolha a que faz sentido pra você.';
  const expiresIn = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };
  const cat = CATALOG[key];
  if (cat) {
    return { clienteNome: cat.clienteNome, intro: cat.intro || fallbackIntro, plans: buildPlans(cat), status: cat.status ?? 'pendente', expiresAt: expiresIn(cat.days) };
  }
  const st = readStore().find((e) => e.token === key);
  if (st) {
    // resiliência: propostas salvas no formato antigo (planIds) ou sem versões
    // são recuperadas — nunca renderiza "escolha sua versão" vazio.
    const legacyIds = (st as unknown as { planIds?: string[] }).planIds;
    const plans =
      Array.isArray(st.plans) && st.plans.length
        ? st.plans
        : Array.isArray(legacyIds) && legacyIds.length
          ? buildPlans({ clienteNome: st.clienteNome, intro: '', planIds: legacyIds, days: st.days ?? 7 })
          : defaultContent().plans;
    return { clienteNome: st.clienteNome, intro: st.intro || fallbackIntro, plans, status: st.status ?? 'pendente', expiresAt: expiresIn(st.days ?? 7) };
  }
  return null;
}

/** Aceite → gera o contrato (WeasyPrint) e cria o documento na Autentique. */
export async function requestContract(_token: string | null, data: SignerData): Promise<ContractResult> {
  await new Promise((r) => setTimeout(r, 1200));
  return { documentId: 'mock-' + Math.random().toString(36).slice(2, 8).toUpperCase(), signingUrl: null, signerEmail: data.email };
  // REAL: POST /api/proposta/contrato → { documentId, signingUrl }
}

/** Pagamento (após assinatura) → cria o Stripe Checkout. */
export async function requestPayment(_token: string | null, _planId: string): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1200));
  return { checkoutUrl: null, status: 'pago' };
  // REAL: POST /api/proposta/pagamento → { checkoutUrl } (Stripe Checkout Session)
}

/** Lista de propostas para o painel admin (Maria). */
export async function listProposals(): Promise<ProposalSummary[]> {
  await new Promise((r) => setTimeout(r, 200));
  const expiresIn = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };
  const sum = (token: string, clienteNome: string, planId: string, days: number, status: ProposalStatus, editable: boolean): ProposalSummary => ({
    token,
    clienteNome,
    planId,
    status: days < 0 ? 'expirada' : status,
    expiresAt: expiresIn(days),
    editable,
  });
  const geradas = readStore().map((e) => sum(e.token, e.clienteNome, e.plans?.[0]?.id ?? 'n/d', e.days, e.status, true));
  const exemplos = Object.entries(CATALOG).map(([t, e]) => sum(t, e.clienteNome, e.planIds[0], e.days, e.status ?? 'pendente', false));
  return [...geradas, ...exemplos];
  // REAL: GET /api/proposta (protegido por login) → lista do Supabase
}
