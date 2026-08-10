import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Setup mocks
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockFromSites = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/dashboard',
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/supabase-client', () => ({
    __esModule: true,
    default: {
        auth: {
            getSession: () => mockGetSession(),
            getUser: () => mockGetUser(),
        },
        from: (table: string) => {
            if (table === 'sites') {
                return {
                    select: vi.fn().mockReturnThis(),
                    order: vi.fn(() => mockFromSites()),
                };
            }
            if (table === 'members') {
                return {
                    select: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: { organization_id: 'test-org-id' },
                        error: null,
                    }),
                };
            }
            return {};
        },
    },
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: Record<string, string>) => {
        const translations: Record<string, string> = {
            welcome: `Welcome back, ${params?.email || 'user'}`,
            description: 'Your SEO dashboard',
            welcomeTitle: 'Welcome to SEO-v2!',
            welcomeSubtitle: "Let's get started",
            noSitesTitle: 'No websites yet',
            noSitesDescription: 'Add your first website',
            addFirstSite: 'Add Your First Website',
            addSiteUrl: 'Website URL',
            addSiteUrlPlaceholder: 'https://example.com',
            addingSite: 'Adding...',
            siteAddedSuccess: 'Website added successfully!',
        };
        return translations[key] || key;
    },
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-current-user', () => ({
    useCurrentUser: () => mockGetUser(),
}));

vi.mock('@/hooks/use-user-sites', () => ({
    useUserSites: () => mockFromSites(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to authenticated user with sites
        mockGetSession.mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' } } },
            error: null,
        });
        mockGetUser.mockReturnValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            isLoading: false,
        });
    });

    describe('With Sites', () => {
        beforeEach(() => {
            mockFromSites.mockReturnValue({
                data: [
                    { id: 'site-1', url: 'https://example.com', ims_score: 75, created_at: '2026-01-01' },
                    { id: 'site-2', url: 'https://another.com', ims_score: 85, created_at: '2026-01-02' },
                ],
                isLoading: false,
            });
        });

        it('should render the welcome message', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
            });
        });

        it('should render site cards when user has sites', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const siteCards = screen.getAllByTestId('site-card');
                expect(siteCards).toHaveLength(2);
            });
        });

        it('should display site URLs', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText('https://example.com')).toBeInTheDocument();
                expect(screen.getByText('https://another.com')).toBeInTheDocument();
            });
        });

        it('should display IMS scores', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText('IMS Score: 75')).toBeInTheDocument();
                expect(screen.getByText('IMS Score: 85')).toBeInTheDocument();
            });
        });
    });

    describe('Without Sites (Onboarding)', () => {
        beforeEach(() => {
            mockFromSites.mockReturnValue({
                data: [],
                isLoading: false,
            });
        });

        it('should render the onboarding empty state when user has no sites', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText('Welcome to SEO-v2!')).toBeInTheDocument();
            });
        });

        it('should display the add site form', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByTestId('onboarding-site-url-input')).toBeInTheDocument();
            });
        });

        it('should display the add first site button', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByTestId('onboarding-add-site-button')).toBeInTheDocument();
            });
        });

        it('should not display the regular welcome message', async () => {
            render(<DashboardPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        it('should not show content while loading', () => {
            mockGetUser.mockReturnValue({
                data: undefined,
                isLoading: true,
            });
            mockFromSites.mockReturnValue({
                data: undefined,
                isLoading: true,
            });

            render(<DashboardPage />, { wrapper: createWrapper() });

            // The component should not show the empty state or sites list while loading
            expect(screen.queryByTestId('site-card')).not.toBeInTheDocument();
            expect(screen.queryByTestId('onboarding-site-url-input')).not.toBeInTheDocument();
        });
    });
});
