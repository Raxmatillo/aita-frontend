import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// Authentication API
// ============================================================================

export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password })
  const { access, refresh } = response.data
  
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
  
  // Get user profile
  const userResponse = await api.get('/auth/me/')
  localStorage.setItem('user', JSON.stringify(userResponse.data))
  
  return userResponse.data
}

export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData)
  return response.data
}

export const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const getToken = () => {
  return localStorage.getItem('access_token')
}

// ============================================================================
// Classes API
// ============================================================================

export const getClasses = async () => {
  const response = await api.get('/classes/')
  return response.data
}

export const createClass = async (classData) => {
  const response = await api.post('/classes/', classData)
  return response.data
}

export const updateClass = async (classId, classData) => {
  const response = await api.put(`/classes/${classId}/`, classData)
  return response.data
}

export const deleteClass = async (classId) => {
  const response = await api.delete(`/classes/${classId}/`)
  return response.data
}

export const getClassDetails = async (classId) => {
  const response = await api.get(`/classes/${classId}/`)
  return response.data
}

// ============================================================================
// Students API
// ============================================================================

export const getStudents = async () => {
  const response = await api.get('/students/')
  return response.data
}

export const createStudent = async (studentData) => {
  const response = await api.post('/students/', studentData)
  return response.data
}

export const updateStudent = async (studentId, studentData) => {
  const response = await api.put(`/students/${studentId}/`, studentData)
  return response.data
}

export const deleteStudent = async (studentId) => {
  const response = await api.delete(`/students/${studentId}/`)
  return response.data
}

// ============================================================================
// Vocabularies API
// ============================================================================

export const getVocabularies = async (params = {}) => {
  const response = await api.get('/vocabularies/', { params })
  return response.data
}

export const createVocabulary = async (formData) => {
  const response = await api.post('/vocabularies/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updateVocabulary = async (vocabId, formData) => {
  const response = await api.put(`/vocabularies/${vocabId}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteVocabulary = async (vocabId) => {
  const response = await api.delete(`/vocabularies/${vocabId}/`)
  return response.data
}

export const getCategories = async () => {
  try {
    const response = await api.get('/categories/')
    console.log(response.data)

    // Yangi struktura bo'yicha ma'lumotni qaytarish
    return response.data.results || []  // Agar `results` bo'lmasa, bo'sh massivni qaytaradi
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []  // Agar xatolik yuz bersa, bo'sh massiv qaytariladi
  }
}

// ============================================================================
// Test API
// ============================================================================

export const getRandomQuestion = async (studentId, categories = null) => {
  const params = categories ? { categories: categories.join(',') } : {}
  const response = await api.get(`/test/${studentId}/random/`, { params })
  return response.data
}

export const submitAnswer = async (studentId, answerData) => {
  const response = await api.post(`/test/${studentId}/answer/`, answerData)
  return response.data
}

// ============================================================================
// Results API
// ============================================================================

export const getStudentResults = async (studentId) => {
  const response = await api.get(`/results/${studentId}/`)
  return response.data
}

export const clearStudentResults = async (studentId) => {
  const response = await api.delete(`/results/${studentId}/clear/`)
  return response.data
}

export default api
