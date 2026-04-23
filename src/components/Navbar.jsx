import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Stydu4 TOEIC</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  to="/tests"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Tests
                </Link>
                <Link
                  to="/courses"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Courses
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  My Learning
                </Link>
                <Link
                  to="/my-results"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  My Results
                </Link>
                {/* <Link
                  to="/progress"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Progress
                </Link> */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
