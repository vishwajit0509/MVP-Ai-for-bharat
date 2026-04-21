import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <>
      <Dashboard />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e2a3a',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f1629' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#0f1629' },
          },
        }}
      />
    </>
  )
}
