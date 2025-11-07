// src/components/ProfileMenu.jsx
// Polished ProfileMenu component for role-based navbar UX.
// Requires: useAuth hook providing { user, token }, React Router's useNavigate.
// Routes: /dashboard/user, /dashboard/gov, /select-role.
// Assumes Tailwind CSS with project theme tokens.

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/userAuth';

export default function ProfileMenu() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const isLoggedIn = !!token;

  // Helper: Get user initials from name (first + last, or first 2 chars).
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper: Get dashboard route based on role.
  const getDashboardRoute = (role) => {
    return role === 'government' ? '/dashboard/gov' : '/dashboard/user';
  };

  const initials = getInitials(user?.name);
  const dashboardRoute = getDashboardRoute(user?.role);

  // Close menu on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle menu item clicks
  const handleShowDashboard = () => {
    setIsOpen(false);
    navigate(dashboardRoute);
  };

  const handleSwitchAccount = () => {
    setIsOpen(false);
    navigate('/select-role');
  };

  // If not logged in, show Sign In button
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign Up / Log In
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gray-100 border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Account menu"
      >
        <span className="text-gray-700 font-medium text-sm">{initials}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transform transition-all duration-200 ease-out"
          role="menu"
          style={{
            animation: 'fadeInScale 0.2s ease-out',
            transformOrigin: 'top right',
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Role: {user?.role === 'government' ? 'Government' : 'User'}</p>
              </div>
            </div>
          </div>
          <div className="py-1" role="none">
            <button
              onClick={handleShowDashboard}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
              role="menuitem"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <div>
                  <span>Show Dashboard</span>
                  <p className="text-xs text-gray-500">Open your dashboard</p>
                </div>
              </div>
            </button>
            <button
              onClick={handleSwitchAccount}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
              role="menuitem"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <div>
                  <span>Switch account</span>
                  <p className="text-xs text-gray-500">Change role</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add minimal CSS for animation (if not using framer-motion)
const styles = `
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
`;

// Inject styles (optional, or add to global CSS)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
