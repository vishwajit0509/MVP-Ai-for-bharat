import { useState, useCallback } from 'react'
import { api } from '../api/client'

export function useTender() {
  const [bootstrap, setBootstrap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadBootstrap = useCallback(async (tenderId = null) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchBootstrap(tenderId)
      setBootstrap(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSelectedTender = useCallback((selectedTender) => {
    setBootstrap(prev => prev ? { ...prev, selected_tender: selectedTender } : null)
  }, [])

  const tender = bootstrap?.selected_tender || null
  const tenders = bootstrap?.tenders || []
  const system = bootstrap?.system || null

  return {
    bootstrap, tender, tenders, system,
    loading, error,
    loadBootstrap, updateSelectedTender,
  }
}
