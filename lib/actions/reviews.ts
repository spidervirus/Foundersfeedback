'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const submissionId = formData.get('submissionId') as string;
    const podId = formData.get('podId') as string;
    const q1 = formData.get('question1') as string;
    const q2 = formData.get('question2') as string;
    const q3 = formData.get('question3') as string;
    const q4 = formData.get('question4') as string;

    if (!submissionId || !podId || !q1 || !q2 || !q3 || !q4) {
        return { error: 'All fields are required' };
    }

    try {
        // 1. Insert review
        const { error: insertError } = await supabase
            .from('reviews')
            .insert({
                pod_id: podId,
                submission_id: submissionId,
                reviewer_id: user.id,
                question_1: q1,
                question_2: q2,
                question_3: q3,
                question_4: q4
            });

        if (insertError) throw insertError;

        // 2. The trigger `on_review_submitted` will handle incrementing `reviews_completed`
        // but typically triggers run *after* the transaction commits.
        // If we need immediate feedback, we might need to rely on client-side state or revalidation.

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error('Submit review error:', error);
        return { error: error.message || 'Failed to submit review' };
    }
}
