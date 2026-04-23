import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertCircle, CheckCircle2, DollarSign, Loader2, LogOut, Settings, PenTool, Play, Pause } from 'lucide-react';
import { getStats, getVehicles, getSedes, logout } from '../services/api';
import toast from 'react-hot-toast';

// Global reference to handle audio across component instances
let globalAudio = null;

const playAlarmSound = () => {
  try {
    const selectedSound = localStorage.getItem('alertSound') || '/jf/public/alerta.mp3';
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    }
    globalAudio = new Audio(selectedSound);
    globalAudio.play().catch(e => console.error("Audio play failed:", e));
  } catch(e) {
    console.error("Audio object creation failed", e);
  }
};

const stopGlobalAudio = () => {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [selectedSound, setSelectedSound] = useState(localStorage.getItem('alertSound') || '/jf/public/alerta.mp3');
  const [playingFile, setPlayingFile] = useState(null);
  const audioInstances = useRef({});

  const stopAll = () => {
    Object.values(audioInstances.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    stopGlobalAudio();
    setPlayingFile(null);
  };

  const playSound = (file) => {
    stopAll();
    const audio = audioInstances.current[file];
    if (audio) {
      audio.play().catch(e => console.error("Audio play failed:", e));
      setPlayingFile(file);
    }
  };



  const alertSounds = [
    { name: 'Alerta Principal', file: '/jf/public/alerta.mp3' },
    { name: 'Emergencia', file: '/jf/public/alertas/freesound_community-emergency-alarm-69780.mp3' },
    { name: 'Sirena', file: '/jf/public/alertas/freesound_community-siren-alert-96052.mp3' },
    { name: 'Notificación 1', file: '/jf/public/alertas/universfield-new-notification-022-370046.mp3' },
    { name: 'Notificación 2', file: '/jf/public/alertas/universfield-new-notification-032-480570.mp3' },
    { name: 'Notificación 3', file: '/jf/public/alertas/universfield-new-notification-036-485897.mp3' },
    { name: 'Notificación 4', file: '/jf/public/alertas/universfield-new-notification-051-494246.mp3' },
    { name: 'Notificación 5', file: '/jf/public/alertas/universfield-new-notification-059-494262.mp3' },
    { name: 'Notificación 6', file: '/jf/public/alertas/universfield-new-notification-064-494547.mp3' },
    { name: 'Notificación 7', file: '/jf/public/alertas/universfield-new-notification-09-352705.mp3' }
  ];

  const handleSelectSound = (file) => {
    setSelectedSound(file);
    localStorage.setItem('alertSound', file);
    playSound(file);
  };

  const handlePlayDemo = (file) => {
    if (playingFile === file) {
      stopAll();
    } else {
      playSound(file);
    }
  };

  useEffect(() => {
    alertSounds.forEach(sound => {
      const audio = new Audio(sound.file);
      audio.preload = 'auto';
      audio.onended = () => setPlayingFile(null);
      audioInstances.current[sound.file] = audio;
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, vehiclesRes, sedesRes] = await Promise.all([
          getStats(),
          getVehicles(),
          getSedes()
        ]);
        
        let vehiclesData = vehiclesRes.data || [];
        let extraAlerts = 0;

        // Calculate alerts using persistent thresholds from DB
        vehiclesData = vehiclesData.map(v => {
          const km = v.km_actual || 0;
          
          const proxMtto = v.km_proximo_mantenimiento || 5000;
          const isCriticalMtto = km >= proxMtto;
          
          const proxRotacion = v.km_proxima_rotacion || 10000;
          const isCriticalRotacion = km >= proxRotacion;
          
          const proxLavado = v.km_proximo_lavado || 2000;
          const isCriticalLavado = km >= proxLavado;

          if (isCriticalMtto || isCriticalRotacion || isCriticalLavado) {
            extraAlerts++;
          }

          return {
            ...v,
            proxMtto,
            isCriticalMtto,
            proxRotacion,
            isCriticalRotacion,
            proxLavado,
            isCriticalLavado
          };
        });

        setStats({...statsRes.data, criticalAlerts: extraAlerts});
        setVehicles(vehiclesData);
        setSedes(sedesRes.data);
        
        if (extraAlerts > 0) {
          toast.error(`Atención: Hay ${extraAlerts} alertas críticas de mantenimiento.`, {
            duration: 5000,
            icon: '🚨'
          });
          playAlarmSound();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Cleanup audio on unmount
    return () => {
      stopAll();
    };
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

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
    <div className="dashboard-content">
      <header className="header">
        <div>
          <h1>Panel de Control</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenido de nuevo al centro de gestión.</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowSoundSettings(!showSoundSettings)} 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Settings size={16} /> Configurar Sonido
          </button>
          <div className="date-display desktop-only">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button onClick={handleLogout} className="btn-primary btn-logout">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </header>

      {showSoundSettings && (
        <div className="card" style={{ marginBottom: '1.5rem', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Configuración de Tono de Alerta</h3>
            <button onClick={() => setShowSoundSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {alertSounds.map((sound, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: `2px solid ${selectedSound === sound.file ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedSound === sound.file ? 'rgba(3, 89, 198, 0.05)' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{sound.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handlePlayDemo(sound.file)}
                    className={playingFile === sound.file ? "btn-primary" : "btn-secondary"}
                    style={{ 
                      flex: 1, 
                      padding: '0.4rem', 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.25rem',
                      background: playingFile === sound.file ? 'var(--error)' : '' 
                    }}
                  >
                    {playingFile === sound.file ? <Pause size={12} /> : <Play size={12} />}
                    {playingFile === sound.file ? 'Stop' : 'Play'}
                  </button>
                  <button 
                    onClick={() => handleSelectSound(sound.file)}
                    className="btn-primary"
                    style={{ flex: 2, padding: '0.4rem', fontSize: '0.75rem', opacity: selectedSound === sound.file ? 0.7 : 1 }}
                    disabled={selectedSound === sound.file}
                  >
                    {selectedSound === sound.file ? 'Activo' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">Vehículos Totales</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="stat-value">{stats?.totalVehicles || vehicles.length}</span>
            <Truck size={24} color="var(--primary)" />
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Alertas Críticas</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="stat-value" style={{ color: 'var(--error)' }}>{stats?.criticalAlerts || 0}</span>
            <span style={{ color: 'var(--error)' }}><AlertCircle size={24} /></span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Mantenimiento al día</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              {vehicles.length - (stats?.criticalAlerts || 0)}
            </span>
            <CheckCircle2 size={24} color="var(--success)" />
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Gasto Mensual</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="stat-value">${stats?.monthlySpending?.toLocaleString() || '0.00'}</span>
            <DollarSign size={24} color="var(--success)" />
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <h3>Panel de Alertas de Flota</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Las alertas por kilometraje se activan al acercarse al límite. Rotación cada 10,000km, Lavado cada 2,000km.
          </p>
          <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Vehículo</th>
                  <th>Km Actual</th>
                  <th>Alertas Activas</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No hay vehículos registrados</td></tr>
                ) : (
                  vehicles.map(v => {
                    const isAnyCritical = v.isCriticalMtto || v.isCriticalRotacion || v.isCriticalLavado;
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', background: isAnyCritical ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '1rem 0' }}>
                          <strong>{v.placa}</strong> <br/>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.marca} {v.modelo}</span>
                        </td>
                        <td>
                          <strong>{v.km_actual?.toLocaleString()} km</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {v.isCriticalMtto && (
                              <span style={{ background: 'var(--error)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                Mtto ({v.proxMtto?.toLocaleString()} km)
                              </span>
                            )}
                            {v.isCriticalRotacion && (
                              <span style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                Rotación ({v.proxRotacion.toLocaleString()} km)
                              </span>
                            )}
                            {v.isCriticalLavado && (
                              <span style={{ background: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                Lavado Chasis ({v.proxLavado.toLocaleString()} km)
                              </span>
                            )}
                            {!isAnyCritical && (
                              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 size={14} /> Todo Óptimo
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

