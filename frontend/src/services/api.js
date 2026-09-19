import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token & Language preference
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('lang') || 'en-IN';
  config.headers['Accept-Language'] = lang;
  return config;
});

export const authAPI = {
  // Mobile + OTP Authentication
  sendOtp: (phone, purpose = 'login') => api.post('/auth/otp/send', { phone, purpose }),
  verifyOtp: (phone, otp) => api.post('/auth/otp/verify', { phone, otp }),
  
  // Voice-Guided Onboarding
  voiceOnboard: (data) => api.post('/auth/onboard', data),

  // Fallback / Legacy
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateLanguage: (language) => api.post('/auth/language', { language })
};

export const shopAPI = {
  // Platform Admin
  getAllShops: () => api.get('/shops/admin/shops'),
  getPlatformStats: () => api.get('/shops/admin/stats'),
  toggleShopStatus: (id, isActive) => api.patch(`/shops/admin/shops/${id}/status`, { isActive }),

  // Shop Owner Staff Management
  getStaff: () => api.get('/shops/staff'),
  addStaff: (data) => api.post('/shops/staff', data),
  removeStaff: (id) => api.delete(`/shops/staff/${id}`),

  // Shop Profile
  getProfile: () => api.get('/shops/profile')
};

export const inventoryAPI = {
  getInventory: () => api.get('/inventory'),
  getSummary: () => api.get('/inventory/summary'),
  getAlerts: () => api.get('/inventory/alerts'),
  sendVoiceCommand: (transcript, dryRun = false) => {
    const lang = localStorage.getItem('lang') || 'en-IN';
    return api.post('/inventory/voice', { transcript, dryRun, language: lang });
  },
  quickAdjust: (productId, type, quantity, unit) => {
    const lang = localStorage.getItem('lang') || 'en-IN';
    return api.post('/inventory/quick-adjust', { productId, type, quantity, unit, language: lang });
  }
};

export const productAPI = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  detectImage: (data) => api.post('/products/detect-image', data)
};

export const transactionAPI = {
  getTransactions: (limit = 50) => api.get(`/transactions?limit=${limit}`),
  undoTransaction: (id) => api.post(`/transactions/${id}/undo`)
};

export default api;
