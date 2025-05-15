import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import PrivateRoute from './components/routes/PrivateRoutes.js';
import AuthPage from './components/pages/AuthPage';
import Documentation from './components/pages/Home';
import Navbar from './components/layout/Navbar';
import AjouterRapport from './components/pages/AjouterRapport'; // Importer la page "Ajouter un rapport"
import ListeRapport from './components/pages/ListeRapport'; // Importer la page "Liste des rapports"
import ModifierRapport from './components/pages/ModifierRapport'; // Import
import Carte from './components/pages/carte.js'; // Importer la page "Carte"
import NotFound from './components/pages/NotFound'; // Importer la page "Not Found"

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
            <AjouterRapport />
          </PrivateRoute>
        } />
        <Route path="/doc" element={
          <PrivateRoute>
            <Documentation />
          </PrivateRoute>
        } />
        <Route path="/ajouter-rapport" element={
          <PrivateRoute>
            <AjouterRapport />
          </PrivateRoute>
        } /> 
        {/* Nouvelle route pour la page "Ajouter un rapport" */}
        <Route path="/liste-rapports" element={
          <PrivateRoute>
            <ListeRapport />
          </PrivateRoute>
        } />
        <Route path="/modifier-rapport/:id" element={
          <PrivateRoute>
            <ModifierRapport />
          </PrivateRoute>
        } /> 
        {/* Nouvelle route pour la page "Modifier un rapport" */}
        <Route path="/carte" element={
          <PrivateRoute>
            <Carte />
          </PrivateRoute>
        } /> 
        {/*Ereeur  */}
        <Route path="*" element={
          <PrivateRoute>
            <NotFound />
          </PrivateRoute>
        } />
        
      </Routes>
    </>
  );
};

export default App;
