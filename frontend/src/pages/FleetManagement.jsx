import React, { useState, useEffect } from 'react';
import { Truck, Plus, Filter, MoreVertical, FileText, Trash2, MapPin, Loader2, Edit3, X } from 'lucide-react';
import { getVehicles, getSedes, importVehicles, deleteVehicle, updateVehicle, getHistory } from '../services/api';
import toast from 'react-hot-toast';

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSede, setSelectedSede] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const viewHistory = async (id) => {
    try {
      setLoading(true);
      const res = await getHistory(id);
      setHistoryData(res.data);
    } catch (err) {
      toast.error('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [vRes, sRes] = await Promise.all([getVehicles(), getSedes()]);
      setVehicles(vRes.data);
      setSedes(sRes.data);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este vehículo? esta acción no se puede deshacer.')) return;
    try {
      setLoading(true);
      await deleteVehicle(id);
      toast.success('Vehículo eliminado correctamente');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateVehicle(editingVehicle.id, editingVehicle);
      toast.success('Vehículo actualizado');
      setEditingVehicle(null);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await importVehicles(formData);
      toast.success(res.data.message);
      fetchData(); // reload
    } catch (err) {
      toast.error("Error al importar");
    } finally {
      e.target.value = null;
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (v.n_interno && v.n_interno.toString().includes(searchTerm));
    
    const matchesSede = selectedSede === 'ALL' || v.sede_id === parseInt(selectedSede);
    
    return matchesSearch && matchesSede;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="fleet-container">
      <header className="header">
        <div>
          <h1>Gestión de Flota</h1>
          <p style={{ color: 'var(--text-muted)' }}>Inventario total de unidades y documentación.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => document.getElementById('csvInput').click()}
            className="btn-primary" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: '#10b981', color: '#fff', border: 'none' 
            }}>
            <FileText size={18} />
            Importar CSV
            <input 
              type="file" 
              id="csvInput" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleImport} 
            />
          </button>

          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            Nuevo Vehículo
          </button>
        </div>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Filtrar por placa, marca o Nº..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
        </div>
        <select 
          value={selectedSede}
          onChange={(e) => setSelectedSede(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
        >
          <option value="ALL">Todas las Sedes</option>
          {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option>Todos los Tipos</option>
          <option>Van</option>
          <option>Bus</option>
          <option>Sedan</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Vehículo</th>
              <th>Información Técnica</th>
              <th>Sede Actual</th>
              <th>KM Total</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No se encontraron vehículos.</td></tr>
            ) : (
              filteredVehicles.map((v) => {
                const sedeObj = sedes.find(s => s.id === v.sede_id);
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '6px' }}>
                          <Truck size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1rem' }}>{v.placa}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{v.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{v.marca || '---'} {v.modelo || '---'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{v.tipo}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                        <MapPin size={14} color="var(--accent)" />
                        {sedeObj?.nombre || 'Sin Sede'}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{v.km_actual?.toLocaleString()} KM</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        background: v.estado === 'activo' ? '#D1FAE5' : '#FEF3C7',
                        color: v.estado === 'activo' ? '#065F46' : '#92400E'
                      }}>
                        {v.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => viewHistory(v.id)}
                          style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent)', cursor: 'pointer' }} 
                          title="Ver Historial"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingVehicle(v)}
                          style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }} 
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          style={{ padding: '0.5rem', background: 'transparent', color: 'var(--error)', cursor: 'pointer' }} 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
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

      {/* Modal de Edición */}
      {editingVehicle && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 10000 
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => setEditingVehicle(null)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Editar Vehículo</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Placa</label>
                <input 
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={editingVehicle.placa}
                  onChange={(e) => setEditingVehicle({...editingVehicle, placa: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Marca</label>
                  <input 
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    value={editingVehicle.marca}
                    onChange={(e) => setEditingVehicle({...editingVehicle, marca: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Modelo</label>
                  <input 
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    value={editingVehicle.modelo}
                    onChange={(e) => setEditingVehicle({...editingVehicle, modelo: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Sede</label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={editingVehicle.sede_id}
                  onChange={(e) => setEditingVehicle({...editingVehicle, sede_id: e.target.value})}
                  required
                >
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Meta de Próximo Mantenimiento (KM)</label>
                <input 
                  type="number"
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={editingVehicle.km_proximo_mantenimiento || ''}
                  onChange={(e) => setEditingVehicle({...editingVehicle, km_proximo_mantenimiento: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingVehicle(null)}
                  style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#64748B' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Historial */}
      {historyData && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 10000 
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setHistoryData(null)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1rem' }}>Historial del Vehículo</h2>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div><strong>Placa:</strong> {historyData.vehiculo.placa}</div>
              <div><strong>Kilometraje Actual:</strong> {historyData.vehiculo.km_actual?.toLocaleString()} KM</div>
            </div>

            <div className="grid-2-1">
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Mantenimientos Recientes</h3>
                <div className="table-container">
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.5rem' }}>Fecha</th>
                        <th>Detalle</th>
                        <th>Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.mantenimientos.length === 0 ? (
                        <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Sin registros.</td></tr>
                      ) : (
                        historyData.mantenimientos.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>{new Date(m.fecha_mantenimiento).toLocaleDateString()}</td>
                            <td>{m.descripcion}</td>
                            <td>${m.costo?.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Lecturas de KM</h3>
                <div className="table-container">
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.5rem' }}>Fecha</th>
                        <th>Lectura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.lecturas.map(l => (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem' }}>{new Date(l.created_at).toLocaleString()}</td>
                          <td>{l.km_leido?.toLocaleString()} KM</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setHistoryData(null)}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '2rem' }}
            >
              Cerrar Historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;

