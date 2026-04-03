'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => setVisible(true), 1500);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Aviso de cookies"
            style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                zIndex: 9998,
                padding: '16px 24px',
                background: 'rgba(15, 15, 18, 0.97)',
                borderTop: '1px solid rgba(201, 168, 76, 0.25)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                animation: 'slideUp 0.4s ease',
            }}
        >
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa', flex: 1, minWidth: '220px' }}>
                🍪 Usamos cookies para mejorar tu experiencia.{' '}
                <a
                    href="/es/privacidad"
                    style={{ color: '#C9A84C', textDecoration: 'underline' }}
                >
                    Política de privacidad
                </a>
            </p>

            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                <button
                    onClick={decline}
                    style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'transparent',
                        color: '#a1a1aa',
                        fontSize: '13px',
                        cursor: 'pointer',
                    }}
                >
                    Rechazar
                </button>
                <button
                    onClick={accept}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
}
