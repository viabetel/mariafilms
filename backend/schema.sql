-- Schema Supabase (Postgres) para a Proposta — esboço.
-- A proposta é NATIVA (dados em `content` jsonb), não é PDF. Só o contrato vira
-- PDF → bucket de Storage `contratos` (gerado no aceite + versão assinada).
--
-- ALINHAMENTO COM O FRONT (src/proposal/api.ts, mapa STATUS_TO_DB):
--   front 'pendente'              → proposals.status 'pendente'
--   front 'aguardando_assinatura' → proposals.status 'enviada'
--   front 'assinada'             → proposals.status 'assinada'
--   front 'pago'                 → proposals.status 'assinada' + linha em `payments`
--   front 'expirada'             → proposals.status 'expirada'
-- A versão escolhida pelo cliente vem de acceptances.plan_id (o front guarda em
-- selectedPlanId). A linha do tempo do painel = eventos de auditoria; no banco
-- pode virar uma tabela `proposal_events` (type, at, meta jsonb) se quiser
-- persistir a trilha completa. `payments` (provider, status, paid_at) entra com
-- o Stripe.

create table if not exists proposals (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,          -- usado no link /proposta?c=TOKEN
  client_name  text not null,
  -- conteúdo da proposta daquele cliente (versões, preços, escopo). É o que a
  -- página mostra E o que o contrato usa → garante que o contrato bate com o
  -- que o cliente escolheu/viu. (Fonte única por cliente.)
  content      jsonb not null,
  status       text not null default 'pendente'  -- pendente | enviada | assinada | expirada
                 check (status in ('pendente','enviada','assinada','expirada')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '7 days')  -- proposta expira em 7 dias
);

create table if not exists acceptances (
  id                    uuid primary key default gen_random_uuid(),
  proposal_id           uuid references proposals(id) on delete cascade,
  plan_id               text not null,        -- v1 | v2 | v3
  signer_name           text not null,
  signer_document       text not null,        -- CPF/CNPJ
  signer_email          text not null,
  autentique_document_id text,                -- id do documento na Autentique
  contract_path         text,                 -- PDF do contrato no Storage
  signed_pdf_path       text,                 -- preenchido pelo webhook ao assinar
  -- trilha de auditoria (LGPD / validade do aceite)
  ip                    text,
  user_agent            text,
  signed_at             timestamptz,
  created_at            timestamptz not null default now()
);

create index if not exists idx_proposals_token on proposals(token);
create index if not exists idx_acceptances_proposal on acceptances(proposal_id);
