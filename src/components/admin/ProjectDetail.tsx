import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TaskManager from './TaskManager';
import ActivityFeed from './ActivityFeed';
import { 
        MapPin, 
        ChevronRight,
        ArrowLeft
} from 'lucide-react';

const STATUS_STYLES = {
        planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ProjectDetail = () => {
        const { id } = useParams();
        const [project, setProject] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [activities, setActivities] = useState<any[]>([]);
        const [tasks, setTasks] = useState<any[]>([]);

        useEffect(() => {
                  if (id) {
                              fetchProjectData();
                  }
        }, [id]);

        const fetchProjectData = async () => {
                  setLoading(true);
                  try {
                              const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
                              setProject(p);

                    const { data: a } = await supabase.from('activities').select('*').eq('project_id', id).order('created_at', { ascending: false });
                              setActivities(a || []);

                    const { data: t } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false });
                              setTasks(t || []);
                  } catch (e) {
                              console.error(e);
                  } finally {
                              setLoading(false);
                  }
        };

        if (loading) return (
                  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>div>
      </div>div>
                );
      
        if (!project) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Project not found</div>div>;
      
        return (
                  <div className="min-h-screen bg-slate-950 text-slate-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                <Link to="/admin/pipeline" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                                          <ArrowLeft className="w-4 h-4" />
                                          Back to Pipeline
                                </Link>Link>
                        
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                    <div className="lg:col-span-2 space-y-8">
                                                                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                                                                              <div className="flex justify-between items-start mb-6">
                                                                                              <div>
                                                                                                                      <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>h1>
                                                                                                                <div className="flex items-center gap-4 text-slate-400">
                                                                                                                                    <div className="flex items-center gap-1.5">
                                                                                                                                                          <MapPin className="w-4 h-4" />
                                                                                                                                          {project.address}
                                                                                                                                          </div>div>
                                                                                                                      </div>div>
                                                                                                    </div>div>
                                                                                              <div className={`px-2.5 py-0.5 rounded-full text-xs border ${STATUS_STYLES[project.status as keyof typeof STATUS_STYLES]}`}>
                                                                                                    {project.status?.replace('_', ' ').toUpperCase()}
                                                                                                    </div>div>
                                                                              </div>div>
                                                                
                                                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-800/50">
                                                                                              <div>
                                                                                                                <div className="text-sm text-slate-500 mb-1">Client</div>div>
                                                                                                                <div className="text-white font-medium">{project.client_name}</div>div>
                                                                                                    </div>div>
                                                                                              <div>
                                                                                                                <div className="text-sm text-slate-500 mb-1">Start Date</div>div>
                                                                                                                <div className="text-white font-medium">{new Date(project.created_at).toLocaleDateString()}</div>div>
                                                                                                    </div>div>
                                                                                              <div>
                                                                                                                <div className="text-sm text-slate-500 mb-1">Type</div>div>
                                                                                                                <div className="text-white font-medium">{project.type || 'N/A'}</div>div>
                                                                                                    </div>div>
                                                                                              <div>
                                                                                                                <div className="text-sm text-slate-500 mb-1">Value</div>div>
                                                                                                                <div className="text-white font-medium">${project.value?.toLocaleString() || '0'}</div>div>
                                                                                                    </div>div>
                                                                              </div>div>
                                                                
                                                                              <TaskManager tasks={tasks} projectId={id!} onTaskUpdate={fetchProjectData} />
                                                                </div>div>
                                                    </div>div>
                                
                                          <div className="space-y-8">
                                                      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                                                                    <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>h2>
                                                       </h1>
