import { useState } from 'react'
import { X, Mail, Loader2 } from 'lucide-react'
import { db } from '../lib/instantdb'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'code'>('email')

  if (!isOpen) return null

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await db.auth.sendMagicCode({ email })
      setSentEmail(email)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const clientName = 'thecoloredit'
    const redirectUrl = window.location.origin + '/thecoloredit/'
    db.auth.signInWithRedirect({
      clientName,
      redirectURL: redirectUrl
    })
  }

  const resetFlow = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setSentEmail('')
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-cream-50 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-charcoal-light hover:text-charcoal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-serif text-2xl text-charcoal mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-charcoal-light text-sm mb-6">
          {mode === 'login'
            ? 'Sign in to access your saved shortlists and shopping lists.'
            : 'Save your color selections and shopping lists.'}
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 border border-charcoal/20 rounded-full flex items-center justify-center gap-3 hover:bg-cream-100 transition-colors mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-charcoal font-medium">Continue with Google</span>
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-charcoal/10" />
          <span className="text-xs text-charcoal-light">or</span>
          <div className="flex-1 h-px bg-charcoal/10" />
        </div>

        {/* Email Magic Link */}
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending code...
                </>
              ) : (
                'Send login code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <p className="text-sm text-charcoal mb-4">
              We sent a code to <strong>{sentEmail}</strong>
            </p>

            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-charcoal mb-2">
                Enter code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border border-charcoal/20 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 text-center text-lg tracking-widest"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify code'
              )}
            </button>

            <button
              type="button"
              onClick={resetFlow}
              className="w-full text-sm text-charcoal-light hover:text-charcoal transition-colors"
            >
              Use different email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-charcoal-light mt-6">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-charcoal font-medium hover:underline"
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-charcoal font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
