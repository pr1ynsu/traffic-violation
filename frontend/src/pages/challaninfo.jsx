import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function ChallanInfo() {
  const { isAuthenticated, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // This should not happen since ProtectedRoute handles it, but just in case
      return;
    } else {
      if (role === 'user') {
        // Redirect to user challan page
      } else if (role === 'government') {
        // Redirect to gov challan page
      } else {
        // Invalid role, redirect to login
      }
    }
  }, [isAuthenticated, role, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role === 'user') {
    return <Navigate to="/user/challan" />;
  } else if (role === 'government') {
    return <Navigate to="/gov/challan" />;
  } else {
    return <Navigate to="/login" />;
  }
}
