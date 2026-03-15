import { useTranslations } from 'next-intl';
import Image from 'next/image';

const cities = [
    'Barcelona', 'Hospitalet', 'Badalona', 'Sabadell', 'Terrassa',
    'Mataró', 'Granollers', 'Cornellà', 'Sant Cugat', 'El Prat',
];

const services = [
    { key: 'home', label: 'Cableado doméstico' },
    { key: 'office', label: 'Redes de oficina' },
    { key: 'retail', label: 'Retail y comercio' },
    { key: 'business', label: 'Empresas y PYME' },
];

export default function Footer() {
    const t = useTranslations('footer');

    return (
        <footer className="bg-brand-dark border-t border-border-subtle relative z-10">
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Image
                                src="/logocablecore.png"
                                alt="CableCore"
                                width={36}
                                height={36}
                                className="w-9 h-9 object-contain"
                            />
                            <span className="font-heading font-bold text-lg text-white">
                                Cable<span className="text-brand-gold">Core</span>
                            </span>
                        </div>
                        <p className="text-sm text-brand-gold-muted leading-relaxed mb-4">
                            {t('desc')}
                        </p>
                        <p className="text-xs text-brand-gold-muted italic">
                            Conectamos tu negocio
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-heading font-semibold text-white mb-4">{t('services')}</h4>
                        <ul className="space-y-2.5">
                            {services.map((s) => (
                                <li key={s.key}>
                                    <a href="#services" className="text-sm text-brand-gold-muted hover:text-brand-gold transition-colors">
                                        {s.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Coverage */}
                    <div>
                        <h4 className="font-heading font-semibold text-white mb-4">{t('company')}</h4>
                        <ul className="space-y-2.5">
                            {cities.slice(0, 6).map((city) => (
                                <li key={city}>
                                    <span className="text-sm text-brand-gold-muted">{city}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading font-semibold text-white mb-4">{t('contactTitle')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="tel:+34605974605" className="flex items-center gap-2 text-sm text-brand-gold-muted hover:text-brand-gold transition-colors">
                                    📞 +34 605 974 605
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/34605974605" target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-brand-gold-muted hover:text-brand-gold transition-colors">
                                    💬 WhatsApp
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@cablecore.es" className="flex items-center gap-2 text-sm text-brand-gold-muted hover:text-brand-gold transition-colors">
                                    ✉️ info@cablecore.es
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-brand-gold-muted">
                                📍 Carrer Vitor Balaguer 33, Badalona, 08914
                            </li>
                            <li className="flex items-center gap-2 text-sm text-brand-gold-muted">
                                🕐 Lun–Sáb 9:00–19:00
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border-subtle">
                <div className="container-custom py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-brand-gold-muted">
                        © {new Date().getFullYear()} CableCore. {t('rights')}
                    </p>
                    <div className="flex gap-4 text-xs text-brand-gold-muted">
                        <a href="#" className="hover:text-brand-gold transition-colors">Política de privacidad</a>
                        <a href="#" className="hover:text-brand-gold transition-colors">Aviso legal</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
