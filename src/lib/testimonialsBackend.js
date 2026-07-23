import { isSupabaseConfigured, supabase } from './supabase'

const TESTIMONIAL_COLUMNS = 'id, content, signature, user_id, created_at'

export async function loadTestimonials() {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('testimonials')
    .select(TESTIMONIAL_COLUMNS)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createTestimonial({ content, signature, userId }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      content: content.trim(),
      signature: signature.trim() || 'anonyme',
      user_id: userId,
    })
    .select(TESTIMONIAL_COLUMNS)
    .single()

  if (error) throw error
  return data
}
