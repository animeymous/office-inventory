import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 dark:bg-blue-900 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="text-white text-xl font-bold">
            Office Inventory
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-white/90 text-sm">
              {user?.fullName} ({user?.role})
            </span>
            
            {user?.role === 'CREATOR' && (
              <>
                <Link to="/creator" className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-1 rounded transition">
                  My Orders
                </Link>
                <Link to="/create-order" className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-1 rounded transition">
                  Create Order
                </Link>
              </>
            )}
            
            {user?.role === 'PURCHASER' && (
              <Link to="/purchaser" className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-1 rounded transition">
                Submitted Orders
              </Link>
            )}
            
            <Link to="/change-password" className="text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-1 rounded transition">
              Change Password
            </Link>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-700 transition text-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition text-white"
            >
              Logout
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-blue-700 dark:bg-blue-800 text-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 space-y-2">
            <div className="text-white/90 text-sm py-2 border-t border-blue-500 dark:border-blue-800">
              {user?.fullName} ({user?.role})
            </div>
            
            {user?.role === 'CREATOR' && (
              <>
                <Link to="/creator" className="block text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
                <Link to="/create-order" className="block text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                  Create Order
                </Link>
              </>
            )}
            
            {user?.role === 'PURCHASER' && (
              <Link to="/purchaser" className="block text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                Submitted Orders
              </Link>
            )}
            
            <Link to="/change-password" className="block text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
              Change Password
            </Link>
            
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded transition text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;