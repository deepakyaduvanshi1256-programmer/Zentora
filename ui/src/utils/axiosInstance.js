import axios from "axios";

// Build-time API address. Web dev: ui/.env. Android/production: VITE_API_URL at build time (see README-ANDROID).
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const axiosInstance = axios.create({ baseURL, timeout: 30000 });

// Tell <GlobalLoader/> when requests start/finish.
const activity = (delta) => window.dispatchEvent(new CustomEvent("api-activity", { detail: delta }));

axiosInstance.interceptors.request.use((config) => {
  activity(1);
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
}, (error) => { activity(-1); return Promise.reject(error); });

axiosInstance.interceptors.response.use(
  (response) => { activity(-1); return response; },
  (error) => {
    activity(-1);
    if (error?.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("info");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
