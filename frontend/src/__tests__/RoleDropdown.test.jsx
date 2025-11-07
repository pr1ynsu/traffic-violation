import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RoleDropdown from '../components/RoleDropdown'
import { AuthContext } from '../auth/AuthProvider'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithAuth = (user, logout = mockLogout) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user, logout }}>
        <RoleDropdown />
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('RoleDropdown', () => {
  beforeEach(() => {
    mockLogout.mockClear()
    mockNavigate.mockClear()
  })

  test('renders role label correctly for user', () => {
    renderWithAuth({ name: 'John Doe', role: 'user' })
    expect(screen.getByText('Hi, John Doe · Role: User')).toBeInTheDocument()
  })

  test('renders role label correctly for government', () => {
    renderWithAuth({ name: 'Jane Smith', role: 'government' })
    expect(screen.getByText('Hi, Jane Smith · Role: Government')).toBeInTheDocument()
  })

  test('toggles dropdown on click', () => {
    renderWithAuth({ name: 'Test User', role: 'user' })
    const dropdownButton = screen.getByText('Hi, Test User · Role: User')

    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()

    fireEvent.click(dropdownButton)
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Switch account')).toBeInTheDocument()

    fireEvent.click(dropdownButton)
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()
  })

  test('navigates to user dashboard on "Go to Dashboard" click', () => {
    renderWithAuth({ name: 'Test User', role: 'user' })
    const dropdownButton = screen.getByText('Hi, Test User · Role: User')
    fireEvent.click(dropdownButton)

    const dashboardLink = screen.getByText('Go to Dashboard')
    fireEvent.click(dashboardLink)

    expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard')
  })

  test('navigates to gov dashboard on "Go to Dashboard" click', () => {
    renderWithAuth({ name: 'Test Gov', role: 'government' })
    const dropdownButton = screen.getByText('Hi, Test Gov · Role: Government')
    fireEvent.click(dropdownButton)

    const dashboardLink = screen.getByText('Go to Dashboard')
    fireEvent.click(dashboardLink)

    expect(mockNavigate).toHaveBeenCalledWith('/gov/dashboard')
  })

  test('calls logout and navigates to login on "Switch account" click', () => {
    renderWithAuth({ name: 'Test User', role: 'user' })
    const dropdownButton = screen.getByText('Hi, Test User · Role: User')
    fireEvent.click(dropdownButton)

    const switchAccountLink = screen.getByText('Switch account')
    fireEvent.click(switchAccountLink)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('closes dropdown on outside click', () => {
    renderWithAuth({ name: 'Test User', role: 'user' })
    const dropdownButton = screen.getByText('Hi, Test User · Role: User')
    fireEvent.click(dropdownButton)

    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()

    // Click outside (on document body)
    fireEvent.click(document.body)

    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()
  })
})
