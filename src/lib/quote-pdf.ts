/* ═══════════════════════════════════════════
   PDF Quote Generator — Print-Friendly Version
   White background with dark text for clean printing
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
    signatureEmisor?: string;
    signatureClient?: string;
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
    const itemRows = data.items.map((item, i) => `
    <tr style="background: ${i % 2 === 0 ? '#fff' : '#f8f6f1'};">
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; font-size: 12px;">${item.description}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: center; font-size: 12px;">${item.quantity}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: right; font-size: 12px;">${item.unitPrice}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #8B6914; text-align: right; font-weight: 700; font-size: 12px;">${item.total}</td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Presupuesto_CableCore_${data.client.name ? data.client.name.replace(/\s+/g, '_') : data.quoteNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #222; padding: 10mm; }
    @page { margin: 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px 15px; background: #fff;">

    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 3px solid #C9A84C; padding-bottom: 8px;">
      <div>
        <img src="https://cablecore.es/logocablecore.png" alt="CableCore" style="height: 80px; width: auto; display: block;" crossorigin="anonymous" />
        <p style="color: #8B6914; font-size: 8px; font-style: italic; margin-top: 1px; font-weight: 500; text-align: center;">Conectamos tu negocio</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #555; line-height: 1.6;">
        <div style="color: #8B6914; font-size: 17px; font-weight: 700; margin-bottom: 4px;">PRESUPUESTO</div>
        <div>Nº ${data.quoteNumber}</div>
        <div>Fecha: ${data.date}</div>
      </div>
    </div>

    <!-- Client info -->
    <div style="background: #f8f6f1; border: 2px solid #e0dcd4; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
      <h3 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; font-weight: 700;">Datos del cliente</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
        <div><span style="color: #888; font-weight: 600;">Nombre:</span> <span style="color: #222; font-weight: 500;">${data.client.name}</span></div>
        <div><span style="color: #888; font-weight: 600;">Teléfono:</span> <span style="color: #222; font-weight: 500;">${data.client.phone}</span></div>
        <div><span style="color: #888; font-weight: 600;">Email:</span> <span style="color: #222; font-weight: 500;">${data.client.email}</span></div>
        ${data.client.address ? `<div><span style="color: #888; font-weight: 600;">Dirección:</span> <span style="color: #222; font-weight: 500;">${data.client.address}</span></div>` : ''}
      </div>
    </div>

    <!-- Items table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
      <thead>
        <tr>
          <th style="padding: 12px 14px; text-align: left; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Descripción</th>
          <th style="padding: 12px 14px; text-align: center; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Cantidad</th>
          <th style="padding: 12px 14px; text-align: right; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Precio/ud.</th>
          <th style="padding: 12px 14px; text-align: right; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display: flex; justify-content: flex-end;">
      <div style="width: 300px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #555; border-bottom: 1px solid #e0dcd4;">
          <span>Subtotal</span> <span style="font-weight: 600; color: #333;">${data.subtotal}</span>
        </div>
        ${data.urgencyMultiplier ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #B8860B; background: #FFF8E1; border-bottom: 1px solid #e0dcd4;">
          <span style="font-weight: 600;">Multiplicador urgencia</span> <span style="font-weight: 700;">${data.urgencyMultiplier}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #555; border-bottom: 1px solid #e0dcd4;">
          <span>IVA (21%)</span> <span style="font-weight: 600; color: #333;">${data.iva}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 10px; font-size: 18px; font-weight: 800; color: #8B6914; background: #f8f6f1; border: 2px solid #C9A84C; border-radius: 4px; margin-top: 2px;">
          <span>TOTAL</span> <span>${data.total}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 10px; background: #f8f6f1; border: 1px solid #e0dcd4; border-radius: 6px; padding: 10px;">
      <h4 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; font-weight: 700;">Condiciones y Método de Pago</h4>
      ${data.notes ? `<p style="color: #555; font-size: 11px; line-height: 1.5; margin-bottom: 8px; white-space: pre-wrap;">${data.notes}</p>` : ''}
      <p style="color: #333; font-size: 11px; line-height: 1.5;">Condiciones: <strong>50% del total por adelantado</strong> en concepto de reserva y materiales para iniciar el proyecto.</p>
      <p style="color: #333; font-size: 11px; margin-top: 4px;">Cuenta bancaria (IBAN): <strong style="pointer-events: none; text-decoration: none; color: inherit;">ES91 2103<span></span> 7379<span></span> 4000<span></span> 3001<span></span> 0959</strong></p>
    </div>

    <!-- Signatures -->
    <div class="no-break" style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
      <div style="text-align: center;">
        <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 10px;">
          <p style="font-size: 8px; color: #bbb; text-transform: uppercase;">Sello y Firma del Prestador</p>
        </div>
        <div style="border-top: 1.5px solid #C9A84C; padding-top: 10px;">
          <p style="font-size: 11px; font-weight: 700; color: #222;">${data.signatureEmisor || 'Anton Shapoval'}</p>
          <p style="font-size: 9px; color: #8B6914; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">CableCore</p>
        </div>
      </div>
      <div style="text-align: center;">
        <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 10px;">
          <p style="font-size: 8px; color: #bbb; text-transform: uppercase;">Sello y Firma del Cliente</p>
        </div>
        <div style="border-top: 1.5px solid #C9A84C; padding-top: 10px;">
          <p style="font-size: 11px; font-weight: 700; color: #222;">${data.signatureClient || data.client.name}</p>
          <p style="font-size: 9px; color: #666; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Conforme el Cliente</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #C9A84C; font-size: 10px; color: #666; text-align: center; line-height: 1.8;">
      <div><b style="color: #8B6914;">CableCore</b> — Instalación profesional de redes y cableado estructurado</div>
      <div>📞 +34 605 974 605 · ✉️ info@cablecore.es · 🌐 cablecore.es</div>
      <div>📍 Carrer Vitor Balaguer 33, Badalona, 08914, Barcelona</div>
      <div style="margin-top: 8px; color: #999; font-size: 9px;">Presupuesto válido por 30 días · Precios con IVA incluido</div>
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
