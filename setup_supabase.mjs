import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbokfnxtophjdtrafjai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2tmbnh0b3BoamR0cmFmamFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MjU5OCwiZXhwIjoyMDkwNjQ4NTk4fQ.F1J-OPiQgyyPt988Wr2LYHjAs1itGO02E7gK_dcwrHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
    console.log('Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        return;
    }
    
    const photosBucket = buckets.find(b => b.name === 'project-photos');
    if (!photosBucket) {
        console.log('Creating bucket "project-photos"...');
        const { error: createError } = await supabase.storage.createBucket('project-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
        });
        if (createError) console.error('Error creating bucket:', createError);
        else console.log('Bucket created successfully!');
    } else {
        console.log('Bucket "project-photos" already exists. Ensuring it is public...');
        const { error: updateError } = await supabase.storage.updateBucket('project-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 10485760
        });
        if (updateError) console.error('Error updating bucket:', updateError);
        else console.log('Bucket updated to public successfully!');
    }

    console.log('Checking table "project_photos"...');
    const { error: tableError } = await supabase.from('project_photos').select('id').limit(1);
    if (tableError) {
        console.error('Error accessing table "project_photos". It might not exist:', tableError.message);
        
        console.log('Attempting to create table via SQL...');
        // We can't run DDL via the standard JS client easily unless there's an RPC, 
        // but let's just log it.
        console.log('Please ensure the table is created in Supabase SQL editor.');
    } else {
        console.log('Table "project_photos" exists.');
    }
}

setupSupabase();
