import axios from 'axios';

const API_URL = window.location.hostname.includes('corporacionjf.com') 
  ? 'https://crm.corporacionjf.com/api' 
  : 'https://www.mecanicoenmedellin.com/jf/public/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/login', { ...credentials, device_name: 'webapp' });
export const logout = () => api.post('/logout');
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
export const getHistory = (id) => api.get(`/vehicles/${id}/history`);
export const getMessages = () => api.get('/chat');
export const sendMessage = (contenido) => api.post('/chat', { contenido });
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const getTeams = () => api.get('/teams');
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const getDocuments = () => api.get('/documentos');
export const uploadDocument = (formData) => api.post('/documentos', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteDocument = (id) => api.delete(`/documentos/${id}`);
export const getVehicles = () => api.get('/vehicles');
export const importVehicles = (formData) => api.post('/vehicles/import', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getStats = () => api.get('/stats');
export const getAnalytics = () => api.get('/reports/analytics');
export const getSedes = () => api.get('/sedes');
export const createSede = (data) => api.post('/sedes', data);
export const getMantenimientos = () => api.get('/mantenimientos');
export const createMantenimiento = (data) => api.post('/mantenimientos', data);
export const updateKm = (id, data) => api.post(`/vehicles/${id}/update-km`, data);

export default api;
