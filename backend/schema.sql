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

-- Assinaturas — plano MENSAL = débito automático recorrente no cartão (ex.:
-- "preapproval" do Mercado Pago). Uma linha por assinatura; as cobranças mensais
-- que ela gera entram em `payments`. Plano à vista NÃO cria assinatura.
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  proposal_id            uuid references proposals(id) on delete cascade,
  plan_id                text not null,             -- v1 | v2 | v3
  gateway                text not null,             -- mercadopago | pagarme
  gateway_subscription_id text unique,              -- id da assinatura no gateway
  monthly_amount         numeric(10,2) not null,    -- valor de cada mensalidade
  months                 int not null,              -- duração do compromisso (meses)
  status                 text not null default 'pendente'  -- pendente | ativa | pausada | cancelada | falhou
                           check (status in ('pendente','ativa','pausada','cancelada','falhou')),
  created_at             timestamptz not null default now()
);

-- Pagamentos — gateway BR (Mercado Pago recomendado). Uma linha por COBRANÇA
-- efetiva: à vista gera 1; assinatura gera 1 por mensalidade debitada (via
-- webhook). A 1ª libera o acesso. O valor é sempre remontado no servidor pelo
-- plan_id, nunca vindo do cliente.
create table if not exists payments (
  id                 uuid primary key default gen_random_uuid(),
  proposal_id        uuid references proposals(id) on delete cascade,
  subscription_id    uuid references subscriptions(id) on delete set null,  -- preenchido quando é mensalidade de assinatura
  plan_id            text not null,                 -- v1 | v2 | v3
  gateway            text not null,                 -- mercadopago | pagarme
  gateway_charge_id  text,                          -- id da cobrança no gateway
  method             text not null default 'pix'    -- pix | cartao | boleto
                       check (method in ('pix','cartao','boleto')),
  amount             numeric(10,2) not null,        -- valor desta cobrança
  installment_n      int not null default 1,        -- nº da mensalidade (1..N)
  installment_total  int not null default 1,        -- total de mensalidades do plano
  status             text not null default 'pendente'  -- pendente | pago | expirado | falhou
                       check (status in ('pendente','pago','expirado','falhou')),
  due_at             timestamptz,                   -- vencimento (mensalidade)
  paid_at            timestamptz,                   -- preenchido pelo webhook do gateway
  created_at         timestamptz not null default now(),
  -- idempotência do webhook: o mesmo charge não vira 'pago' duas vezes
  unique (gateway, gateway_charge_id)
);

-- Mensagens do formulário de contato do site (seção "eternizar o instante").
-- Público insere via POST /api/contato; a Maria lê no /admin (aba mensagens).
create table if not exists contatos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text not null,
  mensagem    text not null,
  lido        boolean not null default false,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_contatos_created on contatos(created_at desc);

create index if not exists idx_proposals_token on proposals(token);
create index if not exists idx_acceptances_proposal on acceptances(proposal_id);
create index if not exists idx_payments_proposal on payments(proposal_id);
create index if not exists idx_subscriptions_proposal on subscriptions(proposal_id);
