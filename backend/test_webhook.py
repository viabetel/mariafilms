"""
Teste OFFLINE do webhook da Autentique (sem servidor, sem rede, sem segredos
reais). Monkeypatcha o `db` e a consulta à Autentique pra provar a lógica:
  - HMAC: corpo forjado sem assinatura válida é rejeitado; assinado passa.
  - acha a aceitação pelo id do documento em QUALQUER lugar do payload.
  - SÓ marca 'assinada' quando a Autentique confirma TODOS assinados.
  - idempotência: proposta já 'assinada' não reprocessa.

Rodar:  python test_webhook.py
"""
import hashlib
import hmac
import json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")  # console Windows (cp1252) imprime setas/acentos
except Exception:
    pass

import main
import security

SECRET = "segredo-de-teste"
DOC_ID = "doc-abc-123"


def _sign(body: bytes) -> str:
    return hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()


class FakeDB:
    """Dublê do módulo db: 1 aceitação + 1 proposta em memória."""
    def __init__(self):
        self.proposal = {"id": "prop-1", "status": "enviada"}
        self.acceptance = {"id": "acc-1", "proposal_id": "prop-1", "autentique_document_id": DOC_ID}
        self.updates = []

    def enabled(self):
        return True

    def select_one(self, table, **eq):
        if table == "acceptances" and eq.get("autentique_document_id") == DOC_ID:
            return self.acceptance
        if table == "proposals" and eq.get("id") == "prop-1":
            return self.proposal
        return None

    def update(self, table, patch, **eq):
        self.updates.append((table, patch, eq))
        if table == "proposals":
            self.proposal.update(patch)
        return [patch]

    def upload(self, *a, **k):
        return None


def run():
    passed = []
    orig_state = main._autentique_document_state  # guarda a real (será monkeypatchada)

    def check(name, cond):
        assert cond, f"FALHOU: {name}"
        passed.append(name)

    # ── HMAC ────────────────────────────────────────────────────────────────
    body = json.dumps({"event": {"type": "document.finished"}}).encode()
    check("hmac aceita assinatura correta", security.verify_hmac(SECRET, body, _sign(body)))
    check("hmac rejeita assinatura errada", not security.verify_hmac(SECRET, body, "deadbeef"))
    check("hmac aceita prefixo sha256=", security.verify_hmac(SECRET, body, "sha256=" + _sign(body)))

    # ── _iter_strings acha o id aninhado ─────────────────────────────────────
    nested = {"event": {"data": {"document": {"id": DOC_ID, "partes": [{"email": "x@y.com"}]}}}}
    check("iter_strings acha o id do documento", DOC_ID in set(main._iter_strings(nested)))

    # ── processamento com TODOS assinados → marca 'assinada' ─────────────────
    fake = FakeDB()
    main.db = fake
    main._autentique_document_state = lambda doc_id: {"all_signed": True, "signed_url": None}
    out = main._process_autentique_webhook(nested)
    check("documento fechado → status assinada", out.get("status") == "assinada")
    check("proposta foi marcada assinada no db", fake.proposal["status"] == "assinada")
    check("gravou signed_at na aceitação", any(t == "acceptances" and "signed_at" in p for t, p, _ in fake.updates))

    # ── idempotência: já 'assinada' → não reprocessa ─────────────────────────
    fake2 = FakeDB()
    fake2.proposal["status"] = "assinada"
    main.db = fake2
    main._process_autentique_webhook(nested)
    check("idempotente: nada de novo qdo já assinada", fake2.updates == [])

    # ── só 1 signatário assinou → NÃO fecha ──────────────────────────────────
    fake3 = FakeDB()
    main.db = fake3
    main._autentique_document_state = lambda doc_id: {"all_signed": False, "signed_url": None}
    out3 = main._process_autentique_webhook(nested)
    check("faltando signatário → não marca assinada", out3.get("status") != "assinada")
    check("proposta segue 'enviada' qdo falta assinar", fake3.proposal["status"] == "enviada")

    # ── documento de outro (não é nosso) → ignora ────────────────────────────
    fake4 = FakeDB()
    main.db = fake4
    out4 = main._process_autentique_webhook({"event": {"data": {"id": "doc-de-outro"}}})
    check("documento desconhecido → ignora sem erro", out4 == {"ok": True})

    # ── parsing do all_signed a partir da resposta GraphQL ───────────────────
    class FakeResp:
        def __init__(self, doc):
            self._doc = doc

        def json(self):
            return {"data": {"document": self._doc}}

    class FakeRequests:
        def __init__(self, doc):
            self._doc = doc

        def post(self, *a, **k):
            return FakeResp(self._doc)

    main.AUTENTIQUE_TOKEN = "tok"
    main.requests = FakeRequests({
        "files": {"signed": "https://x/assinado.pdf"},
        "signatures": [
            {"action": {"name": "SIGN"}, "signed": {"created_at": "2026-06-03"}},
            {"action": {"name": "SIGN"}, "signed": {"created_at": "2026-06-03"}},
        ],
    })
    st = orig_state(DOC_ID)
    check("all_signed=True qdo os 2 têm signed", st["all_signed"] is True)

    main.requests = FakeRequests({
        "files": {"signed": None},
        "signatures": [
            {"action": {"name": "SIGN"}, "signed": {"created_at": "2026-06-03"}},
            {"action": {"name": "SIGN"}, "signed": None},
        ],
    })
    st2 = orig_state(DOC_ID)
    check("all_signed=False qdo 1 não assinou", st2["all_signed"] is False)

    print(f"OK - {len(passed)} checagens passaram:")
    for p in passed:
        print(f"  [ok] {p}")


if __name__ == "__main__":
    run()
