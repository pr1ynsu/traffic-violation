import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/userAuth';

export default function RoleDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoToDashboard = () => {
    setIsOpen(false);
    const dashboardPath = user.role === 'government' ? '/gov' : '/user';
    navigate(dashboardPath);
  };

  const handleSwitchAccount = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const roleLabel = user.role === 'government' ? 'Government' : 'User';
  const displayName = user.name || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-sm">
          Hi, {displayName} · Role: {roleLabel}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleGoToDashboard}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleSwitchAccount}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Switch account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
