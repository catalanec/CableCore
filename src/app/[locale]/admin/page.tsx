import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
    const locale = useLocale();

    const labels: Record<string, { title: string; highlight: string; subtitle: string; label: string }> = {
        es: {
            title: 'Panel de',
            highlight: 'administración',
            subtitle: 'Gestiona presupuestos, leads, materiales y analiza el rendimiento de tu negocio.',
            label: 'Dashboard',
        },
        en: {
            title: 'Admin',
            highlight: 'Dashboard',
            subtitle: 'Manage quotes, leads, materials and analyze your business performance.',
            label: 'Dashboard',
        },
        ru: {
            title: 'Панель',
            highlight: 'управления',
            subtitle: 'Управляйте сметами, клиентами, материалами и анализируйте показатели бизнеса.',
            label: 'Dashboard',
        },
    };

    const l = labels[locale] || labels.es;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">
                <section className="py-12 lg:py-16">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <span className="section-label mx-auto">{l.label}</span>
                            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {l.title}{' '}
                                <span className="text-gradient-gold">{l.highlight}</span>
                            </h1>
                            <p className="text-brand-gold-muted leading-relaxed">{l.subtitle}</p>
                        </div>
                        <AdminDashboard />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
