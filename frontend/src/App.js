import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import PrivateRoute from './components/routes/PrivateRoutes.js';
import AuthPage from './components/pages/AuthPage';
import HomePage from './components/pages/Home';
import Navbar from './components/layout/Navbar';
import AjouterRapport from './components/pages/AjouterRapport'; // Importer la page "Ajouter un rapport"
import ListeRapport from './components/pages/ListeRapport'; // Importer la page "Liste des rapports"

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent = () => {
  const location = useLocation();  // Utilisation de useLocation ici dans le bon contexte
  
  return (
    <>
      {/* Affiche la Navbar uniquement si on n'est pas sur la page de login */}
      {location.pathname !== '/login' && <Navbar />}
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />
        <Route path="/ajouter-rapport" element={
          <PrivateRoute>
            <AjouterRapport />
          </PrivateRoute>
        } /> {/* Nouvelle route pour la page "Ajouter un rapport" */}
        <Route path="/liste-rapports" element={
          <PrivateRoute>
            <ListeRapport />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
};

export default App;
