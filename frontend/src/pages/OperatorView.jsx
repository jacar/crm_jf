import React, { useState, useEffect } from 'react';
import { Save, Truck, Search, Loader2 } from 'lucide-react';
import { getVehicles, updateKm } from '../services/api';
import toast from 'react-hot-toast';

const OperatorView = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [services, setServices] = useState({
    oilChange: false,
    rotation: false,
    wash: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles();
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !kmReading) return;
    
    setIsSubmitting(true);
    setStatusMessage(null);
    
    try {
      const response = await updateKm(selectedVehicle, { 
        km_leido: parseInt(kmReading),
        realizo_mantenimiento: services.oilChange,
        realizo_rotacion: services.rotation,
        realizo_lavado: services.wash,
        operador_id: 1 // TODO: Get from auth context
      });
      
      if (response.data.alert) {
        toast.error(response.data.message, { 
          duration: 6000, 
          position: 'top-center',
          style: { background: '#EF4444', color: '#fff', fontWeight: 'bold' } 
        });
      } else {
        toast.success('Kilometraje registrado correctamente');
      }

      setStatusMessage({ 
        type: 'success', 
        text: response.data.alert 
          ? `¡CRÍTICO! ${response.data.message}` 
          : 'Kilometraje registrado correctamente.' 
      });
      setKmReading('');
      setServices({ oilChange: false, rotation: false, wash: false });
    } catch (error) {
      console.error('Error updating KM:', error);
      toast.error('Error al registrar kilometraje');
      setStatusMessage({ type: 'error', text: 'Error al registrar kilometraje. Intente de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="operator-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Registro de Kilometraje</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Operador Autorizado</p>
      </header>

      <div className="card shadow-lg" style={{ border: '2px solid var(--primary)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Seleccionar Vehículo</label>
            <div style={{ position: 'relative' }}>
              <select 
                required
                className="form-control"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  appearance: 'none',
                  backgroundColor: '#fff'
                }}
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Buscar placa...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Search size={18} color="var(--accent)" />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Kilometraje Actual (KM)</label>
            <input 
              required
              type="number" 
              placeholder="Ej: 15200"
              className="form-control"
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border)',
                fontSize: '1.25rem',
                fontWeight: '700'
              }}
              value={kmReading}
              onChange={(e) => setKmReading(e.target.value)}
            />
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0' }}>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>¿Se realizó algún servicio?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={services.oilChange} onChange={(e) => setServices({...services, oilChange: e.target.checked})} />
                <span>Cambio de Aceite (Mtto Gral)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={services.rotation} onChange={(e) => setServices({...services, rotation: e.target.checked})} />
                <span>Rotación de Cauchos</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={services.wash} onChange={(e) => setServices({...services, wash: e.target.checked})} />
                <span>Lavado de Chasis</span>
              </label>
            </div>
          </div>

          {statusMessage && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: 'var(--radius)', 
              backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${statusMessage.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {statusMessage.text}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting}
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Procesando...' : (
              <>
                <Save size={20} />
                Guardar Lectura
              </>
            )}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Truck size={14} style={{ marginRight: '4px' }} />
          Todos los derechos reservados Corporación JF &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default OperatorView;

