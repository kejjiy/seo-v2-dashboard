import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BillingContent from './billing-content';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn(() => Promise.resolve({
        redirectToCheckout: vi.fn(),
    })),
}));

// Mock fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sessionId: 'sess_123' }),
    })
) as any;

describe('BillingContent', () => {
    it('renders pricing cards', () => {
        render(<BillingContent organizationId="org_123" />);
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
        expect(screen.getByText('$29/mo')).toBeInTheDocument();
    });

    it('calls checkout API on subscribe', async () => {
        render(<BillingContent organizationId="org_123" />);

        const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
        fireEvent.click(subscribeButton);

        expect(global.fetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                priceId: 'price_fake_pro',
                organizationId: 'org_123',
            }),
        }));
    });
});
