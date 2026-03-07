create extension if not exists "uuid-ossp";

create table if not exists patient_records (
  id uuid primary key default uuid_generate_v4(),
  patient_name text, patient_email text, patient_phone text, patient_id text,
  date_of_birth date, blood_type text, allergies jsonb default '[]',
  current_medications jsonb default '[]', medical_conditions jsonb default '[]',
  past_treatments jsonb default '[]', consents jsonb default '[]',
  x_rays jsonb default '[]', dental_records jsonb, appointments_history jsonb default '[]',
  insurance_info jsonb, emergency_contact jsonb, notes text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists dentists (
  id uuid primary key default uuid_generate_v4(),
  name text not null, email text, phone text, cro text, specialty text,
  color text, avatar_url text, slot_duration_minutes int default 30,
  working_hours jsonb, services jsonb default '[]', notes text, is_active boolean default true,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  date date, time text, duration_minutes int,
  patient_id uuid, patient_name text, patient_phone text,
  dentist_id uuid, resource_id uuid, resource_name text,
  service_type text, status text default 'scheduled',
  payment_status text default 'pending', payment_method text,
  payment_date date, price numeric, invoice_number text, notes text,
  follow_up_required boolean default false, follow_up_notes text, follow_up_days int,
  reminder_sent boolean default false, reminder_confirmed boolean default false,
  ehr_synced boolean default false, ehr_id text, ehr_system text, ehr_sync_date timestamptz,
  provider text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null, email text, phone text, company text, profession text,
  city text, state text, birth_date date, source text, segment text, value_tier text,
  status text default 'active', tags jsonb default '[]', interests jsonb default '[]',
  custom_fields jsonb, lifetime_value numeric default 0, last_contact_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null, email text, phone text, status text default 'novo',
  temperatura text, interesse text, segmento text, fonte_original text, canal_conversao text,
  campanha_id uuid, origem_canal_id uuid, lead_score numeric default 0,
  ai_score numeric, ai_classification text, ai_analysis jsonb, ai_conversion_probability numeric,
  valor_estimado numeric, lifetime_value numeric default 0, total_interacoes int default 0,
  taxa_resposta numeric, tempo_medio_resposta numeric, ultima_interacao timestamptz,
  data_entrada timestamptz default now(), tags jsonb default '[]', notas text,
  workflow_ativo boolean default false, workflow_etapa text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null, descricao text, status text default 'pendente',
  prioridade text default 'media', categoria text, progresso int default 0,
  data_vencimento timestamptz, data_conclusao timestamptz,
  responsaveis jsonb default '[]', checklist jsonb default '[]',
  subtarefas jsonb default '[]', observacoes text, pop_id uuid, pop_codigo text,
  tarefa_pai_id uuid, template_id uuid, recorrente boolean default false,
  frequencia_recorrencia text, proxima_ocorrencia timestamptz,
  notificacao_enviada boolean default false,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null, description text, category text, sku text,
  price numeric, cost numeric, currency text default 'BRL',
  stock_quantity int default 0, min_stock_level int default 0,
  image_url text, status text default 'active',
  whatsapp_enabled boolean default false, whatsapp_message_template text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists financial_transactions (
  id uuid primary key default uuid_generate_v4(),
  description text, type text, category text, amount numeric, amount_paid numeric,
  status text default 'pending', date date, due_date date,
  scheduled_payment_date date, payment_method text, payment_date date,
  invoice_number text, invoice_url text, patient_id uuid, patient_name text,
  patient_email text, supplier text, is_recurring boolean default false,
  recurrence_period text, recurrence_day int, partial_payments jsonb default '[]',
  boleto_id text, boleto_url text, boleto_barcode text, boleto_status text,
  boleto_generated_at timestamptz, boleto_paid_at timestamptz,
  stripe_session_id text, stripe_payment_link text, bank_statement_ref text,
  reminder_sent_at timestamptz, reminder_count int default 0, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, customer_name text, products jsonb default '[]',
  total_amount numeric, currency text default 'BRL',
  status text default 'pending', payment_status text default 'pending',
  channel text, whatsapp_order_id text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, provider text,
  chief_complaint text, diagnosis text, treatment_plan text,
  medications jsonb default '[]', follow_up_required boolean default false,
  follow_up_date date, follow_up_notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists medical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, title text, record_type text,
  content text, date date, provider text, medications jsonb default '[]',
  chronic_conditions jsonb default '[]', past_procedures jsonb default '[]',
  allergies jsonb default '[]', attachments jsonb default '[]',
  synced_to_ehr boolean default false, ehr_id text, last_ehr_sync timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists pops (
  id uuid primary key default uuid_generate_v4(),
  codigo text, nome text not null, objetivo text, descricao text,
  responsavel text, frequencia text, categoria text, status text default 'ativo',
  versao text, arquivo_url text, favorito boolean default false,
  checklist jsonb default '[]', pontos_atencao jsonb default '[]',
  indicadores jsonb default '[]', tags jsonb default '[]',
  historico_versoes jsonb default '[]',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sops (
  id uuid primary key default uuid_generate_v4(),
  name text not null, area text, owner text, goal text, primary_offer text,
  status text default 'active', last_update date, kpi_principal text, content jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  title text not null, description text, status text default 'pending',
  priority text default 'medium', category text, progress int default 0,
  start_date date, due_date date, assigned_to text,
  estimated_hours numeric, actual_hours numeric, pop_codigo text, file_url text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null, status text default 'draft', oferta text,
  canal_principal_id uuid, estrategia_id uuid, whatsapp_flow text, landing_page text,
  orcamento numeric, data_inicio date, data_fim date, meta_leads int, meta_conversao numeric,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customer_segments (
  id uuid primary key default uuid_generate_v4(),
  name text not null, description text, criteria jsonb,
  customer_count int default 0, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  name text not null, type text, status text default 'available', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, appointment_id uuid, type text,
  status text default 'pending', scheduled_date timestamptz, completed_date timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null, category text, sku text, quantity int default 0,
  min_quantity int default 0, unit_price numeric, supplier text,
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null, description text, status text default 'open',
  priority text default 'medium', customer_id uuid, customer_name text,
  assigned_to text, resolved_at timestamptz, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

alter table patient_records enable row level security;
alter table dentists enable row level security;
alter table appointments enable row level security;
alter table customers enable row level security;
alter table leads enable row level security;
alter table tasks enable row level security;
alter table products enable row level security;
alter table financial_transactions enable row level security;
alter table sales enable row level security;
alter table interactions enable row level security;
alter table clinical_notes enable row level security;
alter table medical_records enable row level security;
alter table pops enable row level security;
alter table sops enable row level security;
alter table activities enable row level security;
alter table campaigns enable row level security;
alter table customer_segments enable row level security;
alter table resources enable row level security;
alter table follow_ups enable row level security;
alter table inventory_items enable row level security;
alter table support_tickets enable row level security;

create policy "allow_all_patient_records" on patient_records for all to authenticated using (true) with check (true);
create policy "allow_all_dentists" on dentists for all to authenticated using (true) with check (true);
create policy "allow_all_appointments" on appointments for all to authenticated using (true) with check (true);
create policy "allow_all_customers" on customers for all to authenticated using (true) with check (true);
create policy "allow_all_leads" on leads for all to authenticated using (true) with check (true);
create policy "allow_all_tasks" on tasks for all to authenticated using (true) with check (true);
create policy "allow_all_products" on products for all to authenticated using (true) with check (true);
create policy "allow_all_financial_transactions" on financial_transactions for all to authenticated using (true) with check (true);
create policy "allow_all_sales" on sales for all to authenticated using (true) with check (true);
create policy "allow_all_interactions" on interactions for all to authenticated using (true) with check (true);
create policy "allow_all_clinical_notes" on clinical_notes for all to authenticated using (true) with check (true);
create policy "allow_all_medical_records" on medical_records for all to authenticated using (true) with check (true);
create policy "allow_all_pops" on pops for all to authenticated using (true) with check (true);
create policy "allow_all_sops" on sops for all to authenticated using (true) with check (true);
create policy "allow_all_activities" on activities for all to authenticated using (true) with check (true);
create policy "allow_all_campaigns" on campaigns for all to authenticated using (true) with check (true);
create policy "allow_all_customer_segments" on customer_segments for all to authenticated using (true) with check (true);
create policy "allow_all_resources" on resources for all to authenticated using (true) with check (true);
create policy "allow_all_follow_ups" on follow_ups for all to authenticated using (true) with check (true);
create policy "allow_all_inventory_items" on inventory_items for all to authenticated using (true) with check (true);
create policy "allow_all_support_tickets" on support_tickets for all to authenticated using (true) with check (true);
