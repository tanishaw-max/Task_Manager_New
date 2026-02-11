import axios from "axios";

const instance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rbac_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('rbac_user');
      localStorage.removeItem('rbac_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
};

const api = {
  client: instance,
  setToken,

  // AUTH
  login: (data) => instance.post("/api/auth/login", data),
  register: (data) => instance.post("/api/auth/register", data),

  // TASKS
  getTasks: () => instance.get("/api/tasks"),
  createTask: (data) => instance.post("/api/tasks", data),
  updateTask: (id, data) => instance.put(`/api/tasks/${id}`, data),
  deleteTask: (id) => instance.delete(`/api/tasks/${id}`),

  // USERS
  getUsers: () => instance.get("/api/users"),
  createUser: (data) => instance.post("/api/users", data),
  updateUser: (id, data) => instance.put(`/api/users/${id}`, data),
  deleteUser: (id) => instance.delete(`/api/users/${id}`),

  // PROJECTS
  getProjects: () => instance.get("/api/projects"),
  createProject: (data) => instance.post("/api/projects", data),
  updateProject: (id, data) => instance.put(`/api/projects/${id}`, data),
  deleteProject: (id) => instance.delete(`/api/projects/${id}`),
};

export default api;
