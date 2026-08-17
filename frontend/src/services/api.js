import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ⚡ FIX : INTERCEPTEUR POUR INJECTER AUTOMATIQUEMENT LE TOKEN JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- AUTHENTIFICATION ---
export const loginUser = (credentials) => 
  API.post('/auth/login', {
    email: credentials.email?.trim(),
    password: credentials.password,
  });

export const registerUser = (userData) => 
  API.post('/auth/register', {
    ...userData,
    email: userData.email?.trim(),
  });

// 🛠️ FIX UNIVERSEL DE LA VÉRIFICATION EMAIL
export const verifyEmail = (verificationData) => {
  const email = encodeURIComponent(verificationData.email?.trim() || '');
  const code = encodeURIComponent(String(verificationData.code || verificationData.token || '').trim());

  // Envoie dans l'URL (req.query) ET dans le corps JSON (req.body)
  return API.post(`/auth/verify-email?email=${email}&token=${code}&code=${code}`, {
    email: verificationData.email?.trim(),
    code: verificationData.code?.trim(),
    token: verificationData.code?.trim()
  });
};

// --- OFFRES DE STAGE ---
export const getAllJobs = (filters = {}) => API.get('/jobs', { params: filters });
export const getCompanyJobs = () => API.get('/jobs/company/me');
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const createJob = (jobData) => API.post('/jobs', jobData);
export const updateJob = (id, jobData) => API.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// --- SERVICES CANDIDATURES ---
export const applyToJob = (formData) => API.post('/applications', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getStudentApplications = () => API.get('/applications/student');
export const getCompanyApplications = () => API.get('/applications/company');
export const updateApplicationStatus = (id, status) => API.put(`/applications/${id}/status`, { status });
export default API;