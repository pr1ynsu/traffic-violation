# Role-Based Navbar UX Implementation

## Frontend Changes
- [ ] Create `src/components/RoleDropdown.jsx` - Dropdown component for navbar with "Go to Dashboard" and "Switch account" options
- [ ] Modify `src/components/Navbar.jsx` - Replace "Sign Up / Log In" with role label and RoleDropdown when authenticated
- [ ] Create `src/routes/ProtectedRoute.jsx` - Component to protect routes based on role, redirect if mismatched
- [ ] Modify `src/pages/Login.jsx` - Redirect to dashboard if already authenticated, update redirect logic
- [ ] Update `src/auth/AuthProvider.jsx` - Ensure user object includes name, enhance logout to clear all state
- [ ] Update `src/App.jsx` - Wrap /user/* and /gov/* routes with ProtectedRoute
- [ ] Add tests: `src/__tests__/RoleDropdown.test.jsx` and `src/__tests__/ProtectedRoute.test.jsx`
- [ ] Create `docs/ROLE_UX.md` - Documentation for behavior and testing

## Backend Changes
- [ ] Modify `routes/auth.js` - Ensure JWT includes name in payload
- [ ] Optionally add `GET /api/auth/me` endpoint to return user profile

## Dashboard & Data Filtering
- [ ] Ensure user dashboard pages filter data by userId (server-side)
- [ ] Ensure gov dashboard pages show all data with filters (date-range, verified, violation type, vehicle, officer, export)
- [ ] Add server-side filters to violations API if missing

## Testing & Branching
- [ ] Create branch `feature/role-navbar`
- [ ] Run tests: `npm test`
- [ ] Manual test: Create user/gov accounts, login, check navbar, dropdown, routing, logout
