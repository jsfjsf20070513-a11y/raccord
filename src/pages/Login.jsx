import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PageHeader from '../components/PageHeader'
import PasswordField from '../components/PasswordField'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'

const PHONE_PATTERN = /^1\d{10}$/
const OTP_RESEND_SECONDS = 60

const COPY = {
  login: {
    title: 'Sign in · 登录',
    summary: '登录以跨设备同步你的背词进度。· Sync your vocabulary progress across devices.',
    submit: 'Sign in',
    submitting: 'Signing in…',
  },
  signup: {
    title: 'Create account · 注册',
    summary: '注册一个本班网站的账号,保存背词进度。· Create an account to save your vocabulary progress.',
    submit: 'Create account',
    submitting: 'Creating…',
  },
  forgot: {
    title: 'Reset password · 找回密码',
    summary: 'Receive a password reset link by email.',
    submit: 'Send reset link',
    submitting: 'Sending…',
  },
  otp: {
    title: 'Code sign-in · 验证码登录',
    summary: 'Sign in to an existing account with a one-time code emailed to you.',
    submit: 'Send code · 发送验证码',
    submitting: 'Sending… · 发送中…',
    verify: 'Verify & sign in · 验证并登录',
    verifying: 'Verifying… · 验证中…',
  },
}

const ERRORS = {
  invalidPhone: 'Enter a valid 11-digit Chinese mobile number. · 请输入有效的 11 位手机号码。',
  realNameRequired: 'Real name is required. · 请填写真实姓名。',
  nicknameRequired: 'Nickname is required. · 请填写昵称。',
  passwordTooShort: 'Password must be at least 6 characters. · 密码至少需要 6 位字符。',
  passwordMismatch: 'The two passwords do not match. · 两次输入的密码不一致。',
  emailRequired: 'Enter an email address. · 请输入邮箱地址。',
  otpCodeRequired: 'Enter the 6-digit code from your email. · 请输入邮箱收到的 6 位验证码。',
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
      setMessage({ type: 'success', text: 'Code resent. · 验证码已重发。' })
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
        navigate('/vocabulary')
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
          navigate('/vocabulary')
          return
        }
        setMessage({
          type: 'success',
          text: 'Account created. If email confirmation is enabled, check your inbox to verify. · 注册完成。若启用了邮箱确认，请先前往邮箱验证。',
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
            text: 'Code sent. Check your email and enter it below. · 验证码已发送，请查收邮箱并在下方输入。',
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
        navigate('/vocabulary')
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
        text: 'Reset link sent. Please check your email. · 重置链接已发送，请检查邮箱。',
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

  return (
    <article className="page-column">
      <PageHeader
        kicker="Authentification"
        title={copy.title}
        summary={copy.summary}
        backTo="/"
        backLabel="Back to title page · 返回扉页"
        showRule={false}
      />

      {mode === 'login' ? (
        <ul className="login-values">
          <li><span className="login-value-mark" aria-hidden="true">◆</span> 背词进度跨设备同步 —— 手机上背的,电脑上接着背。</li>
          <li><span className="login-value-mark" aria-hidden="true">◆</span> 班级 AI 助手 —— 双语数学答疑,登录后可用<span className="login-value-soon">(即将开放)</span>。</li>
        </ul>
      ) : null}

      <section className="page-section">
        <div className="editorial-actions tabs">
          <button type="button" className={`text-button ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
            Sign in · 登录
          </button>
          <button type="button" className={`text-button ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
            Sign up · 注册
          </button>
          <button type="button" className={`text-button ${mode === 'otp' ? 'active' : ''}`} onClick={() => switchMode('otp')}>
            Code · 验证码
          </button>
          <button type="button" className={`text-button ${mode === 'forgot' ? 'active' : ''}`} onClick={() => switchMode('forgot')}>
            Reset password · 找回密码
          </button>
        </div>

        {mode === 'login' || mode === 'signup' ? (
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

          {mode === 'forgot' || mode === 'otp' || loginMethod === 'email' ? (
            <label>
              <span>Email · 邮箱</span>
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
              <span>Phone · 手机号</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="11-digit mobile number · 11 位手机号"
                required
              />
            </label>
          )}

          {mode === 'login' || mode === 'signup' ? (
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

          {mode === 'otp' && otpSent ? (
            <>
              <label>
                <span>Verification code · 验证码</span>
                <input
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code · 6 位验证码"
                  required
                />
              </label>
              <div className="editorial-actions">
                <button type="button" className="text-button" onClick={handleResendOtp} disabled={loading || resendCountdown > 0}>
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s · ${resendCountdown} 秒后可重发`
                    : 'Resend code · 重新发送'}
                </button>
              </div>
            </>
          ) : null}

          <div className="editorial-actions">
            <button type="submit" className="text-button" disabled={loading}>
              {submitLabel}
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
