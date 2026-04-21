import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Landing } from './pages/Landing'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'hot-toast-card',
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid rgba(15,23,42,0.12)',
            boxShadow: '0 14px 34px rgba(15,23,42,0.12)',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            padding: '14px 16px',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#f8fafc' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#f8fafc' },
          },
        }}
      />
    </>
  )
}
