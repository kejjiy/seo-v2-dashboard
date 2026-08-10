import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import createClient from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { priceId, organizationId } = await req.json();

        if (!priceId || !organizationId) {
            return new NextResponse('Missing priceId or organizationId', { status: 400 });
        }

        // Verify user belongs to organization
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single();

        if (!member) {
            return new NextResponse('Unauthorized access to organization', { status: 403 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: organizationId,
            success_url: `${appUrl}/dashboard?success=true`,
            cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
            metadata: {
                organizationId,
                userId: user.id,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
