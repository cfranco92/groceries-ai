import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockSignUp = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/sign-up',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: mockSignUp,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import SignUpPage from '@/app/(auth)/sign-up/page';

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <SignUpPage />
    </QueryClientProvider>,
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderPage();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders heading', () => {
    renderPage();
    expect(screen.getByText('GroceriesAI')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('has link to sign-in page', () => {
    renderPage();
    const link = screen.getByText('Sign in');
    expect(link.closest('a')).toHaveAttribute('href', '/sign-in');
  });

  it('calls signUp on valid form submission', async () => {
    mockSignUp.mockResolvedValue(undefined);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Password1',
    );
    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'new@example.com',
        'Password1',
        undefined,
      );
    });
  });

  it('redirects to /onboarding on success', async () => {
    mockSignUp.mockResolvedValue(undefined);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Password1',
    );
    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('shows error for duplicate email', async () => {
    const err = new Error('Email in use');
    Object.assign(err, { code: 'auth/email-already-in-use' });
    mockSignUp.mockRejectedValue(err);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'dup@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Password1',
    );
    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('This email is already registered'),
      ).toBeInTheDocument();
    });
  });
});
