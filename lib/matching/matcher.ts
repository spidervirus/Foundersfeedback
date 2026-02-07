import { createClient } from '@/lib/supabase/server';

export async function findMatch(submissionId: string) {
    const supabase = await createClient();

    // 1. Get the current submission details
    const { data: currentSubmission, error: subError } = await supabase
        .from('submissions')
        .select('id, stage, product_type, user_id')
        .eq('id', submissionId)
        .single();

    if (subError || !currentSubmission) {
        console.error('Error fetching submission:', subError);
        return { error: 'Submission not found' };
    }

    // 2. Find other PENDING submissions with matching criteria
    // For MVP: Simple match by stage, ignoring product type for broader pool
    const { data: candidates, error: candidateError } = await supabase
        .from('submissions')
        .select('id, user_id')
        .eq('status', 'analyzed') // 'analyzed' means ready for matching
        .eq('stage', currentSubmission.stage) // Match by stage (Pre-Revenue, Scaling, etc.)
        .neq('user_id', currentSubmission.user_id) // Don't match with self
        .limit(1); // We need 1 other to form a pod of 2 (MVP)

    if (candidateError) {
        console.error('Error finding candidates:', candidateError);
        return { error: 'Error finding candidates' };
    }

    // 3. Check if we have enough candidates to form a pod
    // MVP UPDATE: Allow pods of 2 for easier testing/bootstrapping
    if (candidates && candidates.length >= 1) {
        // FOUND A MATCH! Form a pod.
        const podMembers = [currentSubmission, ...candidates];

        // Transaction-like operations
        // A. Create Pod
        const { data: newPod, error: podError } = await supabase
            .from('review_pods')
            .insert({ status: 'active' })
            .select()
            .single();

        if (podError) return { error: 'Failed to create pod' };

        // B. Add Members
        const membershipData = podMembers.map(sub => ({
            pod_id: newPod.id,
            submission_id: sub.id,
            user_id: sub.user_id
        }));

        const { error: joinError } = await supabase
            .from('pod_members')
            .insert(membershipData);

        if (joinError) return { error: 'Failed to add members to pod' };

        // C. Update Submission Statuses
        const submissionIds = podMembers.map(m => m.id);
        await supabase
            .from('submissions')
            .update({ status: 'matched' })
            .in('id', submissionIds);

        return { success: true, podId: newPod.id, message: 'Pod created!' };
    }

    // No match found yet
    return { success: false, message: 'Added to waiting pool' };
}
