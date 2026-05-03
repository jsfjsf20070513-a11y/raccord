import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const hasRealValue = (value = '') => value && !value.startsWith('YOUR_SUPABASE_')

export const isSupabaseConfigured = Boolean(
  hasRealValue(supabaseUrl) && hasRealValue(supabaseAnonKey),
)

export const SUPABASE_MISSING_MESSAGE = '站点管理员还没有完成 Supabase 配置，登录、找回密码和评论功能暂时不可用。'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
