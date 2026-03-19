import { Metadata } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Calculator from '@/components/calculator/Calculator';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('calculator', params.locale, '/calculator');
}

export default function CalculatorPage() {
    const locale = useLocale();

    const labels: Record<string, { title: string; highlight: string; subtitle: string; label: string }> = {
        es: {
            title: 'Calculadora de',
            highlight: 'instalación',
            subtitle: 'Calcula el coste estimado de tu instalación de red. Configura los detalles y obtén un presupuesto al instante.',
            label: 'Herramienta online',
        },
        en: {
            title: 'Installation',
            highlight: 'Calculator',
            subtitle: 'Estimate the cost of your network installation. Configure the details and get an instant quote.',
            label: 'Online tool',
        },
        ru: {
            title: 'Калькулятор',
            highlight: 'установки',
            subtitle: 'Рассчитайте стоимость монтажа сети. Укажите параметры и получите смету мгновенно.',
            label: 'Онлайн-инструмент',
        },
    };

    const l = labels[locale] || labels.es;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">
                <section className="py-16 lg:py-24">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="section-label mx-auto">{l.label}</span>
                            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {l.title}{' '}
                                <span className="text-gradient-gold">{l.highlight}</span>
                            </h1>
                            <p className="text-brand-gold-muted leading-relaxed">{l.subtitle}</p>
                        </div>
                        <Calculator locale={locale} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
