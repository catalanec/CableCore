-- CableCore CRM 2.0 — Migration
-- Run this in Supabase SQL Editor

-- ── 1. TASKS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',       -- pending | in_progress | done
  priority TEXT DEFAULT 'medium',      -- high | medium | low
  due_date DATE,
  entity_type TEXT,                    -- lead | project | quote
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ACTIVITIES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,          -- call | email | whatsapp | note | status_change | payment | meeting
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL,   -- lead | quote | project
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. LEADS — extra columns ────────────────────────────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;

-- ── 4. PROJECTS — extra columns ─────────────────────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cable_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS network_points INTEGER;

-- ── 5. INDEXES for performance ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline_stage);
