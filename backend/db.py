"""
Camada de acesso à Supabase (Postgres via PostgREST + Storage), dependency-light
(só `requests`). Espelha backend/schema.sql.

DESLIGA SOZINHA: se SUPABASE_URL / SUPABASE_SERVICE_KEY não estiverem no ambiente,
todas as funções viram no-op (devolvem None) e o resto do backend segue funcionando
— o contrato é criado na Autentique mesmo sem persistir. Assim dá pra rodar local
sem Supabase e ligar a persistência só pondo as variáveis de ambiente.

SEGURANÇA: a service_role key BYPASSA o RLS e fica SÓ no servidor, nunca no front.
"""
import os

import requests

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)


def _headers(extra: dict | None = None) -> dict:
    h = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def _first(data):
    if isinstance(data, list):
        return data[0] if data else None
    return data


def insert(table: str, row: dict) -> dict | None:
    if not enabled():
        return None
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=_headers({"Prefer": "return=representation"}),
        json=row,
        timeout=30,
    )
    r.raise_for_status()
    return _first(r.json())


def upsert(table: str, row: dict, on_conflict: str) -> dict | None:
    """Insere ou atualiza por `on_conflict` (coluna única, ex.: 'token')."""
    if not enabled():
        return None
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}",
        headers=_headers({"Prefer": "return=representation,resolution=merge-duplicates"}),
        json=row,
        timeout=30,
    )
    r.raise_for_status()
    return _first(r.json())


def select_one(table: str, **eq) -> dict | None:
    if not enabled():
        return None
    params = {k: f"eq.{v}" for k, v in eq.items()}
    params["limit"] = "1"
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=_headers(), params=params, timeout=30)
    r.raise_for_status()
    return _first(r.json())


def select(table: str, order: str | None = None, **eq) -> list:
    """Lista linhas (filtro por igualdade + ordenação opcional 'col.desc')."""
    if not enabled():
        return []
    params = {k: f"eq.{v}" for k, v in eq.items()}
    if order:
        params["order"] = order
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=_headers(), params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def delete(table: str, **eq) -> bool:
    if not enabled():
        return False
    params = {k: f"eq.{v}" for k, v in eq.items()}
    r = requests.delete(f"{SUPABASE_URL}/rest/v1/{table}", headers=_headers(), params=params, timeout=30)
    r.raise_for_status()
    return True


def update(table: str, patch: dict, **eq) -> list | None:
    if not enabled():
        return None
    params = {k: f"eq.{v}" for k, v in eq.items()}
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=_headers({"Prefer": "return=representation"}),
        params=params,
        json=patch,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def upload(bucket: str, path: str, content: bytes, content_type: str = "application/pdf") -> str | None:
    """Sobe bytes no Storage (x-upsert sobrescreve) e devolve o caminho bucket/path."""
    if not enabled():
        return None
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}",
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        data=content,
        timeout=60,
    )
    r.raise_for_status()
    return f"{bucket}/{path}"
