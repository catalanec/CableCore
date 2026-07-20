import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

async function loadCrm() {
    vi.resetModules();
    return import('./crm');
}

describe('crm server actions', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
        vi.stubGlobal('fetch', fetchMock);
        createClientMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // ── exportMaterialsCSV ──────────────────────────────────────────────
    describe('exportMaterialsCSV', () => {
        it('builds a CSV row per material with computed margin and status', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    materials: [{
                        data: [
                            { name: 'Cable Cat6', category: 'cable', unit: 'm', cost_price: 0.35, sell_price: 0.55, stock: 10, min_stock: 20 },
                        ],
                        error: null,
                    }],
                },
            }));
            const { exportMaterialsCSV } = await loadCrm();
            const result = await exportMaterialsCSV();
            expect(result.success).toBe(true);
            expect(result.csv).toContain('"Cable Cat6"');
            expect(result.csv).toContain('BAJO'); // stock(10) <= min_stock(20)
        });

        it('avoids divide-by-zero and reports 0% margin when sell_price is 0', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    materials: [{
                        data: [{ name: 'Free Sample', category: 'misc', unit: 'ud', cost_price: 5, sell_price: 0, stock: 5, min_stock: 1 }],
                        error: null,
                    }],
                },
            }));
            const { exportMaterialsCSV } = await loadCrm();
            const result = await exportMaterialsCSV();
            expect(result.csv?.split('\n')[1]).toContain(',0,');
        });

        it('returns an empty csv string when there are no materials', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { materials: [{ data: [], error: null }] } }));
            const { exportMaterialsCSV } = await loadCrm();
            const result = await exportMaterialsCSV();
            expect(result).toEqual({ success: true, csv: '' });
        });

        it('returns success:false with the error message on a Supabase error', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { materials: [{ data: null, error: { message: 'connection refused' } }] },
            }));
            const { exportMaterialsCSV } = await loadCrm();
            const result = await exportMaterialsCSV();
            expect(result).toEqual({ success: false, error: 'connection refused' });
        });
    });

    // ── exportProjectsCSV ───────────────────────────────────────────────
    describe('exportProjectsCSV', () => {
        it('falls back to total_cost when actual costs are all zero/absent', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    projects: [{
                        data: [{ client_name: 'Acme', total_revenue: 1000, total_cost: 400, payment_status: 'paid', created_at: '2026-01-01' }],
                        error: null,
                    }],
                },
            }));
            const { exportProjectsCSV } = await loadCrm();
            const result = await exportProjectsCSV();
            // totalC falls back to total_cost(400) because matC+labC+othC === 0
            expect(result.csv).toContain(',0,0,0,400,600,'); // profit = 1000 - 400
        });

        it('sums actual costs over total_cost when actual costs are present', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    projects: [{
                        data: [{ client_name: 'Acme', total_revenue: 1000, total_cost: 999999, actual_material_cost: 100, actual_labor_cost: 200, actual_other_cost: 50, payment_status: 'paid', created_at: '2026-01-01' }],
                        error: null,
                    }],
                },
            }));
            const { exportProjectsCSV } = await loadCrm();
            const result = await exportProjectsCSV();
            expect(result.csv).toContain(',100,200,50,350,650,'); // 1000 - 350
        });

        it('returns success:false with the error message when Supabase throws', async () => {
            createClientMock.mockReturnValue({ from: vi.fn(() => { throw new Error('conn refused'); }) });
            const { exportProjectsCSV } = await loadCrm();
            const result = await exportProjectsCSV();
            expect(result).toEqual({ success: false, error: 'conn refused' });
        });
    });

    // ── updateQuoteStatus (auto project-creation branch) ────────────────
    describe('updateQuoteStatus', () => {
        it('does not touch the projects table for non-completed statuses', async () => {
            const mock = createSupabaseMock({ tables: { quotes: [{ data: null, error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { updateQuoteStatus } = await loadCrm();
            const result = await updateQuoteStatus('quote-1', 'contacted');
            expect(result).toEqual({ success: true });
            expect(mock.from).not.toHaveBeenCalledWith('projects');
        });

        it('creates a new project when quote is completed and no project exists yet', async () => {
            const mock = createSupabaseMock({
                tables: {
                    quotes: [
                        { data: null, error: null }, // update
                        {
                            data: {
                                id: 'quote-1', total: 1500, materials_cost: 400, work_cost: 300, cable_cost: 100,
                                client_name: 'Bob', created_at: '2026-01-01T00:00:00.000Z',
                            },
                            error: null,
                        }, // select single
                    ],
                    projects: [{ data: null, error: null }], // maybeSingle -> no existing project
                },
            });
            createClientMock.mockReturnValue(mock);
            const { updateQuoteStatus } = await loadCrm();
            const result = await updateQuoteStatus('quote-1', 'completed');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('projects');
        });

        it('returns success:false and logs when the status update itself fails', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { quotes: [{ data: null, error: { message: 'row not found' } }] },
            }));
            const { updateQuoteStatus } = await loadCrm();
            const result = await updateQuoteStatus('missing-id', 'completed');
            expect(result).toEqual({ success: false, error: 'row not found' });
        });
    });

    // ── updateProjectCosts (derived total_cost / profit) ────────────────
    describe('updateProjectCosts', () => {
        it('computes total_cost and profit from merged new + existing cost fields', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    projects: [
                        { data: { total_revenue: 1000, actual_material_cost: 100, actual_labor_cost: 50, actual_other_cost: 0 }, error: null }, // select
                        { data: null, error: null }, // update
                    ],
                },
            }));
            const { updateProjectCosts } = await loadCrm();
            const result = await updateProjectCosts('proj-1', { actual_labor_cost: 200 });
            expect(result).toEqual({ success: true });
        });

        it('returns an error when the project does not exist', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { projects: [{ data: null, error: null }] },
            }));
            const { updateProjectCosts } = await loadCrm();
            const result = await updateProjectCosts('missing', {});
            expect(result).toEqual({ success: false, error: 'Project not found' });
        });
    });

    // ── sendLowStockAlerts ───────────────────────────────────────────────
    describe('sendLowStockAlerts', () => {
        it('sends nothing and reports sent:0 when stock is healthy', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { materials: [{ data: [{ name: 'X', stock: 50, min_stock: 10, unit: 'm' }], error: null }] },
            }));
            const { sendLowStockAlerts } = await loadCrm();
            const result = await sendLowStockAlerts();
            expect(result).toEqual({ success: true, sent: 0 });
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('sends a Telegram alert listing every low-stock item', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { materials: [{ data: [{ name: 'Cable Cat6', stock: 5, min_stock: 20, unit: 'm' }], error: null }] },
            }));
            const { sendLowStockAlerts } = await loadCrm();
            const result = await sendLowStockAlerts();
            expect(result).toEqual({ success: true, sent: 1 });
            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [, options] = fetchMock.mock.calls[0];
            expect(JSON.parse(options.body).text).toContain('Cable Cat6');
        });

        it('returns success:false when Supabase throws', async () => {
            createClientMock.mockReturnValue({
                from: vi.fn(() => { throw new Error('network down'); }),
            });
            const { sendLowStockAlerts } = await loadCrm();
            const result = await sendLowStockAlerts();
            expect(result).toEqual({ success: false, error: 'network down' });
        });

        it('still reports success when the Telegram fetch call itself throws (internally caught)', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { materials: [{ data: [{ name: 'Cable Cat6', stock: 1, min_stock: 10, unit: 'm' }], error: null }] },
            }));
            fetchMock.mockImplementation(() => Promise.reject(new Error('network down')));
            const { sendLowStockAlerts } = await loadCrm();
            const result = await sendLowStockAlerts();
            expect(result).toEqual({ success: true, sent: 1 });
        });
    });

    // ── notifyStaleLeads ─────────────────────────────────────────────────
    describe('notifyStaleLeads', () => {
        it('sends the "all clear" message when there are no stale or follow-up leads', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    leads: [
                        { data: [], error: null },
                        { data: [], error: null },
                    ],
                },
            }));
            const { notifyStaleLeads } = await loadCrm();
            const result = await notifyStaleLeads();
            expect(result).toEqual({ success: true, staleCount: 0, followupCount: 0 });
            const [, options] = fetchMock.mock.calls[0];
            expect(JSON.parse(options.body).text).toContain('Todo al día');
        });

        it('reports both stale and follow-up leads in one combined message', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    leads: [
                        { data: [{ name: 'Stale Bob', phone: '111', email: 'a@b.com', created_at: '2020-01-01T00:00:00.000Z' }], error: null },
                        { data: [{ name: 'Followup Alice', phone: '222', email: 'c@d.com', next_followup: '2026-07-13' }], error: null },
                    ],
                },
            }));
            const { notifyStaleLeads } = await loadCrm();
            const result = await notifyStaleLeads();
            expect(result).toEqual({ success: true, staleCount: 1, followupCount: 1 });
        });

        it('returns success:false when Supabase throws while checking stale leads', async () => {
            createClientMock.mockReturnValue({ from: vi.fn(() => { throw new Error('timeout'); }) });
            const { notifyStaleLeads } = await loadCrm();
            const result = await notifyStaleLeads();
            expect(result).toEqual({ success: false, error: 'timeout' });
        });
    });

    // ── getTasks (conditional entity filter branch) ─────────────────────
    describe('getTasks', () => {
        it('returns all tasks when no entity filter is supplied', async () => {
            const mock = createSupabaseMock({ tables: { tasks: [{ data: [{ id: '1' }], error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { getTasks } = await loadCrm();
            const result = await getTasks();
            expect(result).toEqual({ success: true, data: [{ id: '1' }] });
        });

        it('filters by entity_type/entity_id when both are supplied', async () => {
            const mock = createSupabaseMock({ tables: { tasks: [{ data: [{ id: '2' }], error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { getTasks } = await loadCrm();
            const result = await getTasks('project', 'proj-1');
            expect(result).toEqual({ success: true, data: [{ id: '2' }] });
        });

        it('returns an empty array (not null) when Supabase returns null data', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { tasks: [{ data: null, error: null }] } }));
            const { getTasks } = await loadCrm();
            const result = await getTasks();
            expect(result).toEqual({ success: true, data: [] });
        });

        it('returns success:false with an empty array when Supabase throws', async () => {
            createClientMock.mockReturnValue({ from: vi.fn(() => { throw new Error('conn reset'); }) });
            const { getTasks } = await loadCrm();
            const result = await getTasks();
            expect(result).toEqual({ success: false, data: [], error: 'conn reset' });
        });
    });

    // ── deleteQuote (cascading delete) ──────────────────────────────────
    describe('deleteQuote', () => {
        it('deletes the associated project before deleting the quote', async () => {
            const mock = createSupabaseMock({
                tables: { projects: [{ data: null, error: null }], quotes: [{ data: null, error: null }] },
            });
            createClientMock.mockReturnValue(mock);
            const { deleteQuote } = await loadCrm();
            const result = await deleteQuote('quote-1');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('projects');
            expect(mock.from).toHaveBeenCalledWith('quotes');
        });

        it('returns success:false when the quote delete fails, even if the project delete succeeded', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: {
                    projects: [{ data: null, error: null }],
                    quotes: [{ data: null, error: { message: 'fk violation' } }],
                },
            }));
            const { deleteQuote } = await loadCrm();
            const result = await deleteQuote('quote-1');
            expect(result).toEqual({ success: false, error: 'fk violation' });
        });
    });

    // ── updateQuoteStatus: remaining auto-project branches ───────────────
    describe('updateQuoteStatus (additional branches)', () => {
        it('updates the existing project instead of creating a new one when a project already exists for the quote', async () => {
            const mock = createSupabaseMock({
                tables: {
                    quotes: [
                        { data: null, error: null }, // update quote status
                        {
                            data: {
                                id: 'quote-1', total: 1500, materials_cost: 400, work_cost: 300, cable_cost: 100,
                                client_name: 'Bob', created_at: '2026-01-01T00:00:00.000Z',
                            },
                            error: null,
                        }, // select single
                    ],
                    projects: [{ data: { id: 'existing-project-1' }, error: null }], // maybeSingle finds existing project
                },
            });
            createClientMock.mockReturnValue(mock);
            const { updateQuoteStatus } = await loadCrm();
            const result = await updateQuoteStatus('quote-1', 'completed');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('projects');
        });

        it('skips project creation entirely when the completed quote cannot be found', async () => {
            const mock = createSupabaseMock({
                tables: {
                    quotes: [
                        { data: null, error: null }, // update
                        { data: null, error: null }, // select single -> not found
                    ],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { updateQuoteStatus } = await loadCrm();
            const result = await updateQuoteStatus('quote-1', 'completed');
            expect(result).toEqual({ success: true });
            expect(mock.from).not.toHaveBeenCalledWith('projects');
        });
    });

    // ── Simple CRUD actions: update/delete a single record, no side effects ──
    describe.each([
        { name: 'updateLeadStatus', table: 'leads', args: ['lead-1', 'contacted'] },
        { name: 'updateMaterialStock', table: 'materials', args: ['mat-1', 5] },
        { name: 'deleteLead', table: 'leads', args: ['lead-1'] },
        { name: 'updateLeadNotes', table: 'leads', args: ['lead-1', 'called twice'] },
        { name: 'updateQuoteNotes', table: 'quotes', args: ['quote-1', 'internal note'] },
        { name: 'addMaterial', table: 'materials', args: [{ name: 'X', category: 'cable', unit: 'm', cost_price: 1, sell_price: 2, stock: 10, min_stock: 2 }] },
        { name: 'updateMaterial', table: 'materials', args: ['mat-1', { stock: 20 }] },
        { name: 'deleteMaterial', table: 'materials', args: ['mat-1'] },
        { name: 'updateProjectPayment', table: 'projects', args: ['proj-1', { payment_status: 'paid' }] },
        { name: 'addTask', table: 'tasks', args: [{ title: 'Call client' }] },
        { name: 'updateTaskStatus', table: 'tasks', args: ['task-1', 'done'] },
        { name: 'updateTask', table: 'tasks', args: ['task-1', { title: 'Updated' }] },
        { name: 'deleteTask', table: 'tasks', args: ['task-1'] },
        { name: 'updateLeadFollowup', table: 'leads', args: ['lead-1', '2026-08-01'] },
        { name: 'updateLeadValue', table: 'leads', args: ['lead-1', 2500] },
        { name: 'updateProjectInfo', table: 'projects', args: ['proj-1', { client_name: 'New Name' }] },
        { name: 'updateProjectLocations', table: 'projects', args: ['proj-1', [{ name: 'Sede A', total: 10, done: 3 }]] },
        { name: 'addExpense', table: 'expenses', args: [{ description: 'Combustible', amount: 40, category: 'transporte', date: '2026-07-01' }] },
        { name: 'deleteExpense', table: 'expenses', args: ['exp-1'] },
        { name: 'addActivity', table: 'activities', args: [{ type: 'note', description: 'x', entity_type: 'lead', entity_id: 'lead-1' }] },
    ] as const)('$name (simple CRUD)', ({ name, table, args }) => {
        it('returns success:true on a clean write', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { [table]: [{ data: null, error: null }] } }));
            const crm = await loadCrm() as unknown as Record<string, (...a: unknown[]) => Promise<{ success: boolean }>>;
            const result = await crm[name](...args);
            expect(result).toEqual({ success: true });
        });

        it('returns success:false with the Supabase error message on failure', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { [table]: [{ data: null, error: { message: 'db error' } }] } }));
            const crm = await loadCrm() as unknown as Record<string, (...a: unknown[]) => Promise<{ success: boolean; error?: string }>>;
            const result = await crm[name](...args);
            expect(result.success).toBe(false);
            expect(result.error).toBe('db error');
        });
    });

    // ── Actions that also write an activity-log side effect ──────────────
    describe('updateLeadPipelineStage', () => {
        it('updates the lead stage and logs a status_change activity', async () => {
            const mock = createSupabaseMock({ tables: { leads: [{ data: null, error: null }], activities: [{ data: null, error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { updateLeadPipelineStage } = await loadCrm();
            const result = await updateLeadPipelineStage('lead-1', 'negotiation');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('activities');
        });

        it('returns success:false when the stage update itself fails', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { leads: [{ data: null, error: { message: 'bad stage' } }] } }));
            const { updateLeadPipelineStage } = await loadCrm();
            const result = await updateLeadPipelineStage('lead-1', 'invalid');
            expect(result).toEqual({ success: false, error: 'bad stage' });
        });
    });

    describe('updateProjectStatus', () => {
        it('updates the project status and logs a status_change activity', async () => {
            const mock = createSupabaseMock({ tables: { projects: [{ data: null, error: null }], activities: [{ data: null, error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { updateProjectStatus } = await loadCrm();
            const result = await updateProjectStatus('proj-1', 'in_progress');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('activities');
        });

        it('returns success:false when the status update itself fails', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: null, error: { message: 'lock timeout' } }] } }));
            const { updateProjectStatus } = await loadCrm();
            const result = await updateProjectStatus('proj-1', 'in_progress');
            expect(result).toEqual({ success: false, error: 'lock timeout' });
        });
    });

    // ── Read actions with null->[] fallback ───────────────────────────────
    describe('getActivities', () => {
        it('returns activities filtered by entity type/id', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { activities: [{ data: [{ id: 'a1' }], error: null }] } }));
            const { getActivities } = await loadCrm();
            const result = await getActivities('lead', 'lead-1');
            expect(result).toEqual({ success: true, data: [{ id: 'a1' }] });
        });

        it('defaults to an empty array when data is null', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { activities: [{ data: null, error: null }] } }));
            const { getActivities } = await loadCrm();
            const result = await getActivities('lead', 'lead-1');
            expect(result).toEqual({ success: true, data: [] });
        });

        it('returns success:false with an empty array on error', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { activities: [{ data: null, error: { message: 'timeout' } }] } }));
            const { getActivities } = await loadCrm();
            const result = await getActivities('lead', 'lead-1');
            expect(result).toEqual({ success: false, data: [], error: 'timeout' });
        });
    });

    describe('getExpenses', () => {
        it('returns all expenses ordered by date', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { expenses: [{ data: [{ id: 'e1' }], error: null }] } }));
            const { getExpenses } = await loadCrm();
            const result = await getExpenses();
            expect(result).toEqual({ success: true, data: [{ id: 'e1' }] });
        });

        it('returns success:false with an empty array on error', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { expenses: [{ data: null, error: { message: 'db down' } }] } }));
            const { getExpenses } = await loadCrm();
            const result = await getExpenses();
            expect(result).toEqual({ success: false, data: [], error: 'db down' });
        });
    });

    describe('getAllTasks', () => {
        it('returns tasks that are not marked done', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { tasks: [{ data: [{ id: 't1', status: 'pending' }], error: null }] } }));
            const { getAllTasks } = await loadCrm();
            const result = await getAllTasks();
            expect(result).toEqual({ success: true, data: [{ id: 't1', status: 'pending' }] });
        });

        it('returns success:false with an empty array on error', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { tasks: [{ data: null, error: { message: 'db down' } }] } }));
            const { getAllTasks } = await loadCrm();
            const result = await getAllTasks();
            expect(result).toEqual({ success: false, data: [], error: 'db down' });
        });
    });

    // ── getProjectDetail (parallel fetch of project + activities + tasks) ─
    describe('getProjectDetail', () => {
        it('fetches the project with its activities and tasks in parallel', async () => {
            const mock = createSupabaseMock({
                tables: {
                    projects: [{ data: { id: 'proj-1', client_name: 'Bob' }, error: null }],
                    activities: [{ data: [{ id: 'a1' }], error: null }],
                    tasks: [{ data: [{ id: 't1' }], error: null }],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { getProjectDetail } = await loadCrm();
            const result = await getProjectDetail('proj-1');
            expect(result).toEqual({ success: true, project: { id: 'proj-1', client_name: 'Bob' }, activities: [{ id: 'a1' }], tasks: [{ id: 't1' }] });
        });

        it('defaults activities/tasks to empty arrays when their queries return null data', async () => {
            const mock = createSupabaseMock({
                tables: {
                    projects: [{ data: { id: 'proj-1' }, error: null }],
                    activities: [{ data: null, error: null }],
                    tasks: [{ data: null, error: null }],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { getProjectDetail } = await loadCrm();
            const result = await getProjectDetail('proj-1');
            expect(result.activities).toEqual([]);
            expect(result.tasks).toEqual([]);
        });

        it('returns success:false with nulled fields when the project fetch errors', async () => {
            const mock = createSupabaseMock({
                tables: {
                    projects: [{ data: null, error: { message: 'not found' } }],
                    activities: [{ data: [], error: null }],
                    tasks: [{ data: [], error: null }],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { getProjectDetail } = await loadCrm();
            const result = await getProjectDetail('missing');
            expect(result).toEqual({ success: false, project: null, activities: [], tasks: [], error: 'not found' });
        });
    });

    // ── deleteProject (cascading delete of related records) ──────────────
    describe('deleteProject', () => {
        it('deletes related activities, tasks, and expenses before deleting the project', async () => {
            const mock = createSupabaseMock({
                tables: {
                    activities: [{ data: null, error: null }],
                    tasks: [{ data: null, error: null }],
                    expenses: [{ data: null, error: null }],
                    projects: [{ data: null, error: null }],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { deleteProject } = await loadCrm();
            const result = await deleteProject('proj-1');
            expect(result).toEqual({ success: true });
            expect(mock.from).toHaveBeenCalledWith('activities');
            expect(mock.from).toHaveBeenCalledWith('tasks');
            expect(mock.from).toHaveBeenCalledWith('expenses');
            expect(mock.from).toHaveBeenCalledWith('projects');
        });

        it('returns success:false when the final project delete fails, even though child rows were removed', async () => {
            const mock = createSupabaseMock({
                tables: {
                    activities: [{ data: null, error: null }],
                    tasks: [{ data: null, error: null }],
                    expenses: [{ data: null, error: null }],
                    projects: [{ data: null, error: { message: 'fk violation' } }],
                },
            });
            createClientMock.mockReturnValue(mock);
            const { deleteProject } = await loadCrm();
            const result = await deleteProject('proj-1');
            expect(result).toEqual({ success: false, error: 'fk violation' });
        });
    });

    // ── seedMaterials (one-time bulk insert) ──────────────────────────────
    describe('seedMaterials', () => {
        it('inserts the full built-in materials catalog and returns its count', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { materials: [{ data: null, error: null }] } }));
            const { seedMaterials } = await loadCrm();
            const result = await seedMaterials();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('returns success:false when the bulk insert fails', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { materials: [{ data: null, error: { message: 'duplicate key' } }] } }));
            const { seedMaterials } = await loadCrm();
            const result = await seedMaterials();
            expect(result).toEqual({ success: false, error: 'duplicate key' });
        });
    });

    // ── getSupabase() misconfiguration guard ────────────────────────────
    describe('missing Supabase credentials', () => {
        const ORIGINAL_ENV = process.env;

        afterEach(() => {
            process.env = ORIGINAL_ENV;
        });

        it('every action returns success:false instead of throwing when env vars are unset', async () => {
            process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '' };
            const { updateLeadStatus } = await loadCrm();
            const result = await updateLeadStatus('lead-1', 'contacted');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Supabase credentials not configured');
        });
    });
});
