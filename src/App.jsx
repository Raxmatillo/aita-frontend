import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import React from "react";
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Register from './pages/Register'

import ProtectedRoute from './components/ProtectedRoute'
import { getToken } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken()
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Login setIsAuthenticated={setIsAuthenticated} />
        } 
      />
    
      <Route 
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/library"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Library />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App