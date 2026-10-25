-- Run once in the Supabase SQL editor.
create table settings (
  id int primary key default 1 check (id = 1),
  start_date date not null
);

create table payment_methods (
  id bigserial primary key,
  name text not null,
  kind text not null check (kind in ('cash','account','custom')),
  opening_balance numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table expenses (
  id bigserial primary key,
  name text not null,
  kind text not null check (kind in ('daily','monthly')),
  essential boolean not null default true
);

create table loans (
  id bigserial primary key,
  name text not null,
  total numeric(12,2) not null
);

create table savings (
  id bigserial primary key,
  name text not null,
  starting_amount numeric(12,2) not null default 0
);

create table goal (
  id int primary key default 1 check (id = 1),
  purpose text not null,
  goal_amount numeric(12,2) not null,
  daily_threshold numeric(12,2) not null
);

create table logs (
  id bigserial primary key,
  day date not null,
  method_id bigint not null references payment_methods(id),
  amount numeric(12,2) not null check (amount > 0),
  description text,
  expense_id bigint references expenses(id),
  loan_id bigint references loans(id),
  saving_id bigint references savings(id),
  check (num_nonnulls(expense_id, loan_id, saving_id) = 1)
);

create table days (
  day date primary key,
  closed_at timestamptz not null default now(),
  closing jsonb not null
);
