import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../auth/userAuth';

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();
  const location = useLocation();

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no user, wait for auth to load (or redirect)
  if (!user) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  // If role is required and doesn't match, redirect to 403 or appropriate dashboard
  if (role && user.role !== role) {
    const redirectPath = user.role === 'government' ? '/gov' : '/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
