-- Facturas rectificativas (serie R0001, R0002…), una por factura como máximo.
CREATE TABLE IF NOT EXISTS invoice_rectifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rect_number SERIAL UNIQUE,
  invoice_id UUID NOT NULL UNIQUE REFERENCES invoices(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 200),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sólo el servidor (service role) la lee y escribe, como el resto del CRM.
ALTER TABLE invoice_rectifications ENABLE ROW LEVEL SECURITY;
