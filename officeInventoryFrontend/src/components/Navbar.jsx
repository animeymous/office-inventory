import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-blue-600 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="text-white text-xl font-bold">
            Office Inventory
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-white/90 text-sm">
              {user?.fullName} ({user?.role})
            </span>
            
            {user?.role === 'CREATOR' && (
              <>
                <Link to="/creator" className="text-white hover:bg-blue-700 px-3 py-1 rounded transition">
                  My Orders
                </Link>
                <Link to="/create-order" className="text-white hover:bg-blue-700 px-3 py-1 rounded transition">
                  Create Order
                </Link>
              </>
            )}
            
            {user?.role === 'PURCHASER' && (
              <Link to="/purchaser" className="text-white hover:bg-blue-700 px-3 py-1 rounded transition">
                Submitted Orders
              </Link>
            )}
            
            <Link to="/change-password" className="text-white hover:bg-blue-700 px-3 py-1 rounded transition">
              Change Password
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition text-white"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 space-y-2">
            <div className="text-white/90 text-sm py-2 border-t border-blue-500">
              {user?.fullName} ({user?.role})
            </div>
            
            {user?.role === 'CREATOR' && (
              <>
                <Link to="/creator" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
                <Link to="/create-order" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                  Create Order
                </Link>
              </>
            )}
            
            {user?.role === 'PURCHASER' && (
              <Link to="/purchaser" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
                Submitted Orders
              </Link>
            )}
            
            <Link to="/change-password" className="block text-white hover:bg-blue-700 px-3 py-2 rounded transition" onClick={() => setIsMenuOpen(false)}>
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