// Camada de serviço da proposta — ÚNICO ponto que conversa com o backend.
// Hoje é MOCK (localStorage + CATÁLOGO de teste); quando o backend (FastAPI +
// Supabase) existir, só estas funções viram fetch. O FORMATO já é o do banco:
//   StoredProposal  → tabela `proposals` (content jsonb + status + datas)
//   signer          → tabela `acceptances`
//   payment         → tabela `payments` (futura)
//   events[]        → trilha de auditoria / linha do tempo
//
// CICLO DE VIDA (o fluxo combinado, dirigido por admin + cliente):
//   pendente → (cliente aceita) aguardando_assinatura → (Autentique) assinada
//            → (Stripe) pago.  'expirada' = passou da validade real.
//
// Backend futuro:
//   GET  /api/proposta/{token}     → dados + status (Supabase)
//   POST /api/proposta/contrato    → WeasyPrint molda + Autentique cria documento
//   POST /api/proposta/pagamento   → Stripe Checkout Session (cobrar após assinar)
//   webhooks Autentique/Stripe     → avançam o status no Supabase
//   O navegador NUNCA fala com Autentique/Stripe direto (chaves no backend).
import { PLANS, billingPlan, type Plan, type ChargeMethod } from './plans';

// Base do backend FastAPI. Em dev aponta pro uvicorn local; em produção, defina
// VITE_API_BASE no ambiente de build (domínio do backend).
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8000';
// Token do admin (header x-admin-token). .env: VITE_ADMIN_TOKEN. Fallback dev.
const ADMIN_TOKEN = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) ?? 'maria-admin-2026';

// Chamada ao backend ADMIN (protegida). Lança em erro → o chamador cai no
// fallback localStorage, mantendo o painel vivo se o backend estiver fora.
async function adminFetch(path: string, init?: RequestInit): Promise<unknown> {
  const resp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN, ...(init?.headers ?? {}) },
  });
  if (!resp.ok) throw new Error(`admin ${resp.status}`);
  return resp.json();
}
// Chamada pública (ações do cliente). Best-effort: nunca derruba a UI.
async function pubFetch(path: string, init?: RequestInit): Promise<void> {
  try {
    await fetch(`${API_BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  } catch {
    /* ignora: o localStorage segura o protótipo */
  }
}
// GET público da proposta do cliente (view segura, sem dados internos). Lança em
// erro (backend fora / 404) → o chamador decide o fallback.
async function adminFetchPublicProposal(token: string): Promise<unknown> {
  const resp = await fetch(`${API_BASE}/api/proposta/${token}`);
  if (!resp.ok) throw new Error(`proposta ${resp.status}`);
  return resp.json();
}

export type ProposalStatus = 'pendente' | 'aguardando_assinatura' | 'assinada' | 'pago' | 'expirada';

// Mapa para o enum do banco (backend/schema.sql usa nomes mais curtos). Mantido
// aqui pra front e Supabase NÃO divergirem em silêncio. 'pago' é estado de
// pagamento (futura tabela `payments`), não uma coluna de `proposals.status`.
export const STATUS_TO_DB: Record<ProposalStatus, string> = {
  pendente: 'pendente',
  aguardando_assinatura: 'enviada',
  assinada: 'assinada',
  pago: 'assinada', // proposals.status fica 'assinada'; o 'pago' vive em payments
  expirada: 'expirada',
};

// ── Máquina de estados do ciclo de vida (fonte única admin ⇄ cliente ⇄ sistema) ─
// Quem dispara cada transição:
//   'cliente'  age na /proposta (escolhe, aceita, pede o Pix)
//   'sistema'  = WEBHOOK (Autentique confirma a assinatura, gateway confirma o
//               pagamento). 'assinada' e 'pago' SÓ entram por aqui — o cliente
//               jamais afirma "assinei"/"paguei", a verdade vem do servidor.
//   'admin'    pode forçar qualquer status (override consciente no painel).
export type Actor = 'cliente' | 'admin' | 'sistema';
export const LIFECYCLE: Record<ProposalStatus, { next: ProposalStatus[]; by: Actor[] }> = {
  pendente: { next: ['aguardando_assinatura', 'expirada'], by: ['cliente', 'admin'] },
  aguardando_assinatura: { next: ['assinada', 'expirada'], by: ['sistema', 'admin'] }, // assina via webhook Autentique
  assinada: { next: ['pago'], by: ['sistema', 'admin'] }, // paga via webhook do gateway
  pago: { next: [], by: ['admin'] },
  expirada: { next: ['pendente'], by: ['admin'] }, // só renovação reabre
};
export function canTransition(from: ProposalStatus, to: ProposalStatus, by: Actor): boolean {
  if (by === 'admin') return true; // override do painel é sempre permitido
  const rule = LIFECYCLE[from];
  return rule.next.includes(to) && rule.by.includes(by);
}

export interface SignerData {
  nome: string;
  documento: string; // CPF ou CNPJ
  email: string;
  telefone: string; // telefone / whatsapp do cliente
  planId: string;
}

export interface ContractResult {
  documentId: string;
  signingUrl: string | null; // link da Autentique (ou null = só por e-mail)
  signerEmail: string;
  demo: boolean; // true = veio do mock (backend fora). Liga os botões [simular].
}

// Resultado de INICIAR a cobrança da 1ª parcela após a assinatura. É gateway-
// agnóstico (Asaas / Mercado Pago / Pagar.me): o front só exibe o Pix (copia-e-
// cola + QR) ou manda pro checkout de cartão. O status nasce 'pendente' SEMPRE;
// 'pago' só chega pelo webhook do gateway (markPaid), nunca por este retorno.
export interface PaymentResult {
  chargeId: string;
  method: ChargeMethod;
  amount: number; // valor desta cobrança, remontado no servidor pelo planId
  installment: number; // parcela 1..N
  installmentsTotal: number;
  pixCopiaECola: string | null; // string EMV do Pix (copiar e colar no banco)
  pixQrCode: string | null; // imagem do QR (data URL) quando Pix
  checkoutUrl: string | null; // página hospedada do gateway (fluxo de cartão)
  status: 'pendente';
  demo: boolean; // true = veio do mock (backend/gateway fora). Liga o [simular].
}

export interface ProposalInfo {
  clienteNome: string;
  intro: string;
  plans: Plan[];
  status: ProposalStatus;
  expiresAt: string; // ISO
  blocked?: boolean; // arquivada no admin = página fora do ar pro cliente
  // link de assinatura (Autentique) persistido no servidor → restaura o iframe
  // quando o cliente recarrega na etapa de assinatura.
  contract?: { documentId?: string; signingUrl?: string | null };
}

export interface ProposalSummary {
  token: string;
  clienteNome: string;
  planId: string; // versão ESCOLHIDA pelo cliente (com fallback p/ destaque)
  status: ProposalStatus; // já considera expiração real
  createdAt: string;
  expiresAt: string;
  archived: boolean;
  hasSigner: boolean;
  eventsCount: number;
  editable: boolean; // true = criada no admin (dá pra editar); false = exemplo
}

// ── Linha do tempo / eventos ────────────────────────────────────────────────
export type ProposalEventType =
  | 'created' | 'edited' | 'viewed' | 'selected' | 'accepted'
  | 'signed' | 'payment_started' | 'paid' | 'renewed' | 'archived' | 'unarchived' | 'status_changed';

export interface ProposalEvent {
  type: ProposalEventType;
  at: string; // ISO
  meta?: Record<string, string>;
}

export const EVENT_LABEL: Record<ProposalEventType, string> = {
  created: 'proposta criada',
  edited: 'proposta editada',
  viewed: 'cliente abriu',
  selected: 'cliente escolheu uma versão',
  accepted: 'cliente aceitou e gerou contrato',
  signed: 'contrato assinado',
  payment_started: 'cliente iniciou o pagamento',
  paid: 'pagamento confirmado',
  renewed: 'validade renovada',
  archived: 'arquivada',
  unarchived: 'restaurada',
  status_changed: 'status alterado manualmente',
};

export interface SignerRecord {
  nome: string;
  documento: string;
  email: string;
  telefone?: string; // contato (whatsapp) do cliente
  consentAt: string; // quando aceitou os termos (LGPD)
  ip?: string;
  userAgent?: string;
}

// ── CATÁLOGO de demonstração ────────────────────────────────────────────────
// Vazio: trabalhamos só com propostas REAIS (criadas no admin → localStorage, e
// no futuro no Supabase). Pra pré-visualizar uma proposta sem mandar pro cliente,
// use o botão "pré-visualizar" no editor (gera um link efêmero). Sem exemplos.
interface CatalogEntry {
  clienteNome: string;
  intro: string;
  planIds: string[];
  priceOverrides?: Record<string, string>;
  days: number;
  status?: ProposalStatus;
}

const CATALOG: Record<string, CatalogEntry> = {};

function buildPlans(entry: { planIds: string[]; priceOverrides?: Record<string, string> }): Plan[] {
  return entry.planIds
    .map((id) => PLANS.find((p) => p.id === id))
    .filter((p): p is Plan => !!p)
    .map((p) => (entry.priceOverrides?.[p.id] ? { ...p, price: entry.priceOverrides![p.id] } : p));
}

// ── Propostas criadas/editadas no admin (mock em localStorage) ─────────────
// Cada proposta guarda seu CONTEÚDO COMPLETO (intro + versões editáveis) + a
// trilha que o cliente gera (escolha, signatário, eventos). No real isto vira a
// linha de `proposals` (content jsonb) + `acceptances` + `payments` no Supabase.
export interface ProposalContent {
  clienteNome: string;
  intro: string;
  days: number;
  plans: Plan[];
  notes?: string; // anotação interna da Maria (não aparece pro cliente)
}

export interface StoredProposal extends ProposalContent {
  token: string;
  status: ProposalStatus;
  createdAt: string; // ISO — base da validade real (expira = createdAt + days)
  archived?: boolean;
  selectedPlanId?: string; // versão que o CLIENTE escolheu
  signer?: SignerRecord; // dados do aceite (→ acceptances)
  contract?: { documentId?: string; signingUrl?: string | null; signedPdfPath?: string; signedAt?: string };
  // gateway-agnóstico (Asaas/Mercado Pago/Pagar.me). Acompanha parcelas: a 1ª
  // paga já libera o acesso; as seguintes ficam agendadas no gateway.
  payment?: { gateway: 'asaas' | 'mercadopago' | 'pagarme' | 'mock'; method?: ChargeMethod; status: 'pendente' | 'pago'; installmentsTotal: number; installmentsPaid: number; chargeId?: string; paidAt?: string };
  events: ProposalEvent[];
}

const STORE_KEY = 'mf_proposals';
const PREVIEW_TOKEN = '__preview'; // proposta efêmera de pré-visualização (não conta no painel)
const nowIso = () => new Date().toISOString();

/** Validade real: nasce em createdAt e expira depois de `days`. */
export function computeExpiry(createdAt: string, days: number): string {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
export function daysLeftOf(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

/** Status efetivo: pendente/aguardando vencidos viram 'expirada'. Assinada/pago
 *  não expiram (já avançaram). */
function effectiveStatus(p: StoredProposal): ProposalStatus {
  if (p.status === 'assinada' || p.status === 'pago' || p.status === 'expirada') return p.status;
  return daysLeftOf(computeExpiry(p.createdAt, p.days)) <= 0 ? 'expirada' : p.status;
}

/** Versão que conta como "escolhida": a do cliente, senão a em destaque, senão a 1ª. */
function chosenPlanId(p: { selectedPlanId?: string; plans: Plan[] }): string {
  if (p.selectedPlanId && p.plans.some((x) => x.id === p.selectedPlanId)) return p.selectedPlanId;
  return (p.plans.find((x) => x.featured) ?? p.plans[0])?.id ?? 'n/d';
}

// Normaliza qualquer entrada salva (inclusive formatos antigos sem `plans`,
// `createdAt` ou `events`) → nenhum consumidor recebe dado quebrado.
function normalizeEntry(raw: Partial<StoredProposal> & { planIds?: string[] }): StoredProposal {
  const plans =
    Array.isArray(raw.plans) && raw.plans.length
      ? raw.plans
      : Array.isArray(raw.planIds) && raw.planIds.length
        ? buildPlans({ planIds: raw.planIds })
        : defaultContent().plans;
  const createdAt = raw.createdAt ?? nowIso();
  const events = Array.isArray(raw.events) && raw.events.length ? raw.events : [{ type: 'created' as const, at: createdAt }];
  return {
    token: raw.token ?? '',
    clienteNome: raw.clienteNome ?? 'cliente',
    intro: raw.intro ?? '',
    days: typeof raw.days === 'number' ? raw.days : 7,
    plans,
    notes: raw.notes ?? '',
    status: raw.status ?? 'pendente',
    createdAt,
    archived: raw.archived ?? false,
    selectedPlanId: raw.selectedPlanId,
    signer: raw.signer,
    contract: raw.contract,
    payment: raw.payment,
    events,
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
/** Aplica uma mutação a UMA proposta do store e persiste. Retorna a versão nova. */
function mutate(token: string, fn: (p: StoredProposal) => StoredProposal): StoredProposal | undefined {
  const all = readStore();
  let out: StoredProposal | undefined;
  const next = all.map((e) => {
    if (e.token !== token) return e;
    out = fn(e);
    return out;
  });
  if (out) writeStore(next);
  return out;
}
function pushEvent(p: StoredProposal, type: ProposalEventType, meta?: Record<string, string>): StoredProposal {
  return { ...p, events: [...p.events, { type, at: nowIso(), ...(meta ? { meta } : {}) }] };
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
    plans: PLANS.map((p) => ({ ...p, items: p.items.map((it) => ({ ...it })), schedule: p.schedule?.map((s) => ({ ...s })) })),
    notes: '',
  };
}

/** Monta uma mensagem pronta pra Maria copiar e colar pro cliente (WhatsApp,
 *  e-mail). Inclui o link direto E o código de acesso (caso o cliente prefira
 *  digitar). Usa o domínio atual em runtime (no deploy vira o domínio real). */
export function clientMessage(token: string, days?: number): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const validade = days ? ` ela é personalizada e vale por ${days} dias.` : '';
  return (
    `oi! a maria films preparou uma proposta exclusiva pra você.\n\n` +
    `é só abrir aqui: ${origin}/proposta?c=${token}\n\n` +
    `ou entrar em ${origin}/proposta e digitar o código: ${token}\n\n` +
    `${validade ? validade.trim() + ' ' : ''}qualquer dúvida, é só chamar.`
  );
}

/** Cria uma proposta com conteúdo completo → gera código único + link.
 *  Backend-first (persiste na Supabase); cai no localStorage se o backend estiver fora. */
export async function createProposal(content: ProposalContent): Promise<{ token: string; link: string }> {
  try {
    const r = (await adminFetch('/api/admin/proposals', { method: 'POST', body: JSON.stringify({ content }) })) as { token: string; link: string };
    return r;
  } catch {
    const token = genCode(content.clienteNome);
    const createdAt = nowIso();
    const all = readStore();
    all.unshift({ token, status: 'pendente', createdAt, archived: false, events: [{ type: 'created', at: createdAt }], ...content });
    writeStore(all);
    return { token, link: `/proposta?c=${token}` };
  }
}

/** Grava o conteúdo atual numa proposta efêmera e devolve o link de preview.
 *  Não polui o painel (token reservado, filtrado de listProposals). */
export function savePreview(content: ProposalContent): string {
  const createdAt = nowIso();
  const all = readStore().filter((e) => e.token !== PREVIEW_TOKEN);
  all.unshift({ token: PREVIEW_TOKEN, status: 'pendente', createdAt, archived: false, events: [{ type: 'created', at: createdAt }], ...content });
  writeStore(all);
  return `/proposta?c=${PREVIEW_TOKEN}`;
}

/** Edita uma proposta já criada (mantém código/link, status e trilha). */
export async function updateProposal(token: string, content: ProposalContent): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}`, { method: 'PUT', body: JSON.stringify({ content }) });
  } catch {
    mutate(token, (e) => pushEvent({ ...e, ...content }, 'edited'));
  }
}

/** Carrega o conteúdo de uma proposta criada (para o editor). */
export async function getStored(token: string): Promise<ProposalContent | undefined> {
  try {
    const e = (await adminFetch(`/api/admin/proposals/${token}`)) as StoredProposal;
    return { clienteNome: e.clienteNome, intro: e.intro, days: e.days, plans: e.plans, notes: e.notes };
  } catch {
    const e = readStore().find((x) => x.token === token);
    return e && { clienteNome: e.clienteNome, intro: e.intro, days: e.days, plans: e.plans, notes: e.notes };
  }
}

// ── Controles do admin (backend-first, fallback localStorage) ────────────────
export async function deleteProposal(token: string): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}`, { method: 'DELETE' });
  } catch {
    writeStore(readStore().filter((e) => e.token !== token));
  }
}
export async function duplicateProposal(token: string): Promise<{ token: string; link: string } | undefined> {
  try {
    return (await adminFetch(`/api/admin/proposals/${token}/duplicate`, { method: 'POST' })) as { token: string; link: string };
  } catch {
    const src = readStore().find((e) => e.token === token);
    if (!src) return undefined;
    return createProposal({
      clienteNome: src.clienteNome ? `${src.clienteNome} (cópia)` : '',
      intro: src.intro,
      days: src.days,
      plans: src.plans.map((p) => ({ ...p, items: p.items.map((it) => ({ ...it })), schedule: p.schedule?.map((s) => ({ ...s })) })),
      notes: src.notes,
    });
  }
}
export async function archiveProposal(token: string, archived: boolean): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}/archive`, { method: 'POST', body: JSON.stringify({ archived }) });
  } catch {
    mutate(token, (e) => pushEvent({ ...e, archived }, archived ? 'archived' : 'unarchived'));
  }
}
/** Renova a validade: nova data-base, e tira do estado 'expirada' se preciso. */
export async function renewProposal(token: string, days?: number): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}/renew`, { method: 'POST', body: JSON.stringify({ days }) });
  } catch {
    mutate(token, (e) => {
      const nextDays = typeof days === 'number' ? days : e.days;
      const reopened = effectiveStatus(e) === 'expirada' ? 'pendente' : e.status;
      return pushEvent({ ...e, createdAt: nowIso(), days: nextDays, status: reopened }, 'renewed', { days: String(nextDays) });
    });
  }
}
/** Override manual de status (deal fechado offline, correção). Loga a mudança. */
export async function setStatus(token: string, status: ProposalStatus): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  } catch {
    mutate(token, (e) => pushEvent({ ...e, status }, 'status_changed', { de: e.status, para: status }));
  }
}
export async function addNote(token: string, notes: string): Promise<void> {
  try {
    await adminFetch(`/api/admin/proposals/${token}/note`, { method: 'POST', body: JSON.stringify({ notes }) });
  } catch {
    mutate(token, (e) => ({ ...e, notes }));
  }
}

// ── Detalhe completo (drawer do admin) ──────────────────────────────────────
export interface ProposalDetail {
  token: string;
  clienteNome: string;
  intro: string;
  days: number;
  plans: Plan[];
  notes: string;
  status: ProposalStatus; // efetivo
  rawStatus: ProposalStatus; // o que está salvo (antes de aplicar expiração)
  createdAt: string;
  expiresAt: string;
  daysLeft: number;
  archived: boolean;
  selectedPlanId?: string;
  signer?: SignerRecord;
  contract?: StoredProposal['contract'];
  payment?: StoredProposal['payment'];
  events: ProposalEvent[];
  editable: boolean;
  link: string;
}

function detailFromStored(e: StoredProposal): ProposalDetail {
  const expiresAt = computeExpiry(e.createdAt, e.days);
  return {
    token: e.token,
    clienteNome: e.clienteNome,
    intro: e.intro,
    days: e.days,
    plans: e.plans,
    notes: e.notes ?? '',
    status: effectiveStatus(e),
    rawStatus: e.status,
    createdAt: e.createdAt,
    expiresAt,
    daysLeft: daysLeftOf(expiresAt),
    archived: !!e.archived,
    selectedPlanId: e.selectedPlanId,
    signer: e.signer,
    contract: e.contract,
    payment: e.payment,
    events: e.events,
    editable: true,
    link: `/proposta?c=${e.token}`,
  };
}

function detailFromCatalog(token: string, c: CatalogEntry): ProposalDetail {
  const createdAt = nowIso();
  const status: ProposalStatus = c.days < 0 ? 'expirada' : c.status ?? 'pendente';
  const expiresAt = computeExpiry(createdAt, c.days);
  const plans = buildPlans(c);
  // Eventos sintéticos só pra ilustrar o drawer nos exemplos.
  const events: ProposalEvent[] = [{ type: 'created', at: createdAt }];
  return {
    token,
    clienteNome: c.clienteNome,
    intro: c.intro,
    days: c.days,
    plans,
    notes: '',
    status,
    rawStatus: status,
    createdAt,
    expiresAt,
    daysLeft: daysLeftOf(expiresAt),
    archived: false,
    selectedPlanId: status !== 'pendente' ? plans[0]?.id : undefined,
    events,
    editable: false,
    link: `/proposta?c=${token}`,
  };
}

export async function getProposalDetail(token: string): Promise<ProposalDetail | null> {
  try {
    const raw = (await adminFetch(`/api/admin/proposals/${token}`)) as Partial<StoredProposal>;
    return detailFromStored(normalizeEntry(raw));
  } catch {
    const st = readStore().find((e) => e.token === token);
    if (st) return detailFromStored(st);
    const cat = CATALOG[token.toLowerCase()];
    if (cat) return detailFromCatalog(token.toLowerCase(), cat);
    return null;
  }
}

/** Carrega a proposta pelo CÓDIGO (token). Código inválido/ausente → null
 *  (o portão "digite seu código" aparece). Sem fallback: cada cliente tem o seu. */
export async function getProposal(token: string | null): Promise<ProposalInfo | null> {
  if (!token) return null;
  // Tokens são CASE-SENSITIVE (secrets.token_urlsafe gera maiúsculas/minúsculas).
  // NÃO normalizar caixa: o backend guarda o token exato.
  const key = token;
  const fallbackIntro = 'conheça as versões e escolha a que faz sentido pra você.';
  // Backend-first (Supabase): a proposta real do cliente. Só cai no local se a
  // proposta NÃO existir no backend (ex.: preview efêmero) ou o backend estiver fora.
  if (key !== PREVIEW_TOKEN) {
    try {
      const r = (await adminFetchPublicProposal(key)) as { clienteNome: string; intro?: string; plans?: Plan[]; status?: ProposalStatus; expiresAt?: string; blocked?: boolean; contract?: ProposalInfo['contract'] };
      if (r && Array.isArray(r.plans) && r.plans.length) {
        return {
          clienteNome: r.clienteNome,
          intro: r.intro || fallbackIntro,
          plans: r.plans,
          status: r.status ?? 'pendente',
          expiresAt: r.expiresAt ?? computeExpiry(nowIso(), 7),
          blocked: !!r.blocked,
          contract: r.contract, // link de assinatura p/ restaurar o iframe no reload
        };
      }
    } catch {
      /* cai no fallback local abaixo */
    }
  }
  await new Promise((r) => setTimeout(r, 100));
  // store primeiro: uma proposta REAL (criada no admin) sempre vence o catálogo.
  const st = readStore().find((e) => e.token === key);
  if (st) {
    return {
      clienteNome: st.clienteNome,
      intro: st.intro || fallbackIntro,
      plans: st.plans.length ? st.plans : defaultContent().plans,
      status: effectiveStatus(st),
      expiresAt: computeExpiry(st.createdAt, st.days),
      blocked: !!st.archived, // arquivada = fora do ar pro cliente (encerrar/pausar)
    };
  }
  const cat = CATALOG[key];
  if (cat) {
    return {
      clienteNome: cat.clienteNome,
      intro: cat.intro || fallbackIntro,
      plans: buildPlans(cat),
      status: cat.days < 0 ? 'expirada' : cat.status ?? 'pendente',
      expiresAt: computeExpiry(nowIso(), cat.days),
    };
  }
  return null;
}

// ── Writes do CLIENTE (alimentam a espinha que o admin lê) ──────────────────
// Só persistem para propostas REAIS (criadas no admin). Exemplos do catálogo
// seguem como demonstração local. No real, estes são os WEBHOOKS/eventos.

/** Cliente abriu a proposta (1ª vez registra; depois só atualiza meta). */
export function markViewed(token: string | null): void {
  if (!token) return;
  void pubFetch(`/api/proposta/${token}/viewed`, { method: 'POST' });
  mutate(token, (e) => {
    const jaViu = e.events.some((ev) => ev.type === 'viewed');
    return jaViu ? e : pushEvent(e, 'viewed');
  });
}

/** Cliente escolheu uma versão (guarda a escolha; não duplica eventos seguidos). */
export function selectPlan(token: string | null, planId: string): void {
  if (!token) return;
  void pubFetch(`/api/proposta/${token}/select`, { method: 'POST', body: JSON.stringify({ planId }) });
  mutate(token, (e) => {
    if (e.selectedPlanId === planId) return e;
    return pushEvent({ ...e, selectedPlanId: planId }, 'selected', { planId });
  });
}

/** Aceite → gera o contrato (WeasyPrint) e cria o documento na Autentique.
 *  Persiste signatário + escolha + status no store (stand-in do POST/contrato). */
export async function requestContract(token: string | null, data: SignerData): Promise<ContractResult> {
  // Tenta o backend real (FastAPI → WeasyPrint molda o contrato + Autentique cria o
  // documento e devolve o link do cliente). Se o backend não estiver no ar, cai no
  // mock — assim o protótipo nunca quebra.
  let result: ContractResult;
  try {
    const resp = await fetch(`${API_BASE}/api/proposta/contrato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, planId: data.planId, nome: data.nome, documento: data.documento, email: data.email }),
    });
    if (!resp.ok) throw new Error(`backend ${resp.status}`);
    const j = await resp.json();
    result = { documentId: j.documentId, signingUrl: j.signingUrl ?? null, signerEmail: j.signerEmail ?? data.email, demo: false };
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    result = { documentId: 'mock-' + Math.random().toString(36).slice(2, 8).toUpperCase(), signingUrl: null, signerEmail: data.email, demo: true };
  }
  if (token) {
    mutate(token, (e) =>
      pushEvent(
        {
          ...e,
          selectedPlanId: data.planId,
          status: 'aguardando_assinatura',
          signer: { nome: data.nome, documento: data.documento, email: data.email, telefone: data.telefone, consentAt: nowIso(), userAgent: navigator.userAgent },
          contract: { documentId: result.documentId, signingUrl: result.signingUrl },
        },
        'accepted',
        { planId: data.planId },
      ),
    );
  }
  return result;
}

/** Assinatura concluída (stand-in do webhook Autentique). */
export function markSigned(token: string | null): void {
  if (!token) return;
  mutate(token.toLowerCase(), (e) =>
    pushEvent({ ...e, status: 'assinada', contract: { ...e.contract, signedAt: nowIso() } }, 'signed'),
  );
}

/** Inicia a cobrança da 1ª parcela após a assinatura. NÃO marca 'pago' — isso é
 *  exclusivo do webhook do gateway (markPaid). Monta a parcela pelo planId; no
 *  real, o SERVIDOR remonta o valor (jamais confiar no cliente). Devolve o Pix
 *  (copia-e-cola + QR) ou o checkout de cartão. Status nasce 'pendente'. */
export async function requestPayment(token: string | null, planId: string): Promise<PaymentResult> {
  // Backend-first: POST /api/proposta/pagamento → o servidor REMONTA o valor pelo
  // planId (nunca confia no cliente) e o gateway cria a cobrança Pix/cartão. Se o
  // backend/gateway estiver fora, cai no mock (demo) pra o protótipo nunca quebrar.
  let result: PaymentResult;
  try {
    const resp = await fetch(`${API_BASE}/api/proposta/pagamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, planId }),
    });
    if (!resp.ok) throw new Error(`backend ${resp.status}`);
    const j = await resp.json();
    result = {
      chargeId: j.refId,
      method: j.method ?? 'pix',
      amount: j.amount,
      installment: 1,
      installmentsTotal: j.installmentsTotal ?? 1,
      pixCopiaECola: j.pixCopiaECola ?? null,
      pixQrCode: j.pixQrCode ?? null,
      checkoutUrl: j.checkoutUrl ?? null,
      status: 'pendente',
      demo: false,
    };
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    const plan = PLANS.find((p) => p.id === planId);
    const bp = billingPlan(plan ?? { paymentMode: 'avista', totalValue: 0, months: 1 });
    const first = bp.installments[0];
    const chargeId = 'chg-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    result = {
      chargeId,
      method: 'pix',
      amount: first.amount,
      installment: first.n,
      installmentsTotal: bp.installmentsTotal,
      // Pix copia-e-cola fake (formato EMV simplificado) só pra UI do protótipo.
      pixCopiaECola: `00020126MOCKPIX${chargeId}5204000053039865406${Math.round(first.amount * 100)}5802BR`,
      pixQrCode: null,
      checkoutUrl: null,
      status: 'pendente',
      demo: true,
    };
  }
  if (token) {
    mutate(token, (e) =>
      pushEvent(
        { ...e, payment: { gateway: result.demo ? 'mock' : 'mercadopago', method: result.method, status: 'pendente', installmentsTotal: result.installmentsTotal, installmentsPaid: 0, chargeId: result.chargeId } },
        'payment_started',
        { chargeId: result.chargeId, parcela: `1/${result.installmentsTotal}` },
      ),
    );
  }
  return result;
}

/** Pagamento confirmado — stand-in do webhook do gateway (payment.received). SÓ
 *  aqui o status vira 'pago'. No real é disparado pelo webhook, com verificação
 *  de assinatura + idempotência; conta a parcela paga (a 1ª já libera o acesso). */
export function markPaid(token: string | null): void {
  if (!token) return;
  mutate(token, (e) => {
    const total = e.payment?.installmentsTotal ?? 1;
    const paid = Math.min(total, (e.payment?.installmentsPaid ?? 0) + 1);
    return pushEvent(
      { ...e, status: 'pago', payment: { gateway: e.payment?.gateway ?? 'mock', method: e.payment?.method ?? 'pix', status: 'pago', installmentsTotal: total, installmentsPaid: paid, chargeId: e.payment?.chargeId, paidAt: nowIso() } },
      'paid',
      { parcela: `${paid}/${total}` },
    );
  });
}

/** Mapeia um StoredProposal → resumo do painel (mesma derivação, venha de onde vier). */
function summaryOf(e: StoredProposal): ProposalSummary {
  return {
    token: e.token,
    clienteNome: e.clienteNome,
    planId: chosenPlanId(e),
    status: effectiveStatus(e),
    createdAt: e.createdAt,
    expiresAt: computeExpiry(e.createdAt, e.days),
    archived: !!e.archived,
    hasSigner: !!e.signer,
    eventsCount: e.events.length,
    editable: true,
  };
}

/** Lista de propostas para o painel admin (Maria). Backend-first; fallback local. */
export async function listProposals(): Promise<ProposalSummary[]> {
  try {
    const raw = (await adminFetch('/api/admin/proposals')) as Array<Partial<StoredProposal>>;
    return raw.filter((e) => e.token !== PREVIEW_TOKEN).map((e) => summaryOf(normalizeEntry(e)));
  } catch {
    return listProposalsLocal();
  }
}

async function listProposalsLocal(): Promise<ProposalSummary[]> {
  await new Promise((r) => setTimeout(r, 200));
  const geradas: ProposalSummary[] = readStore().filter((e) => e.token !== PREVIEW_TOKEN).map((e) => ({
    token: e.token,
    clienteNome: e.clienteNome,
    planId: chosenPlanId(e),
    status: effectiveStatus(e),
    createdAt: e.createdAt,
    expiresAt: computeExpiry(e.createdAt, e.days),
    archived: !!e.archived,
    hasSigner: !!e.signer,
    eventsCount: e.events.length,
    editable: true,
  }));
  const exemplos: ProposalSummary[] = Object.entries(CATALOG).map(([t, c]) => {
    const createdAt = nowIso();
    const status: ProposalStatus = c.days < 0 ? 'expirada' : c.status ?? 'pendente';
    return {
      token: t,
      clienteNome: c.clienteNome,
      planId: c.planIds[0],
      status,
      createdAt,
      expiresAt: computeExpiry(createdAt, c.days),
      archived: false,
      hasSigner: status === 'assinada' || status === 'pago',
      eventsCount: 1,
      editable: false,
    };
  });
  return [...geradas, ...exemplos];
  // REAL: GET /api/proposta (protegido por login) → lista do Supabase
}
