"""
Esqueleto do backend da Proposta (Maria Films).  NÃO é produção — TODOs marcam
onde WeasyPrint, Autentique e Supabase entram. Espelha o contrato de src/proposal/api.ts.

Rodar local:  uvicorn main:app --reload
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(title="Maria Films — Proposta API")

# Em produção, restrinja aos domínios do site.
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


# ── Modelos (batem com src/proposal/api.ts) ────────────────────────────────
class ContratoIn(BaseModel):
    token: str | None = None
    planId: str
    nome: str
    documento: str  # CPF/CNPJ (validado também no front)
    email: EmailStr


class ContratoOut(BaseModel):
    documentId: str
    signingUrl: str | None
    signerEmail: str
    plan: dict


# ── GET /api/proposta/{token} → resolve cliente + PDF + status ─────────────
@app.get("/api/proposta/{token}")
async def get_proposta(token: str):
    # TODO: buscar no Supabase (tabela `proposals`) por token.
    #   row = supabase.table("proposals").select("*").eq("token", token).single()
    #   if not row: raise HTTPException(404)
    return {"clienteNome": token.replace("-", " "), "pdfUrl": "/proposta/proposta.pdf", "status": "pendente"}


# ── POST /api/proposta/contrato → molda PDF + cria na Autentique ───────────
@app.post("/api/proposta/contrato", response_model=ContratoOut)
async def gerar_contrato(body: ContratoIn, request: Request):
    plan = PLANS.get(body.planId)
    if not plan:
        raise HTTPException(400, "plano inválido")

    # 1) renderiza o contrato moldado ao plano  (WeasyPrint)
    pdf_bytes = render_contract_pdf(plan, body)  # TODO

    # 2) sobe o PDF no Supabase Storage (bucket `contratos`)
    pdf_path = upload_pdf(pdf_bytes, body)  # TODO

    # 3) cria documento + signatário na Autentique
    doc = create_autentique_document(pdf_path, body)  # TODO

    # 4) grava aceite + atualiza status (Supabase)
    #    inclui trilha: ip=request.client.host, user_agent, timestamp  (LGPD/auditoria)
    save_acceptance(body, doc, request)  # TODO

    return ContratoOut(
        documentId=doc["id"], signingUrl=doc.get("signingUrl"),
        signerEmail=body.email, plan=plan,
    )


# ── Webhook da Autentique → marca assinado ─────────────────────────────────
@app.post("/api/webhooks/autentique")
async def autentique_webhook(request: Request):
    payload = await request.json()
    # TODO: validar assinatura do webhook; quando event == 'signature.accepted',
    #   atualizar proposals.status='assinada' e arquivar o PDF assinado.
    return {"ok": True}


# ── STUBS (substituir pela implementação real) ─────────────────────────────
PLANS = {
    "v1": {"id": "v1", "code": "V1", "name": "Experiência", "price": "R$ 580"},
    "v2": {"id": "v2", "code": "V2", "name": "Crescimento", "price": "R$ 560/mês"},
    "v3": {"id": "v3", "code": "V3", "name": "Aceleração", "price": "R$ 1.650"},
}


def render_contract_pdf(plan: dict, body: ContratoIn) -> bytes:
    # SEM IA: é só "mala direta". O template tem lacunas; a gente passa os dados
    # e o WeasyPrint vira PDF. O texto jurídico é FIXO no template.
    #   from datetime import date
    #   from jinja2 import Environment, FileSystemLoader
    #   from weasyprint import HTML
    #   env = Environment(loader=FileSystemLoader("templates"))
    #   html = env.get_template("contrato.html.j2").render(
    #       hoje=date.today().strftime("%d/%m/%Y"),
    #       proposta_ref=body.token or "—",
    #       cliente={"nome": body.nome, "documento": body.documento},
    #       plano=plan,  # vem do `content` da proposta daquele cliente (Supabase)
    #   )
    #   return HTML(string=html).write_pdf()
    raise NotImplementedError


def upload_pdf(pdf_bytes: bytes, body: ContratoIn) -> str:
    # TODO Supabase Storage: supabase.storage.from_("contratos").upload(...)
    raise NotImplementedError


def create_autentique_document(pdf_path: str, body: ContratoIn) -> dict:
    # TODO Autentique GraphQL (mutation createDocument) via httpx, com signatário
    #   {name: body.nome, email: body.email}. Retornar {id, signingUrl}.
    raise NotImplementedError


def save_acceptance(body: ContratoIn, doc: dict, request: Request) -> None:
    # TODO Supabase: insert em `acceptances`; update `proposals.status='enviada'`.
    raise NotImplementedError
