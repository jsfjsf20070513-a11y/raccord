import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useUserRole() {
  const { user } = useAuth()
  const [role, setRole] = useState('guest')
  const [loading, setLoading] = useState(Boolean(user && isSupabaseConfigured))

  useEffect(() => {
    if (!user) {
      setRole('guest')
      setLoading(false)
      return undefined
    }

    if (!isSupabaseConfigured || !supabase) {
      setRole('user')
      setLoading(false)
      return undefined
    }

    let active = true
    setLoading(true)

    const loadRole = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!active) {
        return
      }

      setRole(data?.role || 'user')
      setLoading(false)
    }

    loadRole()

    return () => {
      active = false
    }
  }, [user])

  return {
    role,
    loading,
    isAdmin: role === 'admin' || role === 'super_admin',
  }
}
