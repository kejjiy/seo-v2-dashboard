import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingEmptyState } from './onboarding-empty-state';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Setup mocks
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockToast = vi.fn();

vi.mock('@/lib/supabase-client', () => ({
    __esModule: true,
    default: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: 'test-user-id' } } },
                error: null,
            }),
        },
        from: vi.fn((table: string) => {
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
            if (table === 'sites') {
                return {
                    insert: mockInsert.mockReturnValue({
                        select: mockSelect.mockReturnValue({
                            single: mockSingle,
                        }),
                    }),
                };
            }
            return {};
        }),
    },
}));

import enMessages from '../i18n/messages/en.json';

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        const messages = enMessages as any;
        return messages[namespace]?.[key] || `${namespace}.${key}`;
    },
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    GlobeIcon: () => React.createElement('div', { 'data-testid': 'globe-icon' }),
    PlusIcon: () => React.createElement('div', { 'data-testid': 'plus-icon' }),
    RocketIcon: () => React.createElement('div', { 'data-testid': 'rocket-icon' }),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
    };
};

describe('OnboardingEmptyState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSingle.mockResolvedValue({
            data: { id: 'new-site-id', url: 'https://example.com' },
            error: null,
        });
    });

    describe('Rendering', () => {
        it('should render the welcome title', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            expect(screen.getByText('Welcome to SEO-v2!')).toBeInTheDocument();
        });

        it('should render the welcome subtitle', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            expect(screen.getByText("Let's get started by adding your first website")).toBeInTheDocument();
        });

        it('should render the no sites card title', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            expect(screen.getByText('No websites yet')).toBeInTheDocument();
        });

        it('should render the URL input field', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            expect(screen.getByTestId('onboarding-site-url-input')).toBeInTheDocument();
        });

        it('should render the add site button', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            expect(screen.getByTestId('onboarding-add-site-button')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should have the add button disabled when URL is empty', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            const button = screen.getByTestId('onboarding-add-site-button');
            expect(button).toBeDisabled();
        });

        it('should enable the add button when URL is entered', async () => {
            const user = userEvent.setup();
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });

            const input = screen.getByTestId('onboarding-site-url-input');
            await user.type(input, 'https://example.com');

            const button = screen.getByTestId('onboarding-add-site-button');
            expect(button).not.toBeDisabled();
        });
    });

    describe('Site Addition', () => {
        it('should call the API when form is submitted with valid URL', async () => {
            const user = userEvent.setup();

            render(<OnboardingEmptyState />, { wrapper: createWrapper() });

            const input = screen.getByTestId('onboarding-site-url-input');
            await user.type(input, 'https://example.com');

            const button = screen.getByTestId('onboarding-add-site-button');
            await user.click(button);

            await waitFor(() => {
                expect(mockInsert).toHaveBeenCalledWith({
                    url: 'https://example.com',
                    organization_id: 'test-org-id',
                });
            });
        });
    });

    describe('Accessibility', () => {
        it('should have URL input with correct type', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            const urlInput = screen.getByTestId('onboarding-site-url-input');
            expect(urlInput).toHaveAttribute('type', 'url');
        });

        it('should have submit button with correct type', () => {
            render(<OnboardingEmptyState />, { wrapper: createWrapper() });
            const submitButton = screen.getByTestId('onboarding-add-site-button');
            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });
});
