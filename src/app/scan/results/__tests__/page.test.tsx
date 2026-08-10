import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new Map<string, string>();
const stableSearchParams = {
  get: (key: string) => mockSearchParams.get(key) ?? null,
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => stableSearchParams,
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        ({ children, className, style, ...props }, ref) =>
          React.createElement('div', { ref, className, style, ...props }, children)
      ),
      svg: React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
        ({ children, className, ...props }, ref) =>
          React.createElement('svg', { ref, className, ...props }, children)
      ),
      circle: React.forwardRef<SVGCircleElement, React.SVGAttributes<SVGCircleElement>>(
        (props, ref) => React.createElement('circle', { ref, ...props })
      ),
    },
    useMotionValue: () => ({
      get: () => 0,
      set: vi.fn(),
      on: () => () => {},
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => ({
      get: () => output?.[0] ?? 0,
      on: () => () => {},
    }),
    animate: vi.fn().mockReturnValue({ stop: vi.fn() }),
  };
});

import ResultsPage from '../page';

describe('ResultsPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.clear();

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the results page with IMS score from URL', () => {
    mockSearchParams.set('score', '75');
    mockSearchParams.set('url', 'https://example.com');

    render(<ResultsPage />);
    expect(screen.getByTestId('results-page')).toBeInTheDocument();
    expect(screen.getByTestId('ims-gauge')).toBeInTheDocument();
    expect(screen.getByTestId('ims-score-label')).toHaveTextContent(/Good/i);
  });

  it('loads friction points from sessionStorage (preferred)', async () => {
    mockSearchParams.set('score', '85');

    const mockData = {
      friction_points: [{ message: 'Storage Issue', severity: 'high' }],
    };

    vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue(JSON.stringify(mockData));

    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Storage Issue/i)).toBeInTheDocument();
    });
  });

  it('falls back to URL params if sessionStorage is empty', async () => {
    mockSearchParams.set('score', '50');
    mockSearchParams.set(
      'friction_points',
      JSON.stringify([{ message: 'URL Issue', severity: 'medium' }])
    );

    vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue(null);

    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/URL Issue/i)).toBeInTheDocument();
    });
  });

  it('handles parsing errors gracefully', async () => {
    mockSearchParams.set('friction_points', 'invalid-json');
    vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue('invalid-json');

    render(<ResultsPage />);

    // Should render page but no issues
    expect(screen.getByTestId('results-page')).toBeInTheDocument();
    // Should show "No issues detected" or similar empty state
    expect(screen.getByText(/No issues detected/i)).toBeInTheDocument();
  });

  it("clears storage on 'Scan Another' click", () => {
    render(<ResultsPage />);
    const scanAnotherButton = screen.getByTestId('cta-scan-another');

    scanAnotherButton.click();

    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('last_scan_results');
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
