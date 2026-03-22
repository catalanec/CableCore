import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'info@cablecore.es',
        pass: process.env.SMTP_PASS || '',
    },
});

interface LeadEmailData {
    name: string;
    phone: string;
    email: string;
    service?: string;
    message?: string;
    source: string;
}

interface QuoteEmailData {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    cableType: string;
    cableMeters: number;
    networkPoints: number;
    installationType: string;
    total: number;
    quoteNumber: string;
}

export async function sendLeadNotification(data: LeadEmailData) {
    if (!process.env.SMTP_PASS) {
        console.warn('SMTP_PASS not set, skipping email');
        return;
    }

    const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A84C; margin: 0;">CableCore</h1>
            <p style="color: #999; font-size: 14px;">Nueva solicitud de contacto</p>
        </div>
        <div style="background: #222; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A84C;">
            <h2 style="color: #C9A84C; font-size: 16px; margin-top: 0;">Datos del cliente</h2>
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Teléfono:</strong> <a href="tel:${data.phone}" style="color: #C9A84C;">${data.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #C9A84C;">${data.email}</a></p>
            ${data.service ? `<p><strong>Servicio:</strong> ${data.service}</p>` : ''}
            ${data.message ? `<p><strong>Mensaje:</strong> ${data.message}</p>` : ''}
            <p><strong>Origen:</strong> ${data.source}</p>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            Este email fue generado automáticamente por cablecore.es
        </p>
    </div>`;

    const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A84C; margin: 0;">CableCore</h1>
            <p style="color: #999; font-size: 14px;">Hemos recibido tu solicitud</p>
        </div>
        <div style="background: #222; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A84C;">
            <h2 style="color: #C9A84C; font-size: 16px; margin-top: 0;">Hola ${data.name},</h2>
            <p>Gracias por contactar con <strong>CableCore</strong>. Hemos recibido tu solicitud correctamente.</p>
            <p>Nuestro equipo técnico revisará los datos proporcionados y se pondrá en contacto contigo lo antes posible para ayudarte con tu proyecto.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #ccc;">¿Tu solicitud es urgente?</p>
            <a href="https://wa.me/34605974605" style="display: inline-block; background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                💬 Hablar por WhatsApp
            </a>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>CableCore — Instalación profesional de redes y fibra óptica en Barcelona</p>
            <p>📞 +34 605 974 605 | ✉️ info@cablecore.es</p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"CableCore" <${process.env.SMTP_USER || 'info@cablecore.es'}>`,
            to: process.env.SMTP_USER || 'info@cablecore.es',
            subject: `🔔 Nuevo lead: ${data.name} — ${data.service || 'Sin especificar'}`,
            html: adminHtml,
        });

        if (data.email) {
            await transporter.sendMail({
                from: `"CableCore" <${process.env.SMTP_USER || 'info@cablecore.es'}>`,
                to: data.email,
                subject: `Hemos recibido tu solicitud — CableCore`,
                html: clientHtml,
            });
        }
        
        console.log('Admin notification and client auto-responder emails sent');
    } catch (err) {
        console.error('Failed to send lead emails:', err);
    }
}

export async function sendQuoteNotification(data: QuoteEmailData) {
    if (!process.env.SMTP_PASS) {
        console.warn('SMTP_PASS not set, skipping email');
        return;
    }

    const from = `"CableCore" <${process.env.SMTP_USER || 'info@cablecore.es'}>`;

    // Email to admin
    const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A84C; margin: 0;">CableCore</h1>
            <p style="color: #999; font-size: 14px;">Nuevo presupuesto generado</p>
        </div>
        <div style="background: #222; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A84C;">
            <h2 style="color: #C9A84C; font-size: 16px; margin-top: 0;">Presupuesto ${data.quoteNumber}</h2>
            <p><strong>Cliente:</strong> ${data.clientName}</p>
            <p><strong>Teléfono:</strong> <a href="tel:${data.clientPhone}" style="color: #C9A84C;">${data.clientPhone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${data.clientEmail}" style="color: #C9A84C;">${data.clientEmail}</a></p>
            <hr style="border-color: #333;">
            <p><strong>Cable:</strong> ${data.cableType} — ${data.cableMeters}m</p>
            <p><strong>Puntos de red:</strong> ${data.networkPoints}</p>
            <p><strong>Instalación:</strong> ${data.installationType}</p>
            <hr style="border-color: #333;">
            <p style="font-size: 24px; color: #C9A84C; text-align: center; margin: 10px 0;">
                <strong>TOTAL: ${data.total.toFixed(2)}€</strong>
            </p>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            Este email fue generado automáticamente por cablecore.es
        </p>
    </div>`;

    // Email to client
    const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A84C; margin: 0;">CableCore</h1>
            <p style="color: #999; font-size: 14px;">Tu presupuesto de instalación</p>
        </div>
        <div style="background: #222; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A84C;">
            <h2 style="color: #C9A84C; font-size: 16px; margin-top: 0;">Hola ${data.clientName},</h2>
            <p>Gracias por utilizar nuestro calculador. Aquí tienes un resumen de tu presupuesto:</p>
            <hr style="border-color: #333;">
            <p><strong>Nº Presupuesto:</strong> ${data.quoteNumber}</p>
            <p><strong>Cable:</strong> ${data.cableType} — ${data.cableMeters}m</p>
            <p><strong>Puntos de red:</strong> ${data.networkPoints}</p>
            <p><strong>Tipo de instalación:</strong> ${data.installationType}</p>
            <hr style="border-color: #333;">
            <p style="font-size: 24px; color: #C9A84C; text-align: center; margin: 10px 0;">
                <strong>TOTAL: ${data.total.toFixed(2)}€</strong>
            </p>
            <p style="font-size: 13px; color: #999;">* IVA (21%) incluido. Este presupuesto es orientativo.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #ccc;">¿Quieres confirmar la instalación?</p>
            <a href="https://wa.me/34605974605" style="display: inline-block; background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                💬 Contactar por WhatsApp
            </a>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>CableCore — Instalación profesional de redes</p>
            <p>📞 +34 605 974 605 | ✉️ info@cablecore.es</p>
            <p>Carrer Vitor Balaguer 33, Badalona, 08914</p>
        </div>
    </div>`;

    try {
        // Send to admin
        await transporter.sendMail({
            from,
            to: process.env.SMTP_USER || 'info@cablecore.es',
            subject: `📋 Presupuesto ${data.quoteNumber}: ${data.clientName} — ${data.total.toFixed(2)}€`,
            html: adminHtml,
        });

        // Send to client
        await transporter.sendMail({
            from,
            to: data.clientEmail,
            subject: `Tu presupuesto CableCore — ${data.quoteNumber}`,
            html: clientHtml,
        });

        console.log('Quote notification emails sent');
    } catch (err) {
        console.error('Failed to send quote emails:', err);
    }
}
