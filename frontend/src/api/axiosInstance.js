import axios from "axios"

let rawBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api"
rawBaseUrl = rawBaseUrl.replace(/\/+$/, "")
if (!rawBaseUrl.endsWith("/api")) {
  rawBaseUrl += "/api"
}

const api = axios.create({
  baseURL: rawBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => { return Promise.reject(error) })

export default api