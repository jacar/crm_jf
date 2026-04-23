import React, { useState, useEffect } from 'react';
import { Settings, PenTool, ExternalLink, FileUp, AlertCircle, Loader2 } from 'lucide-react';
import { getVehicles, getMantenimientos, createMantenimiento } from '../services/api';

const MaintenanceControl = () => {
  const [workshopType, setWorkshopType] = useState('interno');
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    tipo_mantenimiento: '',
    km_realizado: '',
    costo: '',
    ruc_nit: '',
    notas: '',
    fecha_mantenimiento: new Date().toISOString().split('T')[0],
    services: {
      aceite: false,
      chasis: false,
      rotacion: false,
      otros: false
    },
    nextAlerts: {
      aceite: '',
      chasis: '',
      rotacion: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, mRes] = await Promise.all([getVehicles(), getMantenimientos()]);
      setVehicles(vRes.data);
      setHistory(mRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { vehiculo_id, km_realizado, services, nextAlerts, tipo_mantenimiento } = formData;
    
    const selectedServices = [];
    if (services.aceite) selectedServices.push('Cambio de Aceite');
    if (services.chasis) selectedServices.push('Lavado de Chasis');
    if (services.rotacion) selectedServices.push('Rotación de Cauchos');
    if (services.otros && tipo_mantenimiento) selectedServices.push(tipo_mantenimiento);
    
    const finalTipoMantenimiento = selectedServices.join(', ') || 'Mantenimiento General';

    if (!vehiculo_id || !km_realizado) {
      alert('Por favor seleccione vehículo y kilometraje');
      return;
    }

    setSubmitting(true);
    try {
      await createMantenimiento({
        ...formData,
        tipo_mantenimiento: finalTipoMantenimiento,
        tipo_taller: workshopType,
        costo: workshopType === 'externo' ? formData.costo : 0,
        km_proximo_mantenimiento: services.aceite ? nextAlerts.aceite : null,
        km_proximo_lavado: services.chasis ? nextAlerts.chasis : null,
        km_proxima_rotacion: services.rotacion ? nextAlerts.rotacion : null
      });
      setFormData({
        vehiculo_id: '',
        tipo_mantenimiento: '',
        km_realizado: '',
        costo: '',
        ruc_nit: '',
        notas: '',
        fecha_mantenimiento: new Date().toISOString().split('T')[0],
        services: { aceite: false, chasis: false, rotacion: false, otros: false },
        nextAlerts: { aceite: '', chasis: '', rotacion: '' }
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert('Error al guardar el mantenimiento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="maintenance-container">
      <header className="header">
        <div>
          <h1>Control de Mantenimiento</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registro de servicios técnicos y carga de facturas.</p>
        </div>
      </header>

      <div className="grid-2-1">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Nuevo Registro</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Vehículo</label>
              <select 
                name="vehiculo_id"
                value={formData.vehiculo_id}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              >
                <option value="">Seleccione un vehículo</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Tipo de Taller</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="workshop" 
                    value="interno" 
                    checked={workshopType === 'interno'} 
                    onChange={() => setWorkshopType('interno')}
                    style={{ marginRight: '8px' }}
                  />
                  Interno
                </label>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="workshop" 
                    value="externo" 
                    checked={workshopType === 'externo'} 
                    onChange={() => setWorkshopType('externo')}
                    style={{ marginRight: '8px' }}
                  />
                  Externo
                </label>
              </div>
            </div>

            {workshopType === 'externo' && (
              <div className="faded-section" style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>RUC / NIT Taller</label>
                  <input 
                    type="text" 
                    name="ruc_nit"
                    value={formData.ruc_nit}
                    onChange={handleChange}
                    placeholder="Ej: 20123456789" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Costo (USD)</label>
                  <input 
                    type="number" 
                    name="costo"
                    value={formData.costo}
                    onChange={handleChange}
                    placeholder="0.00" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Factura (PDF)</label>
                  <div style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', textAlign: 'center', background: 'white', cursor: 'pointer' }}>
                    <FileUp size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click para subir archivo</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Kilometraje Actual</label>
                <input 
                  type="number" 
                  name="km_realizado"
                  value={formData.km_realizado}
                  onChange={(e) => {
                    const km = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      km_realizado: e.target.value,
                      nextAlerts: {
                        aceite: km > 0 ? km + 5000 : '',
                        chasis: km > 0 ? km + 2000 : '',
                        rotacion: km > 0 ? km + 10000 : ''
                      }
                    });
                  }}
                  placeholder="Ej: 15200" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Fecha del Servicio</label>
                <input 
                  type="date" 
                  name="fecha_mantenimiento"
                  value={formData.fecha_mantenimiento}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.875rem' }}>Servicios Realizados y Próximas Alertas</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.services.aceite} onChange={(e) => setFormData({...formData, services: {...formData.services, aceite: e.target.checked}})} />
                    <span>Cambio de Aceite</span>
                  </label>
                  {formData.services.aceite && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Próx:</span>
                      <input type="number" value={formData.nextAlerts.aceite} onChange={(e) => setFormData({...formData, nextAlerts: {...formData.nextAlerts, aceite: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.services.chasis} onChange={(e) => setFormData({...formData, services: {...formData.services, chasis: e.target.checked}})} />
                    <span>Lavado de Chasis</span>
                  </label>
                  {formData.services.chasis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Próx:</span>
                      <input type="number" value={formData.nextAlerts.chasis} onChange={(e) => setFormData({...formData, nextAlerts: {...formData.nextAlerts, chasis: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.services.rotacion} onChange={(e) => setFormData({...formData, services: {...formData.services, rotacion: e.target.checked}})} />
                    <span>Rotación de Cauchos</span>
                  </label>
                  {formData.services.rotacion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Próx:</span>
                      <input type="number" value={formData.nextAlerts.rotacion} onChange={(e) => setFormData({...formData, nextAlerts: {...formData.nextAlerts, rotacion: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={formData.services.otros} onChange={(e) => setFormData({...formData, services: {...formData.services, otros: e.target.checked}})} />
                  <span>Otros (especificar abajo)</span>
                </label>
              </div>
            </div>

            {(formData.services.otros || (!formData.services.aceite && !formData.services.chasis && !formData.services.rotacion)) && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Detalle de Otros Servicios</label>
                <textarea 
                  name="tipo_mantenimiento"
                  value={formData.tipo_mantenimiento}
                  onChange={handleChange}
                  placeholder="Ej: Cambio de filtros, revisión de frenos..." 
                  rows="2" 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                ></textarea>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ padding: '0.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar Mantenimiento'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Historial Reciente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay registros previos.</p>
            ) : (
              history.map(item => (
                <div key={item.id} className="maintenance-item" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      background: item.tipo_taller === 'interno' ? '#E0F2FE' : '#FEE2E2', 
                      color: item.tipo_taller === 'interno' ? '#0369A1' : '#991B1B', 
                      padding: '0.75rem', 
                      borderRadius: '8px' 
                    }}>
                      {item.tipo_taller === 'interno' ? <PenTool size={20} /> : <ExternalLink size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{item.tipo_mantenimiento}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.placa} • {new Date(item.fecha).toLocaleDateString()} • {item.km_realizado} km
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary)', textTransform: 'capitalize' }}>{item.tipo_taller}</div>
                    <div style={{ fontSize: '0.75rem', color: item.tipo_taller === 'interno' ? 'var(--success)' : 'var(--primary)' }}>
                      {item.tipo_taller === 'interno' ? 'Completado' : `$${item.costo}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceControl;

