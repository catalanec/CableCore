import { Metadata } from 'next';
import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { generatePageMetadata, getFAQJsonLd } from '@/lib/seo-metadata';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('precios', params.locale, '/precios');
}

const PRICES = [
    {
        category: 'Puntos de Red (por punto)',
        items: [
            { name: 'Cable Cat6 + roseta + crimpado', price: '95€', detail: 'El más demandado para oficinas' },
            { name: 'Cable Cat6A + roseta', price: '115€', detail: 'Para entornos de alta velocidad' },
            { name: 'Cable Cat7 + roseta blindada', price: '140€', detail: 'Máximo rendimiento 10 Gbps' },
        ],
    },
    {
        category: 'Tendido de Cable',
        items: [
            { name: 'Cable Cat6 por metro (sin canaleta)', price: '3€/m', detail: 'Tubo corrugado incluido' },
            { name: 'Canaleta decorativa (instalada)', price: '4€/m', detail: 'PVC blanco o gris' },
            { name: 'Empotrado en pared', price: '6€/m', detail: 'Con regata y yeso' },
        ],
    },
    {
        category: 'Instalación de Rack',
        items: [
            { name: 'Rack mural 6U', price: 'desde 180€', detail: 'Incluye montaje y patch panel' },
            { name: 'Rack mural 12U', price: 'desde 280€', detail: 'Para oficinas medianas' },
            { name: 'Rack suelo 24U', price: 'desde 450€', detail: 'Instalación completa' },
        ],
    },
    {
        category: 'Mano de Obra',
        items: [
            { name: 'Visita técnica', price: 'Gratis', detail: 'Presupuesto sin compromiso' },
            { name: 'Mano de obra (hora)', price: '35€/h', detail: 'Técnico cualificado' },
            { name: 'Desplazamiento Barcelona', price: 'Incluido', detail: 'Zona metropolitana' },
        ],
    },
];

const FAQS_ES = [
    {
        question: '¿Cuánto cuesta instalar un punto de red en Barcelona?',
        answer: 'El precio de instalación de un punto de red en Barcelona varía según el tipo de cable. Cat6 cuesta desde 95€/punto, Cat6A desde 115€/punto y Cat7 desde 140€/punto. El precio incluye cable, roseta RJ45, crimpado y comprobación de conexión. La mano de obra está incluida en el precio por punto.',
    },
    {
        question: '¿Qué incluye el precio de cableado estructurado?',
        answer: 'El precio incluye: suministro e instalación del cable (Cat6/Cat6A/Cat7), rosetas de red empotradas o de superficie, crimpado y terminación RJ45, verificación de cada punto de red, canaleta o tubo corrugado, y garantía de 5 años en mano de obra.',
    },
    {
        question: '¿Cuánto cuesta instalar 10 puntos de red en una oficina?',
        answer: 'Para una oficina estándar con 10 puntos de red Cat6, el coste aproximado es de 950€ a 1.200€ dependiendo de la complejidad (longitud del cableado, si se necesita rack, etc.). Solicita un presupuesto gratis y recibirás una oferta detallada en 24 horas.',
    },
    {
        question: '¿Ofrecéis presupuesto sin compromiso?',
        answer: 'Sí, ofrecemos visita técnica y presupuesto completamente gratuitos y sin compromiso. Contacta por WhatsApp (+34 605 974 605) o usa nuestra calculadora online para obtener una estimación instantánea.',
    },
    {
        question: '¿En qué zonas trabajáis?',
        answer: 'Trabajamos en toda el área metropolitana de Barcelona: Barcelona ciudad, Badalona, Hospitalet de Llobregat, Sabadell, Terrassa, Mataró, Cornellà, Sant Cugat y alrededores. El desplazamiento está incluido en el precio.',
    },
];

export default function PreciosPage() {
    const locale = useLocale();
    const faqJsonLd = getFAQJsonLd(FAQS_ES);
    const bcLabels: Record<string, { home: string; prices: string }> = {
        es: { home: 'Inicio', prices: 'Precios' },
        en: { home: 'Home', prices: 'Prices' },
        ru: { home: 'Главная', prices: 'Цены' },
    };
    const bc = bcLabels[locale] || bcLabels.es;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <Header />
            <main className="min-h-screen relative z-10 pt-20">
                <Breadcrumbs items={[
                    { label: bc.home, href: '/' },
                    { label: bc.prices },
                ]} />

                {/* HERO */}
                <section className="py-16 lg:py-24 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(201,168,76,0.07)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">Tarifas 2025</span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            Precio instalación{' '}
                            <span className="text-gradient-gold">cable de red</span>
                            {' '}Barcelona
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                            Precios transparentes con IVA incluido. Cat6, Cat6A y Cat7. Presupuesto gratis en 24h.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/calculator" className="btn-gold text-base px-8 py-4">
                                🧮 Calcular mi presupuesto
                            </Link>
                            <a href="tel:+34605974605" className="btn-outline text-base px-8 py-4">
                                📞 +34 605 974 605
                            </a>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* PRICE TABLES */}
                <section className="py-16 lg:py-24">
                    <div className="container-custom max-w-4xl mx-auto">
                        {PRICES.map((section, si) => (
                            <div key={si} className="mb-12">
                                <h2 className="font-heading text-2xl font-bold text-brand-gold mb-6">
                                    {section.category}
                                </h2>
                                <div className="card overflow-hidden">
                                    {section.items.map((item, ii) => (
                                        <div
                                            key={ii}
                                            className={`flex items-center justify-between px-6 py-4 ${ii < section.items.length - 1 ? 'border-b border-brand-gold/10' : ''}`}
                                        >
                                            <div>
                                                <div className="font-medium text-white">{item.name}</div>
                                                <div className="text-sm text-brand-gold-muted mt-0.5">{item.detail}</div>
                                            </div>
                                            <div className="text-brand-gold font-bold text-xl shrink-0 ml-4">
                                                {item.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Disclaimer */}
                        <p className="text-center text-brand-gold-muted text-sm mt-4">
                            * Precios orientativos con IVA incluido. El presupuesto final puede variar según la complejidad del proyecto.
                            <Link href="/calculator" className="text-brand-gold ml-1 underline">Usa la calculadora</Link> para una estimación precisa.
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* FAQ */}
                <section className="py-16 lg:py-24">
                    <div className="container-custom max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-12">
                            Preguntas{' '}
                            <span className="text-gradient-gold">frecuentes</span>
                        </h2>
                        <div className="space-y-4">
                            {FAQS_ES.map((faq, i) => (
                                <details key={i} className="card p-6 group" open={i === 0}>
                                    <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between gap-4">
                                        <span>{faq.question}</span>
                                        <span className="text-brand-gold text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                                    </summary>
                                    <p className="mt-4 text-brand-gold-muted leading-relaxed text-sm">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* CTA */}
                <section className="py-16 lg:py-20 text-center">
                    <div className="container-custom max-w-2xl mx-auto">
                        <h2 className="font-heading text-3xl font-bold mb-4">
                            ¿Listo para <span className="text-gradient-gold">tu presupuesto?</span>
                        </h2>
                        <p className="text-brand-gold-muted mb-8">
                            Visita técnica gratuita · Presupuesto en 24h · Sin compromiso
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contacto" className="btn-gold px-8 py-4">
                                Solicitar presupuesto gratis →
                            </Link>
                            <a href="https://wa.me/34605974605?text=Hola,%20quiero%20un%20presupuesto%20para%20instalaci%C3%B3n%20de%20red"
                                target="_blank" rel="noopener noreferrer" className="btn-outline px-8 py-4">
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
