# Backend da Proposta — esboço (ESQUELETO, não funcional ainda)

Orquestra o ciclo: **escolha do cliente → contrato moldado (WeasyPrint) → assinatura (Autentique)**.
O front (`src/proposal/api.ts`) só chama estas rotas; ele NUNCA fala com a Autentique direto.

## Stack
- **FastAPI** (Python) — roda WeasyPrint e fala com a Autentique. Deploy: função
  Python na Vercel, ou Render/Railway/Fly.
- **WeasyPrint** — gera o PDF do contrato a partir de um template HTML, moldado
  pelo `planId` escolhido.
- **Autentique** (GraphQL, `https://api.autentique.com.br/v2/graphql`) — cria o
  documento + signatários e coleta a assinatura com validade jurídica.
- **Supabase** — Postgres (propostas/clientes/aceites) + Storage (PDFs). Ver `schema.sql`.

## Rotas (espelham o contrato do front)
- `GET  /api/proposta/{token}`   → `{ clienteNome, pdfUrl, status }`
- `POST /api/proposta/contrato`  → `{ token, planId, nome, documento, email }`
                                  → `{ documentId, signingUrl, signerEmail, plan }`
- `POST /api/webhooks/autentique`→ marca `status = assinada` e arquiva o PDF assinado

## Variáveis de ambiente (NUNCA no front)
```
AUTENTIQUE_TOKEN=...        # token da API Autentique
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...    # service role (só no backend)
```

## Fluxo do POST /contrato
1. resolve a proposta pelo `token` (Supabase)
2. renderiza o HTML do contrato moldado ao `planId` → WeasyPrint → PDF (bytes)
3. sobe o PDF no Storage (bucket `contratos`)
4. cria o documento + signatário na Autentique (mutation `createDocument`)
5. grava `acceptances` + atualiza `proposals.status = 'enviada'`
6. devolve `{ documentId, signingUrl }`

> Tudo aqui está como TODO em `main.py`. É um ponto de partida, não produção.
