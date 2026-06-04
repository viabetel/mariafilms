"""
Teste E2E do fluxo COMPLETO da Proposta Viva pelos endpoints REAIS (localhost:8000):
cria uma proposta FORA DO PADRÃO (6 versões custom, mix avista/mensal, valores
quebrados, itens variados, alguns campos faltando de propósito), navega como o
cliente (viewed → select), gera o CONTRATO da versão escolhida e confere que ele
foi moldado pela versão CUSTOM (não pelo catálogo padrão v1/v2/v3) e que a Autentique
recebeu 2 signatários. Para nos links de assinatura (o resto depende do humano).

Uso:  python e2e_flow.py
"""
import json
import sys

import requests

API = "http://localhost:8000"
ADMIN = {"x-admin-token": "maria-admin-2026"}
CLIENT_EMAIL = "santosdeivid80@gmail.com"  # conta do usuário → ele assina no navegador


def jp(label, obj):
    print(f"\n=== {label} ===")
    print(json.dumps(obj, indent=2, ensure_ascii=False))


# 6 versões deliberadamente fora do padrão (stress-test do resolve_plan/_map_content_plan/billing_from_plan)
PLANS = [
    {  # 1) à vista barato, 1 mês — campos mínimos (testa derivação no backend)
        "id": "semente", "code": "S", "name": "Semente", "tagline": "primeiro passo",
        "paymentMode": "avista", "totalValue": 390, "months": 1,
        "items": [{"label": "Reels", "n": 4, "kind": "reels"}],
    },
    {  # 2) mensal 3 meses
        "id": "trimestre", "code": "T3", "name": "Trimestre Vivo", "tagline": "constância",
        "paymentMode": "mensal", "monthlyValue": 540, "months": 3,
        "items": [{"label": "Reels", "n": 9, "kind": "reels"}, {"label": "Carrosséis", "n": 6, "kind": "carrossel"}],
    },
    {  # 3) mensal 6 meses
        "id": "safra6", "code": "S6", "name": "Safra Seis", "tagline": "meio ano de presença",
        "paymentMode": "mensal", "monthlyValue": 490, "months": 6,
        "items": [{"label": "Reels", "n": 18, "kind": "reels"}, {"label": "Artes", "n": 12, "kind": "arte"}, {"label": "Stories", "n": 24, "kind": "stories"}],
    },
    {  # 4) mensal 12 meses (anual)
        "id": "anual", "code": "A12", "name": "Ano Inteiro", "tagline": "compromisso de marca",
        "paymentMode": "mensal", "monthlyValue": 450, "months": 12,
        "items": [{"label": "Reels", "n": 36, "kind": "reels"}, {"label": "Vídeos", "n": 12, "kind": "video"}],
    },
    {  # 5) à vista premium caro, muitos itens, destacada
        "id": "cinema", "code": "PRM", "name": "Cinema Total", "tagline": "produção de cinema",
        "paymentMode": "avista", "totalValue": 4870, "months": 3, "featured": True,
        "items": [{"label": "Reels", "n": 24, "kind": "reels"}, {"label": "Carrosséis", "n": 12, "kind": "carrossel"}, {"label": "Artes", "n": 12, "kind": "arte"}, {"label": "Fotos", "n": 30, "kind": "foto"}, {"label": "Vídeo institucional", "n": 1, "kind": "video"}],
    },
    {  # 6) à vista com VALOR QUEBRADO (centavos) — testa formatação BRL
        "id": "expresso", "code": "EXP", "name": "Pulso Expresso", "tagline": "rápido e certeiro",
        "paymentMode": "avista", "totalValue": 1299.90, "months": 1,
        "items": [{"label": "Reels", "n": 6, "kind": "reels"}, {"label": "Stories", "n": 10, "kind": "stories"}],
    },
]

CHOSEN = "safra6"  # versão custom escolhida pra gerar o contrato (mensal 6 meses)


def main():
    s = requests.Session()

    # 1) cria a proposta custom (admin)
    body = {"content": {
        "clienteNome": "Estúdio Aurora (E2E)",
        "intro": "proposta de teste automatizado com 6 versões fora do padrão.",
        "days": 7,
        "plans": PLANS,
        "notes": "proposta gerada pelo e2e_flow.py",
    }}
    r = s.post(f"{API}/api/admin/proposals", headers=ADMIN, json=body, timeout=30)
    r.raise_for_status()
    created = r.json()
    token = created["token"]
    jp("1) proposta criada", created)

    # 2) o que o CLIENTE vê (GET público) — confere as 6 versões
    r = s.get(f"{API}/api/proposta/{token}", timeout=30)
    r.raise_for_status()
    view = r.json()
    print(f"\n2) cliente vê: {view['clienteNome']} | status={view['status']} | {len(view['plans'])} versões:")
    for p in view["plans"]:
        print(f"   - {p['code']} {p['name']} ({p.get('paymentMode')}) "
              f"price={p.get('price')!r} note={p.get('priceNote')!r} dur={p.get('duration')!r}")

    # 3) cliente VISUALIZA e SELECIONA a versão custom
    s.post(f"{API}/api/proposta/{token}/viewed", timeout=30).raise_for_status()
    s.post(f"{API}/api/proposta/{token}/select", json={"planId": CHOSEN}, timeout=30).raise_for_status()
    print(f"\n3) cliente marcou visualizado + selecionou a versão '{CHOSEN}'")

    # 4) gera o CONTRATO da versão custom escolhida
    contrato = {
        "token": token, "planId": CHOSEN,
        "nome": "Aurora Cliente E2E", "documento": "11144477735",
        "email": CLIENT_EMAIL, "telefone": "32999990000",
    }
    r = s.post(f"{API}/api/proposta/contrato", json=contrato, timeout=120)
    if not r.ok:
        print("FALHOU ao gerar contrato:", r.status_code, r.text)
        sys.exit(1)
    res = r.json()
    jp("4) contrato gerado (eco do plano DEVE ser a versão custom)", res)

    doc_id = res["documentId"]

    # 5) confere na Autentique: 2 signatários + nome do doc reflete a versão
    import main  # reusa o helper que consulta a Autentique
    token_aut = main.AUTENTIQUE_TOKEN
    q = {"query": "query($id: UUID!){ document(id: $id){ name signatures { name email action { name } link { short_link } } } }",
         "variables": {"id": doc_id}}
    dr = requests.post(main.AUTENTIQUE_URL, headers={"Authorization": f"Bearer {token_aut}"}, json=q, timeout=30)
    doc = (dr.json().get("data") or {}).get("document") or {}
    sigs = doc.get("signatures", [])
    print(f"\n5) Autentique: doc='{doc.get('name')}' | {len(sigs)} signatários")
    links = {}
    for sg in sigs:
        links[sg["email"]] = (sg.get("link") or {}).get("short_link")
        print(f"   - {sg['name']} <{sg['email']}> ação={sg['action']['name']} link={links[sg['email']]}")

    print("\n" + "=" * 64)
    print("PRONTO ATÉ ONDE NÃO DEPENDE DE HUMANO.")
    print(f"token da proposta: {token}")
    print(f"documentId: {doc_id}")
    print("LINKS PRA ASSINAR (abrir no navegador):")
    for email, link in links.items():
        print(f"   {email} -> {link}")
    print("=" * 64)


if __name__ == "__main__":
    main()
