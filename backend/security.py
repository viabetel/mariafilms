"""
Utilidades de segurança do backend (defensivo). Centraliza:
- geração de tokens INADIVINHÁVEIS (secrets, não random),
- comparação em tempo constante (anti-timing),
- validação server-side de CPF/CNPJ (NUNCA confiar só no front),
- verificação de assinatura HMAC de webhooks.

Regra: o servidor é a fronteira de confiança. Tudo que vem do cliente é hostil
até ser validado aqui.
"""
import hashlib
import hmac
import re
import secrets


# ── Tokens ─────────────────────────────────────────────────────────────────
def gen_token(slug: str) -> str:
    """Código da proposta: slug legível + sufixo CRIPTOGRAFICAMENTE aleatório.
    A proposta não tem login → o token é a única proteção; precisa ser imprevisível.
    `secrets.token_urlsafe(9)` ≈ 72 bits de entropia (inviável de adivinhar)."""
    slug = re.sub(r"[^a-z0-9]+", "-", (slug or "").lower()).strip("-")[:24] or "cliente"
    return f"{slug}-{secrets.token_urlsafe(9)}"


def constant_eq(a: str, b: str) -> bool:
    """Compara segredos sem vazar tempo (anti-timing). Falha fechado se vazio."""
    if not a or not b:
        return False
    return hmac.compare_digest(a, b)


# ── Validação de documento (CPF/CNPJ) — porta do validation.ts do front ──────
def _valid_cpf(cpf: str) -> bool:
    cpf = re.sub(r"\D", "", cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    for end in (9, 10):
        s = sum(int(cpf[i]) * ((end + 1) - i) for i in range(end))
        d = (s * 10) % 11 % 10
        if d != int(cpf[end]):
            return False
    return True


def _valid_cnpj(cnpj: str) -> bool:
    cnpj = re.sub(r"\D", "", cnpj)
    if len(cnpj) != 14 or cnpj == cnpj[0] * 14:
        return False
    for size in (12, 13):
        weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2][13 - size:]
        s = sum(int(cnpj[i]) * weights[i] for i in range(size))
        d = s % 11
        d = 0 if d < 2 else 11 - d
        if d != int(cnpj[size]):
            return False
    return True


def valid_documento(value: str) -> bool:
    """Aceita CPF (11) ou CNPJ (14) com dígito verificador correto."""
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11:
        return _valid_cpf(digits)
    if len(digits) == 14:
        return _valid_cnpj(digits)
    return False


# ── Webhooks ─────────────────────────────────────────────────────────────────
def verify_hmac(secret: str, raw_body: bytes, signature: str, algo: str = "sha256") -> bool:
    """Confere a assinatura HMAC do corpo cru do webhook (anti-forja). O gateway/
    Autentique assina o payload com um segredo compartilhado; recomputamos e
    comparamos em tempo constante. Sem isso, qualquer um forja um 'pago'/'assinado'."""
    if not secret or not signature:
        return False
    mac = hmac.new(secret.encode(), raw_body, getattr(hashlib, algo)).hexdigest()
    # aceita assinatura nua ou no formato "sha256=..."
    sig = signature.split("=", 1)[-1].strip()
    return hmac.compare_digest(mac, sig)
