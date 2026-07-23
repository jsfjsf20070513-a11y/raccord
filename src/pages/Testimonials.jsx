import { useEffect, useMemo, useState } from 'react'
import { useWorld } from '../context/useWorld'
import { verifiedTechnicalTraces } from '../data/testimonialArchive'
import CarnetRegisterDesktop from '../experiences/desktop/carnet/CarnetRegisterDesktop'
import CarnetRegisterMobile from '../experiences/mobile/carnet/CarnetRegisterMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import { loadTestimonials } from '../lib/testimonialsBackend'
import { isSupabaseConfigured } from '../lib/supabase'

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Asia/Shanghai',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export default function Testimonials() {
  const { setWorld } = useWorld()
  const mode = useExperienceMode()
  const [remoteEntries, setRemoteEntries] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setWorld('carnet')
  }, [setWorld])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const entries = await loadTestimonials()
        if (active) setRemoteEntries(entries)
      } catch (error) {
        if (active) {
          if (import.meta.env.DEV) console.info('[testimonials] read-only archive unavailable', error)
          setStatus('寄语数据库尚未就绪;来源附录仍可阅读。')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const contributions = useMemo(() => remoteEntries.map((entry) => ({
    id: `supabase-${entry.id}`,
    content: entry.content,
    signature: entry.signature || 'anonyme',
    date: formatDate(entry.created_at),
    source: 'supabase',
  })), [remoteEntries])

  const Register = mode === 'mobile' ? CarnetRegisterMobile : CarnetRegisterDesktop
  return (
    <Register
      traces={verifiedTechnicalTraces}
      contributions={contributions}
      loading={loading}
      status={status}
    />
  )
}
