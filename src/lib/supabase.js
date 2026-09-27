import { createClient } from '@supabase/supabase-js'
import { resolveBackendConfig } from './backendConfig'

const config = resolveBackendConfig(
  import.meta.env.VITE_RACCORD_SUPABASE_URL,
  import.meta.env.VITE_RACCORD_SUPABASE_ANON_KEY,
)
export const isSupabaseConfigured = config.configured

export const SUPABASE_MISSING_MESSAGE =
  'Supabase has not been configured by the site admin yet — sign-in, password reset, and comments are temporarily unavailable. · 站点管理员还没有完成 Supabase 配置，登录、找回密码和评论功能暂时不可用。'

export const supabase = isSupabaseConfigured
  ? createClient(config.url, config.key)
  : null
