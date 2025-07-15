import axios from "axios"

const apiClient = axios.create({
  baseURL: "http://localhost:5050/api",
  withCredentials: true, // send cookies 
})

// Optionally add Authorization header 
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
