import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Briefcase, Shield, Save, Loader2, X } from 'lucide-react';
import { getStaff, getTeams, updateStaff } from '../services/api';
import toast from 'react-hot-toast';

const Teams = () => {
  const [staff, setStaff] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', cargo: '', equipo_id: '', rol_interno: 'usuario' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([getStaff(), getTeams()]);
      setStaff(sRes.data);
      setTeams(tRes.data);
    } catch (err) {
      toast.error('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createStaff(newUser);
      toast.success('Miembro agregado correctamente');
      setIsCreating(false);
      setNewUser({ name: '', email: '', password: '', cargo: '', equipo_id: '', rol_interno: 'usuario' });
      fetchData();
    } catch (err) {
      toast.error('Error al crear usuario. Verifica el email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateStaff(editingUser.id, editingUser);
      toast.success('Perfil actualizado');
      setEditingUser(null);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="teams-container">
      <header className="header">
        <div>
          <h1>Equipos de Trabajo</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los cargos, roles y equipos de los colaboradores.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={18} />
          Nuevo Miembro
        </button>
      </header>

      <div className="grid-2-1">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Colaborador</th>
                  <th>Cargo / Posición</th>
                  <th>Equipo</th>
                  <th>Rol CRM</th>
                  <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Briefcase size={14} color="var(--primary)" />
                        {u.cargo}
                      </div>
                    </td>
                    <td>{u.equipo_nombre || 'Sin Equipo'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', 
                        background: u.rol_interno === 'admin' ? '#dcfce7' : '#f1f5f9',
                        color: u.rol_interno === 'admin' ? '#166534' : '#64748b'
                      }}>
                        {u.rol_interno}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                      <button 
                        onClick={() => setEditingUser(u)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                      >
                        <Shield size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Resumen de Equipos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {teams.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay equipos creados.</p>
            ) : (
              teams.map(t => (
                <div key={t.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 700 }}>{t.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.descripcion}</div>
                </div>
              ))
            )}
            <button className="btn-primary" style={{ marginTop: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
              Crear Nuevo Equipo
            </button>
          </div>
        </div>
      </div>

      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '400px', position: 'relative' }}>
             <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none' }}><X size={20} /></button>
             <h2>Editar Perfil Laboral</h2>
             <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cargo / Puesto</label>
                  <input 
                    className="form-control" 
                    value={editingUser.cargo || ''} 
                    onChange={e => setEditingUser({...editingUser, cargo: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Equipo</label>
                  <select 
                    className="form-control" 
                    value={editingUser.equipo_id || ''} 
                    onChange={e => setEditingUser({...editingUser, equipo_id: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  >
                    <option value="">Ninguno</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rol en Plataforma</label>
                  <select 
                    className="form-control" 
                    value={editingUser.rol_interno || 'usuario'} 
                    onChange={e => setEditingUser({...editingUser, rol_interno: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                  >
                    <option value="usuario">Usuario Estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Guardar Cambios</button>
             </form>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
             <button onClick={() => setIsCreating(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none' }}><X size={20} /></button>
             <h2 style={{ marginBottom: '1.5rem' }}>Nuevo Miembro</h2>
             <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Nombre Completo</label>
                    <input 
                      className="form-control" 
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Email Correo</label>
                    <input 
                      type="email"
                      className="form-control" 
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Contraseña (Mín. 6 caracteres)</label>
                  <input 
                    type="password"
                    className="form-control" 
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Cargo</label>
                    <input 
                      className="form-control" 
                      placeholder="Ej: Conductor"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                      value={newUser.cargo}
                      onChange={e => setNewUser({...newUser, cargo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Equipo</label>
                    <select 
                      className="form-control" 
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                      value={newUser.equipo_id}
                      onChange={e => setNewUser({...newUser, equipo_id: e.target.value})}
                    >
                      <option value="">Ninguno</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Rol de Usuario</label>
                  <select 
                    className="form-control" 
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                    value={newUser.rol_interno}
                    onChange={e => setNewUser({...newUser, rol_interno: e.target.value})}
                  >
                    <option value="usuario">Operador / Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', color: '#64748B' }}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>Crear Miembro</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
