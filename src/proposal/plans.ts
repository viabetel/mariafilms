// Dados da proposta,espelham o gerador WeasyPrint (build_proposta_maria.py).
// Fonte única para a experiência web; o PDF formal continua sendo gerado pelo
// WeasyPrint (identidade clara/comercial). Aqui é a camada "viva" (dark/cinema).

export interface Plan {
  id: string; // 'v1'|'v2'|'v3' nos padrões; versões customizadas usam id próprio
  code: string;
  name: string;
  tagline: string;
  total: number; // qtd de conteúdos
  totalLabel: string;
  items: { label: string; n: number }[];
  duration: string;
  price: string; // formatado
  priceNote: string;
  perContent: string;
  featured?: boolean;
  badge?: string;
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
      { label: 'Reels', n: 4 },
      { label: 'Carrosséis', n: 2 },
      { label: 'Artes estáticas', n: 2 },
    ],
    duration: '1 mês · sem compromisso',
    price: 'R$ 580',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 72,50 por conteúdo',
  },
  {
    id: 'v2',
    code: 'V2',
    name: 'Crescimento',
    tagline: 'Consistência que gera resultado, o algoritmo recompensa frequência.',
    total: 24,
    totalLabel: 'conteúdos em 3 meses',
    items: [
      { label: 'Reels', n: 12 },
      { label: 'Carrosséis', n: 12 },
      { label: 'Artes', n: 12 },
    ],
    duration: '3 meses · parcelado',
    price: 'R$ 560/mês',
    priceNote: 'total R$ 1.680,00',
    perContent: 'cerca de R$ 70,00 por conteúdo',
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
      { label: 'Reels', n: 12 },
      { label: 'Carrosséis', n: 12 },
      { label: 'Artes', n: 12 },
    ],
    duration: '3 meses · à vista',
    price: 'R$ 1.650',
    priceNote: 'pagamento único',
    perContent: 'cerca de R$ 68,75 por conteúdo',
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
