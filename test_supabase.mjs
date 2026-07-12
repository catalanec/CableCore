import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL || 'https://cbokfnxtophjdtrafjai.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
    console.error('Set SUPABASE_SERVICE_ROLE_KEY in your environment before running this script.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to "project-photos"...');
    const dummyBuffer = Buffer.from('test image data');
    const fileName = `test/${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
        .from('project-photos')
        .upload(fileName, dummyBuffer, { contentType: 'text/plain' });
        
    if (error) {
        console.error('Upload Error:', error);
    } else {
        console.log('Upload Success:', data);
        const { data: { publicUrl } } = supabase.storage.from('project-photos').getPublicUrl(fileName);
        console.log('Public URL:', publicUrl);
    }
}

testUpload();
