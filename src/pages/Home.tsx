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
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-8 pb-10">
        {/* Logo/Brand */}
        <div className="mb-12">
          <p className="section-label mb-3">Welcome to</p>
          <h1 className="font-serif text-display text-charcoal tracking-tight leading-none">
            The Color Edit
          </h1>
        </div>

        {/* Welcome Illustration */}
        <div className="mb-10">
          <img
            src={welcomeIllustration}
            alt="Illustration of someone overwhelmed by paint color choices"
            className="w-full rounded-lg shadow-sm"
            style={{ maxWidth: '800px' }}
          />
        </div>

        {/* Value Prop */}
        <div className="mb-8">
          <h2 className="font-serif text-xl text-charcoal leading-tight mb-4">
            Your perfect paint palette, curated in minutes instead of hours
          </h2>
          <p className="text-charcoal-light text-sm leading-relaxed">
            Receive 5 tailored recommendations, complete with trim pairings, finish advice, and exactly where to buy them.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col gap-3 text-sm text-charcoal-lighter">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sage" />
            <span>Pulled from a database of the top colors for 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sage" />
            <span>Personalized to your room and needs</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-10 space-y-4 safe-area-inset-bottom">
        {/* Primary CTA */}
        <button
          onClick={() => navigate('/setup')}
          className="btn-primary w-full flex items-center justify-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          Get my shortlist
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Disclaimer */}
        <p className="text-center text-xs text-charcoal-lighter pt-4 text-editorial">
          Digital swatches are a starting point. Always test real samples.
        </p>

        {/* Elegant divider */}
        <div className="divider my-6" />

        {/* Version info */}
        <p className="text-center text-xs text-charcoal-lighter/50">
          Last updated {buildTime}
        </p>
      </div>
    </div>
  )
}
