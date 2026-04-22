-- CableCore CRM Invoices Migration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number SERIAL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  razon_social TEXT NOT NULL,
  cif TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  
  total_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set the starting value of the sequence to 21
ALTER SEQUENCE invoices_invoice_number_seq RESTART WITH 21;

-- Create an index to quickly pull invoices
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Optional: Update quotes to track if they've been invoiced
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_invoiced BOOLEAN DEFAULT false;
