import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { authData, logout } = useAuth();

  return (
    <div>
      <h1>Bonjour opérateur {authData.selectedOperateur}</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
};

export default HomePage;
