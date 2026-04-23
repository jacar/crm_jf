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
import { Toaster } from 'react-hot-toast';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router basename="/jf/public">
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
                    <Route path="/configuracion" element={<Placeholder title="Configuración del Sistema" />} />
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
