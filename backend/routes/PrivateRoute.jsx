import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { authData } = useAuth();

  return authData.isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
