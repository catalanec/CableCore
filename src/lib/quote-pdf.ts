/* ═══════════════════════════════════════════
   PDF Quote Generator
   Generates professional PDF quotes using
   HTML-to-canvas approach (works client-side)
   ═══════════════════════════════════════════ */

export interface QuotePDFData {
    quoteNumber: string;
    date: string;
    client: {
        name: string;
        phone: string;
        email: string;
        address?: string;
    };
    items: Array<{
        description: string;
        quantity: string;
        unitPrice: string;
        total: string;
    }>;
    subtotal: string;
    urgencyMultiplier?: string;
    iva: string;
    total: string;
    notes?: string;
}

export function generateQuoteNumber(): string {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const r = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CC-${y}${m}${d}-${r}`;
}

export function generateQuoteHTML(data: QuotePDFData): string {
    const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2e; color: #a09480; font-size: 13px;">${item.description}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2e; color: #a09480; text-align: center; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2e; color: #a09480; text-align: right; font-size: 13px;">${item.unitPrice}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #2a2a2e; color: #c9a84c; text-align: right; font-weight: 600; font-size: 13px;">${item.total}</td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #09090b; color: #fff; }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; padding: 40px; background: #09090b;">

    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #c9a84c; padding-bottom: 24px;">
      <div>
        <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 4px;">
          <span style="color: #fff;">Cable</span><span style="color: #c9a84c;">Core</span>
        </h1>
        <p style="color: #a09480; font-size: 12px; font-style: italic;">Conectamos tu negocio</p>
      </div>
      <div style="text-align: right; font-size: 12px; color: #a09480; line-height: 1.6;">
        <div style="color: #c9a84c; font-size: 16px; font-weight: 700; margin-bottom: 4px;">PRESUPUESTO</div>
        <div>N° ${data.quoteNumber}</div>
        <div>Fecha: ${data.date}</div>
      </div>
    </div>

    <!-- Client info -->
    <div style="background: #111113; border: 1px solid #2a2a2e; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <h3 style="color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Datos del cliente</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
        <div><span style="color: #666;">Nombre:</span> <span style="color: #fff;">${data.client.name}</span></div>
        <div><span style="color: #666;">Teléfono:</span> <span style="color: #fff;">${data.client.phone}</span></div>
        <div><span style="color: #666;">Email:</span> <span style="color: #fff;">${data.client.email}</span></div>
        ${data.client.address ? `<div><span style="color: #666;">Dirección:</span> <span style="color: #fff;">${data.client.address}</span></div>` : ''}
      </div>
    </div>

    <!-- Items table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #111113;">
          <th style="padding: 12px; text-align: left; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c;">Descripción</th>
          <th style="padding: 12px; text-align: center; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c;">Cantidad</th>
          <th style="padding: 12px; text-align: right; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c;">Precio/ud.</th>
          <th style="padding: 12px; text-align: right; color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display: flex; justify-content: flex-end;">
      <div style="width: 280px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #a09480; border-bottom: 1px solid #2a2a2e;">
          <span>Subtotal</span> <span>${data.subtotal}</span>
        </div>
        ${data.urgencyMultiplier ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #e8b931; border-bottom: 1px solid #2a2a2e;">
          <span>Multiplicador urgencia</span> <span>${data.urgencyMultiplier}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #a09480; border-bottom: 1px solid #2a2a2e;">
          <span>IVA (21%)</span> <span>${data.iva}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 20px; font-weight: 800; color: #c9a84c; border-top: 2px solid #c9a84c; margin-top: 4px;">
          <span>TOTAL</span> <span>${data.total}</span>
        </div>
      </div>
    </div>

    ${data.notes ? `
    <div style="margin-top: 30px; background: #111113; border: 1px solid #2a2a2e; border-radius: 8px; padding: 16px;">
      <h4 style="color: #c9a84c; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Notas</h4>
      <p style="color: #a09480; font-size: 12px; line-height: 1.5;">${data.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #2a2a2e; font-size: 11px; color: #666; text-align: center; line-height: 1.8;">
      <div><b style="color: #c9a84c;">CableCore</b> — Instalación profesional de redes y cableado estructurado</div>
      <div>📞 +34 605 974 605 · ✉️ info@cablecore.es · 🌐 cablecore.es</div>
      <div>📍 Carrer Vitor Balaguer 33, Badalona, 08914, Barcelona</div>
      <div style="margin-top: 8px; color: #555;">Presupuesto válido por 30 días · Precios con IVA incluido</div>
    </div>

  </div>
</body>
</html>`;
}

export async function downloadQuotePDF(data: QuotePDFData): Promise<void> {
    const html = generateQuoteHTML(data);

    // Open printable window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to download the PDF');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-trigger print dialog (Save as PDF)
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
