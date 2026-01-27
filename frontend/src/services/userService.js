import api from './api';

export const getMe = () => api.get('/users/me');
export const updateProfile = (userData) => api.put('/users/me', userData);
export const getDashboard = () => api.get('/users/dashboard');
export const getAdminUsers = () => api.get('/users/admin/users');
export const updateUserRole = (id, role) => api.put(`/users/admin/users/${id}/role`, { role });