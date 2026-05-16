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
    signatureEmisor?: string;
    signatureClient?: string;
}

// Ensure the invoice number is padded with zeros (e.g., 21 -> 00021)
export function formatInvoiceNumber(num: string | number): string {
    return num.toString().padStart(5, '0');
}

export function generateInvoiceHTML(data: InvoicePDFData): string {
    const itemRows = data.items.map((item, i) => `
    <tr style="background: ${i % 2 === 0 ? '#fff' : '#f8f6f1'};">
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; font-size: 10px;">${item.description}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: center; font-size: 10px;">${item.quantity}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #333; text-align: right; font-size: 10px;">${item.unitPrice}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e0dcd4; color: #8B6914; text-align: right; font-weight: 700; font-size: 10px;">${item.total}</td>
    </tr>
  `).join('');

    const formattedInvoiceNum = formatInvoiceNumber(data.invoiceNumber);

    // Calculate due date: invoice date + 60 days
    const parseDateES = (dateStr: string): Date => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        return new Date(dateStr);
    };
    const invoiceDate = parseDateES(data.date);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 70);
    const dueDateStr = dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Factura_CableCore_${formattedInvoiceNum}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #222; padding: 10mm; font-size: 10px; }
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
        <div style="color: #8B6914; font-size: 17px; font-weight: 700; margin-bottom: 4px;">FACTURA</div>
        <div>Nº ${formattedInvoiceNum}</div>
        <div>Fecha: ${data.date}</div>
        <div style="color: #c0392b; font-weight: 600;">Vencimiento: ${dueDateStr}</div>
      </div>
    </div>

    <!-- Emisor & Cliente — single bordered box -->
    <div style="border: 1.5px solid #C9A84C; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; background: #fdfaf4;">

        <!-- Datos Prestador de Servicios (CableCore) -->
        <div style="padding: 10px 15px; border-right: 1px solid #e0dcd4; font-size: 10px; color: #555; line-height: 1.7;">
          <h3 style="color: #8B6914; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; font-weight: 700;">Prestador de Servicios</h3>
          <div><span style="color: #222; font-weight: 700;">CableCore</span></div>
          <div>Anton Shapoval</div>
          <div>NIF: Y3806392K</div>
          <div>Carrer Victor Balaguer 33, àtic/3</div>
          <div>08914 Badalona (Barcelona)</div>
          <div>Teléfono: +34 605 974 605</div>
          <div>Email: info@cablecore.es</div>
        </div>

        <!-- Datos Cliente -->
        <div style="padding: 10px 15px; font-size: 10px; color: #555; line-height: 1.7;">
          <h3 style="color: #8B6914; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 700;">Facturar a:</h3>
          <div><span style="color: #222; font-weight: 700;">${data.client.razonSocial}</span></div>
          <div>CIF/NIF: ${data.client.cif}</div>
          <div>${data.client.address || '—'}</div>
          <div>${data.client.phone ? 'Teléfono: ' + data.client.phone : '&nbsp;'}</div>
          <div>${data.client.email ? 'Email: ' + data.client.email : '&nbsp;'}</div>
        </div>

      </div>
    </div>

    <!-- Items table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
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
      <div style="width: 260px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 10px; font-size: 10px; color: #555; border-bottom: 1px solid #e0dcd4;">
          <span>Base Imponible</span> <span style="font-weight: 600; color: #333;">${data.subtotal}</span>
        </div>
        ${data.urgencyMultiplier ? `
        <div style="display: flex; justify-content: space-between; padding: 6px 10px; font-size: 10px; color: #B8860B; background: #FFF8E1; border-bottom: 1px solid #e0dcd4;">
          <span style="font-weight: 600;">Multiplicador urgencia</span> <span style="font-weight: 700;">${data.urgencyMultiplier}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 6px 10px; font-size: 10px; color: #555; border-bottom: 1px solid #e0dcd4;">
          <span>IVA (21%)</span> <span style="font-weight: 600; color: #333;">${data.iva}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 10px; font-size: 14px; font-weight: 800; color: #8B6914; background: #f8f6f1; border: 1.5px solid #C9A84C; border-radius: 4px; margin-top: 6px; margin-bottom: 6px;">
          <span>TOTAL</span> <span>${data.total}</span>
        </div>
      </div>
    </div>

    ${data.notes ? `
    <div style="margin-top: 10px; background: #f8f6f1; border: 1px solid #e0dcd4; border-radius: 6px; padding: 10px;">
      <h4 style="color: #8B6914; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; font-weight: 700;">Método de Pago</h4>
      <p style="color: #555; font-size: 10px; line-height: 1.6; white-space: pre-wrap;">${data.notes}</p>
      <p style="color: #333; font-size: 10px; margin-top: 8px;">Cuenta bancaria (IBAN): <strong style="pointer-events: none; text-decoration: none; color: inherit;">ES91 2103<span></span> 7379<span></span> 4000<span></span> 3001<span></span> 0959</strong></p>
    </div>
    ` : ''}

    <!-- Signatures -->
    <div class="no-break" style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
      <div style="text-align: center;">
        <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 10px;">
          <p style="font-size: 8px; color: #bbb; text-transform: uppercase;">Sello o Firma del Prestador</p>
        </div>
        <div style="border-top: 1.5px solid #C9A84C; padding-top: 10px;">
          <p style="font-size: 11px; font-weight: 700; color: #222;">${data.signatureEmisor || 'Anton Shapoval'}</p>
          <p style="font-size: 9px; color: #8B6914; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">CableCore</p>
        </div>
      </div>
      <div style="text-align: center;">
        <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 10px;">
          <p style="font-size: 8px; color: #bbb; text-transform: uppercase;">Sello o Firma del Cliente</p>
        </div>
        <div style="border-top: 1.5px solid #C9A84C; padding-top: 10px;">
          <p style="font-size: 11px; font-weight: 700; color: #222;">${data.signatureClient || data.client.razonSocial}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 25px; padding-top: 15px; border-top: 2px solid #C9A84C; font-size: 10px; color: #666; text-align: center; line-height: 1.8;">
      <div>Operación exenta/sujeta a normativa del IVA español. Todos los precios incluyen euros (€).</div>
    </div>

  </div>
</body>
</html>`;
}

export function downloadInvoicePDF(data: InvoicePDFData): void {
    const html = generateInvoiceHTML(data);

    // Open printable window — must be called synchronously from user event
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permite los popups para descargar la factura.');
        return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-trigger print dialog after content loads
    printWindow.addEventListener('load', () => {
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 300);
    });
}
