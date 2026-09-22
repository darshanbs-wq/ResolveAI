import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, user, loading: sessionLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('agent@resolveai.com')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (user) navigate('/tickets', { replace: true })
  }, [user, navigate])
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <header className='bg-[#0F766E] text-white p-4'>
          <h1 className='text-2xl font-bold font-display'>ResolveAI</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          <p className="text-sm text-muted">Checking session…</p>
        </div>
      </div>
    )
  }

  // Already logged in → skip login page


  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      // Hold the success state briefly so the page cross-fades instead of snapping
      setLeaving(true)
      setTimeout(() => navigate('/tickets'), 450)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className='bg-[#0F766E] text-white p-4'>
        <h1 className='text-2xl font-bold font-display'>ResolveAI</h1>
      </header>

      <div className='mt-20 flex items-center justify-center p-10'>
        <div
          className={`w-full max-w-md bg-white p-8 rounded-lg shadow-md transition-all duration-300 ${
            leaving ? 'opacity-0 -translate-y-2' : 'animate-fade-up opacity-100 translate-y-0'
          }`}
        >
          <h2 className="text-xl font-semibold text-ink">Welcome back</h2>
          <p className="text-muted text-sm mb-6">Sign in to your workspace</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              className='w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50 disabled:text-muted'
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              className='w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50 disabled:text-muted'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleLogin()}
              disabled={loading}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className='flex w-full items-center justify-center gap-2 bg-brand text-white p-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-semibold'
            >
              {loading && !leaving && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              )}
              {leaving ? '✓ Welcome back' : loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Demo: agent@resolveai.com / demo1234
          </p>
        </div>
      </div>
    </div>
  )
}