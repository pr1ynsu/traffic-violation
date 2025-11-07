import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../routes/ProtectedRoute'
import { AuthContext } from '../auth/AuthProvider'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const TestComponent = () => <div>Protected Content</div>

const renderWithAuth = (user, children, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={{ user }}>
        {children}
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  test('renders children when user is authenticated and role matches', () => {
    renderWithAuth(
      { name: 'John Doe', role: 'user' },
      <ProtectedRoute role="user">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  test('renders children when user is authenticated and role matches (government)', () => {
    renderWithAuth(
      { name: 'Jane Smith', role: 'government' },
      <ProtectedRoute role="government">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  test('redirects to 403 when user role does not match', () => {
    renderWithAuth(
      { name: 'John Doe', role: 'user' },
      <ProtectedRoute role="government">
        <TestComponent />
      </ProtectedRoute>,
      ['/gov/dashboard']
    )

    expect(mockNavigate).toHaveBeenCalledWith('/403')
  })

  test('redirects to login when user is not authenticated', () => {
    renderWithAuth(
      null,
      <ProtectedRoute role="user">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('redirects to login when user is not authenticated (government route)', () => {
    renderWithAuth(
      null,
      <ProtectedRoute role="government">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('redirects user role to their dashboard when accessing wrong role route', () => {
    renderWithAuth(
      { name: 'John Doe', role: 'user' },
      <ProtectedRoute role="government">
        <TestComponent />
      </ProtectedRoute>,
      ['/gov/dashboard']
    )

    expect(mockNavigate).toHaveBeenCalledWith('/403')
  })

  test('redirects government role to their dashboard when accessing wrong role route', () => {
    renderWithAuth(
      { name: 'Jane Smith', role: 'government' },
      <ProtectedRoute role="user">
        <TestComponent />
      </ProtectedRoute>,
      ['/user/dashboard']
    )

    expect(mockNavigate).toHaveBeenCalledWith('/403')
  })
})
