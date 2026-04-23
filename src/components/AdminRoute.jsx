import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Check if user is authenticated and has ADMIN role
  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/tests" replace />;
  }

  return children;
};

export default AdminRoute;
