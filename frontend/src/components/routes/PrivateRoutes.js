import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { authData, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>; // ou un spinner
  }

  if (!authData.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
