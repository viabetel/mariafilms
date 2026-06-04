#!/usr/bin/env python3
r"""
Teste ISOLADO do Autentique — valida a integração de assinatura SEM precisar do
backend pronto, do Supabase ou do WeasyPrint. Só `pip install requests`.

O que faz: sobe um PDF qualquer pro Autentique em modo SANDBOX (não gasta crédito,
o doc some em alguns dias) com DOIS signatários (cliente + Maria) e imprime os
links de assinatura. É o jeito mais rápido de responder às perguntas em aberto:
  - o token da API funciona?
  - createDocument com 2 signatários funciona?
  - ele DEVOLVE o link de assinatura na hora (nossa suposição) ou só por e-mail?

COMO RODAR (em qualquer máquina com internet + Python; não precisa de GTK/WeasyPrint):
  1) cria conta grátis em autentique.com.br
  2) pega o token em  Autentique > Configurações > API  (Integrações)
  3) gera/escolhe um PDF de teste (ex.: rode build_contract.py no seu ambiente
     WeasyPrint pra ter o contrato real, ou use qualquer PDF pra um smoke test)
  4) no terminal:
        pip install requests
        set AUTENTIQUE_TOKEN=seu_token         (Windows)   |  export ... (mac/linux)
        set PDF_PATH=..\propostas\proposta_contrato_exemplo.pdf
        set CLIENTE_EMAIL=voceteste+cliente@gmail.com
        set MARIA_EMAIL=voceteste+maria@gmail.com
        python test_autentique.py
  Use o MESMO e-mail com "+cliente" e "+maria" (truque do Gmail) pra você receber
  os dois convites e assinar os dois lados, testando o fluxo inteiro.
"""
import json
import os
import sys

import requests

URL = "https://api.autentique.com.br/v2/graphql"
TOKEN = os.environ.get("AUTENTIQUE_TOKEN")
PDF = os.environ.get("PDF_PATH", "contrato_exemplo.pdf")
CLIENTE_EMAIL = os.environ.get("CLIENTE_EMAIL", "TROQUE-cliente@example.com")
MARIA_EMAIL = os.environ.get("MARIA_EMAIL", "TROQUE-maria@example.com")
CLIENTE_NOME = os.environ.get("CLIENTE_NOME", "Cliente Teste")
MARIA_NOME = os.environ.get("MARIA_NOME", "Maria Films")

if not TOKEN:
    sys.exit("Defina AUTENTIQUE_TOKEN (token da API: Autentique > Configurações > API).")
if not os.path.exists(PDF):
    sys.exit(f"PDF não encontrado: {PDF}. Aponte PDF_PATH para um arquivo .pdf existente.")

# sandbox:true → documento de teste, NÃO gasta crédito. Pedimos o link de cada
# signatário (link.short_link) pra checar se vem de volta na hora.
QUERY = """
mutation CreateDocument($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
  createDocument(sandbox: true, document: $document, signers: $signers, file: $file) {
    id
    name
    signatures { public_id name email action { name } link { short_link } }
  }
}
"""

variables = {
    "document": {"name": "Contrato (teste sandbox) - Maria Films"},
    "signers": [
        # delivery_method=LINK → o Autentique DEVOLVE o short_link (não manda e-mail);
        # vinculado ao e-mail, só aquele endereço assina. É o que viabiliza o redirect
        # dentro do site (opção B).
        {"name": CLIENTE_NOME, "email": CLIENTE_EMAIL, "action": "SIGN", "delivery_method": "DELIVERY_METHOD_LINK"},  # CONTRATANTE = cliente
        {"name": MARIA_NOME, "email": MARIA_EMAIL, "action": "SIGN", "delivery_method": "DELIVERY_METHOD_LINK"},      # CONTRATADA = Maria
    ],
    "file": None,
}

# upload multipart no formato GraphQL (operations + map + arquivo)
operations = json.dumps({"query": QUERY, "variables": variables})
file_map = json.dumps({"file": ["variables.file"]})

with open(PDF, "rb") as fh:
    resp = requests.post(
        URL,
        headers={"Authorization": f"Bearer {TOKEN}"},
        data={"operations": operations, "map": file_map},
        files=[("file", (os.path.basename(PDF), fh, "application/pdf"))],
        timeout=60,
    )

print("HTTP", resp.status_code)
try:
    data = resp.json()
except ValueError:
    print(resp.text)
    sys.exit("Resposta não-JSON (token errado ou endpoint fora do ar?).")

print(json.dumps(data, indent=2, ensure_ascii=False))

if data.get("errors"):
    sys.exit("\nO Autentique retornou erro acima — confira token e os campos dos signatários.")

doc = (data.get("data") or {}).get("createDocument")
if doc:
    print(f"\nDocumento criado: {doc['id']}")
    print("Links de assinatura (o que o front/Maria usariam):")
    for s in doc.get("signatures", []):
        link = (s.get("link") or {}).get("short_link")
        print(f"  - {s.get('email')}: {link or '(sem link -> entregue por e-mail)'}")
