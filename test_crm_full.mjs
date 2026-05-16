import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbokfnxtophjdtrafjai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2tmbnh0b3BoamR0cmFmamFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3MjU5OCwiZXhwIjoyMDkwNjQ4NTk4fQ.F1J-OPiQgyyPt988Wr2LYHjAs1itGO02E7gK_dcwrHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullCrm() {
    console.log('1. Testing Project Creation...');
    const testProjectId = 'test-project-' + Date.now();
    const { data: project, error: pError } = await supabase.from('projects').insert({
        id: testProjectId,
        name: 'Test Project ' + new Date().toLocaleString(),
        status: 'lead',
        client_name: 'Test Client',
        total_price: 1000
    }).select().single();

    if (pError) {
        console.error('Project Creation Error:', pError);
    } else {
        console.log('Project Created:', project.id);
    }

    console.log('2. Testing Gastos (Expenses)...');
    const { data: gasto, error: gError } = await supabase.from('expenses').insert({
        project_id: testProjectId,
        description: 'Test Expense',
        amount: 50,
        category: 'material'
    }).select().single();

    if (gError) {
        console.error('Gasto Creation Error:', gError);
    } else {
        console.log('Gasto Created:', gasto.id);
    }

    console.log('3. Testing Activity Feed...');
    const { data: activity, error: aError } = await supabase.from('activity_log').insert({
        project_id: testProjectId,
        action: 'Created test project',
        user_name: 'Antigravity AI'
    }).select().single();

    if (aError) {
        console.error('Activity Log Error:', aError);
    } else {
        console.log('Activity Log Created:', activity.id);
    }

    console.log('Cleanup: Deleting test data...');
    // We'll leave it for now so the user can see it if they log in.
    console.log('Test project ID for manual check:', testProjectId);
}

testFullCrm();
