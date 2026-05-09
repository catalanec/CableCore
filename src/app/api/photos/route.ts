import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function POST(req: NextRequest) {
      try {
                const formData = await req.formData();
                const file = formData.get('file') as File;
                const projectId = formData.get('project_id') as string;
                const caption = formData.get('caption') as string || '';
                if (!file || !projectId) {
                              return NextResponse.json({ success: false, error: 'file and project_id required' }, { status: 400 });
                }
                const ext = file.name.split('.').pop() || 'jpg';
                const fileName = `${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);
                const { error: uploadError } = await supabase.storage
                    .from('project-photos')
                    .upload(fileName, buffer, { contentType: file.type, upsert: false });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('project-photos').getPublicUrl(fileName);
                const { error: dbError } = await supabase.from('project_photos').insert({ project_id: projectId, url: publicUrl, path: fileName, caption });
                if (dbError) console.warn('project_photos table not found:', dbError.message);
                return NextResponse.json({ success: true, url: publicUrl, path: fileName });
      } catch (err: any) {
                return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
}

export async function GET(req: NextRequest) {
      try {
                const { searchParams } = new URL(req.url);
                const projectId = searchParams.get('project_id');
                if (!projectId) return NextResponse.json({ photos: [] });
                const { data, error } = await supabase.from('project_photos').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
                if (!error && data) return NextResponse.json({ photos: data });
                const { data: files } = await supabase.storage.from('project-photos').list(projectId, { limit: 50 });
                const photos = (files || []).map(f => ({
                              url: supabase.storage.from('project-photos').getPublicUrl(`${projectId}/${f.name}`).data.publicUrl,
                              path: `${projectId}/${f.name}`, caption: ''
                }));
                return NextResponse.json({ photos });
      } catch (err: any) {
                return NextResponse.json({ photos: [], error: err.message });
      }
}

export async function DELETE(req: NextRequest) {
      try {
                const { path, id } = await req.json();
                if (path) await supabase.storage.from('project-photos').remove([path]);
                if (id) await supabase.from('project_photos').delete().eq('id', id);
                return NextResponse.json({ success: true });
      } catch (err: any) {
                return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
}
