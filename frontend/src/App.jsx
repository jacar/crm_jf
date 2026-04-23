import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import OperatorView from './pages/OperatorView';
import Documents from './pages/Documents';
import MaintenanceControl from './pages/MaintenanceControl';
import Sedes from './pages/Sedes';
import Login from './pages/Login';
import Placeholder from './pages/Placeholder';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import SettingsPage from './pages/Settings';
import { Toaster } from 'react-hot-toast';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Detectar basename dinámico según el dominio
  const getBasename = () => {
    return window.location.hostname.includes('corporacionjf.com') ? '' : '/jf/public';
  };

  return (
    <Router basename={getBasename()}>
      <Toaster position="top-right" />
      <Routes>
        {/* Ruta de Login - Fuera del layout principal */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas - Dentro del layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/flota" element={<FleetManagement />} />
                    <Route path="/operador" element={<OperatorView />} />
                    <Route path="/documentos" element={<Documents />} />
                    <Route path="/mantenimiento" element={<MaintenanceControl />} />
                    <Route path="/sedes" element={<Sedes />} />
                    <Route path="/reportes" element={<Reports />} />
                    <Route path="/usuarios" element={<Teams />} />
                    <Route path="/configuracion" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                  <ChatWidget />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
