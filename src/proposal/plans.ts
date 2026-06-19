// Dados da proposta — espelham o gerador WeasyPrint (build_proposta_maria.py).
// Fonte única para a experiência web; o PDF formal continua sendo gerado pelo
// WeasyPrint (identidade clara/comercial). Aqui é a camada "viva" (dark/cinema).
import {
  Film, Layers, Image, PlayCircle, Camera, Video, Square,
  Airplane, Clapperboard, Users, MapPin, Sparkles, Music, Mic,
  Gift, Crown, Star, Heart, Zap, Palette, Scissors, Monitor, Megaphone, BarChart, ClipboardList,
  type LucideIcon,
} from './icons';

// ── Tipos de entregável ─────────────────────────────────────────────────────
// Tipos built-in + suporte a custom kinds (string arbitrária).
// Quando o kind NÃO é um dos built-in, usamos o KIND_META_DEFAULT ou o
// customKindsMeta que pode ser definido por proposta.
export type BuiltinKind =
  | 'reels' | 'carrossel' | 'arte' | 'stories' | 'foto' | 'video'
  | 'drone' | 'makingof' | 'cobertura' | 'ensaio' | 'consultoria'
  | 'podcast' | 'live' | 'relatorio' | 'identidade' | 'outro';

// DeliverableKind agora aceita qualquer string — os built-in são só sugestões.
export type DeliverableKind = BuiltinKind | (string & {});

export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
export type PaymentMode = 'mensal' | 'avista' | 'parcelado';
export type ScheduleViewMode = 'weeks' | 'months';

// ── Interfaces de dados ─────────────────────────────────────────────────────
export interface DeliverableItem {
  label: string;
  n: number;
  kind?: DeliverableKind;
  description?: string;   // detalhes do entregável (ex: "Reels de 30s a 60s com legendas")
  duration?: string;       // duração do conteúdo (ex: "30s a 60s")
  format?: string;         // formato/plataforma (ex: "Instagram + TikTok")
}

// Uma postagem no cronograma daquela versão (semana + dia + tipo).
export interface ScheduleEntry {
  id: string;
  week: number;
  day: Weekday;
  kind: DeliverableKind;
  label?: string;
}

// Desconto aplicável ao plano.
export interface PlanDiscount {
  type: 'percent' | 'fixed';
  value: number; // ex: 10 (=10%) ou 50 (=R$50)
  label?: string; // ex: "desconto de lançamento"
}

// Add-on / extra com preço.
export interface PlanAddon {
  id: string;
  label: string;
  description?: string;
  price: number; // valor do add-on
  included: boolean; // se já está incluso neste plano
}

// Metadados de um tipo de serviço customizado (para kinds não-builtin).
export interface CustomKindMeta {
  label: string;
  icon: string; // nome do ícone (key de ICON_MAP)
  color: string; // hex
}

export interface Plan {
  id: string; // 'v1'|'v2'|'v3' nos padrões; versões customizadas usam id próprio
  code: string;
  name: string;
  tagline: string;
  total: number; // qtd de conteúdos
  totalLabel: string;
  items: DeliverableItem[];
  duration: string;
  price: string; // formatado
  priceNote: string;
  perContent: string;
  featured?: boolean;
  badge?: string;
  weeks?: number; // horizonte do cronograma (default 4, ou 12 se "3 meses")
  schedule?: ScheduleEntry[]; // cronograma salvo desta versão (editável no admin)
  // ── precificação estruturada (cálculo automático) ────────────────────────
  paymentMode?: PaymentMode; // 'mensal' (valor×meses) | 'avista' (valor único) | 'parcelado'
  monthlyValue?: number; // R$/mês quando mensal
  totalValue?: number; // R$ total quando à vista ou parcelado
  months?: number; // duração em meses
  installments?: number; // nº de parcelas quando paymentMode='parcelado'
  autoPrice?: boolean; // true (default) = preço/total/por-conteúdo derivam sozinhos
  // ── novos campos ─────────────────────────────────────────────────────────
  scheduleViewMode?: ScheduleViewMode; // 'weeks' | 'months' — como exibir o cronograma
  discount?: PlanDiscount; // desconto aplicável
  addons?: PlanAddon[]; // extras opcionais com preço
  customKindsMeta?: Record<string, CustomKindMeta>; // metadados de kinds customizados
}

/** Soma a quantidade de todos os entregáveis = nº de conteúdos da versão. */
export function sumItems(items: DeliverableItem[]): number {
  return (items ?? []).reduce((s, it) => s + Math.max(0, it.n | 0), 0);
}
/** Formata em reais, sem centavos quando o valor é redondo (R$ 580 / R$ 72,50). */
export function brl(n: number): string {
  const cents = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
}

/** Calcula o valor do desconto em R$. */
export function discountAmount(total: number, discount?: PlanDiscount): number {
  if (!discount || discount.value <= 0) return 0;
  if (discount.type === 'percent') return Math.round(total * discount.value) / 100;
  return Math.min(discount.value, total);
}

/** Soma o valor dos add-ons inclusos. */
export function addonsTotal(addons?: PlanAddon[]): number {
  return (addons ?? []).filter((a) => a.included).reduce((s, a) => s + a.price, 0);
}

/** Valor total da versão: mensal×meses, ou o valor único à vista, + add-ons - desconto. */
export function planTotalValue(p: Pick<Plan, 'paymentMode' | 'monthlyValue' | 'totalValue' | 'months' | 'discount' | 'addons'>): number {
  let base: number;
  if (p.paymentMode === 'mensal') base = (p.monthlyValue ?? 0) * Math.max(1, p.months ?? 1);
  else base = p.totalValue ?? 0;
  base += addonsTotal(p.addons);
  base -= discountAmount(base, p.discount);
  return Math.max(0, base);
}

/** Valor bruto (antes do desconto), para exibir "de R$ X". */
export function planGrossValue(p: Pick<Plan, 'paymentMode' | 'monthlyValue' | 'totalValue' | 'months' | 'addons'>): number {
  let base: number;
  if (p.paymentMode === 'mensal') base = (p.monthlyValue ?? 0) * Math.max(1, p.months ?? 1);
  else base = p.totalValue ?? 0;
  base += addonsTotal(p.addons);
  return base;
}

// ── Plano de cobrança (o que o gateway de pagamento consome) ────────────────
export type ChargeMethod = 'pix' | 'cartao' | 'boleto';
export interface Installment { n: number; amount: number; dueInDays: number }
export interface BillingPlan {
  mode: PaymentMode;
  recurring: boolean;
  total: number;
  monthly: number;
  installmentsTotal: number;
  installments: Installment[];
}

export function billingPlan(p: Pick<Plan, 'paymentMode' | 'monthlyValue' | 'totalValue' | 'months' | 'installments' | 'discount' | 'addons'>): BillingPlan {
  const total = planTotalValue(p);
  if (p.paymentMode === 'mensal') {
    const months = Math.max(1, p.months ?? 1);
    const monthly = Math.round(total / months);
    const installments: Installment[] = Array.from({ length: months }, (_, i) => ({ n: i + 1, amount: monthly, dueInDays: i * 30 }));
    return { mode: 'mensal', recurring: true, total, monthly, installmentsTotal: months, installments };
  }
  if (p.paymentMode === 'parcelado') {
    const nParcelas = Math.max(1, p.installments ?? 2);
    const parcela = Math.round(total / nParcelas);
    const installments: Installment[] = Array.from({ length: nParcelas }, (_, i) => ({ n: i + 1, amount: parcela, dueInDays: i * 30 }));
    return { mode: 'parcelado', recurring: false, total, monthly: parcela, installmentsTotal: nParcelas, installments };
  }
  return { mode: 'avista', recurring: false, total, monthly: 0, installmentsTotal: 1, installments: [{ n: 1, amount: total, dueInDays: 0 }] };
}

/** Deriva os textos exibidos (preço, total, duração, rótulos) a partir da
 *  precificação estruturada + dos entregáveis. */
export function deriveDisplay(p: Plan): Pick<Plan, 'price' | 'priceNote' | 'duration' | 'total' | 'totalLabel' | 'perContent'> {
  const contents = sumItems(p.items);
  const totalValue = planTotalValue(p);
  const grossValue = planGrossValue(p);
  const months = Math.max(1, p.months ?? 1);
  const mensal = p.paymentMode === 'mensal';
  const parcelado = p.paymentMode === 'parcelado';
  const mesLabel = months === 1 ? 'mês' : 'meses';
  const hasDiscount = p.discount && p.discount.value > 0 && totalValue < grossValue;

  let priceNote: string;
  if (mensal) {
    priceNote = `total ${brl(totalValue)}`;
  } else if (parcelado) {
    const nParcelas = Math.max(1, p.installments ?? 2);
    const valorParcela = Math.round(totalValue / nParcelas);
    priceNote = `${nParcelas}× de ${brl(valorParcela)}`;
  } else {
    priceNote = 'pagamento único';
  }
  if (hasDiscount) {
    priceNote += ` · de ${brl(grossValue)}`;
  }

  let durationStr: string;
  if (mensal) durationStr = `${months} ${mesLabel} · parcelado`;
  else if (parcelado) durationStr = `${months} ${mesLabel} · ${p.installments ?? 2}× sem juros`;
  else durationStr = months > 1 ? `${months} ${mesLabel} · à vista` : `${months} ${mesLabel} · à vista`;

  return {
    total: contents,
    totalLabel: months > 1 ? `conteúdos em ${months} ${mesLabel}` : 'conteúdos entregues',
    price: mensal ? `${brl(p.monthlyValue ?? 0)}/mês` : brl(totalValue),
    priceNote,
    duration: durationStr,
    perContent: contents > 0 ? `cerca de ${brl(totalValue / contents)} por conteúdo` : '',
  };
}

// ── Mapa de ícones por nome (para kinds customizados) ───────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Film, Layers, Image, PlayCircle, Camera, Video, Square,
  Airplane, Clapperboard, Users, MapPin, Sparkles, Music, Mic,
  Gift, Crown, Star, Heart, Zap, Palette, Scissors, Monitor, Megaphone, BarChart, ClipboardList,
};

// Rótulo + ícone + cor por tipo de entregável. Fonte única (card, cronograma, editor).
export interface KindMetaEntry { label: string; icon: LucideIcon; color: string }
export const KIND_META: Record<string, KindMetaEntry> = {
  reels:        { label: 'reels',              icon: Film,         color: '#ff007f' },
  carrossel:    { label: 'carrossel',          icon: Layers,       color: '#8B5CF6' },
  arte:         { label: 'arte / estático',    icon: Image,        color: '#10B981' },
  stories:      { label: 'stories',            icon: PlayCircle,   color: '#F59E0B' },
  foto:         { label: 'foto',               icon: Camera,       color: '#0EA5E9' },
  video:        { label: 'vídeo',              icon: Video,        color: '#3B82F6' },
  drone:        { label: 'drone / aérea',      icon: Airplane,     color: '#06B6D4' },
  makingof:     { label: 'making-of',          icon: Clapperboard, color: '#EC4899' },
  cobertura:    { label: 'cobertura',          icon: MapPin,       color: '#F97316' },
  ensaio:       { label: 'ensaio',             icon: Sparkles,     color: '#A855F7' },
  consultoria:  { label: 'consultoria',        icon: Users,        color: '#14B8A6' },
  podcast:      { label: 'podcast',            icon: Mic,          color: '#EF4444' },
  live:         { label: 'live / webinar',     icon: Monitor,      color: '#6366F1' },
  relatorio:    { label: 'relatório',          icon: BarChart,     color: '#64748B' },
  identidade:   { label: 'identidade visual',  icon: Palette,      color: '#D946EF' },
  outro:        { label: 'outro',              icon: Square,       color: '#9CA3AF' },
};

export const KIND_ORDER: DeliverableKind[] = [
  'reels', 'carrossel', 'arte', 'stories', 'foto', 'video',
  'drone', 'makingof', 'cobertura', 'ensaio', 'consultoria',
  'podcast', 'live', 'relatorio', 'identidade', 'outro',
];

/** Resolve o KindMeta de qualquer kind (builtin ou custom). */
export function resolveKindMeta(kind: DeliverableKind, customMeta?: Record<string, CustomKindMeta>): KindMetaEntry {
  if (KIND_META[kind]) return KIND_META[kind];
  const custom = customMeta?.[kind];
  if (custom) {
    const icon = ICON_MAP[custom.icon] ?? Square;
    return { label: custom.label, icon, color: custom.color };
  }
  return { label: kind, icon: Square, color: '#9CA3AF' };
}

export const WEEKDAYS: Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const POST_DAYS: Weekday[] = ['ter', 'qui', 'seg', 'sex', 'qua', 'sab', 'dom']; // ordem de preferência

/** Adivinha o tipo pelo texto (fallback p/ itens sem `kind`). */
export function inferKind(label: string): DeliverableKind {
  const s = (label || '').toLowerCase();
  if (/reel/.test(s)) return 'reels';
  if (/carross|carrosel|slide/.test(s)) return 'carrossel';
  if (/stor/.test(s)) return 'stories';
  if (/v[ií]deo|film/.test(s)) return 'video';
  if (/foto|photo/.test(s)) return 'foto';
  if (/arte|est[aá]tic|post|card|design/.test(s)) return 'arte';
  if (/drone|a[eé]re/.test(s)) return 'drone';
  if (/making|bastidor/.test(s)) return 'makingof';
  if (/cobertura|evento/.test(s)) return 'cobertura';
  if (/ensaio|sess[aã]o/.test(s)) return 'ensaio';
  if (/consult|reuni[aã]o|estrat[eé]g/.test(s)) return 'consultoria';
  if (/podcast/.test(s)) return 'podcast';
  if (/live|webinar/.test(s)) return 'live';
  if (/relat[oó]r|report|analytics/.test(s)) return 'relatorio';
  if (/identidade|brand|logo/.test(s)) return 'identidade';
  return 'outro';
}
export function kindOf(it: DeliverableItem): DeliverableKind {
  return it.kind ?? inferKind(it.label);
}

/** Nº de semanas do cronograma: respeita plan.weeks; senão deduz da duração ou months. */
export function defaultWeeks(plan: Pick<Plan, 'weeks' | 'months' | 'duration' | 'totalLabel'>): number {
  if (typeof plan.weeks === 'number' && plan.weeks > 0) return plan.weeks;
  // Se months está definido, usar diretamente
  if (typeof plan.months === 'number' && plan.months > 0) return plan.months * 4;
  const t = `${plan.duration ?? ''} ${plan.totalLabel ?? ''}`.toLowerCase();
  if (/3\s*mes|3\s*mês|trimes/.test(t)) return 12;
  if (/2\s*mes|2\s*mês/.test(t)) return 8;
  return 4;
}

const uid = () => Math.random().toString(36).slice(2, 8);

/** Distribui os entregáveis da versão pelas semanas (round-robin entre tipos,
 *  pra cada semana ficar variada). Base do botão "gerar automaticamente". */
export function generateSchedule(plan: Plan, preferredDays?: Weekday[]): ScheduleEntry[] {
  const days = preferredDays ?? POST_DAYS;
  const groups = (plan.items ?? []).map((it) => ({ kind: kindOf(it), label: it.label, n: Math.max(0, it.n | 0) }));
  const total = groups.reduce((s, g) => s + g.n, 0);
  if (total === 0) return [];
  // intercala os tipos: reels, carrossel, arte, reels, ...
  const counters = groups.map((g) => g.n);
  const units: { kind: DeliverableKind; label: string }[] = [];
  let idx = 0;
  while (units.length < total) {
    const ci = idx % groups.length;
    if (counters[ci] > 0) { units.push({ kind: groups[ci].kind, label: groups[ci].label }); counters[ci]--; }
    idx++;
    if (counters.every((c) => c === 0)) break;
  }
  const weeks = defaultWeeks(plan);
  const perWeek = Math.ceil(total / weeks);
  const entries: ScheduleEntry[] = [];
  let u = 0;
  for (let w = 1; w <= weeks && u < total; w++) {
    for (let k = 0; k < perWeek && u < total; k++) {
      const unit = units[u++];
      entries.push({ id: uid(), week: w, day: days[k % days.length], kind: unit.kind, label: unit.label });
    }
  }
  return entries;
}

/** Duplica os posts de uma semana-fonte para uma semana-destino. */
export function duplicateWeek(schedule: ScheduleEntry[], fromWeek: number, toWeek: number): ScheduleEntry[] {
  const weekEntries = schedule.filter((e) => e.week === fromWeek);
  const copies = weekEntries.map((e) => ({ ...e, id: uid(), week: toWeek }));
  return [...schedule, ...copies];
}

/** Gera o cronograma duplicando um template semanal para todas as semanas. */
export function fillFromWeekTemplate(template: ScheduleEntry[], totalWeeks: number): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    template.forEach((t) => {
      entries.push({ ...t, id: uid(), week: w });
    });
  }
  return entries;
}

/** Converte semana para mês (1-indexed). Semana 1-4 = Mês 1, 5-8 = Mês 2, etc. */
export function weekToMonth(week: number): number {
  return Math.ceil(week / 4);
}

/** Agrupa entries do schedule por mês. */
export function groupByMonth(schedule: ScheduleEntry[]): Map<number, ScheduleEntry[]> {
  const map = new Map<number, ScheduleEntry[]>();
  for (const entry of schedule) {
    const month = weekToMonth(entry.week);
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(entry);
  }
  return map;
}

// ── Planos padrão ───────────────────────────────────────────────────────────
export const PLANS: Plan[] = [
  {
    id: 'v1',
    code: 'V1',
    name: 'Experiência',
    tagline: 'Ideal para conhecer o serviço e testar resultados.',
    total: 8,
    totalLabel: 'conteúdos entregues',
    items: [
      { label: 'Reels', n: 4, kind: 'reels', description: 'Vídeos curtos otimizados para o algoritmo' },
      { label: 'Carrosséis', n: 2, kind: 'carrossel', description: 'Posts com múltiplas imagens educativas' },
      { label: 'Artes estáticas', n: 2, kind: 'arte', description: 'Designs profissionais para feed' },
    ],
    duration: '1 mês · sem compromisso',
    price: 'R$ 580',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 72,50 por conteúdo',
    paymentMode: 'avista',
    totalValue: 580,
    months: 1,
    autoPrice: true,
    scheduleViewMode: 'weeks',
  },
  {
    id: 'v2',
    code: 'V2',
    name: 'Crescimento',
    tagline: 'Consistência que gera resultado, o algoritmo recompensa frequência.',
    total: 36, // corrigido: 12+12+12 = 36
    totalLabel: 'conteúdos em 3 meses',
    items: [
      { label: 'Reels', n: 12, kind: 'reels', description: 'Vídeos curtos otimizados para o algoritmo' },
      { label: 'Carrosséis', n: 12, kind: 'carrossel', description: 'Posts com múltiplas imagens educativas' },
      { label: 'Artes', n: 12, kind: 'arte', description: 'Designs profissionais para feed' },
    ],
    duration: '3 meses · parcelado',
    price: 'R$ 560/mês',
    priceNote: 'total R$ 1.680,00',
    perContent: 'cerca de R$ 46,67 por conteúdo', // corrigido: 1680/36
    paymentMode: 'mensal',
    monthlyValue: 560,
    months: 3,
    autoPrice: true,
    featured: true,
    badge: 'melhor custo-benefício',
    scheduleViewMode: 'months',
  },
  {
    id: 'v3',
    code: 'V3',
    name: 'Aceleração',
    tagline: 'Máxima economia com compromisso, invista uma vez, colha por 3 meses.',
    total: 36, // corrigido: 12+12+12 = 36
    totalLabel: 'conteúdos em 3 meses',
    items: [
      { label: 'Reels', n: 12, kind: 'reels', description: 'Vídeos curtos otimizados para o algoritmo' },
      { label: 'Carrosséis', n: 12, kind: 'carrossel', description: 'Posts com múltiplas imagens educativas' },
      { label: 'Artes', n: 12, kind: 'arte', description: 'Designs profissionais para feed' },
    ],
    duration: '3 meses · à vista',
    price: 'R$ 1.650',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 45,83 por conteúdo', // corrigido: 1650/36
    paymentMode: 'avista',
    totalValue: 1650,
    months: 3,
    autoPrice: true,
    badge: 'menor preço por conteúdo',
    scheduleViewMode: 'months',
  },
];

// ── Processos por tipo ──────────────────────────────────────────────────────
export const PROCESS: Record<string, readonly (readonly [string, string])[]> = {
  reels: [
    ['Roteiro estratégico', 'Texto pensado pra prender nos 3 primeiros segundos.'],
    ['Captação profissional', 'Enquadramento, luz e áudio que transmitem autoridade.'],
    ['Edição & finalização', 'Cortes dinâmicos, legendas, trilha, atenção até o fim.'],
    ['Sua aprovação', 'Nada vai ao ar sem o seu OK. Controle total.'],
    ['Legenda + pronto', 'Copy persuasiva, hashtags e CTA. É só postar.'],
  ],
  arte: [
    ['Estratégia comercial', 'Cada arte resolve uma dor do seu cliente.'],
    ['Conteúdo de conversão', 'Educa, gera valor e conduz até a compra.'],
    ['Design profissional', 'Identidade visual que diferencia a marca.'],
    ['Sua aprovação', 'Revisão com até 2 ajustes antes de publicar.'],
    ['Legenda + pronto', 'Copy otimizada com CTA claro. É só postar.'],
  ],
  carrossel: [
    ['Planejamento', 'Tema e sequência pensados para gerar saves e compartilhamentos.'],
    ['Conteúdo + design', 'Cada slide conta uma micro-história visual.'],
    ['Revisão', 'Ajustes de texto e layout antes da aprovação.'],
    ['Sua aprovação', 'Você valida antes de publicar.'],
    ['Legenda + pronto', 'Copy persuasiva com CTA. É só postar.'],
  ],
  stories: [
    ['Estratégia', 'Formato pensado pra conexão direta com a audiência.'],
    ['Captação / design', 'Conteúdo autêntico com acabamento profissional.'],
    ['Edição', 'Cortes, legendas e elementos visuais que prendem.'],
    ['Sua aprovação', 'Validação antes de ir ao ar.'],
    ['Pronto', 'Publicação otimizada para engajamento.'],
  ],
  drone: [
    ['Planejamento de voo', 'Rota e ângulos definidos para o melhor resultado.'],
    ['Captação aérea', 'Imagens cinematográficas em alta resolução.'],
    ['Pós-produção', 'Color grading, estabilização e trilha sonora.'],
    ['Sua aprovação', 'Revisão do material final.'],
    ['Entrega', 'Arquivo final em alta resolução.'],
  ],
  cobertura: [
    ['Briefing', 'Alinhamento do evento, momentos-chave e expectativas.'],
    ['Captação no local', 'Registro profissional de todos os momentos importantes.'],
    ['Edição', 'Seleção e tratamento das melhores imagens e vídeos.'],
    ['Entrega', 'Material organizado e em alta resolução.'],
    ['Conteúdo extra', 'Reels ou carrosséis do evento (se incluso).'],
  ],
  ensaio: [
    ['Briefing criativo', 'Conceito, referências e paleta de cores.'],
    ['Direção de cena', 'Poses, ângulos e iluminação dirigidos.'],
    ['Captação', 'Sessão fotográfica profissional.'],
    ['Tratamento', 'Edição individual de cada foto selecionada.'],
    ['Entrega', 'Galeria em alta resolução + versões para redes.'],
  ],
  consultoria: [
    ['Diagnóstico', 'Análise completa do perfil e posicionamento atual.'],
    ['Estratégia', 'Plano de conteúdo personalizado com metas claras.'],
    ['Reunião', 'Sessão ao vivo com orientações práticas.'],
    ['Material de apoio', 'Documento com recomendações e calendário.'],
    ['Acompanhamento', 'Suporte por mensagem durante o período.'],
  ],
};

export const DIFFS = [
  ['3×', 'mais alcance pelo algoritmo pra quem posta com constância e qualidade.'],
  ['70%', 'dos consumidores decidem comprar após assistir a um vídeo do produto/serviço.'],
  ['0h', 'do seu tempo com conteúdo. você foca no negócio, eu cuido da presença digital.'],
] as const;

export const CONTACT = {
  whatsapp: '(32) 99972-2706',
  instagram: '@mariaubaldino.films',
  email: 'Mariaeduarda681@icloud.com',
};

// ── Seções editáveis da proposta (defaults) ─────────────────────────────────
export interface FAQItem { q: string; a: string }
export interface InclusoItem { label: string; description: string }
export interface CondicoesConfig {
  validade: string;
  pagamento: string;
  aprovacao: string;
  naoInclui: string;
}

export const DEFAULT_FAQ: FAQItem[] = [
  { q: 'preciso aparecer nos vídeos?', a: 'não necessariamente. existem formatos que funcionam muito bem sem você aparecer — e quando fizer sentido, eu te direciono com roteiro e luz pra você ficar confortável.' },
  { q: 'e se eu não gostar do resultado?', a: 'cada conteúdo passa pela sua aprovação antes de ser publicado. você tem até 2 rodadas de ajustes inclusos pra garantir que ficou do jeito certo.' },
  { q: 'em quanto tempo começo a ver resultado?', a: 'os primeiros sinais (mais alcance, mais mensagens) costumam aparecer nas primeiras semanas. resultado consistente vem com constância — por isso os planos de 3 meses existem.' },
  { q: 'posso cancelar a qualquer momento?', a: 'sim. o V1 não tem compromisso. nos planos de 3 meses, basta avisar com 15 dias de antecedência. sem burocracia.' },
];

export const DEFAULT_INCLUSO: InclusoItem[] = [
  { label: 'roteiro', description: 'Texto estratégico pensado pra converter.' },
  { label: 'captação', description: 'Produção profissional de foto e vídeo.' },
  { label: 'edição', description: 'Cortes, cores, legenda e trilha.' },
  { label: 'aprovação', description: 'Nada vai ao ar sem o seu OK.' },
  { label: 'legenda + CTA', description: 'Copy persuasiva com chamada pra ação.' },
  { label: 'consistência', description: 'Calendário e frequência que o algoritmo recompensa.' },
];

export const DEFAULT_CONDICOES: CondicoesConfig = {
  validade: 'esta proposta é válida por {days} dias a partir do envio.',
  pagamento: 'pix ou cartão de crédito. planos mensais são debitados automaticamente.',
  aprovacao: 'cada conteúdo tem até 2 rodadas de ajuste. após 3 dias úteis sem resposta, o conteúdo é publicado.',
  naoInclui: 'tráfego pago, deslocamento fora da cidade, figurino, locação ou atores.',
};

// ── Temas de cores ──────────────────────────────────────────────────────────
export interface ProposalTheme {
  id: string;
  name: string;
  accent: string;
  accentLight: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
}

export const THEMES: ProposalTheme[] = [
  { id: 'pink',   name: 'rosa',     accent: '#E91E90', accentLight: '#FCE4F0', bg: '#FAF5F0', surface: '#FFFFFF', text: '#171717', textMuted: '#737373' },
  { id: 'gold',   name: 'dourado',  accent: '#D4A017', accentLight: '#FEF3C7', bg: '#FFFBEB', surface: '#FFFFFF', text: '#171717', textMuted: '#737373' },
  { id: 'teal',   name: 'turquesa', accent: '#0D9488', accentLight: '#CCFBF1', bg: '#F0FDFA', surface: '#FFFFFF', text: '#171717', textMuted: '#737373' },
  { id: 'violet', name: 'violeta',  accent: '#7C3AED', accentLight: '#EDE9FE', bg: '#FAF5FF', surface: '#FFFFFF', text: '#171717', textMuted: '#737373' },
  { id: 'dark',   name: 'escuro',   accent: '#E91E90', accentLight: '#3B1F2B', bg: '#0A0A0A', surface: '#171717', text: '#FAFAFA', textMuted: '#A3A3A3' },
];

// ── Configuração de seções da proposta ──────────────────────────────────────
export interface ProposalSections {
  heroTitle?: string;
  heroSubtitle?: string;
  showPorque?: boolean;
  showIncluso?: boolean;
  showProcesso?: boolean;
  showCalendario?: boolean;
  showResultados?: boolean;
  showFaq?: boolean;
  showCondicoes?: boolean;
  faq?: FAQItem[];
  incluso?: InclusoItem[];
  condicoes?: CondicoesConfig;
}

export const DEFAULT_SECTIONS: ProposalSections = {
  showPorque: true,
  showIncluso: true,
  showProcesso: true,
  showCalendario: true,
  showResultados: true,
  showFaq: true,
  showCondicoes: true,
};
