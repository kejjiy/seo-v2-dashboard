import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';
import React from 'react';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock the HeroSection component
vi.mock('@/components/landing/hero-section', () => ({
    HeroSection: () => <div data-testid="hero-section">Hero Section Mock</div>,
}));

describe('LandingPage', () => {
    it('should render the SEO-v2 branding', () => {
        render(<LandingPage />);
        expect(screen.getByText('SEO-v2')).toBeInTheDocument();
    });

    it('should render login and signup links', () => {
        render(<LandingPage />);
        expect(screen.getByText('Log in')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should have correct navigation hrefs', () => {
        render(<LandingPage />);
        const loginLink = screen.getByText('Log in').closest('a');
        const signupLink = screen.getByText('Sign up').closest('a');

        expect(loginLink).toHaveAttribute('href', '/auth/login');
        expect(signupLink).toHaveAttribute('href', '/auth/signup');
    });

    it('should render the hero section', () => {
        render(<LandingPage />);
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('should render the footer with copyright', () => {
        render(<LandingPage />);
        expect(screen.getByText(/© 2026 SEO-v2/)).toBeInTheDocument();
    });
});
