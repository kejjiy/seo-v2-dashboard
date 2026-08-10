import createClient from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BillingContent from './billing-content';

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get user's organization
    const { data: member } = await supabase
        .from('members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

    if (!member) {
        // Handle case where user has no org (should be handled by onboarding)
        return <div>No organization found.</div>;
    }

    return <BillingContent organizationId={member.organization_id} />;
}
