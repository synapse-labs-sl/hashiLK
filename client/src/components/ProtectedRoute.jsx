import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function ProtectedRoute({ children, requireSeller = false, requireAdmin = false }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSeller && !user.isSeller && user.role !== 'seller') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
