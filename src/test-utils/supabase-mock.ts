import { vi } from 'vitest';

export type SupabaseResult<T = unknown> = { data: T | null; error: { message: string } | null };

/**
 * Chainable query-builder mock. Every method returns itself so any call
 * order (`.select().eq().order()`, `.update().eq()`, ...) type-checks and
 * resolves. Awaiting the builder directly, or calling `.single()` /
 * `.maybeSingle()`, both resolve to the same queued result — that result is
 * popped once per `.from(table)` call so sequential calls to the same table
 * within one function (select, then insert, then update) can return
 * different canned responses.
 */
function makeBuilder(result: SupabaseResult) {
    const builder: Record<string, unknown> = {};
    const chain = ['select', 'update', 'insert', 'delete', 'upsert', 'eq', 'neq', 'lt', 'gt', 'order', 'limit'];
    chain.forEach((method) => {
        builder[method] = vi.fn(() => builder);
    });
    builder.single = vi.fn(() => Promise.resolve(result));
    builder.maybeSingle = vi.fn(() => Promise.resolve(result));
    builder.then = (onFulfilled: (v: SupabaseResult) => unknown, onRejected?: (e: unknown) => unknown) =>
        Promise.resolve(result).then(onFulfilled, onRejected);
    return builder;
}

export interface SupabaseMockOptions {
    /** Per-table queue of responses. Each `.from(table)` call pops the next entry (last entry repeats). */
    tables?: Record<string, SupabaseResult[]>;
    rpc?: SupabaseResult;
}

/** What a mocked Storage bucket may answer — both the success and the failure
 *  shape, so a test can override either one. */
export type StorageResult = { error: { message: string } | null };
export type StorageList = { data: Array<{ name: string }>; error?: { message: string } | null };
export type StorageBucket = {
    upload: (...args: never[]) => Promise<StorageResult>;
    remove: (...args: never[]) => Promise<StorageResult>;
    list: (...args: never[]) => Promise<StorageList>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
};

export function createSupabaseMock({ tables = {}, rpc = { data: null, error: null } }: SupabaseMockOptions = {}) {
    const queues: Record<string, SupabaseResult[]> = Object.fromEntries(
        Object.entries(tables).map(([k, v]) => [k, [...v]])
    );

    const from = vi.fn((table: string) => {
        const queue = queues[table];
        const result: SupabaseResult = queue && queue.length > 0
            ? (queue.length > 1 ? queue.shift()! : queue[0])
            : { data: null, error: null };
        return makeBuilder(result);
    });

    // Typed rather than inferred from these happy-path defaults. Inference made
    // `error: null` and `data: never[]` the only shapes the bucket could ever
    // return, so a test that replaced storage.from to exercise a failing upload
    // or a non-empty listing — which is exactly what these mocks are for — did
    // not type-check against the object it was replacing.
    const storageUpload = vi.fn((): Promise<StorageResult> => Promise.resolve({ error: null }));
    const storageRemove = vi.fn((): Promise<StorageResult> => Promise.resolve({ error: null }));
    const storageList = vi.fn((): Promise<StorageList> => Promise.resolve({ data: [] }));
    const storageGetPublicUrl = vi.fn((path: string) => ({ data: { publicUrl: `https://mock.supabase.co/${path}` } }));

    return {
        from,
        rpc: vi.fn(() => Promise.resolve(rpc)),
        storage: {
            from: vi.fn((): StorageBucket => ({
                upload: storageUpload,
                remove: storageRemove,
                list: storageList,
                getPublicUrl: storageGetPublicUrl,
            })),
        },
    };
}
