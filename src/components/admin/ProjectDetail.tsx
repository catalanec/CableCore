import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import TaskManager from './TaskManager';
import ActivityFeed from './ActivityFeed';
import { Building2, Calendar, MapPin, User, Phone, Mail, Clock, CheckCircle2, AlertCircle, ChevronRight, Plus } from 'lucide-react';

const STATUS_STYLES = {
      planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ProjectDetail = () => {
      const { id }  = useParams();
      const [project, setProject] = useState<any>(null);
      const [loading, setLoading] = useState(true);
      const [activities, setActivities] = useState<any[]>([]);
      const [tasks, setTasks] = useState<any[]>([]);

      useEffect(() => { if (id) fetchProjectData(); }, [id]);

      const fetchProjectData = async () => {
              setLoading(true);
              try {
                        const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
                        setProject(p);
                        const { data: a } = await supabase.from('activities').select('*').eq('project_id', id).order('created_at', { ascending: false });
                        setActivities(a
