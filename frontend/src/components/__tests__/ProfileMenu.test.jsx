// src/components/__tests__/ProfileMenu.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProfileMenu from '../ProfileMenu';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../auth/userAuth', () => ({
  default: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProfileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sign In button when not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null, token: null });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign Up / Log In')).toBeInTheDocument();
  });

  it('renders avatar with initials when logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('opens dropdown on avatar click', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    await waitFor(() => {
      expect(screen.getByText('Show Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Switch account')).toBeInTheDocument();
    });
  });

  it('navigates to user dashboard on Show Dashboard click', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    const dashboardButton = await screen.findByText('Show Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/user');
  });

  it('navigates to gov dashboard for government role', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Jane Smith', role: 'government' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    const dashboardButton = await screen.findByText('Show Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/gov');
  });

  it('navigates to /select-role on Switch account click', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    const switchButton = await screen.findByText('Switch account');
    fireEvent.click(switchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/select-role');
  });

  it('closes menu on outside click', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    await waitFor(() => {
      expect(screen.getByText('Show Dashboard')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Show Dashboard')).not.toBeInTheDocument();
    });
  });

  it('closes menu on Escape key', async () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', role: 'user' },
      token: 'fake-token',
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );

    const avatar = screen.getByLabelText('Account menu');
    fireEvent.click(avatar);

    await waitFor(() => {
      expect(screen.getByText('Show Dashboard')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Show Dashboard')).not.toBeInTheDocument();
    });
  });
});
