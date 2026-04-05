import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/sign-in',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: vi.fn(),
    signInWithGoogle: mockSignInWithGoogle,
    signOut: vi.fn(),
  }),
}));

import SignInPage from '@/app/(auth)/sign-in/page';

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <SignInPage />
    </QueryClientProvider>,
  );
}

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    renderPage();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('renders heading and subtitle', () => {
    renderPage();
    expect(screen.getByText('GroceriesAI')).toBeInTheDocument();
    expect(
      screen.getByText('Smart grocery lists for your family'),
    ).toBeInTheDocument();
  });

  it('has link to sign-up page', () => {
    renderPage();
    const link = screen.getByText('Sign up');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/sign-up');
  });

  it('calls signIn on valid form submission', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'Password1',
      );
    });
  });

  it('redirects to /lists on successful sign-in', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/lists');
    });
  });

  it('shows error when authentication fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Authentication failed'));
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
  });
});
