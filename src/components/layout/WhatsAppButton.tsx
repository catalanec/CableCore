'use client';

import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '34605974605';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola CableCore 👋 Me interesa un presupuesto para instalación de red.');

export default function WhatsAppButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="whatsapp-float"
            onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'whatsapp_click', {
                        event_category: 'engagement',
                        event_label: 'floating_button',
                    });
                }
            }}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
        >
            {/* Pulse ring */}
            <span className="whatsapp-pulse" aria-hidden="true" />

            {/* WhatsApp SVG icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="32"
                height="32"
                fill="white"
                aria-hidden="true"
            >
                <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.737 5.49 2.027 7.8L0 32l8.418-2.01A15.94 15.94 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.064 22.208c-.332.938-1.647 1.717-2.716 1.94-.723.15-1.665.27-4.841-1.04-4.063-1.647-6.683-5.774-6.883-6.04-.193-.265-1.61-2.14-1.61-4.083 0-1.942 1.018-2.897 1.378-3.293.36-.396.784-.495 1.046-.495.26 0 .52.002.748.014.24.013.562-.09.88.671.332.79 1.127 2.733 1.226 2.934.1.2.166.435.033.7-.134.265-.2.43-.397.663-.198.232-.416.52-.595.698-.197.196-.402.409-.173.803.23.396 1.02 1.68 2.188 2.721 1.503 1.34 2.77 1.754 3.164 1.952.396.198.627.165.858-.1.232-.264.99-1.154 1.254-1.55.265-.396.53-.33.893-.198.364.133 2.31 1.09 2.707 1.287.396.198.66.297.76.462.099.165.099.957-.233 1.893z" />
            </svg>

            <style jsx>{`
                .whatsapp-float {
                    position: fixed;
                    bottom: 28px;
                    right: 28px;
                    z-index: 9999;
                    width: 60px;
                    height: 60px;
                    background: #25D366;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
                    cursor: pointer;
                    text-decoration: none;
                }
                .whatsapp-float:hover {
                    background: #1ebe5a;
                    transform: scale(1.08) !important;
                    box-shadow: 0 6px 28px rgba(37, 211, 102, 0.6);
                }
                .whatsapp-pulse {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: rgba(37, 211, 102, 0.4);
                    animation: wa-pulse 2.5s ease-out infinite;
                }
                @keyframes wa-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </a>
    );
}
