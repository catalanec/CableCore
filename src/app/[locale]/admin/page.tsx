
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';

import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ params: { locale } }: { params: { locale: string } }) {


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

    let quotes: any[] = [];
    let leads: any[] = [];
    let materials: any[] = [];
    let projects: any[] = [];
    let tasks: any[] = [];
    let invoices: any[] = [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const [qRes, lRes, mRes, pRes, tRes, invRes] = await Promise.all([
            supabase.from('quotes').select('*').order('created_at', { ascending: false }),
            supabase.from('leads').select('*').order('created_at', { ascending: false }),
            supabase.from('materials').select('*').order('name', { ascending: true }),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('tasks').select('*').order('due_date', { ascending: true }),
            supabase.from('invoices').select('*').order('invoice_number', { ascending: false }),
        ]);

        quotes = qRes.data || [];
        leads = lRes.data || [];
        materials = mRes.data || [];
        projects = pRes.data || [];
        tasks = tRes.data || [];
        invoices = invRes.data || [];
    }

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">
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
                        <AdminDashboard 
                            initialQuotes={quotes} 
                            initialLeads={leads} 
                            initialMaterials={materials} 
                            initialProjects={projects}
                            initialTasks={tasks}
                            initialInvoices={invoices}
                        />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
