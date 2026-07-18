import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to inject the JWT auth token
api.interceptors.request.use(
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

export const authAPI = {
  register: (fullName, email, password) => 
    api.post('/auth/register', { full_name: fullName, email, password }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  getMe: () => 
    api.get('/auth/me'),
};

export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getHistory: () => api.get('/resumes/history'),
  getDetails: (id) => api.get(`/resumes/${id}`),
};

export const jobAPI = {
  create: (title, company, rawText) => 
    api.post('/jobs/create', { title, company, raw_text: rawText }),
};

export const analysisAPI = {
  run: (resumeId, jobDescriptionId) => 
    api.post('/analysis/run', { resume_id: resumeId, job_description_id: jobDescriptionId }),
  getHistory: () => api.get('/analysis/history'),
  getDetails: (id) => api.get(`/analysis/${id}`),
};

export const interviewAPI = {
  createSession: (resumeId, jobDescriptionId) => 
    api.post('/interviews/sessions/create', { resume_id: resumeId, job_description_id: jobDescriptionId }),
  getSessions: () => api.get('/interviews/sessions'),
  getSessionDetails: (id) => api.get(`/interviews/sessions/${id}`),
  submitAnswer: (id, questionIndex, questionText, answer) => 
    api.post(`/interviews/sessions/${id}/submit`, {
      question_index: questionIndex,
      question_text: questionText,
      candidate_answer: answer,
    }),
  getFeedbacks: (id) => api.get(`/interviews/sessions/${id}/feedback`),
};

export default api;
