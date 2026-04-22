/* ═══════════════════════════════════════════
   PDF Invoice Generator — Print-Friendly Version
   White background with dark text for clean printing
   ═══════════════════════════════════════════ */

export interface InvoicePDFData {
    invoiceNumber: string | number;
    date: string;
    client: {
        razonSocial: string;
        cif: string;
        address: string;
        phone?: string;
        email?: string;
    };
    items: Array<{
        description: string;
        quantity: string | number;
        unitPrice: string;
        total: string;
    }>;
    subtotal: string;
    urgencyMultiplier?: string;
    iva: string;
    total: string;
    notes?: string;
}

// Ensure the invoice number is padded with zeros (e.g., 21 -> 00021)
export function formatInvoiceNumber(num: string | number): string {
    return num.toString().padStart(5, '0');
}

export function generateInvoiceHTML(data: InvoicePDFData): string {
    const itemRows = data.items.map((item, i) => `
    <tr style="background: ${i % 2 === 0 ? '#fff' : '#f8f6f1'};">
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; font-size: 12px;">${item.description}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: center; font-size: 12px;">${item.quantity}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: right; font-size: 12px;">${item.unitPrice}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #8B6914; text-align: right; font-weight: 700; font-size: 12px;">${item.total}</td>
    </tr>
  `).join('');

    const formattedInvoiceNum = formatInvoiceNumber(data.invoiceNumber);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura_CableCore_${formattedInvoiceNum}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #222; padding: 15mm; }
    @page { margin: 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px 15px; background: #fff;">

    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 3px solid #C9A84C; padding-bottom: 15px;">
      <div>
        <img src="https://cablecore.es/logocablecore.png" alt="CableCore" style="height: 100px; width: auto; display: block;" crossorigin="anonymous" />
        <p style="color: #8B6914; font-size: 9px; font-style: italic; margin-top: 2px; font-weight: 500; text-align: center;">Conectamos tu negocio</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #555; line-height: 1.6;">
        <div style="color: #8B6914; font-size: 17px; font-weight: 700; margin-bottom: 4px;">FACTURA</div>
        <div>Nº ${formattedInvoiceNum}</div>
        <div>Fecha: ${data.date}</div>
      </div>
    </div>

    <!-- Emisor & Cliente -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
      
      <!-- Datos Emisor (CableCore) -->
      <div style="font-size: 12px; color: #555; border-right: 1px solid #e0dcd4; padding-right: 20px;">
        <h3 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: 700;">Datos del Vendedor</h3>
        <p style="margin-bottom: 4px;"><span style="color: #222; font-weight: 600;">Anton Shapoval (CableCore)</span></p>
        <p style="margin-bottom: 4px;">NIF: Y6111818B</p>
        <p style="margin-bottom: 4px;">Carrer Vitor Balaguer 33, BA</p>
        <p style="margin-bottom: 4px;">08914 Badalona (Barcelona)</p>
        <p style="margin-bottom: 4px;">Email: info@cablecore.es</p>
      </div>

      <!-- Datos Cliente -->
      <div style="background: #f8f6f1; border: 2px solid #e0dcd4; border-radius: 6px; padding: 18px;">
        <h3 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: 700;">Facturar a:</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: 6px; font-size: 12px;">
          <div><span style="color: #888; font-weight: 600;">Razón Social:</span> <span style="color: #222; font-weight: 600;">${data.client.razonSocial}</span></div>
          <div><span style="color: #888; font-weight: 600;">CIF/NIF:</span> <span style="color: #222; font-weight: 500;">${data.client.cif}</span></div>
          <div><span style="color: #888; font-weight: 600;">Dirección:</span> <span style="color: #222; font-weight: 500;">${data.client.address}</span></div>
          ${data.client.email ? `<div><span style="color: #888; font-weight: 600;">Email:</span> <span style="color: #222; font-weight: 500;">${data.client.email}</span></div>` : ''}
          ${data.client.phone ? `<div><span style="color: #888; font-weight: 600;">Teléfono:</span> <span style="color: #222; font-weight: 500;">${data.client.phone}</span></div>` : ''}
        </div>
      </div>

    </div>

    <!-- Items table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr>
          <th style="padding: 12px 14px; text-align: left; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Descripción de servicios</th>
          <th style="padding: 12px 14px; text-align: center; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Cantidad</th>
          <th style="padding: 12px 14px; text-align: right; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Precio/ud.</th>
          <th style="padding: 12px 14px; text-align: right; color: #fff; background: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Base Imponible</th>
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
          <span>Base Imponible</span> <span style="font-weight: 600; color: #333;">${data.subtotal}</span>
        </div>
        ${data.urgencyMultiplier ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #B8860B; background: #FFF8E1; border-bottom: 1px solid #e0dcd4;">
          <span style="font-weight: 600;">Multiplicador urgencia</span> <span style="font-weight: 700;">${data.urgencyMultiplier}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; color: #555; border-bottom: 1px solid #e0dcd4;">
          <span>IVA (21%)</span> <span style="font-weight: 600; color: #333;">${data.iva}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px; font-size: 21px; font-weight: 800; color: #8B6914; background: #f8f6f1; border: 2px solid #C9A84C; border-radius: 4px; margin-top: 6px;">
          <span>TOTAL</span> <span>${data.total}</span>
        </div>
      </div>
    </div>

    ${data.notes ? `
    <div style="margin-top: 25px; background: #f8f6f1; border: 1px solid #e0dcd4; border-radius: 6px; padding: 14px;">
      <h4 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; font-weight: 700;">Método de Pago e Información Adicional</h4>
      <p style="color: #555; font-size: 11px; line-height: 1.5; white-space: pre-wrap;">${data.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 35px; padding-top: 15px; border-top: 2px solid #C9A84C; font-size: 10px; color: #666; text-align: center; line-height: 1.8;">
      <div>Operación exenta/sujeta a normativa del IVA español. Todos los precios incluyen euros (€).</div>
    </div>

  </div>
</body>
</html>`;
}

export async function downloadInvoicePDF(data: InvoicePDFData): Promise<void> {
    const html = generateInvoiceHTML(data);

    // Open printable window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permite los popups para descargar la factura.');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-trigger print dialog (Save as PDF)
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
