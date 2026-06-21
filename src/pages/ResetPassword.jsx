import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

// 重设密码 ResetPassword — design contract: centered « Réinitialisation »
// masthead + a narrow underline-input form, with success / invalid states.
// The real Supabase recovery-session logic is preserved.
function Masthead({ title, summary }) {
  return (
    <header className="login-masthead">
      <Link to="/login" className="login-back">返回登录 · Connexion</Link>
      <p className="login-eyebrow">Réinitialisation</p>
      <h1 className="login-title">{title}</h1>
      <p className="login-summary">{summary}</p>
    </header>
  )
}

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
      setMessage(error.message || '重置失败,请重新申请重置链接。')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <article className="page-column login-page">
        <Masthead title="验证重置链接" summary="正在检查当前链接是否仍然有效…" />
      </article>
    )
  }

  if (pageState === 'invalid' || pageState === 'unavailable') {
    return (
      <article className="page-column login-page">
        <Masthead
          title={pageState === 'invalid' ? '链接已失效' : '功能暂不可用'}
          summary={pageState === 'invalid'
            ? '这个重置链接已过期或已被使用。请回到登录页重新申请一封重置邮件。'
            : SUPABASE_MISSING_MESSAGE}
        />
        <div className="reset-state">
          <p><Link to="/login" className="vocab-verify">重新申请 · 找回密码 →</Link></p>
        </div>
      </article>
    )
  }

  if (pageState === 'success') {
    return (
      <article className="page-column login-page">
        <Masthead title="密码已更新" summary="密码已写入账户,现在可以用新密码登录了。" />
        <div className="reset-state">
          <p className="reset-ok">✓ 已更新</p>
          <p><Link to="/login" className="vocab-verify">前往登录 · Connexion →</Link></p>
        </div>
      </article>
    )
  }

  return (
    <article className="page-column login-page">
      <Masthead title="设置新密码" summary="为账号设置一个新的登录密码。" />

      <section className="login-section">
        <form className="editorial-form login-form" onSubmit={handleSubmit}>
          <PasswordField
            label="新密码 · Nouveau mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <PasswordField
            label="确认新密码 · Confirmer"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="editorial-actions login-submit">
            <button type="submit" className="vocab-verify" disabled={submitting}>
              {submitting ? '保存中…' : '保存新密码 · Enregistrer'}
            </button>
          </div>
          {message ? <p className="status-line is-error">{message}</p> : null}
        </form>
        <section className="home-meditation"><DailyMeditation offset={3} /></section>
      </section>
    </article>
  )
}
