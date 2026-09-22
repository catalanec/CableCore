
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { Metadata } from 'next';

import { createAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

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

    // A missing service key used to fall back to the anon key, which RLS lets
    // insert but not read — an empty dashboard that looks like lost data. Let it
    // throw instead, and say so on screen.
    let loadError: string | null = null;
    try {
        const supabase = createAdminClient();
        
        const [qRes, lRes, mRes, pRes, tRes, invRes] = await Promise.all([
            supabase.from('quotes').select('*').order('created_at', { ascending: false }),
            supabase.from('leads').select('*').order('created_at', { ascending: false }),
            supabase.from('materials').select('*').order('name', { ascending: true }),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('tasks').select('*').order('due_date', { ascending: true }),
            supabase.from('invoices').select('*').order('invoice_number', { ascending: false }),
        ]);

        const failed = [qRes, lRes, mRes, pRes, tRes, invRes].find(r => r.error);
        if (failed?.error) throw new Error(failed.error.message);

        quotes = qRes.data || [];
        leads = lRes.data || [];
        materials = mRes.data || [];
        projects = pRes.data || [];
        tasks = tRes.data || [];
        invoices = invRes.data || [];
    } catch (e) {
        loadError = e instanceof Error ? e.message : String(e);
        console.error('[admin] failed to load CRM data:', loadError);
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
                        {loadError && (
                            <div className="mb-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                                <strong className="block mb-1">No se han podido cargar los datos del CRM.</strong>
                                <span className="opacity-80">{loadError}</span>
                                <span className="block mt-2 opacity-60">
                                    La lista aparece vacía por este error, no porque falten registros.
                                </span>
                            </div>
                        )}
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
