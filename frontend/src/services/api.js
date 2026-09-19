import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateLanguage: (language) => api.post('/auth/language', { language })
};

export const inventoryAPI = {
  getInventory: () => api.get('/inventory'),
  getSummary: () => api.get('/inventory/summary'),
  getAlerts: () => api.get('/inventory/alerts'),
  sendVoiceCommand: (transcript, dryRun = false) => api.post('/inventory/voice', { transcript, dryRun }),
  quickAdjust: (productId, type, quantity, unit) => api.post('/inventory/quick-adjust', { productId, type, quantity, unit })
};

export const productAPI = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const transactionAPI = {
  getTransactions: (limit = 50) => api.get(`/transactions?limit=${limit}`),
  undoTransaction: (id) => api.post(`/transactions/${id}/undo`)
};

export default api;
