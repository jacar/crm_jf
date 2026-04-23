import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Clock, Building, Save, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [config, setConfig] = useState({
    companyName: 'Corporación JF',
    country: 'Venezuela',
    kmOil: 5000,
    kmMtto: 5000,
    kmFilter: 10000,
    privacyStatement: 'Este es un software de uso privado exclusivo para la gestión de flota de corporacionjf.com en la República Bolivariana de Venezuela.'
  });

  const handleSave = () => {
    // In a real app, this would call an API
    toast.success('Configuración guardada exitosamente');
  };

  return (
    <div className="settings-container">
      <header className="header">
        <h1>Configuración del Sistema</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ajustes globales y políticas de privacidad.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* General Info */}
        <div className="card" style={{ background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#38bdf8' }}>
            <Building size={20} />
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Información Corporativa</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>Nombre de Empresa</label>
              <input type="text" value={config.companyName} disabled style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>País / Región</label>
              <input type="text" value={config.country} disabled style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
            </div>
          </div>
        </div>

        {/* Maintenance Intervals */}
        <div className="card" style={{ background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#10b981' }}>
            <Clock size={20} />
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Umbrales de Mantenimiento</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>Aceite (KM)</label>
                <input type="number" value={config.kmOil} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>General (KM)</label>
                <input type="number" value={config.kmMtto} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
              </div>
            </div>
            <button onClick={handleSave} className="btn-primary" style={{ background: '#10b981', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={18} /> Actualizar Umbrales
            </button>
          </div>
        </div>

        {/* Privacy & Legal */}
        <div className="card" style={{ background: '#1e293b', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#f59e0b' }}>
            <ShieldCheck size={20} />
            <h2 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Políticas de Privacidad y Uso</h2>
          </div>
          <div style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem' }}>
              {config.privacyStatement}
            </p>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Versión del Software: <strong>TRACKJF v2.5.0-VEN</strong>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#10b981', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Servidor Seguro SSL
                </span>
                <span style={{ color: '#38bdf8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Acceso Restringido
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
