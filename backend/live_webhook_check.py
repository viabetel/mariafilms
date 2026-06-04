"""
Teste VIVO do webhook contra dados REAIS (Autentique + Supabase), SEM precisar de
túnel: invoca o handler localmente com o docId real. Ele re-consulta a Autentique
(fonte da verdade) e, se os DOIS assinaram, marca a proposta 'assinada' no Supabase.

Uso:  python live_webhook_check.py <documentId>
"""
import sys

main = __import__("main")  # carrega .env + Autentique + Supabase


def show_state(doc_id: str):
    st = main._autentique_document_state(doc_id)
    print(f"  Autentique: all_signed={st['all_signed']}  signed_url={'sim' if st and st['signed_url'] else 'não'}")
    acc = main.db.select_one("acceptances", autentique_document_id=doc_id)
    if acc:
        prop = main.db.select_one("proposals", id=acc["proposal_id"])
        print(f"  Supabase: acceptance.signed_at={acc.get('signed_at')}  proposal.status={prop.get('status') if prop else '?'}")
    else:
        print("  Supabase: aceite não encontrado")


def main_run():
    doc_id = sys.argv[1] if len(sys.argv) > 1 else None
    if not doc_id:
        sys.exit("uso: python live_webhook_check.py <documentId>")

    print("ANTES de processar o webhook:")
    show_state(doc_id)

    # payload mínimo que o handler reconhece (o docId em qualquer lugar). O HMAC
    # é checado no endpoint HTTP; aqui chamamos o miolo direto (já provado em
    # test_webhook.py que o gate de assinatura funciona).
    payload = {"event": {"type": "document.finished", "data": {"document": {"id": doc_id}}}}
    out = main._process_autentique_webhook(payload)
    print(f"\nhandler retornou: {out}")

    print("\nDEPOIS de processar o webhook:")
    show_state(doc_id)


if __name__ == "__main__":
    main_run()
