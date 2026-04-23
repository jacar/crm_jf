import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Users, 
  MapPin,
  LogOut,
  Smartphone
} from 'lucide-react';

import { logout } from '../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch(e) {
      console.log("Logged out locally");
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/jf/public/login';
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo" style={{ textAlign: 'center' }}>
        <img 
          src="https://www.webcincodev.com/blog/wp-content/uploads/2025/09/Diseno-sin-titulo-25e.png" 
          alt="Corporación JF" 
          style={{ maxWidth: '160px', height: 'auto', display: 'inline-block' }} 
        />
      </div>
      
      <nav className="sidebar-nav">
        <li>
          <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/flota" className={`sidebar-link ${isActive('/flota') ? 'active' : ''}`}>
            <Truck size={20} />
            Flota
          </Link>
        </li>
        <li>
          <Link to="/documentos" className={`sidebar-link ${isActive('/documentos') ? 'active' : ''}`}>
            <FileText size={20} />
            Documentos
          </Link>
        </li>
        <li>
          <Link to="/operador" className={`sidebar-link ${isActive('/operador') ? 'active' : ''}`}>
            <Smartphone size={20} />
            Vista Operador
          </Link>
        </li>
        <li>
          <Link to="/sedes" className={`sidebar-link ${isActive('/sedes') ? 'active' : ''}`}>
            <MapPin size={20} />
            Sedes
          </Link>
        </li>
        <li>
          <Link to="/mantenimiento" className={`sidebar-link ${isActive('/mantenimiento') ? 'active' : ''}`}>
            <AlertTriangle size={20} />
            Mantenimientos
          </Link>
        </li>
        <li>
          <Link to="/reportes" className={`sidebar-link ${isActive('/reportes') ? 'active' : ''}`}>
            <FileText size={20} />
            Reportes
          </Link>
        </li>
        <li>
          <Link to="/usuarios" className={`sidebar-link ${isActive('/usuarios') ? 'active' : ''}`}>
            <Users size={20} />
            Usuarios
          </Link>
        </li>
        <li className="mobile-only-logout">
          <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'transparent', color: '#F87171' }}>
            <LogOut size={20} />
            Salir
          </button>
        </li>
      </nav>

      <div style={{ marginTop: 'auto' }} className="desktop-only-bottom">
        <Link to="/configuracion" className={`sidebar-link ${isActive('/configuracion') ? 'active' : ''}`}>
          <Settings size={20} />
          Configuración
        </Link>
        <button 
          onClick={handleLogout}
          className="sidebar-link" 
          style={{ 
            color: '#F87171', 
            background: 'transparent', 
            width: '100%', 
            justifyContent: 'flex-start',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
