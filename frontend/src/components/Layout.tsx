import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/" className="flex items-center text-xl font-bold text-gray-900">
              <img src="src/img/Layout/RSS-Cast-Logo.png" alt="Logo" className="h-12 w-12 mr-2 rounded-full" />
              RSS-Cast
            </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/upload" className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900">
                    Upload
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}
