import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

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
        <div className="mb-16">
          <p className="section-label mb-3">Welcome to</p>
          <h1 className="font-serif text-display text-charcoal tracking-tight leading-none">
            The Color
            <br />
            Edit
          </h1>
        </div>

        {/* Hero Visual - Elegant color story */}
        <div className="mb-16 flex items-end gap-2">
          <div
            className="w-14 h-20 shadow-sm"
            style={{ backgroundColor: '#D5CEC4' }}
          />
          <div
            className="w-14 h-28 shadow-sm"
            style={{ backgroundColor: '#B8AFA3' }}
          />
          <div
            className="w-14 h-24 shadow-sm"
            style={{ backgroundColor: '#C9C5BD' }}
          />
          <div
            className="w-14 h-32 shadow-sm"
            style={{ backgroundColor: '#A8B5A3' }}
          />
          <div
            className="w-14 h-20 shadow-sm"
            style={{ backgroundColor: '#D4C4B5' }}
          />
        </div>

        {/* Value Prop */}
        <div className="mb-10">
          <h2 className="font-serif text-headline text-charcoal leading-tight mb-4">
            Your perfect paint palette, curated in minutes
          </h2>
          <p className="text-charcoal-light text-subtitle leading-relaxed">
            Expert recommendations with trim pairings, finish advice, and where to buy.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex gap-8 text-sm text-charcoal-lighter">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-sage" />
            <span>Matched to your room</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-sage" />
            <span>Undertone-safe picks</span>
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
