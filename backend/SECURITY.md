# Segurança — Proposta/Contrato/Pagamento (Maria Films)

Auditoria + endurecimento feitos em 2026-06-03. Princípio: **o servidor é a
fronteira de confiança; tudo que vem do cliente é hostil até validar**.

## Corrigido (e testado)

| # | Achado | Correção | Onde |
|---|--------|----------|------|
| 1 | Tokens de proposta com RNG inseguro (`random`, previsível) — e o token é a única proteção (sem login) | `secrets.token_urlsafe` (~72 bits) | `security.gen_token` |
| 2 | Sem validação server-side de CPF/CNPJ (só no front, burlável) | validação no servidor + dígito verificador | `security.valid_documento`, `ContratoIn` |
| 3 | Injeção de HTML/CSS no contrato (nome/doc do cliente no HTML cru) | `html.escape` nos campos do signatário | `propostas/build_contract.py` |
| 4 | Comparação de admin token vulnerável a timing | `hmac.compare_digest` | `security.constant_eq` |
| 5 | Endpoint de contrato sem trava (abuso/custo: cria doc Autentique à vontade) | exige proposta REAL existir + rejeita expirada | `gerar_contrato` |
| 6 | Sem rate limiting | `slowapi`: contrato 5/min, webhooks 60/min | `main.py` |
| 7 | Webhooks sem validação de assinatura (forja de "pago"/"assinado") | HMAC obrigatório, compare_digest, falha fechado | `security.verify_hmac`, `_verified_payload` |
| 8 | CORS liberado para `*` | allowlist por env `CORS_ORIGINS` (default: só localhost) | `main.py` |
| 9 | `requirements.txt` sem versões fixadas | versões fixadas | `requirements.txt` |
| 10 | Trilha de eventos podia ser inflada por cliente (DoS) | teto de 200 eventos | `proposals_api._push_event` |
| 11 | Sem headers de segurança no front | X-Frame-Options DENY, nosniff, HSTS, Referrer-Policy | `vercel.json` |
| 12 | PII exposta pela chave anon? | RLS confirmado ligado (anon lê 0); `rls_hardening.sql` torna explícito | Supabase |

## Verificado OK
- Nenhum segredo hardcoded no código; `.gitignore` cobre `.env`.
- `npm audit`: 0 vulnerabilidades.
- Sem `dangerouslySetInnerHTML`/`eval` no front (sem XSS sink).
- Valor SEMPRE remontado no servidor pelo `planId` (cliente não dita preço).
- Status `assinada`/`pago` só por webhook (cliente não se declara pago).
- Bucket de Storage privado.

## FALTA antes de ir ao ar (deploy-time)
- **Login real no /admin**: hoje o token/senha do painel vão no bundle do front
  (`VITE_ADMIN_TOKEN`/`VITE_ADMIN_PASSWORD`) → quem ler o JS tem acesso. Trocar por
  **Supabase Auth** (login de verdade) e remover o token do front. ESTE é o furo
  mais sério que sobra; só "fecha" no deploy com auth de servidor.
- Rotacionar TODOS os segredos que apareceram em chat/dev: token Autentique,
  service_role do Supabase. Gerar novos no deploy.
- Definir os segredos de webhook reais: `AUTENTIQUE_WEBHOOK_SECRET`,
  `GATEWAY_WEBHOOK_SECRET` (hoje vazios → webhooks negam tudo, que é o certo até lá).
- `CORS_ORIGINS` = domínio real do site.
- `AUTENTIQUE_SANDBOX=false` só quando for valer juridicamente.
- Idempotência dos webhooks (não processar o mesmo evento 2x).
- Rate limiter com store compartilhado (Redis) se rodar em mais de 1 instância
  (o default do slowapi é em memória, por processo).
- Rodar `rls_hardening.sql` na Supabase de produção.
- CSP estrita no front (precisa testar p/ não quebrar Google Fonts + iframe Autentique).
