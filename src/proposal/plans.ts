// Dados da proposta,espelham o gerador WeasyPrint (build_proposta_maria.py).
// Fonte única para a experiência web; o PDF formal continua sendo gerado pelo
// WeasyPrint (identidade clara/comercial). Aqui é a camada "viva" (dark/cinema).
import { Film, Layers, Image, PlayCircle, Camera, Video, Square, type LucideIcon } from './icons';

// Tipo de cada entregável da social mídia → define ÍCONE e cor no card e no
// cronograma. É editável no admin; itens antigos sem tipo caem no inferKind.
export type DeliverableKind = 'reels' | 'carrossel' | 'arte' | 'stories' | 'foto' | 'video' | 'outro';
export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
export type PaymentMode = 'mensal' | 'avista';

export interface DeliverableItem { label: string; n: number; kind?: DeliverableKind }
// Uma postagem no cronograma daquela versão (semana + dia + tipo).
export interface ScheduleEntry { id: string; week: number; day: Weekday; kind: DeliverableKind; label?: string }

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
  paymentMode?: PaymentMode; // 'mensal' (valor×meses) | 'avista' (valor único)
  monthlyValue?: number; // R$/mês quando mensal
  totalValue?: number; // R$ total quando à vista
  months?: number; // duração em meses
  autoPrice?: boolean; // true (default) = preço/total/por-conteúdo derivam sozinhos
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
/** Valor total da versão: mensal×meses, ou o valor único à vista. */
export function planTotalValue(p: Pick<Plan, 'paymentMode' | 'monthlyValue' | 'totalValue' | 'months'>): number {
  if (p.paymentMode === 'mensal') return (p.monthlyValue ?? 0) * Math.max(1, p.months ?? 1);
  return p.totalValue ?? 0;
}

// ── Plano de cobrança (o que o gateway de pagamento consome) ────────────────
// Traduz a precificação da versão em PARCELAS concretas com vencimento. É o elo
// entre o preço exibido e a cobrança real (Pix/cartão). Quem chama isto de
// verdade é o SERVIDOR, remontando pelo planId: o cliente nunca manda valor.
//   V1 (avista 580)  -> 1 parcela de 580 hoje
//   V2 (mensal 560)  -> 3 parcelas de 560 (hoje, +30d, +60d)  [parcelado em 3x]
//   V3 (avista 1650) -> 1 parcela de 1.650 hoje
export type ChargeMethod = 'pix' | 'cartao' | 'boleto';
export interface Installment { n: number; amount: number; dueInDays: number }
export interface BillingPlan {
  mode: PaymentMode;          // 'mensal' (assinatura recorrente) | 'avista'
  recurring: boolean;         // true = ASSINATURA: cartão debitado automático todo mês
  total: number;              // valor total do compromisso
  monthly: number;            // valor de cada mensalidade (0 quando à vista)
  installmentsTotal: number;  // nº de mensalidades/cobranças
  installments: Installment[]; // cada mensalidade (vencimento relativo à assinatura)
}
// Decidido 2026-06-02: receber DENTRO do site. Mensal = ASSINATURA no cartão
// (débito automático recorrente, ex.: preapproval do Mercado Pago); à vista = Pix
// ou cartão único. Pix mês a mês fica como alternativa informal (a Maria cobra na
// mão) se o cliente não quiser pôr cartão.
export function billingPlan(p: Pick<Plan, 'paymentMode' | 'monthlyValue' | 'totalValue' | 'months'>): BillingPlan {
  const total = planTotalValue(p);
  if (p.paymentMode === 'mensal') {
    const months = Math.max(1, p.months ?? 1);
    const monthly = p.monthlyValue ?? Math.round(total / months);
    const installments: Installment[] = Array.from({ length: months }, (_, i) => ({ n: i + 1, amount: monthly, dueInDays: i * 30 }));
    return { mode: 'mensal', recurring: true, total, monthly, installmentsTotal: months, installments };
  }
  return { mode: 'avista', recurring: false, total, monthly: 0, installmentsTotal: 1, installments: [{ n: 1, amount: total, dueInDays: 0 }] };
}
/** Deriva os textos exibidos (preço, total, duração, rótulos) a partir da
 *  precificação estruturada + dos entregáveis. É o "amarrar decisões": muda o
 *  valor/meses ou os entregáveis e tudo se recalcula sozinho. */
export function deriveDisplay(p: Plan): Pick<Plan, 'price' | 'priceNote' | 'duration' | 'total' | 'totalLabel' | 'perContent'> {
  const contents = sumItems(p.items);
  const totalValue = planTotalValue(p);
  const months = Math.max(1, p.months ?? 1);
  const mensal = p.paymentMode === 'mensal';
  const mesLabel = months === 1 ? 'mês' : 'meses';
  return {
    total: contents,
    totalLabel: months > 1 ? `conteúdos em ${months} ${mesLabel}` : 'conteúdos entregues',
    price: mensal ? `${brl(p.monthlyValue ?? 0)}/mês` : brl(totalValue),
    priceNote: mensal ? `total ${brl(totalValue)}` : 'pagamento único',
    duration: `${months} ${mesLabel} · ${mensal ? 'parcelado' : 'à vista'}`,
    // por-conteúdo derivado do MESMO total → nunca defasa do preço/entregáveis
    perContent: contents > 0 ? `cerca de ${brl(totalValue / contents)} por conteúdo` : '',
  };
}

// Rótulo + ícone + cor por tipo de entregável. Fonte única (card, cronograma, editor).
export const KIND_META: Record<DeliverableKind, { label: string; icon: LucideIcon; color: string }> = {
  reels: { label: 'reels', icon: Film, color: '#ff007f' },
  carrossel: { label: 'carrossel', icon: Layers, color: '#8B5CF6' },
  arte: { label: 'arte / estático', icon: Image, color: '#10B981' },
  stories: { label: 'stories', icon: PlayCircle, color: '#F59E0B' },
  foto: { label: 'foto', icon: Camera, color: '#0EA5E9' },
  video: { label: 'vídeo', icon: Video, color: '#3B82F6' },
  outro: { label: 'outro', icon: Square, color: '#9CA3AF' },
};
export const KIND_ORDER: DeliverableKind[] = ['reels', 'carrossel', 'arte', 'stories', 'foto', 'video', 'outro'];
export const WEEKDAYS: Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const POST_DAYS: Weekday[] = ['ter', 'qui', 'seg', 'sex', 'qua', 'sab', 'dom']; // ordem de preferência

/** Adivinha o tipo pelo texto (fallback p/ itens sem `kind`). */
export function inferKind(label: string): DeliverableKind {
  const s = (label || '').toLowerCase();
  if (/reel/.test(s)) return 'reels';
  if (/carross|carrosel|slide/.test(s)) return 'carrossel';
  if (/stor/.test(s)) return 'stories';
  if (/v[ií]deo|film/.test(s)) return 'video';
  if (/foto|photo|ensaio/.test(s)) return 'foto';
  if (/arte|est[aá]tic|post|card|design/.test(s)) return 'arte';
  return 'outro';
}
export function kindOf(it: DeliverableItem): DeliverableKind {
  return it.kind ?? inferKind(it.label);
}

/** Nº de semanas do cronograma: respeita plan.weeks; senão deduz da duração. */
export function defaultWeeks(plan: Pick<Plan, 'weeks' | 'duration' | 'totalLabel'>): number {
  if (typeof plan.weeks === 'number' && plan.weeks > 0) return plan.weeks;
  const t = `${plan.duration ?? ''} ${plan.totalLabel ?? ''}`.toLowerCase();
  if (/3\s*mes|3\s*mês|trimes/.test(t)) return 12;
  if (/2\s*mes|2\s*mês/.test(t)) return 8;
  return 4;
}

const uid = () => Math.random().toString(36).slice(2, 8);

/** Distribui os entregáveis da versão pelas semanas (round-robin entre tipos,
 *  pra cada semana ficar variada). Base do botão "gerar automaticamente". */
export function generateSchedule(plan: Plan): ScheduleEntry[] {
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
      entries.push({ id: uid(), week: w, day: POST_DAYS[k % POST_DAYS.length], kind: unit.kind, label: unit.label });
    }
  }
  return entries;
}

export const PLANS: Plan[] = [
  {
    id: 'v1',
    code: 'V1',
    name: 'Experiência',
    tagline: 'Ideal para conhecer o serviço e testar resultados.',
    total: 8,
    totalLabel: 'conteúdos entregues',
    items: [
      { label: 'Reels', n: 4, kind: 'reels' },
      { label: 'Carrosséis', n: 2, kind: 'carrossel' },
      { label: 'Artes estáticas', n: 2, kind: 'arte' },
    ],
    duration: '1 mês · sem compromisso',
    price: 'R$ 580',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 72,50 por conteúdo',
    paymentMode: 'avista',
    totalValue: 580,
    months: 1,
    autoPrice: true,
  },
  {
    id: 'v2',
    code: 'V2',
    name: 'Crescimento',
    tagline: 'Consistência que gera resultado, o algoritmo recompensa frequência.',
    total: 24,
    totalLabel: 'conteúdos em 3 meses',
    items: [
      { label: 'Reels', n: 12, kind: 'reels' },
      { label: 'Carrosséis', n: 12, kind: 'carrossel' },
      { label: 'Artes', n: 12, kind: 'arte' },
    ],
    duration: '3 meses · parcelado',
    price: 'R$ 560/mês',
    priceNote: 'total R$ 1.680,00',
    perContent: 'cerca de R$ 70,00 por conteúdo',
    paymentMode: 'mensal',
    monthlyValue: 560,
    months: 3,
    autoPrice: true,
    featured: true,
    badge: 'melhor custo-benefício',
  },
  {
    id: 'v3',
    code: 'V3',
    name: 'Aceleração',
    tagline: 'Máxima economia com compromisso, invista uma vez, colha por 3 meses.',
    total: 24,
    totalLabel: 'conteúdos em 3 meses',
    items: [
      { label: 'Reels', n: 12, kind: 'reels' },
      { label: 'Carrosséis', n: 12, kind: 'carrossel' },
      { label: 'Artes', n: 12, kind: 'arte' },
    ],
    duration: '3 meses · à vista',
    price: 'R$ 1.650',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 68,75 por conteúdo',
    paymentMode: 'avista',
    totalValue: 1650,
    months: 3,
    autoPrice: true,
    badge: 'menor preço por conteúdo',
  },
];

export const PROCESS = {
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
} as const;

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
