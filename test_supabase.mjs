import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://cbokfnxtophjdtrafjai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2tmbnh0b3BoamR0cmFmamFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MjU5OCwiZXhwIjoyMDkwNjQ4NTk4fQ.F1J-OPiQgyyPt988Wr2LYHjAs1itGO02E7gK_dcwrHA';

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
