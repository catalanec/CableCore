-- CableCore Database Schema
-- Run this in Supabase SQL Editor

-- ===================
-- QUOTES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','accepted','rejected','completed')),

  -- Client info
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address TEXT,

  -- Installation details
  cable_type TEXT NOT NULL,
  cable_meters INTEGER DEFAULT 0,
  network_points INTEGER DEFAULT 0,
  installation_type TEXT NOT NULL,
  installation_meters INTEGER DEFAULT 0,

  -- Materials
  canaleta_meters INTEGER DEFAULT 0,
  tubo_corrugado_meters INTEGER DEFAULT 0,
  regata_meters INTEGER DEFAULT 0,

  -- Additional work
  switch_install BOOLEAN DEFAULT FALSE,
  router_install BOOLEAN DEFAULT FALSE,
  network_config BOOLEAN DEFAULT FALSE,
  patch_panel_install BOOLEAN DEFAULT FALSE,

  -- Rack
  rack_type TEXT DEFAULT 'none',

  -- Urgency
  urgency TEXT DEFAULT 'normal',

  -- Pricing
  cable_cost NUMERIC(10,2) DEFAULT 0,
  points_cost NUMERIC(10,2) DEFAULT 0,
  installation_cost NUMERIC(10,2) DEFAULT 0,
  materials_cost NUMERIC(10,2) DEFAULT 0,
  work_cost NUMERIC(10,2) DEFAULT 0,
  rack_cost NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0,
  urgency_multiplier NUMERIC(3,2) DEFAULT 1,
  iva NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,

  -- Notes
  notes TEXT,
  internal_notes TEXT
);

-- ===================
-- LEADS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form' CHECK (source IN ('contact_form','calculator','whatsapp','phone','manual')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  quote_id UUID REFERENCES quotes(id),
  notes TEXT
);

-- ===================
-- MATERIALS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  cost_price NUMERIC(10,2) DEFAULT 0,
  sell_price NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0
);

-- ===================
-- PROJECTS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  quote_id UUID REFERENCES quotes(id),
  lead_id UUID REFERENCES leads(id),
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2) DEFAULT 0,
  notes TEXT
);

-- ===================
-- ROW LEVEL SECURITY
-- ===================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "auth_quotes" ON quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_materials" ON materials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous inserts for contact form and calculator
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_quotes" ON quotes FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
