import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from "react-router-dom"
import { Dashboard } from './pages/Dashboard'
import { Landing } from './pages/Landing'
import { HourglassLoader } from './components/HourglassLoader'

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
        gutter={10}
        containerStyle={{ bottom: 24, right: 24 }}
        toastOptions={{
          duration: 4000,
          className: 'premium-toast',
          style: {
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            color: '#0f172a',
            border: '1px solid rgba(15, 23, 42, 0.09)',
            borderRadius: '16px',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.9) inset, 0 20px 50px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.06)',
            fontSize: '14px',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: '500',
            lineHeight: '1.5',
            padding: '14px 18px',
            minWidth: '300px',
            maxWidth: '420px',
          },
          success: {
            duration: 3500,
            style: { borderLeft: '3px solid #10b981' },
            iconTheme: { primary: '#10b981', secondary: '#f0fdf4' },
          },
          error: {
            duration: 5000,
            style: { borderLeft: '3px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
          },
          loading: {
            style: { borderLeft: '3px solid #f59e0b' },
            icon: <HourglassLoader size={22} />,
          },
        }}
      />
    </>
  )
}
