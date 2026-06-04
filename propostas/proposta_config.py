# ════════════════════════════════════════════════════════════════════════
# FONTE ÚNICA — proposta + contrato leem DAQUI. Mude só este arquivo por cliente.
# [EDITÁVEL] tudo aqui é placeholder pra alinhar depois.
# ════════════════════════════════════════════════════════════════════════

CLIENT = "sua marca"  # nome do cliente desta proposta

# Dados legais da CONTRATADA (Maria) — pro contrato. [EDITÁVEL]
CONTRACTOR = {
    "nome": "Maria Eduarda Ubaldino",
    "doc": "CPF/CNPJ 000.000.000-00",
    "marca": "maria films",
    "cidade": "Juiz de Fora/MG",
}

CONTACT = {
    "whatsapp": "(32) 99972-2706",
    "instagram": "@mariaubaldino.films",
    "email": "Mariaeduarda681@icloud.com",
}

# Planos. O premium ("featured") tem "diff" = escopo diferencial. [EDITÁVEL]
PLANS = [
    {
        "code": "v1", "name": "experiência",
        "tagline": "ideal para conhecer o serviço e testar resultados",
        "total": "8", "total_label": "conteúdos entregues",
        "items": [("4", "reels"), ("2", "carrosséis"), ("2", "artes estáticas")],
        "duration": "1 mês · sem compromisso", "months": 1,
        "price": "580", "price_prefix": "R$", "price_suffix": "",
        "price_value": 580.0, "monthly": False,
        "price_note": "pagamento único", "per": "≈ R$72,50 por conteúdo",
        "featured": False, "badge": "", "diff": [],
    },
    {
        "code": "v2", "name": "crescimento",
        "tagline": "consistência que gera resultado — o algoritmo recompensa frequência",
        "total": "24", "total_label": "conteúdos em 3 meses",
        "items": [("12", "reels"), ("12", "carrosséis"), ("12", "artes")],
        "duration": "3 meses · parcelado", "months": 3,
        "price": "560", "price_prefix": "R$", "price_suffix": "/mês",
        "price_value": 560.0, "monthly": True,
        "price_note": "total R$1.680,00", "per": "≈ R$70,00 por conteúdo",
        "featured": False, "badge": "melhor custo-benefício", "diff": [],
    },
    {
        "code": "v3", "name": "autoridade",
        "tagline": "presença completa e estratégica — não só posta, constrói marca",
        "total": "24+", "total_label": "conteúdos + extras / 3 meses",
        "items": [("12", "reels"), ("12", "carrosséis"), ("12", "artes")],
        "duration": "3 meses · à vista", "months": 3,
        "price": "1.650", "price_prefix": "R$", "price_suffix": "",
        "price_value": 1650.0, "monthly": False,
        "price_note": "pagamento único", "per": "tudo do crescimento, e mais:",
        "featured": True, "badge": "experiência completa",
        "diff": [
            "relatório mensal de métricas",
            "reunião de estratégia mensal",
            "pacote de stories semanais",
        ],
    },
]

# Condições comerciais (proposta). [EDITÁVEL]
TERMS = [
    ("validade", "esta proposta é válida por 15 dias a partir do envio."),
    ("pagamento", "pix ou cartão. v2 parcelado em até 3x; v3 à vista com desconto."),
    ("aprovação", "você aprova cada conteúdo em até 3 dias úteis; após esse prazo, considera-se aprovado para manter o cronograma."),
    ("revisões", "até 2 ajustes por conteúdo inclusos."),
    ("reagendamento", "gravações podem ser remarcadas com aviso de 48h."),
]

NOT_INCLUDED = [
    "impulsionamento / tráfego pago (anúncios)",
    "deslocamento para fora da cidade",
    "figurino, locação e contratação de atores/modelos",
]

# Regras do contrato. [EDITÁVEL — alinhar com advogado depois]
CONTRACT_RULES = {
    "aprovacao_dias": 3,            # dias úteis p/ aprovação tácita
    "revisoes": 2,                  # ajustes por conteúdo
    "multa_pct": 30,               # multa rescisória sobre saldo (%)
    "juros_mes_pct": 1,             # juros de mora a.m.
    "multa_atraso_pct": 2,          # multa por atraso de pagamento
    "portfolio": True,              # Maria pode usar no portfólio/redes
    "entrega_raw": False,           # entrega arquivos brutos? não
}

# Identidade (espelha o site)
PK = "#ff007f"
PK_SOFT = "rgba(255,0,127,0.4)"
BG = "#000000"
SURFACE = "#0a0a0a"
CARD = "#ffffff"
INK = "#111111"
INK_DIM = "#555555"
MUTED = "#9ca3af"
DIM = "#6b7280"
FAINT = "#4b5563"
