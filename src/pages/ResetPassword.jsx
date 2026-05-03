import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

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
      setMessage('密码至少需要 6 位字符。')
      return
    }
    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致。')
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
      setMessage(error.message || '重置失败，请重新申请重置链接。')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <article className="page-column">
        <PageHeader kicker="Password Recovery" title="验证重置链接" summary="正在检查当前链接是否仍然有效。" backTo="/login" backLabel="返回登录" />
      </article>
    )
  }

  if (pageState === 'invalid' || pageState === 'unavailable') {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Password Recovery"
          title={pageState === 'invalid' ? '链接已失效' : '功能暂不可用'}
          summary={pageState === 'invalid' ? '重置链接已过期或已使用，请重新申请一次。' : SUPABASE_MISSING_MESSAGE}
          backTo="/login"
          backLabel="返回登录"
        />
      </article>
    )
  }

  if (pageState === 'success') {
    return (
      <article className="page-column">
        <PageHeader kicker="Password Recovery" title="密码已重置" summary="新密码已经写入账户，稍后将返回首页。" backTo="/" backLabel="返回扉页" />
      </article>
    )
  }

  return (
    <article className="page-column">
      <PageHeader
        kicker="Password Recovery"
        title="设置新密码"
        summary="通过邮件中的重置链接进入后，在此写入新的登录密码。"
        backTo="/login"
        backLabel="返回登录"
      />

      <section className="page-section">
        <form className="editorial-form" onSubmit={handleSubmit}>
          <PasswordField
            label="新密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordField
            label="确认新密码"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="editorial-actions">
            <button type="submit" className="text-button" disabled={submitting}>{submitting ? '提交中' : '更新密码'}</button>
            <Link to="/login">返回登录</Link>
          </div>
          {message ? <p className="status-line is-error">{message}</p> : null}
        </form>
      </section>
    </article>
  )
}
