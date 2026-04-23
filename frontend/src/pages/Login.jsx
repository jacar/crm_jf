import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/CRM.png" 
              alt="Corporación JF" 
              style={{ maxWidth: '200px', height: 'auto', display: 'block', margin: '0 auto 1.5rem auto' }} 
            />
          </div>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingrese sus credenciales para acceder al sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@mecanico.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Todos los derechos reservados Corporación JF &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
      
      <div className="login-visual">
        <div className="overlay"></div>
        <div className="content">
          <h2>Gestión de Flotas Inteligente</h2>
          <p>Monitoreo en tiempo real, mantenimientos preventivos y control de costos en una sola plataforma.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
