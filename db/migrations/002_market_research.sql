-- LimpiaFast Growth OS v0.3 - Market Research
-- Primary interviews stay separate from secondary desk-research evidence.

create table if not exists market_research_interviews (
  id uuid primary key default gen_random_uuid(),
  respondent_code text not null unique,
  source text not null default 'past_client' check (source in ('past_client','lost_lead','prospect','friend_family','other')),
  customer_stage text not null default 'used_service' check (customer_stage in ('used_service','considered_not_bought','prospect')),
  district text,
  service_type text,
  last_service_at date,
  trigger text,
  job_to_be_done text,
  alternatives jsonb not null default '[]'::jsonb,
  biggest_fear text,
  trust_signal text,
  top_factor text,
  price_paid numeric(12,2),
  expected_price numeric(12,2),
  ps_too_cheap numeric(12,2),
  ps_good_value numeric(12,2),
  ps_expensive numeric(12,2),
  ps_too_expensive numeric(12,2),
  satisfaction smallint check (satisfaction between 1 and 5),
  nps smallint check (nps between 0 and 10),
  would_rehire boolean,
  coded_segment text check (coded_segment in ('rescue','hygiene','renewal','convenience','other')),
  open_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market_research_attribute_scores (
  interview_id uuid not null references market_research_interviews(id) on delete cascade,
  attribute text not null check (attribute in ('visible_result','odor_removal','care_no_damage','drying_speed','trust_reputation','price_transparency','convenience','safety_children_pets')),
  importance smallint not null check (importance between 1 and 5),
  rank smallint check (rank between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (interview_id, attribute)
);

create table if not exists market_research_message_tests (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references market_research_interviews(id) on delete cascade,
  winning_concept text not null check (winning_concept in ('rescue','hygiene','renewal','convenience')),
  rejected_concept text check (rejected_concept in ('rescue','hygiene','renewal','convenience')),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists market_research_evidence (
  id text primary key,
  source_type text not null default 'secondary' check (source_type in ('secondary','primary')),
  theme text not null,
  source_name text not null,
  source_url text,
  geography text,
  sample_context text,
  finding text not null,
  metric_value numeric(12,2),
  metric_unit text,
  confidence text not null default 'directional' check (confidence in ('directional','strong')),
  collected_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_market_research_interviews_segment on market_research_interviews(coded_segment);
create index if not exists idx_market_research_interviews_source on market_research_interviews(source);
create index if not exists idx_market_research_evidence_theme on market_research_evidence(theme);

alter table public.market_research_interviews enable row level security;
alter table public.market_research_attribute_scores enable row level security;
alter table public.market_research_message_tests enable row level security;
alter table public.market_research_evidence enable row level security;

insert into market_research_evidence (id, theme, source_name, source_url, geography, sample_context, finding, metric_value, metric_unit, confidence, collected_at)
values
  ('local_competitor_positioning_2026', 'outcome', 'Cooljaus', 'https://cooljaus.com/', 'Lima, Peru', 'Competidor local; comunicación comercial pública', 'La propuesta combina transformación visible, eliminación de manchas y olores, secado rápido, productos seguros y precio conocido antes de confirmar.', null, null, 'directional', '2026-08-22'),
  ('local_competitor_price_sofa_2026', 'price_transparency', 'Cooljaus precios', 'https://cooljaus.com/precios', 'Lima, Peru', 'Precio publicado; no representa todo el mercado', 'Publica precios referenciales y explica que tamaño, material y dificultad de manchas pueden modificar la cotización.', 80, 'PEN precio desde sillón', 'directional', '2026-08-22'),
  ('modernize_price_2025', 'price_transparency', 'Modernize Homeowner Insights 2025', 'https://modernize.com/homeowner-insights/2025-homeowner-insights-contractor-selection', 'Estados Unidos', 'Más de 150,000 homeowners', 'El precio es muy importante para la selección; además, cotizaciones poco claras y mala comunicación aparecen como razones de rechazo.', 65.78, '% precio muy importante', 'strong', '2026-08-22'),
  ('modernize_unclear_quotes_2025', 'trust', 'Modernize Homeowner Insights 2025', 'https://modernize.com/homeowner-insights/2025-homeowner-insights-contractor-selection', 'Estados Unidos', 'Más de 150,000 homeowners', 'Las cotizaciones poco claras reducen la probabilidad de contratación.', 32.60, '% cita cotización poco clara como freno', 'strong', '2026-08-22'),
  ('home_services_channels_2026', 'discovery', 'Home Services Consumer Study Q1 2026', 'https://assets.ctfassets.net/xpbu77rkft4z/203lpNa3kQQfG4w6B81IzK/e89be8756cbe761d3b55756ee59fecac/CONS_Report_Home_Services_Survey_FINAL.pdf', 'Estados Unidos', 'Estudio de consumidores de servicios para el hogar', 'Boca a boca, internet, publicidad directa y redes sociales conviven como fuentes relevantes de descubrimiento.', 62, '% boca a boca en 2025', 'strong', '2026-08-22'),
  ('tinuiti_reviews_2025', 'trust', 'Tinuiti Home Services Marketing Study 2025', 'https://tinuiti.com/research-insights/research/2025-home-services-marketing-study/', 'Estados Unidos', 'Consumidores de home services', 'Las reseñas online son una señal importante de calidad; Google lidera como fuente de reseñas y Facebook también es relevante.', null, null, 'strong', '2026-08-22')
on conflict (id) do update set
  theme = excluded.theme,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  geography = excluded.geography,
  sample_context = excluded.sample_context,
  finding = excluded.finding,
  metric_value = excluded.metric_value,
  metric_unit = excluded.metric_unit,
  confidence = excluded.confidence,
  collected_at = excluded.collected_at;
