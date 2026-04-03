'use client';

import { useState } from 'react';
import { addTask, updateTaskStatus, deleteTask } from '@/app/actions/crm';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    entity_type?: string;
    entity_id?: string;
    created_at: string;
}

interface TaskManagerProps {
    tasks: Task[];
    entityType?: string;
    entityId?: string;
    compact?: boolean;
}

const PRIORITY_STYLES: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

const PRIORITY_ICONS: Record<string, string> = {
    high: '🔴',
    medium: '🟡',
    low: '⚪',
};

function isOverdue(dateStr?: string) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const today = new Date(new Date().toDateString());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (d.getTime() === today.getTime()) return 'Hoy';
    if (d.getTime() === tomorrow.getTime()) return 'Mañana';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function TaskManager({ tasks: initialTasks, entityType, entityId, compact = false }: TaskManagerProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newDueDate, setNewDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');

    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const visibleTasks = filter === 'all' ? tasks : filter === 'done' ? doneTasks : pendingTasks;

    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        setLoading(true);
        try {
            await addTask({
                title: newTitle,
                priority: newPriority,
                due_date: newDueDate || undefined,
                entity_type: entityType,
                entity_id: entityId,
            });
            const newTask: Task = {
                id: Date.now().toString(),
                title: newTitle,
                priority: newPriority,
                due_date: newDueDate || undefined,
                status: 'pending',
                created_at: new Date().toISOString(),
            };
            setTasks([...tasks, newTask]);
            setNewTitle('');
            setNewDueDate('');
            setNewPriority('medium');
            setShowForm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (task: Task) => {
        const newStatus = task.status === 'done' ? 'pending' : 'done';
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        await updateTaskStatus(task.id, newStatus);
    };

    const handleDelete = async (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
        await deleteTask(id);
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            {!compact && (
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {(['pending', 'all', 'done'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs rounded-lg transition-all ${filter === f
                                    ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30'
                                    : 'text-brand-gold-muted hover:text-white'
                                }`}
                            >
                                {f === 'pending' ? `Pendientes (${pendingTasks.length})` : f === 'done' ? `Hechas (${doneTasks.length})` : 'Todas'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-3 py-1 text-xs rounded-lg bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/20 transition-all"
                    >
                        + Tarea
                    </button>
                </div>
            )}

            {/* Add task form */}
            {showForm && (
                <div className="card p-4 border-brand-gold/20 space-y-3">
                    <input
                        autoFocus
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder="Título de la tarea..."
                        className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {/* Priority */}
                        <div className="flex gap-1">
                            {['high', 'medium', 'low'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setNewPriority(p)}
                                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${newPriority === p
                                        ? PRIORITY_STYLES[p]
                                        : 'text-brand-gold-muted border-border-subtle'
                                    }`}
                                >
                                    {PRIORITY_ICONS[p]} {p}
                                </button>
                            ))}
                        </div>
                        {/* Due date */}
                        <input
                            type="date"
                            value={newDueDate}
                            onChange={e => setNewDueDate(e.target.value)}
                            className="bg-brand-dark border border-border-subtle rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={loading || !newTitle.trim()}
                            className="btn-gold px-4 py-1.5 text-xs disabled:opacity-50"
                        >
                            {loading ? '...' : 'Añadir'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-brand-gold-muted hover:text-white transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Compact add button */}
            {compact && (
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs text-brand-gold hover:text-brand-gold/80 transition-colors"
                >
                    + Añadir tarea
                </button>
            )}

            {/* Task list */}
            <div className="space-y-1.5">
                {visibleTasks.length === 0 && (
                    <div className="text-center py-6 text-brand-gold-muted text-xs">
                        {filter === 'done' ? 'No hay tareas completadas' : 'No hay tareas pendientes 🎉'}
                    </div>
                )}
                {visibleTasks.map(task => (
                    <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all group ${
                            task.status === 'done'
                                ? 'bg-surface-card/30 border-border-subtle opacity-60'
                                : isOverdue(task.due_date)
                                    ? 'bg-red-400/5 border-red-400/20'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/20'
                        }`}
                    >
                        {/* Checkbox */}
                        <button
                            onClick={() => handleToggle(task)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                task.status === 'done'
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'border-border-subtle hover:border-brand-gold/50'
                            }`}
                        >
                            {task.status === 'done' && <span className="text-[10px]">✓</span>}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium leading-tight ${task.status === 'done' ? 'line-through text-brand-gold-muted' : 'text-white'}`}>
                                {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
                                    {PRIORITY_ICONS[task.priority]} {task.priority}
                                </span>
                                {task.due_date && (
                                    <span className={`text-[10px] ${isOverdue(task.due_date) && task.status !== 'done' ? 'text-red-400' : 'text-brand-gold-muted'}`}>
                                        📅 {formatDate(task.due_date)} {isOverdue(task.due_date) && task.status !== 'done' ? '⚠️' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Delete */}
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all text-xs px-1"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
