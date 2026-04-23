import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertCircle, CheckCircle2, DollarSign, Loader2, LogOut, Settings, Play, Pause, Volume2, VolumeX, ShieldCheck, Map, Signal, Fingerprint, Search, Filter, FileDown, FileSpreadsheet, X, Clock } from 'lucide-react';
import { getStats, getVehicles, getSedes, logout } from '../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE = window.location.hostname.includes('corporacionjf.com') ? '' : '/jf/public';

let globalAudio = null;

const playAlarmSound = () => {
  try {
    const selectedSound = localStorage.getItem('alertSound') || `${BASE}/alerta.mp3`;
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    }
    globalAudio = new Audio(selectedSound);
    globalAudio.loop = true;
    globalAudio.play().catch(e => console.warn("Audio play blocked:", e));
  } catch(e) {
    console.error("Audio failed", e);
  }
};

const stopGlobalAudio = () => {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.loop = false;
  }
};

const Dashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [selectedSound, setSelectedSound] = useState(localStorage.getItem('alertSound') || `${BASE}/alerta.mp3`);
  const [playingFile, setPlayingFile] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [alertBannerVisible, setAlertBannerVisible] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  
  // Mute Logic
  const [isMutedAlways, setIsMutedAlways] = useState(localStorage.getItem('isMutedAlways') === 'true');
  const [muteUntil, setMuteUntil] = useState(localStorage.getItem('muteUntil') || null);
  
  const [searchTerm, setSearchTerm] = useState(location.state?.filterSede || '');
  const [filterType, setFilterType] = useState('ALL');
  
  const audioInstances = useRef({});

  const stopAll = () => {
    Object.values(audioInstances.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    }
    setPlayingFile(null);
    setIsSoundPlaying(false);
  };

  const checkMuteStatus = () => {
    if (isMutedAlways) return true;
    if (muteUntil && new Date().getTime() < parseInt(muteUntil)) return true;
    return false;
  };

  const handleMuteAlways = () => {
    const newState = !isMutedAlways;
    setIsMutedAlways(newState);
    localStorage.setItem('isMutedAlways', newState);
    if (newState) stopAll();
    toast.success(newState ? 'Alertas desactivadas permanentemente' : 'Alertas reactivadas');
  };

  const handleSnooze = (minutes) => {
    const until = new Date().getTime() + (minutes * 60 * 1000);
    setMuteUntil(until.toString());
    localStorage.setItem('muteUntil', until.toString());
    stopAll();
    setAlertBannerVisible(false);
    toast.success(`Silenciado por ${minutes} minutos`);
  };

  const alertSounds = [
    { name: 'Alerta Principal', file: `${BASE}/alerta.mp3` },
    { name: 'Emergencia', file: `${BASE}/alertas/freesound_community-emergency-alarm-69780.mp3` },
    { name: 'Sirena', file: `${BASE}/alertas/freesound_community-siren-alert-96052.mp3` },
    { name: 'Notificación 1', file: `${BASE}/alertas/universfield-new-notification-022-370046.mp3` },
    { name: 'Notificación 2', file: `${BASE}/alertas/universfield-new-notification-032-480570.mp3` },
    { name: 'Notificación 3', file: `${BASE}/alertas/universfield-new-notification-036-485897.mp3` },
    { name: 'Notificación 4', file: `${BASE}/alertas/universfield-new-notification-051-494246.mp3` },
    { name: 'Notificación 5', file: `${BASE}/alertas/universfield-new-notification-059-494262.mp3` },
    { name: 'Notificación 6', file: `${BASE}/alertas/universfield-new-notification-064-494547.mp3` },
    { name: 'Notificación 7', file: `${BASE}/alertas/universfield-new-notification-09-352705.mp3` }
  ];

  useEffect(() => {
    alertSounds.forEach(sound => {
      const audio = new Audio(sound.file);
      audio.preload = 'auto';
      audio.onended = () => setPlayingFile(null);
      audioInstances.current[sound.file] = audio;
    });
  }, []);

  const checkAlerts = (v) => {
    const alerts = [];
    const km = v.km_actual || 0;
    const today = new Date();
    if (km >= (v.km_proximo_mantenimiento || 5000)) alerts.push({ type: 'danger', label: 'Mtto' });
    if (km >= (v.km_proximo_aceite || 5000)) alerts.push({ type: 'danger', label: 'Aceite' });
    if (v.fecha_vencimiento_poliza && new Date(v.fecha_vencimiento_poliza) <= today) alerts.push({ type: 'danger', label: 'Póliza' });
    if (v.fecha_vencimiento_roct && new Date(v.fecha_vencimiento_roct) <= today) alerts.push({ type: 'danger', label: 'ROCT' });
    if (v.fecha_vencimiento_impuesto && new Date(v.fecha_vencimiento_impuesto) <= today) alerts.push({ type: 'warning', label: 'Impuesto' });
    return alerts;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, vehiclesRes, sedesRes] = await Promise.all([getStats(), getVehicles(), getSedes()]);
        const rawVehicles = vehiclesRes.data || [];
        const processedVehicles = rawVehicles.map(v => ({ ...v, activeAlerts: checkAlerts(v) }));
        setStats(statsRes.data);
        setVehicles(processedVehicles);
        setFilteredVehicles(processedVehicles);
        setSedes(sedesRes.data);
        const totalAlerts = processedVehicles.filter(v => v.activeAlerts.length > 0).length;
        setAlertCount(totalAlerts);
        
        if (totalAlerts > 0 && !checkMuteStatus()) {
          setAlertBannerVisible(true);
          playAlarmSound();
          setIsSoundPlaying(true);
        }
      } catch (error) { console.error('Error fetching dashboard data:', error); }
      finally { setLoading(false); }
    };
    fetchData();
    return () => stopAll();
  }, [isMutedAlways, muteUntil]);

  useEffect(() => {
    let result = vehicles;
    if (searchTerm) {
      result = result.filter(v => 
        v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (v.n_interno && v.n_interno.toString().includes(searchTerm)) ||
        (v.propietario && v.propietario.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterType === 'GPS') result = result.filter(v => v.has_gps);
    else if (filterType === 'STARLINK') result = result.filter(v => v.has_starlink);
    else if (filterType === 'CAPTA_HUELLAS') result = result.filter(v => v.has_capta_huellas);
    else if (filterType === 'POLIZAS_FALTAN') result = result.filter(v => !v.fecha_vencimiento_poliza || v.activeAlerts.some(a => a.label === 'Póliza'));
    setFilteredVehicles(result);
  }, [searchTerm, filterType, vehicles]);

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo1Url = `${BASE}/logo_crm.png`;
    const logo2Url = `${BASE}/logo_corporacion.png`;
    
    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const generateReport = async () => {
      try {
        const [logo1, logo2] = await Promise.all([loadImage(logo1Url), loadImage(logo2Url)]);
        
        // Header Background
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 297, 40, 'F');
        
        // Place Logos
        if (logo2) doc.addImage(logo2, 'PNG', 10, 5, 30, 30);
        if (logo1) doc.addImage(logo1, 'PNG', 45, 8, 24, 24);
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE MAESTRO DE FLOTA', 75, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('CORPORACIÓN JF - CONTROL DE GESTIÓN Y MANTENIMIENTO', 75, 30);
        
        doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 225, 25);
        
        const tableData = filteredVehicles.map(v => [
          v.n_interno || '---',
          v.placa,
          `${v.marca} ${v.modelo}`,
          v.empresa || 'Corporación JF',
          v.propietario || 'S/D',
          v.activeAlerts.map(a => a.label).join(', ') || 'AL DÍA'
        ]);

        autoTable(doc, {
          startY: 45,
          head: [['Nº', 'PLACA', 'MARCA / MODELO', 'EMPRESA', 'PROPIETARIO', 'ESTADO']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
          styles: { fontSize: 9 },
          columnStyles: { 0: { halign: 'center' }, 5: { fontStyle: 'bold' } }
        });

        doc.save(`Reporte_Maestro_JF_${new Date().getTime()}.pdf`);
        toast.success('Reporte Maestro Generado');
      } catch (err) {
        console.error("PDF Error:", err);
        toast.error('Error al generar PDF');
      }
    };

    generateReport();
  };

  const exportToCSV = () => {
    try {
      const headers = ['N Interno,Placa,Modelo,Marca,Empresa,Propietario,Alertas'];
      const rows = filteredVehicles.map(v => [v.n_interno || '', v.placa, v.modelo, v.marca, v.empresa || 'Corporación JF', v.propietario || '', v.activeAlerts.map(a => a.label).join(' | ') || 'AL DIA'].join(','));
      const csvContent = "\uFEFF" + headers.concat(rows).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Flota_JF_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV descargado');
    } catch (e) { toast.error('Error al exportar CSV'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="dashboard-content">
      {alertBannerVisible && alertCount > 0 && !checkMuteStatus() && (
        <div className="alert-banner" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', color: 'white', padding: '1.2rem 2rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'pulse 2s infinite', boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={32} />
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>ESTADO DE ALERTA: {alertCount} UNIDADES</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Se requiere revisión técnica o legal inmediata.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '0.3rem' }}>
              <button onClick={() => handleSnooze(30)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <Clock size={14} /> 30m
              </button>
              <button onClick={() => handleSnooze(60)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <Clock size={14} /> 1h
              </button>
            </div>
            <button onClick={handleMuteAlways} className="btn-primary" style={{ background: 'white', color: '#DC2626', fontWeight: 'bold', borderRadius: '12px' }}>
              <VolumeX size={18} /> Silenciar Siempre
            </button>
            <button onClick={stopAll} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '12px' }}>
              Silenciar Ahora
            </button>
          </div>
        </div>
      )}

      {isMutedAlways && (
        <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.75rem 1.5rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span>Las notificaciones sonoras están desactivadas permanentemente.</span>
          <button onClick={handleMuteAlways} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Reactivar Sonido</button>
        </div>
      )}

      <header className="header" style={{ marginBottom: '2rem' }}>
        <div><h1>Control de Flota Real</h1><p style={{ color: 'var(--text-muted)' }}>{vehicles.length} unidades registradas.</p></div>
        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={exportToPDF} className="btn-primary" style={{ background: '#2563eb', display: 'flex', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '50px' }}><FileDown size={18} /> Exportar PDF</button>
          <button onClick={exportToCSV} className="btn-primary" style={{ background: '#10b981', display: 'flex', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '50px' }}><FileSpreadsheet size={18} /> Exportar CSV</button>
          <button onClick={() => setShowSoundSettings(!showSoundSettings)} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }}><Settings size={20} /></button>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%', color: '#ef4444' }}><LogOut size={20} /></button>
        </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card" onClick={() => setFilterType('ALL')} style={{ cursor: 'pointer', borderBottom: filterType === 'ALL' ? '4px solid var(--primary)' : 'none' }}>
          <div className="stat-label">FLOTA COMPLETA</div>
          <div className="stat-value">{vehicles.length} <Truck size={20} /></div>
        </div>
        <div className="card stat-card" onClick={() => setFilterType('GPS')} style={{ cursor: 'pointer', borderBottom: filterType === 'GPS' ? '4px solid #10b981' : 'none' }}>
          <div className="stat-label">UNIDADES CON GPS</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{vehicles.filter(v => v.has_gps).length} <Map size={20} /></div>
        </div>
        <div className="card stat-card" onClick={() => setFilterType('STARLINK')} style={{ cursor: 'pointer', borderBottom: filterType === 'STARLINK' ? '4px solid #3b82f6' : 'none' }}>
          <div className="stat-label">STAR LINK</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{vehicles.filter(v => v.has_starlink).length} <Signal size={20} /></div>
        </div>
        <div className="card stat-card" onClick={() => setFilterType('CAPTA_HUELLAS')} style={{ cursor: 'pointer', borderBottom: filterType === 'CAPTA_HUELLAS' ? '4px solid #8b5cf6' : 'none' }}>
          <div className="stat-label">CAPTA HUELLAS</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{vehicles.filter(v => v.has_capta_huellas).length} <Fingerprint size={20} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input type="text" placeholder="Buscar por Placa, Nº Interno o Propietario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setFilterType('POLIZAS_FALTAN')} className={`btn-${filterType === 'POLIZAS_FALTAN' ? 'primary' : 'secondary'}`} style={{ fontSize: '0.8rem', borderRadius: '8px' }}><ShieldCheck size={16} /> Ver Pólizas que Faltan</button>
            {(searchTerm || filterType !== 'ALL') && (
              <button onClick={() => { setSearchTerm(''); setFilterType('ALL'); }} className="btn-secondary" style={{ fontSize: '0.8rem', borderRadius: '8px' }}><X size={16} /> Limpiar</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '0.85rem', color: '#64748b' }}>
                <th style={{ padding: '1rem' }}>UNIDAD / PLACA</th>
                <th>DISPOSITIVOS</th>
                <th>EMPRESA / PROPIETARIO</th>
                <th>ESTADO / ALERTAS</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>{v.n_interno ? `Nº ${v.n_interno}` : '---'}</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{v.placa}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.marca} {v.modelo}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {v.has_gps && <Map size={16} style={{ color: '#10b981' }} />}
                      {v.has_starlink && <Signal size={16} style={{ color: '#3b82f6' }} />}
                      {v.has_capta_huellas && <Fingerprint size={16} style={{ color: '#8b5cf6' }} />}
                    </div>
                  </td>
                  <td><div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{v.empresa}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.propietario}</div></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {v.activeAlerts.length > 0 ? v.activeAlerts.map((a, i) => (
                        <span key={i} style={{ background: a.type === 'danger' ? '#fee2e2' : '#fef3c7', color: a.type === 'danger' ? '#dc2626' : '#d97706', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>{a.label}</span>
                      )) : <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>AL DÍA</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
