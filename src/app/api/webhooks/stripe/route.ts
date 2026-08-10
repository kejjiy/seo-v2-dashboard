import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    const session = event.data.object as { client_reference_id?: string };

    if (event.type === 'checkout.session.completed') {
        const organizationId = session.client_reference_id;

        if (!organizationId) {
            return new NextResponse('Organization ID missing in session', { status: 400 });
        }

        // Update organization subscription status
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ subscription_status: 'active' })
            .eq('id', organizationId);

        if (error) {
            console.error('Error updating organization:', error);
            return new NextResponse('Database Error', { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
