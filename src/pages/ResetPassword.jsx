import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

const BACK_LABEL = 'Back to sign in · 返回登录'
const HOME_LABEL = 'Back to title page · 返回扉页'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setPageState('unavailable')
      return undefined
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('form')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState('form')
      } else {
        setTimeout(() => {
          setPageState((current) => (current === 'loading' ? 'invalid' : current))
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setMessage(SUPABASE_MISSING_MESSAGE)
      return
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters. · 密码至少需要 6 位字符。')
      return
    }
    if (password !== confirmPassword) {
      setMessage('The two passwords do not match. · 两次输入的密码不一致。')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPageState('success')
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      setMessage(
        error.message ||
          'Reset failed — please request a new reset link. · 重置失败，请重新申请重置链接。',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Password Recovery"
          title="Verifying reset link · 验证重置链接"
          summary="Checking whether the current link is still valid. · 正在检查当前链接是否仍然有效。"
          backTo="/login"
          backLabel={BACK_LABEL}
        />
      </article>
    )
  }

  if (pageState === 'invalid' || pageState === 'unavailable') {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Password Recovery"
          title={pageState === 'invalid' ? 'Link expired · 链接已失效' : 'Feature unavailable · 功能暂不可用'}
          summary={
            pageState === 'invalid'
              ? 'The reset link has expired or has already been used. Please request a new one. · 重置链接已过期或已使用，请重新申请一次。'
              : SUPABASE_MISSING_MESSAGE
          }
          backTo="/login"
          backLabel={BACK_LABEL}
        />
      </article>
    )
  }

  if (pageState === 'success') {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Password Recovery"
          title="Password reset · 密码已重置"
          summary="The new password has been written to the account. Returning to the title page shortly. · 新密码已经写入账户，稍后将返回首页。"
          backTo="/"
          backLabel={HOME_LABEL}
        />
      </article>
    )
  }

  return (
    <article className="page-column">
      <PageHeader
        kicker="Password Recovery"
        title="Set a new password · 设置新密码"
        summary="Enter a new sign-in password after arriving here from the reset link in your email. · 通过邮件中的重置链接进入后，在此写入新的登录密码。"
        backTo="/login"
        backLabel={BACK_LABEL}
      />

      <section className="page-section">
        <form className="editorial-form" onSubmit={handleSubmit}>
          <PasswordField
            label="New password · 新密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm new password · 确认新密码"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="editorial-actions">
            <button type="submit" className="text-button" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Update password · 更新密码'}
            </button>
            <Link to="/login">{BACK_LABEL}</Link>
          </div>
          {message ? <p className="status-line is-error">{message}</p> : null}
        </form>
      </section>
    </article>
  )
}
