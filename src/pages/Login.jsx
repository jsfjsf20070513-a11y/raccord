import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

const PHONE_PATTERN = /^1\d{10}$/
const OTP_RESEND_SECONDS = 60

const COPY = {
  login: {
    title: '登录 · Connexion',
    summary: '登录后,背词进度跨设备同步。',
    submit: '登录 · Connexion',
    submitting: '登录中…',
  },
  signup: {
    title: '注册 · Créer un compte',
    summary: '注册一个账号,保存你的背词进度。',
    submit: '注册 · Créer un compte',
    submitting: '注册中…',
  },
  forgot: {
    title: '找回密码 · Mot de passe oublié',
    summary: '通过邮箱接收密码重置链接。',
    submit: '发送重置链接 · Envoyer le lien',
    submitting: '发送中…',
  },
  otp: {
    title: '验证码登录 · Code',
    summary: '用邮箱验证码登录已有账号。',
    submit: '发送验证码 · Envoyer le code',
    submitting: '发送中…',
    verify: '验证并登录 · Vérifier',
    verifying: '验证中…',
  },
}

const ERRORS = {
  invalidPhone: '请输入有效的 11 位手机号码。',
  realNameRequired: '请填写真实姓名。',
  nicknameRequired: '请填写昵称。',
  passwordTooShort: '密码至少需要 6 位字符。',
  passwordMismatch: '两次输入的密码不一致。',
  emailRequired: '请输入邮箱地址。',
  otpCodeRequired: '请输入邮箱收到的 6 位验证码。',
  generic: '操作失败,请稍后重试。',
}

export default function Login() {
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
  // After a successful sign-in we don't auto-navigate; we offer a destination
  // choice (背词 / 寄语墙) so the user lands where they meant to.
  const [signedIn, setSignedIn] = useState(false)
  // OTP (email verification code) flow: otpSent gates the two steps
  // (request code → verify code); resendCountdown throttles re-requests.
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  const finalEmail = loginMethod === 'phone' ? `${phone}@phone.local` : email
  const copy = COPY[mode]

  // Tick the resend countdown down once per second; the timer is re-scheduled
  // on each change and cleared on unmount so it never fires detached.
  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined
    }
    const id = setTimeout(() => setResendCountdown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCountdown])

  // Switch tab and clear transient OTP state so a half-finished code flow
  // never leaks into another mode.
  const switchMode = (next) => {
    setMode(next)
    setMessage(null)
    setOtpSent(false)
    setOtpCode('')
    setResendCountdown(0)
  }

  const requestOtp = async () => {
    if (!email.trim()) {
      throw new Error(ERRORS.emailRequired)
    }
    // shouldCreateUser:false — code sign-in is for existing accounts only;
    // new accounts must go through signup (which collects real name / nickname).
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    })
    if (error) throw error
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await requestOtp()
      setResendCountdown(OTP_RESEND_SECONDS)
      setMessage({ type: 'success', text: '验证码已重新发送。' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || ERRORS.generic })
    } finally {
      setLoading(false)
    }
  }

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
        setSignedIn(true)
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
          setSignedIn(true)
          return
        }
        setMessage({
          type: 'success',
          text: '注册完成。若启用了邮箱确认,请先前往邮箱验证。',
        })
        return
      }

      if (mode === 'otp') {
        if (!otpSent) {
          await requestOtp()
          setOtpSent(true)
          setResendCountdown(OTP_RESEND_SECONDS)
          setMessage({
            type: 'success',
            text: '验证码已发送,请查收邮箱并在下方输入。',
          })
          return
        }
        if (!otpCode.trim()) {
          throw new Error(ERRORS.otpCodeRequired)
        }
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: 'email',
        })
        if (error) throw error
        setSignedIn(true)
        return
      }

      // mode === 'forgot'
      if (!email.trim()) {
        throw new Error(ERRORS.emailRequired)
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: '重置链接已发送,请检查邮箱。',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || ERRORS.generic })
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = mode === 'otp'
    ? (otpSent
        ? (loading ? copy.verifying : copy.verify)
        : (loading ? copy.submitting : copy.submit))
    : (loading ? copy.submitting : copy.submit)

  // ── after a successful sign-in: where to? ──
  if (signedIn) {
    return (
      <article className="page-column login-page">
        <header className="login-masthead">
          <p className="login-eyebrow">Connecté · 已登录</p>
          <h1 className="login-title">欢迎回来</h1>
          <p className="login-summary">接下来去哪儿?</p>
        </header>
        <div className="login-dest">
          <Link to="/vocabulary" className="vocab-verify">去背词 →</Link>
          <Link to="/witness" className="vocab-verify">去寄语墙 →</Link>
        </div>
        <DailyMeditation offset={7} />
      </article>
    )
  }

  return (
    <article className="page-column login-page">
      <header className="login-masthead">
        <Link to="/" className="login-back">返回扉页 · Retour</Link>
        <p className="login-eyebrow">Authentification</p>
        <h1 className="login-title">{copy.title}</h1>
        <p className="login-summary">{copy.summary}</p>
      </header>

      {mode === 'login' ? (
        <ul className="login-values">
          <li>
            <span className="login-value-mark" aria-hidden="true">◆</span>
            <span className="login-value-text">背词进度跨设备同步 —— 手机上背的,电脑上接着背。</span>
          </li>
          <li>
            <span className="login-value-mark" aria-hidden="true">◆</span>
            <span className="login-value-text">班级 AI 助手 —— 双语数学答疑,登录后可用<span className="login-value-soon">(即将开放)</span>。</span>
          </li>
        </ul>
      ) : null}

      <section className="login-section">
        <div className="editorial-actions tabs login-tabs">
          <button type="button" className={`text-button ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>登录</button>
          <button type="button" className={`text-button ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>注册</button>
          <button type="button" className={`text-button ${mode === 'otp' ? 'active' : ''}`} onClick={() => switchMode('otp')}>验证码</button>
          <button type="button" className={`text-button ${mode === 'forgot' ? 'active' : ''}`} onClick={() => switchMode('forgot')}>找回密码</button>
        </div>

        {mode === 'login' || mode === 'signup' ? (
          <div className="editorial-actions tabs login-tabs">
            <button type="button" className={`text-button ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => setLoginMethod('email')}>邮箱</button>
            <button type="button" className={`text-button ${loginMethod === 'phone' ? 'active' : ''}`} onClick={() => setLoginMethod('phone')}>手机</button>
          </div>
        ) : null}

        <form className="editorial-form login-form" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <>
              <label>
                <span>真实姓名 · Nom</span>
                <input value={realName} onChange={(event) => setRealName(event.target.value)} required />
              </label>
              <label>
                <span>昵称 · Pseudo</span>
                <input value={nickname} onChange={(event) => setNickname(event.target.value)} required />
              </label>
            </>
          ) : null}

          {mode === 'forgot' || mode === 'otp' || loginMethod === 'email' ? (
            <label>
              <span>邮箱 · E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required={mode === 'forgot' || mode === 'otp' || loginMethod === 'email'}
                disabled={mode === 'otp' && otpSent}
              />
            </label>
          ) : (
            <label>
              <span>手机号 · Téléphone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="numeric"
                required
              />
            </label>
          )}

          {mode === 'login' || mode === 'signup' ? (
            <PasswordField
              label="密码 · Mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          ) : null}

          {mode === 'signup' ? (
            <PasswordField
              label="确认密码 · Confirmer"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          ) : null}

          {mode === 'otp' && otpSent ? (
            <>
              <label>
                <span>验证码 · Code</span>
                <input
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <div className="editorial-actions">
                <button type="button" className="text-button" onClick={handleResendOtp} disabled={loading || resendCountdown > 0}>
                  {resendCountdown > 0
                    ? `${resendCountdown} 秒后可重新发送`
                    : '重新发送 · Renvoyer'}
                </button>
              </div>
            </>
          ) : null}

          <div className="editorial-actions login-submit">
            <button type="submit" className="vocab-verify" disabled={loading}>
              {submitLabel}
            </button>
          </div>
          {message ? <p className={`status-line ${message.type === 'error' ? 'is-error' : 'is-success'}`}>{message.text}</p> : null}
        </form>
        <DailyMeditation offset={7} />
      </section>
    </article>
  )
}
