import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Office Inventory
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user?.fullName} ({user?.role})
            </span>
            
            {user?.role === 'CREATOR' && (
              <>
                <Link to="/creator" className="hover:bg-blue-700 px-3 py-1 rounded">
                  My Orders
                </Link>
                <Link to="/create-order" className="hover:bg-blue-700 px-3 py-1 rounded">
                  Create Order
                </Link>
              </>
            )}
            
            {user?.role === 'PURCHASER' && (
              <Link to="/purchaser" className="hover:bg-blue-700 px-3 py-1 rounded">
                Submitted Orders
              </Link>
            )}
            
            <Link to="/change-password" className="hover:bg-blue-700 px-3 py-1 rounded">
              Change Password
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;