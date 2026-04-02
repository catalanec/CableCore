/* ═══════════════════════════════════════════
   Invoice Email Template — CableCore Brand
   Gold/White professional invoice email
   ═══════════════════════════════════════════ */

export interface InvoiceEmailData {
    clientName: string;
    quoteNumber: string;
    projectSummary: string;       // e.g. "Cableado Cat6, 150m, 12 puntos"
    totalAmount: number;           // Full project total
    paymentAmount: number;         // Amount for THIS payment
    paymentType: 'advance' | 'final';
    paymentUrl: string;            // Stripe checkout URL
    quoteViewUrl?: string;         // Link to view/download quote PDF
}

export function generateInvoiceEmailHTML(data: InvoiceEmailData): string {
    const isAdvance = data.paymentType === 'advance';
    const paymentLabel = isAdvance ? 'Anticipo (50%)' : 'Pago Final (50%)';
    const paymentDescription = isAdvance
        ? 'Para iniciar su proyecto, le solicitamos un anticipo del 50% destinado a la compra de materiales y equipamiento necesario.'
        : 'Su proyecto ha sido completado con éxito. Le enviamos la factura del 50% restante para finalizar el pago.';

    const stepInfo = isAdvance
        ? `<tr>
            <td style="padding: 12px 18px; background: #FFF8E1; border-left: 4px solid #C9A84C;">
              <span style="color: #8B6914; font-weight: 700; font-size: 13px;">📋 Etapas de pago:</span>
              <div style="margin-top: 8px; font-size: 13px; color: #555; line-height: 1.8;">
                <div>✅ <strong style="color: #8B6914;">Paso 1: Anticipo (50%)</strong> — ${data.paymentAmount.toFixed(2)}€ <span style="color: #C9A84C; font-size: 11px;">(este pago)</span></div>
                <div>⏳ <strong>Paso 2: Pago final (50%)</strong> — ${data.paymentAmount.toFixed(2)}€ <span style="color: #999; font-size: 11px;">(al finalizar)</span></div>
              </div>
            </td>
          </tr>`
        : `<tr>
            <td style="padding: 12px 18px; background: #E8F5E9; border-left: 4px solid #4CAF50;">
              <span style="color: #2E7D32; font-weight: 700; font-size: 13px;">✅ Estado del proyecto:</span>
              <div style="margin-top: 8px; font-size: 13px; color: #555; line-height: 1.8;">
                <div>✅ <strong>Paso 1: Anticipo (50%)</strong> — ${data.paymentAmount.toFixed(2)}€ <span style="color: #4CAF50; font-size: 11px;">(pagado)</span></div>
                <div>🔔 <strong style="color: #8B6914;">Paso 2: Pago final (50%)</strong> — ${data.paymentAmount.toFixed(2)}€ <span style="color: #C9A84C; font-size: 11px;">(este pago)</span></div>
              </div>
            </td>
          </tr>`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CableCore — ${paymentLabel}</title>
</head>
<body style="margin: 0; padding: 0; background: #1a1a1a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a1a; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%); padding: 30px; text-align: center; border-bottom: 3px solid #C9A84C;">
              <img src="https://cablecore.es/logocablecore.png" alt="CableCore" style="height: 70px; width: auto;" />
              <div style="color: #C9A84C; font-size: 11px; font-style: italic; margin-top: 6px; letter-spacing: 1px;">Conectamos tu negocio</div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <h1 style="color: #222; font-size: 22px; margin: 0 0 8px; font-weight: 700;">Estimado/a ${data.clientName},</h1>
              <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">
                ${paymentDescription}
              </p>
            </td>
          </tr>

          <!-- Project Summary -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f6f1; border: 2px solid #e0dcd4; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e0dcd4;">
                    <span style="color: #8B6914; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Resumen del Proyecto</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="color: #333; font-size: 14px; line-height: 1.6;">${data.projectSummary}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-top: 1px solid #e0dcd4;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #888; font-size: 13px;">Presupuesto Nº</td>
                        <td style="color: #333; font-size: 13px; text-align: right; font-weight: 600;">${data.quoteNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #888; font-size: 13px; padding-top: 6px;">Total del Proyecto</td>
                        <td style="color: #333; font-size: 13px; text-align: right; font-weight: 600; padding-top: 6px;">${data.totalAmount.toFixed(2)}€</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Steps -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden;">
                ${stepInfo}
              </table>
            </td>
          </tr>

          <!-- Payment Amount -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f6f1; border: 2px solid #C9A84C; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <div style="color: #8B6914; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px;">${paymentLabel}</div>
                    <div style="color: #8B6914; font-size: 36px; font-weight: 800;">${data.paymentAmount.toFixed(2)}€</div>
                    <div style="color: #999; font-size: 12px; margin-top: 4px;">IVA incluido</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 25px; text-align: center;">
              <a href="${data.paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C 0%, #8B6914 100%); color: #fff; font-size: 16px; font-weight: 700; padding: 16px 40px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(201,168,76,0.4);">
                💳 Pagar ${paymentLabel}
              </a>
              <div style="margin-top: 10px; color: #999; font-size: 11px;">Pago seguro procesado por Stripe</div>
            </td>
          </tr>

          ${data.quoteViewUrl ? `
          <!-- View Quote Link -->
          <tr>
            <td style="padding: 0 30px 25px; text-align: center;">
              <a href="${data.quoteViewUrl}" style="color: #8B6914; font-size: 13px; text-decoration: underline;">📄 Ver presupuesto completo</a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background: #1a1a1a; padding: 25px 30px; border-top: 3px solid #C9A84C;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #C9A84C; font-size: 13px; font-weight: 700;">CableCore</td>
                  <td style="color: #888; font-size: 12px; text-align: right;">Instalación profesional de redes</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 10px; color: #666; font-size: 11px; line-height: 1.8;">
                    📞 +34 605 974 605 · ✉️ info@cablecore.es<br>
                    📍 Carrer Vitor Balaguer 33, Badalona, 08914<br>
                    🌐 <a href="https://cablecore.es" style="color: #C9A84C; text-decoration: none;">cablecore.es</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateInvoiceEmailSubject(data: { paymentType: 'advance' | 'final'; quoteNumber: string }): string {
    return data.paymentType === 'advance'
        ? `CableCore — Anticipo Proyecto ${data.quoteNumber}`
        : `CableCore — Pago Final Proyecto ${data.quoteNumber}`;
}
