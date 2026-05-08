import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PageHeader from '../components/PageHeader'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

const PHONE_PATTERN = /^1\d{10}$/

const COPY = {
  login: {
    title: 'Sign in · 登录',
    summary: 'Access your collaborative records and class workspace.',
    submit: 'Sign in',
    submitting: 'Signing in…',
  },
  signup: {
    title: 'Create account · 注册',
    summary: 'Set up an account scoped to this class website.',
    submit: 'Create account',
    submitting: 'Creating…',
  },
  forgot: {
    title: 'Reset password · 找回密码',
    summary: 'Receive a password reset link by email.',
    submit: 'Send reset link',
    submitting: 'Sending…',
  },
}

const ERRORS = {
  invalidPhone: 'Enter a valid 11-digit Chinese mobile number. · 请输入有效的 11 位手机号码。',
  realNameRequired: 'Real name is required. · 请填写真实姓名。',
  nicknameRequired: 'Nickname is required. · 请填写昵称。',
  passwordTooShort: 'Password must be at least 6 characters. · 密码至少需要 6 位字符。',
  passwordMismatch: 'The two passwords do not match. · 两次输入的密码不一致。',
  emailRequired: 'Enter an email address. · 请输入邮箱地址。',
  generic: 'Operation failed. Please try again later. · 操作失败，请稍后重试。',
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loginMethod, setLoginMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [realName, setRealName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const finalEmail = loginMethod === 'phone' ? `${phone}@phone.local` : email
  const copy = COPY[mode]

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: SUPABASE_MISSING_MESSAGE })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'login') {
        if (loginMethod === 'phone' && !PHONE_PATTERN.test(phone)) {
          throw new Error(ERRORS.invalidPhone)
        }
        const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password })
        if (error) throw error
        navigate('/')
        return
      }

      if (mode === 'signup') {
        if (!realName.trim()) throw new Error(ERRORS.realNameRequired)
        if (!nickname.trim()) throw new Error(ERRORS.nicknameRequired)
        if (password.length < 6) throw new Error(ERRORS.passwordTooShort)
        if (password !== confirmPassword) throw new Error(ERRORS.passwordMismatch)
        if (loginMethod === 'phone' && !PHONE_PATTERN.test(phone)) {
          throw new Error(ERRORS.invalidPhone)
        }

        const { data, error } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: {
            data: {
              nickname: nickname.trim(),
              real_name: realName.trim(),
              phone: loginMethod === 'phone' ? phone : null,
            },
          },
        })

        if (error) throw error
        if (data.session) {
          navigate('/')
          return
        }
        setMessage({
          type: 'success',
          text: 'Account created. If email confirmation is enabled, check your inbox to verify. · 注册完成。若启用了邮箱确认，请先前往邮箱验证。',
        })
        return
      }

      if (!email.trim()) {
        throw new Error(ERRORS.emailRequired)
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Reset link sent. Please check your email. · 重置链接已发送，请检查邮箱。',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || ERRORS.generic })
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="page-column">
      <PageHeader
        kicker="Authentication"
        title={copy.title}
        summary={copy.summary}
        backTo="/"
        backLabel="Back to title page · 返回扉页"
        showRule={false}
      />

      <section className="page-section">
        <div className="editorial-actions tabs">
          <button type="button" className={`text-button ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Sign in · 登录
          </button>
          <button type="button" className={`text-button ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>
            Sign up · 注册
          </button>
          <button type="button" className={`text-button ${mode === 'forgot' ? 'active' : ''}`} onClick={() => setMode('forgot')}>
            Reset password · 找回密码
          </button>
        </div>

        {mode !== 'forgot' ? (
          <div className="editorial-actions tabs">
            <button type="button" className={`text-button ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => setLoginMethod('email')}>
              Email · 邮箱
            </button>
            <button type="button" className={`text-button ${loginMethod === 'phone' ? 'active' : ''}`} onClick={() => setLoginMethod('phone')}>
              Phone · 手机
            </button>
          </div>
        ) : null}

        <form className="editorial-form" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <>
              <label>
                <span>Real name · 真实姓名</span>
                <input value={realName} onChange={(event) => setRealName(event.target.value)} required />
              </label>
              <label>
                <span>Nickname · 昵称</span>
                <input value={nickname} onChange={(event) => setNickname(event.target.value)} required />
              </label>
            </>
          ) : null}

          {mode === 'forgot' || loginMethod === 'email' ? (
            <label>
              <span>Email · 邮箱</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required={mode === 'forgot' || loginMethod === 'email'}
              />
            </label>
          ) : (
            <label>
              <span>Phone · 手机号</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="11-digit mobile number · 11 位手机号"
                required
              />
            </label>
          )}

          {mode !== 'forgot' ? (
            <PasswordField
              label="Password · 密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          ) : null}

          {mode === 'signup' ? (
            <PasswordField
              label="Confirm password · 确认密码"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          ) : null}

          <div className="editorial-actions">
            <button type="submit" className="text-button" disabled={loading}>
              {loading ? copy.submitting : copy.submit}
            </button>
            {mode === 'login' ? <Link to="/manage">Open collaboration desk · 进入协作</Link> : null}
          </div>
          {message ? <p className={`status-line ${message.type === 'error' ? 'is-error' : 'is-success'}`}>{message.text}</p> : null}
        </form>
        <DailyMeditation offset={7} />
      </section>
    </article>
  )
}
