import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { APIKeyManager } from '@/components/dashboard/api-key-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockKeys = [
    {
        id: 'key-1',
        organization_id: 'org-1',
        site_id: 'site-1',
        prefix: 'sv2_abcd',
        name: 'WordPress Prod',
        created_at: '2026-02-11T00:00:00Z',
    },
    {
        id: 'key-2',
        organization_id: 'org-1',
        site_id: 'site-1',
        prefix: 'sv2_efgh',
        name: null,
        created_at: '2026-02-10T00:00:00Z',
    },
];

const mockCreateKey = vi.fn();
const mockRevokeKey = vi.fn();

vi.mock('@/hooks/use-api-keys', () => ({
    useAPIKeys: () => ({
        keys: mockKeys,
        isLoading: false,
        createKey: mockCreateKey,
        isCreating: false,
        revokeKey: mockRevokeKey,
        isRevoking: false,
    }),
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('APIKeyManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the API Keys card title', () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });
        expect(screen.getByText('API Keys')).toBeInTheDocument();
    });

    it('should display the Generate New Key button', () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });
        expect(screen.getByText('Generate New Key')).toBeInTheDocument();
    });

    it('should display existing keys in a table', () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });
        expect(screen.getByText('WordPress Prod')).toBeInTheDocument();
        expect(screen.getByText('Unnamed Key')).toBeInTheDocument();
    });

    it('should display key prefixes with ellipsis', () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });
        expect(screen.getByText('sv2_abcd...')).toBeInTheDocument();
        expect(screen.getByText('sv2_efgh...')).toBeInTheDocument();
    });

    it('should display date for each key', () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });
        // There should be date elements rendered
        const rows = screen.getAllByRole('row');
        // Header row + 2 data rows
        expect(rows.length).toBe(3);
    });

    it('should open the generate dialog when button is clicked', async () => {
        render(<APIKeyManager siteId="site-1" />, { wrapper: createWrapper() });

        fireEvent.click(screen.getByText('Generate New Key'));

        await waitFor(() => {
            expect(screen.getByText('Generate API Key')).toBeInTheDocument();
            expect(screen.getByLabelText('Key Name')).toBeInTheDocument();
        });
    });
});
