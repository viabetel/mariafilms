"""
Esqueleto do backend da Proposta (Maria Films).  NÃO é produção — TODOs marcam
onde WeasyPrint, Autentique e Supabase entram. Espelha o contrato de src/proposal/api.ts.

Rodar local:  uvicorn main:app --reload
"""
import json
import os
from datetime import datetime, timezone

# Carrega backend/.env ANTES de qualquer import que leia variáveis de ambiente
# (db.py e security.py leem no import). Assim os segredos não precisam ser
# exportados na mão a cada `uvicorn` — ficam num .env local (fora do git).
try:
    from dotenv import load_dotenv
    import pathlib
    load_dotenv(pathlib.Path(__file__).resolve().parent / ".env")
except ImportError:
    pass  # sem python-dotenv: segue lendo do ambiente do processo

import requests
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import db
import security
from proposals_api import router as proposals_router

# ── Config Autentique (chave SÓ no servidor, via variável de ambiente) ─────────
AUTENTIQUE_URL = "https://api.autentique.com.br/v2/graphql"
AUTENTIQUE_TOKEN = os.environ.get("AUTENTIQUE_TOKEN", "")
# sandbox=true não gasta crédito e o documento some sozinho. Em produção, defina
# AUTENTIQUE_SANDBOX=false para o documento valer juridicamente.
AUTENTIQUE_SANDBOX = os.environ.get("AUTENTIQUE_SANDBOX", "true").lower() != "false"

# CORS por ALLOWLIST (não '*'). Em produção, defina CORS_ORIGINS com os domínios do
# site separados por vírgula. Default seguro = só o dev local.
_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

# Rate limiter por IP — barra abuso/força-bruta nos endpoints sensíveis.
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Maria Films — Proposta API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda r, e: _rate_limited())

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "x-admin-token"],
)

# Rotas de CRUD das propostas (admin protegido por token + ações do cliente).
app.include_router(proposals_router)


@app.on_event("startup")
def _warm_contract_fonts():
    """Pré-aquece o cache de fontes do WeasyPrint em segundo plano, pra o PRIMEIRO
    contrato real já sair rápido (~1s) em vez de pagar o download de fontes."""
    import threading

    def _run():
        try:
            import pathlib
            import sys
            sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "propostas"))
            from build_contract import warm_fonts
            warm_fonts()
        except Exception:
            pass

    threading.Thread(target=_run, daemon=True).start()


def _rate_limited():
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=429, content={"detail": "muitas requisições, tente em instantes"})


# ── Modelos (batem com src/proposal/api.ts) ────────────────────────────────
class ContratoIn(BaseModel):
    # Limites de tamanho = anti-DoS/anti-lixo. A validação NÃO confia no front.
    token: str | None = Field(default=None, max_length=80)
    planId: str = Field(min_length=1, max_length=40)
    nome: str = Field(min_length=2, max_length=120)
    documento: str = Field(min_length=11, max_length=20)
    email: EmailStr

    @field_validator("documento")
    @classmethod
    def _doc_valido(cls, v: str) -> str:
        # CPF/CNPJ com dígito verificador correto, validado NO SERVIDOR.
        if not security.valid_documento(v):
            raise ValueError("CPF/CNPJ inválido")
        return v


class ContratoOut(BaseModel):
    documentId: str
    signingUrl: str | None
    signerEmail: str
    plan: dict


# ── Modelo do formulário de contato do site (seção "eternizar o instante") ──
class ContatoIn(BaseModel):
    # Limites = anti-DoS/anti-lixo; a validação não confia no front.
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr
    mensagem: str = Field(min_length=1, max_length=4000)
    # honeypot: campo isca invisível no form. Humano deixa vazio; bot preenche.
    website: str | None = Field(default=None, max_length=200)


# ── POST /api/contato → grava a mensagem do site (aparece no /admin) ────────
@app.post("/api/contato")
@limiter.limit("5/minute")
async def criar_contato(body: ContatoIn, request: Request):
    # honeypot preenchido = bot: finge sucesso e descarta (não polui o painel).
    if body.website:
        return {"ok": True}
    db.insert(
        "contatos",
        {
            "nome": body.nome.strip(),
            "email": str(body.email),
            "mensagem": body.mensagem.strip(),
            "ip": get_remote_address(request),
            "user_agent": (request.headers.get("user-agent") or "")[:400],
        },
    )
    # TODO Resend: notificar a Maria por e-mail aqui quando o token estiver pronto.
    return {"ok": True}


# ── GET /api/proposta/{token} → resolve cliente + conteúdo + status ────────
@app.get("/api/proposta/{token}")
async def get_proposta(token: str):
    row = db.select_one("proposals", token=token)
    if not row:
        if db.enabled():
            raise HTTPException(404, "proposta não encontrada")
        return {"clienteNome": token.replace("-", " "), "intro": "", "plans": [], "status": "pendente", "expiresAt": None, "blocked": False}
    # View segura pro CLIENTE: sem a nota interna (notes) nem a trilha de eventos.
    content = row.get("content") or {}
    status = content.get("status", "pendente")

    # FECHAMENTO SEM WEBHOOK: se está aguardando assinatura, pergunta pra Autentique
    # (com o token do servidor) se os DOIS já assinaram e marca 'assinada' na hora.
    # O front faz polling deste GET a cada 5s → o status avança sozinho, sem depender
    # de webhook cadastrado no painel. Read da Autentique não gasta crédito.
    if status == "aguardando_assinatura":
        acc = _latest_acceptance(row.get("id"))
        if acc and _finalize_if_all_signed(acc, row):
            status = "assinada"

    return {
        "clienteNome": content.get("clienteNome") or row.get("client_name"),
        "intro": content.get("intro", ""),
        "plans": content.get("plans", []),
        "status": status,
        "expiresAt": row.get("expires_at"),
        "blocked": bool(content.get("archived")),
        # link de assinatura (Autentique) p/ RESTAURAR o iframe quando o cliente
        # recarrega a página na etapa de assinatura. Sem isso, o reload perdia o
        # quadro e caía no "modo demonstração".
        "contract": content.get("contract"),
        "heroTitle": content.get("heroTitle", ""),
        "heroSubtitle": content.get("heroSubtitle", ""),
        "themeId": content.get("themeId", "pink"),
        "sections": content.get("sections", {}),
    }


# ── POST /api/proposta/contrato → molda PDF + cria na Autentique ───────────
# Rate limit AGRESSIVO: cada chamada cria um documento na Autentique (custa
# crédito) + sobe arquivo + grava no banco. Sem teto, vira vetor de abuso/custo.
# ═══════════════════════════════════════════════════════════════════════════
# RESOLVEDOR ÚNICO DE PLANO (a "solução definitiva")
#
# O servidor é dono da verdade. Dado o planId que o cliente escolheu, ele acha o
# plano GUARDADO NA PROPOSTA (definido pelo admin) e deriva DALI tanto o contrato
# quanto a cobrança. Nada é chumbado em v1/v2/v3, e o cliente nunca dita preço:
# o valor vem sempre do plano salvo. Funciona para QUALQUER versão custom.
# ═══════════════════════════════════════════════════════════════════════════

def _num(v) -> float:
    """Coerção segura para número (campos do admin podem vir vazios/strings)."""
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _sum_items(cp: dict) -> int:
    return sum(max(0, int(_num(it.get("n")))) for it in (cp.get("items") or []))


def _brl(n: float) -> str:
    s = f"{n:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if s.endswith(",00"):
        s = s[:-3]
    return f"R$ {s}"


def resolve_plan(prop: dict | None, plan_id: str) -> dict:
    """Devolve o plano (shape do front) escolhido, lido da proposta GUARDADA.
    Sem proposta (modo protótipo sem-DB), cai no catálogo padrão por id."""
    if prop:
        for pl in (prop.get("content") or {}).get("plans") or []:
            if pl.get("id") == plan_id:
                return pl
        raise HTTPException(400, "versão não encontrada nesta proposta")
    std = PLANS.get(plan_id)
    if not std:
        raise HTTPException(400, "plano inválido")
    return std


def billing_from_plan(cp: dict) -> dict:
    """Plano de cobrança derivado do plano guardado. Espelha billingPlan() do front.
    Mensal = assinatura recorrente; à vista = cobrança única. Valor sempre daqui
    (servidor), nunca do cliente."""
    mensal = cp.get("paymentMode") == "mensal"
    months = max(1, int(_num(cp.get("months")) or 1))
    if mensal:
        monthly = _num(cp.get("monthlyValue"))
        total = monthly * months
        if monthly <= 0:  # fallback defensivo
            monthly = round(total / months, 2) if total else 0.0
        installments = [{"n": i + 1, "amount": monthly, "dueInDays": i * 30} for i in range(months)]
        return {"mode": "mensal", "recurring": True, "total": total, "monthly": monthly,
                "installmentsTotal": months, "installments": installments}
    total = _num(cp.get("totalValue"))
    return {"mode": "avista", "recurring": False, "total": total, "monthly": 0.0,
            "installmentsTotal": 1, "installments": [{"n": 1, "amount": total, "dueInDays": 0}]}


def _map_content_plan(cp: dict) -> dict:
    """Converte o plano da PROPOSTA (shape do front) para o shape que o gerador de
    contrato (build_contract) espera. Blindado contra campos faltando/vazios — o
    admin pode criar QUALQUER versão sem quebrar o contrato."""
    items = [(str(int(_num(it.get("n")))), str(it.get("label", "") or "item")) for it in (cp.get("items") or [])]
    mensal = cp.get("paymentMode") == "mensal"
    bp = billing_from_plan(cp)
    # preço/observação: usa o que o admin derivou; se vazio, monta a partir do valor.
    price = str(cp.get("price") or "").strip() or (f"{_brl(bp['monthly'])}/mês" if mensal else _brl(bp["total"]))
    price_note = str(cp.get("priceNote") or "").strip() or (f"total {_brl(bp['total'])}" if mensal else "pagamento único")
    total = cp.get("total")
    total_str = str(total) if total not in (None, "") else str(_sum_items(cp))
    return {
        "code": cp.get("code") or "",
        "name": cp.get("name") or "Plano",
        "items": items or [("", "conforme proposta")],
        "diff": cp.get("diff") or [],
        "total": total_str,
        "duration": cp.get("duration") or f"{max(1, int(_num(cp.get('months')) or 1))} meses",
        "price": price,
        "price_prefix": "",
        "price_suffix": "",
        "price_note": price_note,
    }


@app.post("/api/proposta/contrato", response_model=ContratoOut)
@limiter.limit("5/minute")
async def gerar_contrato(body: ContratoIn, request: Request, background_tasks: BackgroundTasks):
    # ANTI-ABUSO: a requisição precisa apontar para uma proposta REAL (quando há
    # Supabase). Sem isso, qualquer um gera contratos/documentos Autentique à
    # vontade. Em modo sem-DB (protótipo local), segue permitindo.
    prop = None
    if db.enabled():
        prop = db.select_one("proposals", token=body.token) if body.token else None
        if not prop:
            raise HTTPException(404, "proposta não encontrada")
        if prop.get("status") == "expirada":
            raise HTTPException(410, "proposta expirada")

    # Resolve o plano pela proposta GUARDADA (qualquer versão custom) e mapeia pro
    # contrato. Uma fonte de verdade só → contrato sempre bate com a proposta.
    cp = resolve_plan(prop, body.planId)
    contract_plan = body.planId if not prop else _map_content_plan(cp)
    plan_echo = {"id": cp.get("id", body.planId), "code": cp.get("code"), "name": cp.get("name")}

    # 1) renderiza o contrato moldado ao plano (WeasyPrint, ~1s com cache de fontes)
    pdf_bytes = render_contract_pdf(contract_plan, body)

    # 2) cria o documento + signatários na Autentique; devolve o link do CLIENTE.
    #    Este é o ÚNICO passo no caminho crítico (o cliente precisa do link já).
    doc = create_autentique_document(pdf_bytes, body)

    # 3) persistência (Supabase) em SEGUNDO PLANO: arquivar o PDF + gravar o aceite
    #    NÃO seguram a resposta (eram ~5 idas à nuvem = vários segundos). Rodam
    #    depois do retorno; o cliente recebe o link na hora.
    client_host = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    background_tasks.add_task(_persist_acceptance, body, doc, pdf_bytes, prop, client_host, user_agent)

    return ContratoOut(
        documentId=doc["id"], signingUrl=doc.get("clientSigningUrl"),
        signerEmail=body.email, plan=plan_echo,
    )


def _persist_acceptance(body: ContratoIn, doc: dict, pdf_bytes: bytes, proposal: dict | None, ip: str | None, user_agent: str | None) -> None:
    """Arquiva o PDF no Storage e grava o aceite. Roda em background (fora do
    caminho crítico). Reusa a proposta já buscada → sem releitura redundante."""
    try:
        contract_path = upload_pdf(pdf_bytes, body)
        save_acceptance(body, doc, ip, user_agent, contract_path, proposal)
    except Exception:
        # TODO: logar p/ a Maria reprocessar. O contrato/assinatura já existe na
        # Autentique mesmo que o arquivamento falhe.
        pass


AUTENTIQUE_WEBHOOK_SECRET = os.environ.get("AUTENTIQUE_WEBHOOK_SECRET", "")
GATEWAY_WEBHOOK_SECRET = os.environ.get("GATEWAY_WEBHOOK_SECRET", "")


async def _verified_payload(request: Request, secret: str) -> dict:
    """Lê o corpo cru, CONFERE a assinatura HMAC e só então devolve o JSON.
    Anti-forja: sem assinatura válida, ninguém marca 'assinado'/'pago'. Falha
    fechado se o segredo do webhook não estiver configurado."""
    raw = await request.body()
    sig = (
        request.headers.get("x-autentique-signature")  # Autentique (HMAC-SHA256 hex)
        or request.headers.get("x-signature")
        or request.headers.get("x-hub-signature-256")
        or ""
    )
    if not security.verify_hmac(secret, raw, sig):
        raise HTTPException(401, "assinatura de webhook inválida")
    return json.loads(raw or b"{}")


# ── Webhook da Autentique → marca 'assinada' SÓ quando o documento fecha ───
# A Autentique dispara UM evento por signatário (cliente + Maria = 2). NÃO dá pra
# marcar 'assinada' no 1º evento, senão o pagamento liberaria antes de a Maria
# contrassinar. Estratégia à prova de payload: o evento (autenticado por HMAC) é só
# o GATILHO; re-consultamos a Autentique (fonte da verdade) e só fechamos quando
# TODOS os signatários têm assinatura registrada. Idempotente (proposta já
# 'assinada' → no-op).
_DOCUMENT_QUERY = """
query Document($id: UUID!) {
  document(id: $id) {
    id
    files { signed }
    signatures { action { name } signed { created_at } }
  }
}
"""


def _iter_strings(obj):
    """Varre recursivamente o payload e devolve todas as strings — usado pra achar
    o id do documento sem depender do shape exato do webhook da Autentique."""
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from _iter_strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _iter_strings(v)


# front (enum da UI) → enum da coluna proposals.status. Espelha _DB_STATUS de
# proposals_api e STATUS_TO_DB do front.
_FRONT_TO_DB_STATUS = {
    "pendente": "pendente",
    "aguardando_assinatura": "enviada",
    "assinada": "assinada",
    "pago": "assinada",
    "expirada": "expirada",
}


def _set_proposal_status(proposal: dict | None, front_status: str) -> None:
    """Atualiza o status da proposta nas DUAS representações: a coluna `status`
    (enum do banco, p/ constraint/consulta) E o `content.status` jsonb (enum do
    front) — que é o que o admin e o cliente realmente LEEM (proposals_api.
    _row_to_stored). Mexer só na coluna deixava o painel mostrando o status velho."""
    if not proposal or not proposal.get("id"):
        return
    content = dict(proposal.get("content") or {})
    content["status"] = front_status
    db.update(
        "proposals",
        {"status": _FRONT_TO_DB_STATUS.get(front_status, "pendente"), "content": content},
        id=proposal["id"],
    )


def _autentique_document_state(doc_id: str) -> dict | None:
    """Consulta o documento na Autentique. Devolve {all_signed, signed_url} ou None
    se a consulta falhar. Fonte da verdade — não confiamos no corpo do evento."""
    if not AUTENTIQUE_TOKEN:
        return None
    resp = requests.post(
        AUTENTIQUE_URL,
        headers={"Authorization": f"Bearer {AUTENTIQUE_TOKEN}"},
        json={"query": _DOCUMENT_QUERY, "variables": {"id": doc_id}},
        timeout=30,
    )
    data = resp.json()
    doc = (data.get("data") or {}).get("document")
    if not doc:
        return None
    sigs = doc.get("signatures") or []
    # só contam os que PRECISAM assinar (action SIGN); todos com `signed` preenchido.
    signers = [s for s in sigs if ((s.get("action") or {}).get("name") or "").upper() == "SIGN"]
    all_signed = bool(signers) and all((s.get("signed") or {}).get("created_at") for s in signers)
    return {"all_signed": all_signed, "signed_url": (doc.get("files") or {}).get("signed")}


def _archive_signed_pdf(acceptance: dict, signed_url: str | None) -> str | None:
    """Baixa o PDF já assinado da Autentique e arquiva no Storage. Best-effort."""
    if not signed_url:
        return None
    try:
        r = requests.get(signed_url, timeout=60)
        r.raise_for_status()
        token = acceptance.get("autentique_document_id") or "doc"
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        return db.upload("contratos", f"assinados/{token}-{ts}.pdf", r.content)
    except Exception:
        return None


def _finalize_if_all_signed(acceptance: dict, proposal: dict | None) -> bool:
    """FONTE DA VERDADE: pergunta pra Autentique se TODOS assinaram. Se sim, fecha
    — arquiva o PDF assinado, grava signed_at e marca a proposta 'assinada'.
    Idempotente (já 'assinada' → no-op). Devolve True se está/ficou assinada.
    Usado pelo webhook E pelo polling do front (não depende de webhook cadastrado)."""
    if proposal and proposal.get("status") == "assinada":
        return True  # já fechado
    state = _autentique_document_state(acceptance["autentique_document_id"])
    if not state or not state["all_signed"]:
        return False  # ainda falta signatário (ex.: Maria não contrassinou)
    signed_path = _archive_signed_pdf(acceptance, state["signed_url"])
    patch = {"signed_at": datetime.now(timezone.utc).isoformat()}
    if signed_path:
        patch["signed_pdf_path"] = signed_path
    db.update("acceptances", patch, id=acceptance["id"])
    _set_proposal_status(proposal, "assinada")  # coluna + content.status (admin lê este)
    return True


def _latest_acceptance(proposal_id: str) -> dict | None:
    """Aceite mais recente da proposta que tem documento na Autentique."""
    if not proposal_id:
        return None
    accs = db.select("acceptances", order="created_at.desc", proposal_id=proposal_id)
    return next((a for a in accs if a.get("autentique_document_id")), None)


def _process_autentique_webhook(payload: dict) -> dict:
    """Miolo do webhook, sem HTTP (testável). Recebe o payload JÁ AUTENTICADO."""
    if not db.enabled():
        return {"ok": True}  # sem banco não há o que marcar (modo protótipo)

    # acha a aceitação pelo id do documento que aparece em QUALQUER lugar do
    # payload assinado → robusto contra mudanças no formato do webhook.
    acceptance = None
    for candidate in dict.fromkeys(_iter_strings(payload)):  # dedup, preserva ordem
        acceptance = db.select_one("acceptances", autentique_document_id=candidate)
        if acceptance:
            break
    if not acceptance:
        return {"ok": True}  # evento de um documento que não é nosso → ignora

    proposal = db.select_one("proposals", id=acceptance.get("proposal_id")) if acceptance.get("proposal_id") else None
    closed = _finalize_if_all_signed(acceptance, proposal)
    return {"ok": True, "status": "assinada"} if closed else {"ok": True}


@app.post("/api/webhooks/autentique")
@limiter.limit("60/minute")
async def autentique_webhook(request: Request):
    # A Autentique pode NÃO assinar o webhook com HMAC (depende do painel). Aqui o
    # evento é só GATILHO: se vier assinatura, conferimos; se não vier, aceitamos —
    # porque _process_autentique_webhook RE-CONSULTA a Autentique com o token do
    # servidor (fonte da verdade) e só marca 'assinada' quando o documento fechou
    # de fato. Um POST forjado, no máximo, dispara uma re-consulta (rate-limited);
    # nunca marca algo como assinado sem a Autentique confirmar.
    raw = await request.body()
    sig = (
        request.headers.get("x-autentique-signature")
        or request.headers.get("x-signature")
        or request.headers.get("x-hub-signature-256")
        or ""
    )
    if sig and not security.verify_hmac(AUTENTIQUE_WEBHOOK_SECRET, raw, sig):
        raise HTTPException(401, "assinatura de webhook inválida")
    return _process_autentique_webhook(json.loads(raw or b"{}"))


# ── POST /api/proposta/pagamento → cria a cobrança Pix/cartão da 1ª parcela ─
class PagamentoIn(BaseModel):
    token: str
    planId: str


class PagamentoOut(BaseModel):
    kind: str  # 'assinatura' (recorrente no cartão) | 'avulso' (Pix/cartão único)
    refId: str  # id da assinatura (preapproval) OU da cobrança no gateway
    method: str  # pix | cartao | boleto
    amount: float  # 1ª mensalidade (assinatura) ou valor único (avulso)
    installmentsTotal: int  # nº de mensalidades (assinatura) ou 1 (avulso)
    pixCopiaECola: str | None
    pixQrCode: str | None
    checkoutUrl: str | None  # link p/ pôr o cartão (assinatura) ou pagar
    status: str  # nasce 'pendente'; vira 'pago'/'ativa' SÓ pelo webhook do gateway


@app.post("/api/proposta/pagamento", response_model=PagamentoOut)
@limiter.limit("10/minute")
async def criar_pagamento(body: PagamentoIn, request: Request):
    # SEGURANÇA: o valor é REMONTADO aqui a partir do plano GUARDADO na proposta
    # (definido pelo admin), nunca do cliente. Mesma fonte de verdade do contrato
    # → cobrança e contrato nunca divergem, e funciona para QUALQUER versão custom.
    # DECISÃO 2026-06-02 (receber DENTRO do site):
    #   plano MENSAL  → ASSINATURA no cartão (débito automático recorrente).
    #   plano À VISTA → cobrança única (Pix ou cartão).
    prop = db.select_one("proposals", token=body.token) if (db.enabled() and body.token) else None
    if db.enabled() and not prop:
        raise HTTPException(404, "proposta não encontrada")
    cp = resolve_plan(prop, body.planId)
    bp = billing_from_plan(cp)
    if not bp["installments"] or bp["total"] <= 0:
        raise HTTPException(400, "versão sem valor configurado")

    if bp["recurring"]:
        # Mercado Pago "preapproval" (assinatura): cobra bp['monthly'] todo mês
        # por bp['installmentsTotal'] meses, no cartão do cliente.
        sub = create_subscription(body.token, bp)  # TODO
        return PagamentoOut(
            kind="assinatura", refId=sub["id"], method="cartao",
            amount=bp["monthly"], installmentsTotal=bp["installmentsTotal"],
            pixCopiaECola=None, pixQrCode=None, checkoutUrl=sub.get("initPoint"),
            status="pendente",
        )

    # à vista: cobrança única (Pix copia-e-cola + QR, ou checkout de cartão).
    charge = create_charge(body.token, bp["installments"][0], bp)  # TODO
    return PagamentoOut(
        kind="avulso", refId=charge["id"], method=charge.get("method", "pix"),
        amount=bp["total"], installmentsTotal=1,
        pixCopiaECola=charge.get("pixCopiaECola"), pixQrCode=charge.get("pixQrCode"),
        checkoutUrl=charge.get("checkoutUrl"), status="pendente",
    )


# ── Webhook do gateway de pagamento → marca pago / mensalidade recebida ────
# Gateway BR (Mercado Pago recomendado; só taxa por transação, sem mensalidade).
# UM endpoint; a implementação por dentro troca conforme o gateway.
@app.post("/api/webhooks/pagamento")
@limiter.limit("60/minute")
async def pagamento_webhook(request: Request):
    payload = await _verified_payload(request, GATEWAY_WEBHOOK_SECRET)
    # TODO: idempotência (não processar o mesmo evento 2x → evita marcar pago em
    #   duplicidade).
    # (2) AVULSO: evento de pagamento aprovado → grava em `payments` (pago) e
    #   libera o acesso.
    # (3) ASSINATURA: a cada mensalidade debitada, o gateway dispara um evento →
    #   grava 1 linha em `payments` (parcela n). A 1ª já libera o acesso; as
    #   seguintes entram automático todo mês. Eventos de assinatura cancelada/
    #   falha de cartão → atualizar `subscriptions.status` e avisar a Maria.
    _ = payload
    return {"ok": True}


# Catálogo padrão MÍNIMO — só usado como fallback no modo protótipo SEM Supabase
# (resolve_plan cai aqui). Com Supabase, a fonte de verdade é o plano guardado na
# proposta (qualquer versão custom). NÃO há mais tabela de preços chumbada: contrato
# e cobrança derivam ambos de billing_from_plan/_map_content_plan sobre o plano real.
PLANS = {
    "v1": {"id": "v1", "code": "V1", "name": "Experiência", "paymentMode": "avista", "totalValue": 580.0, "months": 1},
    "v2": {"id": "v2", "code": "V2", "name": "Crescimento", "paymentMode": "mensal", "monthlyValue": 560.0, "months": 3},
    "v3": {"id": "v3", "code": "V3", "name": "Aceleração", "paymentMode": "avista", "totalValue": 1650.0, "months": 3},
}


def create_subscription(token: str, bp: dict) -> dict:
    # TODO Mercado Pago "preapproval" (assinatura) via httpx: cobra bp['monthly']
    #   todo mês por bp['installmentsTotal'] meses no cartão do cliente. Gravar em
    #   `subscriptions` (status 'pendente' até o cliente autorizar o cartão).
    #   Retornar {id, initPoint}  (initPoint = link onde o cliente põe o cartão).
    raise NotImplementedError


def create_charge(token: str, installment: dict, bp: dict) -> dict:
    # TODO Mercado Pago (cobrança única) via httpx. Criar Pix (copia-e-cola + QR)
    #   ou checkout de cartão do valor à vista, gravar em `payments` ('pendente').
    #   Retornar {id, method, pixCopiaECola, pixQrCode, checkoutUrl}.
    raise NotImplementedError


def render_contract_pdf(contract_plan, body: ContratoIn) -> bytes:
    # SEM IA, sem operador: é "mala direta". A versão escolhida (planId) + os dados
    # do aceite moldam o contrato; o texto jurídico é FIXO no gerador. O único
    # passo humano que sobra é a Maria assinar a parte dela na Autentique.
    #
    # Reusa o MESMO gerador WeasyPrint de propostas/build_contract.py (fonte única
    # do contrato) → proposta e contrato nunca divergem.
    import sys
    import pathlib
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "propostas"))
    from build_contract import contract_pdf_bytes  # import tardio: WeasyPrint precisa Pango/Cairo

    signer = {"nome": body.nome, "documento": body.documento, "email": body.email}
    # contract_plan vem do endpoint: um DICT moldado pela versão real da proposta
    # (inclusive custom/editada), ou a STRING do planId (modo sem-DB → catálogo
    # padrão). build_contract aceita os dois.
    # TODO: preencher CONTRACTOR.doc real em proposta_config.py (hoje placeholder).
    return contract_pdf_bytes(contract_plan, signer)


def upload_pdf(pdf_bytes: bytes, body: ContratoIn) -> str | None:
    """Arquiva o contrato gerado no Storage (bucket `contratos`). Devolve o caminho,
    ou None se a Supabase não estiver configurada."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    token = body.token or "sem-token"
    return db.upload("contratos", f"{token}/{ts}-{body.planId}.pdf", pdf_bytes)


_AUTENTIQUE_MUTATION = """
mutation CreateDocument($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!, $sandbox: Boolean!) {
  createDocument(sandbox: $sandbox, document: $document, signers: $signers, file: $file) {
    id
    name
    signatures { public_id name email action { name } link { short_link } }
  }
}
"""


def create_autentique_document(pdf_bytes: bytes, body: ContratoIn) -> dict:
    """Cria o documento na Autentique com DOIS signatários e devolve os links.
    PROVADO em test_autentique.py:
      - delivery_method=LINK → a Autentique DEVOLVE o short_link (não manda e-mail);
        é esse link do cliente que o site embute/redireciona para assinar.
      - exige `name` no signatário quando usa LINK.
    Devolve {id, clientSigningUrl, signers:[{email, signingUrl}]}.
    """
    if not AUTENTIQUE_TOKEN:
        raise HTTPException(500, "AUTENTIQUE_TOKEN não configurado no servidor.")

    # CONTRATADA (Maria) — nome/e-mail vêm da fonte única em propostas/proposta_config.
    import pathlib
    import sys
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "propostas"))
    from proposta_config import CONTACT, CONTRACTOR

    # CONTRATADA: nome/e-mail oficiais vêm de proposta_config. Para TESTE (a Maria
    # não está presente), dá pra sobrescrever via env CONTRATADA_EMAIL/CONTRATADA_NOME.
    # Usar o e-mail do DONO da conta Autentique evita um 3º signatário fantasma (o
    # Autentique adiciona o titular sozinho; se a contratada já for o titular, não
    # duplica). Quando for oficial, remova o env e use a conta/e-mail reais da Maria.
    contratada_email = os.environ.get("CONTRATADA_EMAIL") or CONTACT["email"]
    contratada_nome = os.environ.get("CONTRATADA_NOME") or CONTRACTOR["nome"]
    # ORDEM: o cliente (CONTRATANTE) é o 1º; a Maria (CONTRATADA) contrassina.
    signers = [
        {"name": body.nome, "email": body.email, "action": "SIGN", "delivery_method": "DELIVERY_METHOD_LINK"},
        {"name": contratada_nome, "email": contratada_email, "action": "SIGN", "delivery_method": "DELIVERY_METHOD_LINK"},
    ]
    variables = {
        "document": {"name": f"Contrato {body.planId.upper()} - Maria Films"},
        "signers": signers,
        "file": None,
        "sandbox": AUTENTIQUE_SANDBOX,
    }
    # upload multipart no formato GraphQL (operations + map + arquivo)
    operations = json.dumps({"query": _AUTENTIQUE_MUTATION, "variables": variables})
    file_map = json.dumps({"file": ["variables.file"]})
    resp = requests.post(
        AUTENTIQUE_URL,
        headers={"Authorization": f"Bearer {AUTENTIQUE_TOKEN}"},
        data={"operations": operations, "map": file_map},
        files=[("file", ("contrato.pdf", pdf_bytes, "application/pdf"))],
        timeout=60,
    )
    data = resp.json()
    if data.get("errors"):
        raise HTTPException(502, f"Autentique retornou erro: {data['errors']}")

    doc = (data.get("data") or {}).get("createDocument") or {}
    sigs = doc.get("signatures", [])

    def _link(sig):
        return (sig.get("link") or {}).get("short_link")

    # o link do CLIENTE é o que o front usa para assinar no site.
    client_link = next((_link(s) for s in sigs if (s.get("email") or "").lower() == body.email.lower()), None)
    return {
        "id": doc.get("id"),
        "clientSigningUrl": client_link,
        "signers": [{"email": s.get("email"), "signingUrl": _link(s)} for s in sigs],
    }


def save_acceptance(body: ContratoIn, doc: dict, ip: str | None, user_agent: str | None, contract_path: str | None = None, proposal: dict | None = None) -> None:
    """Grava o aceite em `acceptances` + trilha (LGPD) e marca a proposta como
    'enviada'. No-op se a Supabase não estiver configurada. Recebe a proposta já
    buscada (sem releitura); se vier None, faz self-healing por token."""
    if not db.enabled():
        return

    if not proposal:
        proposal = db.select_one("proposals", token=body.token) if body.token else None
    if not proposal:
        proposal = db.upsert(
            "proposals",
            {"token": body.token or doc["id"], "client_name": body.nome, "content": {}, "status": "enviada"},
            on_conflict="token",
        )
    proposal_id = proposal["id"] if proposal else None

    db.insert(
        "acceptances",
        {
            "proposal_id": proposal_id,
            "plan_id": body.planId,
            "signer_name": body.nome,
            "signer_document": body.documento,
            "signer_email": body.email,
            "autentique_document_id": doc.get("id"),
            "contract_path": contract_path,
            "ip": ip,
            "user_agent": user_agent,
        },
    )
    # guarda o link de assinatura do CLIENTE no content → o GET devolve e o front
    # restaura o iframe no reload (em vez de cair no "modo demonstração").
    proposal["content"] = {
        **(proposal.get("content") or {}),
        "contract": {"documentId": doc.get("id"), "signingUrl": doc.get("clientSigningUrl")},
    }
    # marca 'aguardando_assinatura' (front) → 'enviada' (coluna) E content.status,
    # senão o painel/cliente continuariam vendo 'pendente' após gerar o contrato.
    _set_proposal_status(proposal, "aguardando_assinatura")
