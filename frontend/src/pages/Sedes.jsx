import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, Building2, X } from 'lucide-react';
import { getSedes, createSede } from '../services/api';

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', ubicacion: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSedes();
  }, []);

  const fetchSedes = async () => {
    try {
      const res = await getSedes();
      setSedes(res.data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSede(formData);
      setIsModalOpen(false);
      setFormData({ nombre: '', ubicacion: '' });
      fetchSedes(); // refresh
    } catch (error) {
      console.error('Error creating sede:', error);
      alert('Error al crear sede. Verifique que llenó los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="sedes-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Gestión de Sedes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sucursales y centros de operación logística.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Nueva Sede
        </button>
      </header>

      {/* Modal Nueva Sede */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>Agregar Sede</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Nombre de Sede</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  placeholder="Ej. Sede Norte"
                />
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Ubicación</label>
                <input 
                  type="text" 
                  value={formData.ubicacion}
                  onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  placeholder="Ej. Calle 10 # 45-20"
                />
              </div>
              <button disabled={submitting} type="submit" style={{ marginTop: '1rem', padding: '0.875rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Guardando...' : 'Guardar Sede'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {sedes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay sedes registradas.</p>
        ) : (
          sedes.map(sede => (
            <div key={sede.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e293b', padding: '1.5rem', borderRadius: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#38bdf8' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>{sede.nombre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    <MapPin size={14} />
                    {sede.ubicacion || 'Sin ubicación registrada'}
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>Vehículos asignados</span>
                <span style={{ 
                  background: '#38bdf8', 
                  color: '#0f172a', 
                  padding: '2px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {sede.vehiculos_count || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sedes;
