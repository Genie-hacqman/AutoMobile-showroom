import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { PageLoader } from './Feedback';

// Guards authenticated areas and remembers where the visitor was heading so we can
// send them straight back after a successful sign in.
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return <PageLoader label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/profile" replace state={{ deniedFrom: location.pathname }} />;
  }

  return children;
}
