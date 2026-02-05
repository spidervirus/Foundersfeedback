import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findMatch } from '@/lib/matching/matcher';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { submissionId } = body;

        if (!submissionId) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
        }

        // Verify ownership
        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .select('user_id, status')
            .eq('id', submissionId)
            .single();

        if (subError || !submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        if (submission.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Attempt to find a match
        const result = await findMatch(submissionId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Matching API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to trigger matching' },
            { status: 500 }
        );
    }
}
