'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CheckoutRedirectStripe = {
    redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: Error } | undefined>;
};

const PLANS = [
    {
        id: 'price_fake_pro',
        name: 'Pro Plan',
        price: '$29/mo',
        features: ['Unlimited Scans', 'Advanced Reports', 'Priority Support'],
    },
];

export default function BillingContent({ organizationId }: { organizationId: string }) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (priceId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    organizationId,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const { sessionId } = await response.json();
            const stripe = await stripePromise;

            if (stripe) {
                const checkoutStripe = stripe as unknown as CheckoutRedirectStripe;
                const result = await checkoutStripe.redirectToCheckout({ sessionId });
                if (result?.error) console.error(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PLANS.map((plan) => (
                    <Card key={plan.id}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.price}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Subscribe'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
