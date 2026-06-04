# Deploy — Maria Films / Proposta Viva

O projeto é **dois serviços** (decoplados pelo `VITE_API_BASE`):

| Parte | Stack | Onde | Config |
|---|---|---|---|
| Site (front) | Vite + React | **Vercel** | `vercel.json` (já pronto) |
| API (backend) | FastAPI + WeasyPrint | **Render** (Docker) | `backend/Dockerfile` + `render.yaml` |

> O backend **não roda na Vercel**: o WeasyPrint precisa das libs nativas do Pango, que não existem no serverless. Por isso vai num container no Render.

---

## 1) Backend no Render

1. Crie conta em **render.com** (login com GitHub).
2. **New → Blueprint** → conecte o repo `viabetel/mariafilms`. O Render lê o `render.yaml` e cria o serviço `mariafilms-api`.
3. Preencha as variáveis de ambiente (todas marcadas `sync: false` no `render.yaml` — ficam só no painel, nunca no repo):

| Variável | O que é |
|---|---|
| `AUTENTIQUE_TOKEN` | token da conta Autentique |
| `AUTENTIQUE_SANDBOX` | **`false`** em produção (true = teste, sem validade jurídica) |
| `AUTENTIQUE_WEBHOOK_SECRET` | o MESMO valor que você cadastra no painel da Autentique (passo 3) |
| `CONTRATADA_EMAIL` / `CONTRATADA_NOME` | dados da contratada (e-mail = dono do token evita 3º signatário) |
| `SUPABASE_URL` | `https://ezhudxpaqzxzxysluqag.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service_role (segredo — **rotacionar antes do launch**) |
| `ADMIN_TOKEN` | senha do `/admin` |
| `CORS_ORIGINS` | domínio do site na Vercel, sem barra no fim (ex.: `https://mariafilms.vercel.app`) |
| `MERCADOPAGO_ACCESS_TOKEN` / `GATEWAY_WEBHOOK_SECRET` | só quando a Fase 2 (pagamento) entrar |

4. Deploy. A URL fica tipo `https://mariafilms-api.onrender.com`. Teste: abra `…/openapi.json` (tem que responder).

## 2) Front na Vercel

1. No projeto da Vercel, defina `VITE_API_BASE` = a URL do Render (ex.: `https://mariafilms-api.onrender.com`).
2. Redeploy (ou push no `main`, que a Vercel pega sozinha).

## 3) Webhook da Autentique (senão a assinatura nunca conclui no site)

No painel da Autentique → Configurações → Webhooks, cadastre:
- URL: `https://mariafilms-api.onrender.com/api/webhooks/autentique`
- Segredo: o mesmo `AUTENTIQUE_WEBHOOK_SECRET` do Render.

---

## ⚠️ Pegadinhas / checklist antes de abrir pro público

- [ ] `AUTENTIQUE_SANDBOX=false` (contratos com validade jurídica)
- [ ] `CORS_ORIGINS` com o domínio real da Vercel (senão o navegador bloqueia toda a API)
- [ ] Webhook da Autentique cadastrado e testado (assinar os 2 lados → vira "assinada" sozinho)
- [ ] **Rotacionar** os tokens que foram expostos em desenvolvimento (Autentique + Supabase service_role)
- [ ] **Login real no `/admin`** (hoje a senha vai no bundle do front; o `/admin` expõe CPF/CNPJ — LGPD). Trocar por Supabase Auth.
- [ ] **Pagamento (Mercado Pago)** ainda é `NotImplementedError` → o fluxo trava em "assinada". Implementar `create_subscription`/`create_charge` + webhook `/api/webhooks/pagamento`.
- [ ] Reload na tela de assinatura: o `GET /api/proposta` não devolve o `signingUrl` → o cliente perde o quadro ao atualizar. Persistir/reconsultar o link.
- [ ] Plano grátis do Render dorme após ~15min → 1º contrato depois disso demora (acordar + aquecer fontes). Subir de plano se for incômodo.
- [ ] CPF/dados reais da Maria em `propostas/proposta_config.py` (hoje placeholder).

## Rodar local (referência)

```
cd backend
python -m uvicorn main:app --port 8000
```
Precisa do `backend/.env` (ver `backend/.env.example`) e do GTK/WeasyPrint instalado.
