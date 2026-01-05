import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import welcomeIllustration from '../Gemini_Generated_Image_welcome.png'

// Injected at build time by Vite
declare const __BUILD_TIME__: string

function formatBuildTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

export default function Home() {
  const navigate = useNavigate()
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? formatBuildTime(__BUILD_TIME__) : 'Development'

  return (
    <div className="px-6 pt-4 pb-10 safe-area-inset-bottom" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Logo/Brand */}
      <div className="mb-6">
        <p className="section-label mb-2">Welcome to</p>
        <h1 className="font-serif text-display text-charcoal tracking-tight leading-none">
          The Color Edit
        </h1>
      </div>

      {/* Welcome Illustration */}
      <div className="mb-6">
        <img
          src={welcomeIllustration}
          alt="Illustration of someone overwhelmed by paint color choices"
          className="w-full rounded-lg shadow-sm"
          style={{ maxHeight: '40vh', width: 'auto', maxWidth: '100%' }}
        />
      </div>

      {/* Value Prop */}
      <div className="mb-6">
        <h2 className="font-serif text-xl text-charcoal leading-tight mb-3">
          Your perfect paint palette, curated in minutes instead of hours
        </h2>
        <p className="text-charcoal-light text-sm leading-relaxed">
          Receive 5 tailored recommendations, complete with trim pairings, finish advice, and exactly where to buy them.
        </p>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-col gap-2 text-sm text-charcoal-lighter mb-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Pulled from a database of the top colors for 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          <span>Personalized to your room and needs</span>
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => navigate('/setup')}
        className="btn-primary w-full flex items-center justify-center gap-3 mb-6"
      >
        <Sparkles className="w-5 h-5" />
        Get my shortlist
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Disclaimer */}
      <p className="text-center text-xs text-charcoal-lighter text-editorial mb-6">
        Digital swatches are a starting point. Always test real samples.
      </p>

      {/* Elegant divider */}
      <div className="divider mb-6" />

      {/* Version info */}
      <p className="text-center text-xs text-charcoal-lighter/50">
        Last updated {buildTime}
      </p>
    </div>
  )
}
