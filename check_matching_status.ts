
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Try .env.local first
dotenv.config(); // Fallback to .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatus() {
    console.log('Checking submissions...');

    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('id, user_id, stage, status, product_type, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching submissions:', error);
        return;
    }

    console.table(submissions);

    console.log('\nChecking pod members...');
    const { data: members, error: memberError } = await supabase
        .from('pod_members')
        .select('pod_id, user_id, submission_id');

    if (memberError) {
        console.error('Error fetching members:', memberError);
    } else {
        console.table(members);
    }
}

checkStatus();
