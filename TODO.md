# Role-Based Navbar UX Implementation

## Frontend Changes
- [x] Create `src/components/RoleDropdown.jsx` - Dropdown component for navbar with "Go to Dashboard" and "Switch account" options
- [x] Modify `src/components/Navbar.jsx` - Replace "Sign Up / Log In" with role label and RoleDropdown when authenticated
- [x] Create `src/routes/ProtectedRoute.jsx` - Component to protect routes based on role, redirect if mismatched
- [x] Modify `src/pages/Login.jsx` - Redirect to dashboard if already authenticated, update redirect logic
- [x] Update `src/auth/AuthProvider.jsx` - Ensure user object includes name, enhance logout to clear all state
- [x] Update `src/App.jsx` - Wrap /user/* and /gov/* routes with ProtectedRoute
- [ ] Add tests: `src/__tests__/RoleDropdown.test.jsx` and `src/__tests__/ProtectedRoute.test.jsx`
- [x] Create `docs/ROLE_UX.md` - Documentation for behavior and testing

## Backend Changes
- [x] Modify `routes/auth.js` - Ensure JWT includes name in payload
- [ ] Optionally add `GET /api/auth/me` endpoint to return user profile

## Dashboard & Data Filtering
- [ ] Ensure user dashboard pages filter data by userId (server-side)
- [ ] Ensure gov dashboard pages show all data with filters (date-range, verified, violation type, vehicle, officer, export)
- [ ] Add server-side filters to violations API if missing

## Testing & Branching
- [x] Create branch `feature/role-navbar`
- [ ] Run tests: `npm test`
- [ ] Manual test: Create user/gov accounts, login, check navbar, dropdown, routing, logout
