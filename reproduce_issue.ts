
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Sign up a temp user
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'testpassword123';

    console.log(`Signing up user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('User not created');
        return;
    }

    console.log('User created:', user.id);

    // 2. Insert profile (if trigger doesn't do it / just to be safe)
    // The trigger should handle it, but let's wait a bit or just proceed.


    // 3. Read existing submissions to see valid values
    console.log('Reading existing submissions...');
    const { data: existing, error: readError } = await supabase
        .from('submissions')
        .select('stage')
        .limit(5);

    if (readError) {
        console.error('Error reading submissions:', readError);
    } else {
        console.log('Existing stages:', existing);
    }

    /*
    const potentialValues = [
      'just-an-idea',
      'Just an idea',
      'idea',
      'building-mvp',
      'Building MVP',
      'mvp',
      'launched-no-users',
      'Launched, no users',
      'some-users',
      'Some users, no revenue',
      'revenue',
      'Revenue'
    ];
  
    for (const val of potentialValues) {
        console.log(`Attempting insert with stage: "${val}"`);
        const { data, error } = await supabase
            .from('submissions')
            .insert({
                user_id: user.id,
                landing_page_url: 'https://example.com',
                target_customer: 'Testers',
                value_prop: 'Testing constraints',
                stage: val,
                status: 'analyzed',
                input_data: { test: true }
            })
            .select()
            .single();
  
        if (error) {
            console.log(`Failed for "${val}": ${error.message}`);
        } else {
            console.log(`SUCCESS for "${val}"`);
        }
    }
    */
}

run();
