import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Eye, Download, Search, AlertCircle, Loader2, Calendar, Filter, X } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument, getVehicles } from '../services/api';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Doc Form
  const [newDoc, setNewDoc] = useState({
    vehiculo_id: '',
    tipo_doc: '',
    fecha_vencimiento: '',
    file: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, vRes] = await Promise.all([getDocuments(), getVehicles()]);
      setDocuments(dRes.data);
      setVehicles(vRes.data);
    } catch (err) {
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newDoc.file || !newDoc.vehiculo_id || !newDoc.tipo_doc) {
      return toast.error('Por favor completa todos los campos');
    }

    const formData = new FormData();
    formData.append('file', newDoc.file);
    formData.append('vehiculo_id', newDoc.vehiculo_id);
    formData.append('tipo_doc', newDoc.tipo_doc);
    formData.append('fecha_vencimiento', newDoc.fecha_vencimiento);

    try {
      setLoading(true);
      await uploadDocument(formData);
      toast.success('Documento guardado');
      setShowUploadModal(false);
      setNewDoc({ vehiculo_id: '', tipo_doc: '', fecha_vencimiento: '', file: null });
      fetchData();
    } catch (err) {
      toast.error('Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este documento permanentemente?')) return;
    try {
      setLoading(true);
      await deleteDocument(id);
      toast.success('Documento eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const getExpirationStatus = (date) => {
    if (!date) return { label: 'Sin Vencimiento', color: '#64748b', bg: '#f1f5f9' };
    const today = new Date();
    const expDate = new Date(date);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'VENCIDO', color: '#991b1b', bg: '#fef2f2' };
    if (diffDays <= 30) return { label: `Vence en ${diffDays} días`, color: '#92400e', bg: '#fffbeb' };
    return { label: 'Vigente', color: '#166534', bg: '#f0fdf4' };
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.placa?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.tipo_doc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || doc.tipo_doc === filterType;
    return matchesSearch && matchesType;
  });

  if (loading && documents.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="docs-container">
      <header className="header">
        <div>
          <h1>Gestión Documental</h1>
          <p style={{ color: 'var(--text-muted)' }}>Almacenamiento central de pólizas RCV, ROCT y títulos de propiedad.</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} />
          Subir Documento
        </button>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Buscar por placa o tipo de documento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '150px' }}
        >
          <option value="todos">Todos los Tipos</option>
          <option value="Póliza RCV">Póliza RCV</option>
          <option value="Seguro Todo Riesgo">Seguro Todo Riesgo</option>
          <option value="ROCT">ROCT (Carga)</option>
          <option value="Título de Propiedad">Título de Propiedad</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Documento</th>
                <th>Vehículo</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No se encontraron documentos.</td></tr>
              ) : (
                filteredDocs.map(doc => {
                  const status = getExpirationStatus(doc.fecha_vencimiento);
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: '#e2e8f0', p: '0.5rem', borderRadius: '6px', color: 'var(--primary)', padding: '0.5rem' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{doc.tipo_doc}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Subido: {new Date(doc.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{doc.placa}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                          <Calendar size={14} color="var(--accent)" />
                          {doc.fecha_vencimiento ? new Date(doc.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                          background: status.bg, color: status.color
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <a 
                            href={`https://www.mecanicoenmedellin.com/jf/public${doc.url_archivo}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ padding: '0.5rem', color: 'var(--primary)' }}
                            title="Ver / Descargar"
                          >
                            <Eye size={18} />
                          </a>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setShowUploadModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Subir Nuevo Documento</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Vehículo</label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newDoc.vehiculo_id}
                  onChange={e => setNewDoc({...newDoc, vehiculo_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona un vehículo...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Documento</label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newDoc.tipo_doc}
                  onChange={e => setNewDoc({...newDoc, tipo_doc: e.target.value})}
                  required
                >
                  <option value="">Selecciona tipo...</option>
                  <option value="Póliza RCV">Póliza RCV</option>
                  <option value="Seguro Todo Riesgo">Seguro Todo Riesgo</option>
                  <option value="ROCT">ROCT (Carga)</option>
                  <option value="Título de Propiedad">Título de Propiedad</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fecha de Vencimiento</label>
                <input 
                  type="date"
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  value={newDoc.fecha_vencimiento}
                  onChange={e => setNewDoc({...newDoc, fecha_vencimiento: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Archivo (PDF, Excel o Imagen)</label>
                <input 
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,image/*"
                  onChange={e => setNewDoc({...newDoc, file: e.target.files[0]})}
                  style={{ width: '100%', padding: '0.5rem 0' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#64748B' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Guardar Documento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
