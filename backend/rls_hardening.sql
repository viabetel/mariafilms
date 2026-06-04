-- TRAVA DE SEGURANÇA (RLS) — rode no SQL Editor da Supabase depois do schema.sql.
--
-- Por que: estas tabelas guardam PII de clientes (CPF/CNPJ, e-mail). SÓ o backend
-- (com a service_role key, que BYPASSA o RLS) deve tocá-las. Ativando RLS SEM criar
-- nenhuma policy para anon/authenticated, o resultado é DENY total para qualquer
-- chave pública — exatamente o que queremos. A service_role continua passando.
--
-- Idempotente: pode rodar quantas vezes quiser.

alter table proposals     enable row level security;
alter table acceptances   enable row level security;
alter table subscriptions enable row level security;
alter table payments      enable row level security;

-- (Sem policies de propósito: ninguém além da service_role lê/escreve.)
-- Revoga grants diretos que poderiam furar o RLS para as roles públicas.
revoke all on proposals,     acceptances, subscriptions, payments from anon;
revoke all on proposals,     acceptances, subscriptions, payments from authenticated;
