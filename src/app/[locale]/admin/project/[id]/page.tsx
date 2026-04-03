import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';
import ProjectDetail from '@/components/admin/ProjectDetail';

async function getProject(id: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [projectRes, activitiesRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('activities').select('*').eq('entity_type', 'project').eq('entity_id', id).order('created_at', { ascending: false }).limit(50),
        supabase.from('tasks').select('*').eq('entity_type', 'project').eq('entity_id', id).order('due_date', { ascending: true }),
    ]);

    return {
        project: projectRes.data,
        activities: activitiesRes.data || [],
        tasks: tasksRes.data || [],
    };
}

export default async function ProjectDetailPage({ params }: { params: { id: string; locale: string } }) {
    const { project, activities, tasks } = await getProject(params.id);
    if (!project) notFound();

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20 pb-16">
                <div className="container-custom max-w-5xl mx-auto">
                    <ProjectDetail
                        project={project}
                        activities={activities}
                        tasks={tasks}
                    />
                </div>
            </main>
        </>
    );
}
