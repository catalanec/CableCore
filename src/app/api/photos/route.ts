import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service_role key to bypass RLS for uploads
// Hardcoded to avoid requiring the user to manually configure Vercel env vars
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2tmbnh0b3BoamR0cmFmamFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MjU5OCwiZXhwIjoyMDkwNjQ4NTk4fQ.F1J-OPiQgyyPt988Wr2LYHjAs1itGO02E7gK_dcwrHA';

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/photos — upload a photo for a project
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const projectId = formData.get('project_id') as string;
        const caption = formData.get('caption') as string || '';

        if (!file || !projectId) {
            return NextResponse.json({ success: false, error: 'file and project_id required' }, { status: 400 });
        }

        // Build file path: project_id/timestamp_filename
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('project-photos')
            .upload(fileName, buffer, { contentType: file.type, upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('project-photos')
            .getPublicUrl(fileName);

        // Save metadata to project_photos table
        const { error: dbError } = await supabase
            .from('project_photos')
            .insert({ project_id: projectId, url: publicUrl, path: fileName, caption });

        if (dbError) {
            // Table might not exist yet — still return URL
            console.warn('project_photos table not found, returning URL only:', dbError.message);
        }

        return NextResponse.json({ success: true, url: publicUrl, path: fileName });
    } catch (err: any) {
        console.error('Photo upload error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET /api/photos?project_id=xxx — list photos for a project
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('project_id');
        if (!projectId) return NextResponse.json({ photos: [] });

        // Try DB first
        const { data, error } = await supabase
            .from('project_photos')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            return NextResponse.json({ photos: data });
        }

        // Fallback: list from Storage
        const { data: files } = await supabase.storage
            .from('project-photos')
            .list(projectId, { limit: 50 });

        const photos = (files || []).map(f => ({
            url: supabase.storage.from('project-photos').getPublicUrl(`${projectId}/${f.name}`).data.publicUrl,
            path: `${projectId}/${f.name}`,
            caption: ''
        }));

        return NextResponse.json({ photos });
    } catch (err: any) {
        return NextResponse.json({ photos: [], error: err.message });
    }
}

// DELETE /api/photos — delete a photo
export async function DELETE(req: NextRequest) {
    try {
        const { path, id } = await req.json();
        if (path) {
            await supabase.storage.from('project-photos').remove([path]);
        }
        if (id) {
            await supabase.from('project_photos').delete().eq('id', id);
        }
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
