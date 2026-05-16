import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad — Presupuesto PRO',
    description: 'Política de privacidad de la aplicación Presupuesto PRO.',
    robots: 'noindex',
};

export default function PresupuestoPROPrivacidad() {
    return (
        <main style={{ fontFamily: 'Arial, sans-serif', maxWidth: 760, margin: '0 auto', padding: '40px 24px', color: '#222', lineHeight: 1.7 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🛡️ Política de Privacidad</h1>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 40 }}>Última actualización: mayo 2026 · Aplicación: <strong>Presupuesto PRO</strong></p>

            {[
                {
                    title: '1. RESPONSABLE DEL TRATAMIENTO',
                    body: 'Presupuesto PRO\nContacto: strannik07@gmail.com',
                },
                {
                    title: '2. DATOS QUE RECOPILAMOS',
                    body: '• Email y nombre (solo si creas una cuenta)\n• Presupuestos y datos de clientes introducidos por ti\n• Datos de uso anónimos para mejorar la aplicación\n• Datos de facturación en caso de suscripción PRO/Business',
                },
                {
                    title: '3. FINALIDAD DEL TRATAMIENTO',
                    body: '• Proporcionar el servicio de generación de presupuestos y facturas\n• Sincronizar tus datos en la nube (solo plan PRO/Business)\n• Mejora y desarrollo de la aplicación\n• Gestión de suscripciones',
                },
                {
                    title: '4. BASE LEGAL',
                    body: 'El tratamiento se basa en la ejecución del contrato de prestación del servicio y, en su caso, en tu consentimiento explícito.',
                },
                {
                    title: '5. ALMACENAMIENTO',
                    body: '• Plan Free: datos almacenados únicamente en tu dispositivo (offline)\n• Plan PRO/Business: sincronización cifrada mediante Supabase (servidores en la UE)\n• No vendemos ni cedemos tus datos a terceros',
                },
                {
                    title: '6. DERECHOS',
                    body: 'Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a strannik07@gmail.com. Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la aplicación.',
                },
                {
                    title: '7. COOKIES Y RASTREO',
                    body: 'La aplicación no utiliza cookies. Se pueden usar identificadores anónimos para análisis de uso agregado.',
                },
                {
                    title: '8. MENORES',
                    body: 'Este servicio no está dirigido a menores de 16 años.',
                },
                {
                    title: '9. CONTACTO',
                    body: 'strannik07@gmail.com',
                },
            ].map(({ title, body }) => (
                <section key={title} style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>{title}</h2>
                    <p style={{ color: '#444', whiteSpace: 'pre-line', fontSize: 14 }}>{body}</p>
                </section>
            ))}

            <hr style={{ margin: '40px 0', borderColor: '#eee' }} />
            <p style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>
                Presupuesto PRO · Todos los derechos reservados
            </p>
        </main>
    );
}
