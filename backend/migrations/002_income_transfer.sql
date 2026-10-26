-- Run once in the Supabase SQL editor on an existing database (before deploying the new backend).
-- Adds income and transfer log kinds. Existing logs become kind = 'spend'.

alter table logs add column if not exists kind text not null default 'spend'
  check (kind in ('spend', 'income', 'transfer'));
alter table logs add column if not exists to_method_id bigint references payment_methods(id);

-- drop the old "exactly one target" check, whatever it was named
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'logs'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%num_nonnulls%'
  loop
    execute format('alter table logs drop constraint %I', c);
  end loop;
end $$;

alter table logs add constraint logs_shape check (
  (kind = 'spend'    and num_nonnulls(expense_id, loan_id, saving_id) = 1 and to_method_id is null) or
  (kind = 'income'   and num_nonnulls(expense_id, loan_id, saving_id) = 0 and to_method_id is null) or
  (kind = 'transfer' and num_nonnulls(expense_id, loan_id, saving_id) = 0
                     and to_method_id is not null and to_method_id <> method_id)
);
