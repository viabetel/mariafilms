"""
API REST das propostas, persistida na Supabase (substitui o localStorage do front).

DESENHO: o `content` jsonb guarda o objeto inteiro da proposta (o "StoredProposal"
do front), e algumas colunas (token, client_name, status, expires_at) são espelho
pra consulta/constraint. O front continua com a MESMA lógica de derivação; só troca
"ler/gravar no localStorage" por "chamar estas rotas".

SEGURANÇA:
- Admin (criar/editar/listar/excluir) exige header `x-admin-token` == ADMIN_TOKEN.
- Cliente é público PELO código (token inadivinhável) e só pode disparar ações
  limitadas (viewed/select). Avançar para 'assinada'/'pago' NÃO passa por aqui —
  é webhook (Autentique/gateway). Isso preserva a regra de ouro do ciclo de vida.
"""
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, Header, HTTPException

import db
import security

router = APIRouter()
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
DEFAULT_DAYS = 7


def _require_admin(tok: str | None) -> None:
    # comparação em tempo constante; falha fechado se ADMIN_TOKEN não configurado.
    if not security.constant_eq(tok or "", ADMIN_TOKEN):
        raise HTTPException(401, "não autorizado")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _gen_token(name: str) -> str:
    return security.gen_token(name)


# front status → enum da coluna `proposals.status` (pendente|enviada|assinada|expirada)
_DB_STATUS = {
    "pendente": "pendente",
    "aguardando_assinatura": "enviada",
    "assinada": "assinada",
    "pago": "assinada",
    "expirada": "expirada",
}


def _row_to_stored(row: dict) -> dict:
    """Reconstrói o StoredProposal a partir da linha (content jsonb + colunas)."""
    p = dict(row.get("content") or {})
    p["token"] = row["token"]
    p.setdefault("createdAt", row.get("created_at"))
    p.setdefault("status", "pendente")
    return p


def _persist(token: str, stored: dict) -> None:
    """Grava o StoredProposal de volta (content jsonb + espelha colunas)."""
    days = int(stored.get("days") or DEFAULT_DAYS)
    created = stored.get("createdAt") or _now_iso()
    expires = (datetime.fromisoformat(created) + timedelta(days=days)).isoformat()
    db.update(
        "proposals",
        {
            "content": stored,
            "client_name": stored.get("clienteNome") or "cliente",
            "status": _DB_STATUS.get(stored.get("status", "pendente"), "pendente"),
            "expires_at": expires,
        },
        token=token,
    )


def _load(token: str) -> dict:
    row = db.select_one("proposals", token=token)
    if not row:
        raise HTTPException(404, "proposta não encontrada")
    return _row_to_stored(row)


_MAX_EVENTS = 200  # teto da trilha: impede um cliente de inflar o registro (DoS)


def _push_event(stored: dict, etype: str, meta: dict | None = None) -> None:
    ev = {"type": etype, "at": _now_iso()}
    if meta:
        ev["meta"] = meta
    evs = stored.setdefault("events", [])
    evs.append(ev)
    if len(evs) > _MAX_EVENTS:
        stored["events"] = evs[-_MAX_EVENTS:]


# ── ADMIN: CRUD das propostas ──────────────────────────────────────────────
@router.post("/api/admin/proposals")
def create_proposal(body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    c = body.get("content") or {}
    name = c.get("clienteNome") or ""
    token = _gen_token(name)
    created = _now_iso()
    days = int(c.get("days") or DEFAULT_DAYS)
    stored = {
        "clienteNome": name,
        "intro": c.get("intro", ""),
        "days": days,
        "plans": c.get("plans", []),
        "notes": c.get("notes", ""),
        "status": "pendente",
        "createdAt": created,
        "archived": False,
        "events": [{"type": "created", "at": created}],
    }
    db.insert(
        "proposals",
        {
            "token": token,
            "client_name": name or "cliente",
            "content": stored,
            "status": "pendente",
            "created_at": created,
            "expires_at": (datetime.fromisoformat(created) + timedelta(days=days)).isoformat(),
        },
    )
    return {"token": token, "link": f"/proposta?c={token}"}


@router.get("/api/admin/proposals")
def list_proposals(x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    rows = db.select("proposals", order="created_at.desc")
    return [_row_to_stored(r) for r in rows]


@router.get("/api/admin/proposals/{token}")
def get_proposal_full(token: str, x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    return _load(token)


@router.put("/api/admin/proposals/{token}")
def update_proposal(token: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    stored = _load(token)
    c = body.get("content") or {}
    for k in ("clienteNome", "intro", "days", "plans", "notes"):
        if k in c:
            stored[k] = c[k]
    _push_event(stored, "edited")
    _persist(token, stored)
    return {"ok": True}


@router.delete("/api/admin/proposals/{token}")
def delete_proposal(token: str, x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    db.delete("proposals", token=token)
    return {"ok": True}


@router.post("/api/admin/proposals/{token}/archive")
def archive_proposal(token: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    stored = _load(token)
    archived = bool(body.get("archived"))
    stored["archived"] = archived
    _push_event(stored, "archived" if archived else "unarchived")
    _persist(token, stored)
    return {"ok": True}


@router.post("/api/admin/proposals/{token}/renew")
def renew_proposal(token: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    stored = _load(token)
    days = int(body.get("days") or stored.get("days") or DEFAULT_DAYS)
    stored["createdAt"] = _now_iso()
    stored["days"] = days
    if stored.get("status") == "expirada":
        stored["status"] = "pendente"
    _push_event(stored, "renewed", {"days": str(days)})
    _persist(token, stored)
    return {"ok": True}


@router.post("/api/admin/proposals/{token}/status")
def set_status(token: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    stored = _load(token)
    new = body.get("status")
    _push_event(stored, "status_changed", {"de": stored.get("status", ""), "para": new})
    stored["status"] = new
    _persist(token, stored)
    return {"ok": True}


@router.post("/api/admin/proposals/{token}/note")
def add_note(token: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    stored = _load(token)
    stored["notes"] = body.get("notes", "")
    _persist(token, stored)
    return {"ok": True}


@router.post("/api/admin/proposals/{token}/duplicate")
def duplicate_proposal(token: str, x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    src = _load(token)
    name = (src.get("clienteNome") or "") and f"{src['clienteNome']} (cópia)"
    return create_proposal(
        body={"content": {"clienteNome": name, "intro": src.get("intro", ""), "days": src.get("days", DEFAULT_DAYS), "plans": src.get("plans", []), "notes": src.get("notes", "")}},
        x_admin_token=x_admin_token,
    )


# ── ADMIN: mensagens do formulário de contato do site ──────────────────────
@router.get("/api/admin/contatos")
def list_contatos(x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    return db.select("contatos", order="created_at.desc")


@router.post("/api/admin/contatos/{cid}/read")
def mark_contato_read(cid: str, body: dict = Body(...), x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    db.update("contatos", {"lido": bool(body.get("lido", True))}, id=cid)
    return {"ok": True}


@router.delete("/api/admin/contatos/{cid}")
def delete_contato(cid: str, x_admin_token: str = Header(None)):
    _require_admin(x_admin_token)
    db.delete("contatos", id=cid)
    return {"ok": True}


# ── CLIENTE: ações limitadas (públicas pelo código da proposta) ─────────────
@router.post("/api/proposta/{token}/viewed")
def mark_viewed(token: str):
    stored = _load(token)
    if not any(e.get("type") == "viewed" for e in stored.get("events", [])):
        _push_event(stored, "viewed")
        _persist(token, stored)
    return {"ok": True}


@router.post("/api/proposta/{token}/select")
def select_plan(token: str, body: dict = Body(...)):
    stored = _load(token)
    plan_id = body.get("planId")
    if stored.get("selectedPlanId") != plan_id:
        stored["selectedPlanId"] = plan_id
        _push_event(stored, "selected", {"planId": plan_id})
        _persist(token, stored)
    return {"ok": True}
