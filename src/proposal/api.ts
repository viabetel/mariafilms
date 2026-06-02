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
import { PLANS, type Plan } from './plans';

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

// ── Máquina de estados do ciclo de vida (fonte única admin ⇄ cliente) ───────
// Quem dispara cada transição: 'cliente' (na /proposta) ou 'admin' (no painel).
// O admin pode forçar qualquer status (override consciente); o CLIENTE só segue
// o caminho natural. Mantém front e backend falando a mesma língua.
export const LIFECYCLE: Record<ProposalStatus, { next: ProposalStatus[]; by: ('cliente' | 'admin')[] }> = {
  pendente: { next: ['aguardando_assinatura', 'expirada'], by: ['cliente', 'admin'] },
  aguardando_assinatura: { next: ['assinada', 'expirada'], by: ['cliente', 'admin'] },
  assinada: { next: ['pago'], by: ['cliente', 'admin'] },
  pago: { next: [], by: ['admin'] },
  expirada: { next: ['pendente'], by: ['admin'] }, // só renovação reabre
};
export function canTransition(from: ProposalStatus, to: ProposalStatus, by: 'cliente' | 'admin'): boolean {
  if (by === 'admin') return true; // override do painel é sempre permitido
  const rule = LIFECYCLE[from];
  return rule.next.includes(to) && rule.by.includes(by);
}

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
  blocked?: boolean; // arquivada no admin = página fora do ar pro cliente
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
  | 'signed' | 'paid' | 'renewed' | 'archived' | 'unarchived' | 'status_changed';

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
  consentAt: string; // quando aceitou os termos (LGPD)
  ip?: string;
  userAgent?: string;
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
  payment?: { provider: 'stripe'; status: 'pago'; checkoutUrl?: string | null; paidAt?: string };
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

/** Cria uma proposta com conteúdo completo → gera código único + link. */
export function createProposal(content: ProposalContent): { token: string; link: string } {
  const token = genCode(content.clienteNome);
  const createdAt = nowIso();
  const all = readStore();
  all.unshift({ token, status: 'pendente', createdAt, archived: false, events: [{ type: 'created', at: createdAt }], ...content });
  writeStore(all);
  return { token, link: `/proposta?c=${token}` };
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
export function updateProposal(token: string, content: ProposalContent): void {
  mutate(token, (e) => pushEvent({ ...e, ...content }, 'edited'));
}

/** Carrega o conteúdo de uma proposta criada (para o editor). */
export function getStored(token: string): ProposalContent | undefined {
  const e = readStore().find((x) => x.token === token);
  return e && { clienteNome: e.clienteNome, intro: e.intro, days: e.days, plans: e.plans, notes: e.notes };
}

// ── Controles do admin ──────────────────────────────────────────────────────
export function deleteProposal(token: string): void {
  writeStore(readStore().filter((e) => e.token !== token));
}
export function duplicateProposal(token: string): { token: string; link: string } | undefined {
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
export function archiveProposal(token: string, archived: boolean): void {
  mutate(token, (e) => pushEvent({ ...e, archived }, archived ? 'archived' : 'unarchived'));
}
/** Renova a validade: nova data-base, e tira do estado 'expirada' se preciso. */
export function renewProposal(token: string, days?: number): void {
  mutate(token, (e) => {
    const nextDays = typeof days === 'number' ? days : e.days;
    const reopened = effectiveStatus(e) === 'expirada' ? 'pendente' : e.status;
    return pushEvent({ ...e, createdAt: nowIso(), days: nextDays, status: reopened }, 'renewed', { days: String(nextDays) });
  });
}
/** Override manual de status (deal fechado offline, correção). Loga a mudança. */
export function setStatus(token: string, status: ProposalStatus): void {
  mutate(token, (e) => pushEvent({ ...e, status }, 'status_changed', { de: e.status, para: status }));
}
export function addNote(token: string, notes: string): void {
  mutate(token, (e) => ({ ...e, notes }));
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
  await new Promise((r) => setTimeout(r, 120));
  const st = readStore().find((e) => e.token === token);
  if (st) return detailFromStored(st);
  const cat = CATALOG[token.toLowerCase()];
  if (cat) return detailFromCatalog(token.toLowerCase(), cat);
  return null;
}

/** Carrega a proposta pelo CÓDIGO (token). Código inválido/ausente → null
 *  (o portão "digite seu código" aparece). Sem fallback: cada cliente tem o seu. */
export async function getProposal(token: string | null): Promise<ProposalInfo | null> {
  await new Promise((r) => setTimeout(r, 250));
  if (!token) return null;
  const key = token.toLowerCase();
  const fallbackIntro = 'conheça as versões e escolha a que faz sentido pra você.';
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
  mutate(token.toLowerCase(), (e) => {
    const jaViu = e.events.some((ev) => ev.type === 'viewed');
    return jaViu ? e : pushEvent(e, 'viewed');
  });
}

/** Cliente escolheu uma versão (guarda a escolha; não duplica eventos seguidos). */
export function selectPlan(token: string | null, planId: string): void {
  if (!token) return;
  mutate(token.toLowerCase(), (e) => {
    if (e.selectedPlanId === planId) return e;
    return pushEvent({ ...e, selectedPlanId: planId }, 'selected', { planId });
  });
}

/** Aceite → gera o contrato (WeasyPrint) e cria o documento na Autentique.
 *  Persiste signatário + escolha + status no store (stand-in do POST/contrato). */
export async function requestContract(token: string | null, data: SignerData): Promise<ContractResult> {
  await new Promise((r) => setTimeout(r, 1200));
  const documentId = 'mock-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  if (token) {
    mutate(token.toLowerCase(), (e) =>
      pushEvent(
        {
          ...e,
          selectedPlanId: data.planId,
          status: 'aguardando_assinatura',
          signer: { nome: data.nome, documento: data.documento, email: data.email, consentAt: nowIso(), userAgent: navigator.userAgent },
          contract: { documentId, signingUrl: null },
        },
        'accepted',
        { planId: data.planId },
      ),
    );
  }
  return { documentId, signingUrl: null, signerEmail: data.email };
  // REAL: POST /api/proposta/contrato → { documentId, signingUrl }
}

/** Assinatura concluída (stand-in do webhook Autentique). */
export function markSigned(token: string | null): void {
  if (!token) return;
  mutate(token.toLowerCase(), (e) =>
    pushEvent({ ...e, status: 'assinada', contract: { ...e.contract, signedAt: nowIso() } }, 'signed'),
  );
}

/** Pagamento (após assinatura) → cria o Stripe Checkout. Persiste 'pago'. */
export async function requestPayment(token: string | null, _planId: string): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1200));
  if (token) {
    mutate(token.toLowerCase(), (e) =>
      pushEvent({ ...e, status: 'pago', payment: { provider: 'stripe', status: 'pago', paidAt: nowIso() } }, 'paid'),
    );
  }
  return { checkoutUrl: null, status: 'pago' };
  // REAL: POST /api/proposta/pagamento → { checkoutUrl } (Stripe Checkout Session)
}

/** Lista de propostas para o painel admin (Maria). */
export async function listProposals(): Promise<ProposalSummary[]> {
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
