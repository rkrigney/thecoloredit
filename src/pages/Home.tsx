import { useNavigate } from 'react-router-dom'
import { Palette, BookOpen, Home as HomeIcon } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-8">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl text-charcoal tracking-tight">
            The Color Edit
          </h1>
          <p className="mt-2 text-charcoal-lighter text-sm">
            Find your perfect palette
          </p>
        </div>

        {/* Hero Visual - Abstract color swatches */}
        <div className="mb-12 flex gap-3">
          <div
            className="w-16 h-24 rounded-xl shadow-sm"
            style={{ backgroundColor: '#D9D0C3' }}
          />
          <div
            className="w-16 h-28 rounded-xl shadow-sm -mt-2"
            style={{ backgroundColor: '#CCC5B7' }}
          />
          <div
            className="w-16 h-24 rounded-xl shadow-sm"
            style={{ backgroundColor: '#C9C5BD' }}
          />
          <div
            className="w-16 h-20 rounded-xl shadow-sm mt-2"
            style={{ backgroundColor: '#C7D1C7' }}
          />
        </div>

        {/* Value Prop */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-charcoal leading-snug mb-3">
            Get to a confident 5-swatch shortlist in under 5 minutes
          </h2>
          <p className="text-charcoal-light text-base leading-relaxed">
            Curated recommendations with trim, finish, and where to buy.
            No guesswork. No overwhelm.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex gap-6 mb-10 text-sm text-charcoal-lighter">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Button-driven</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Expert-backed</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-8 space-y-3 safe-area-inset-bottom">
        {/* Primary CTA */}
        <button
          onClick={() => navigate('/setup')}
          className="btn-primary flex items-center justify-center gap-3"
        >
          <Palette className="w-5 h-5" />
          Get my 5-swatch shortlist
        </button>

        {/* Secondary CTAs */}
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
            <BookOpen className="w-4 h-4" />
            Browse Collections
          </button>
          <button className="btn-secondary flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
            <HomeIcon className="w-4 h-4" />
            My House Palette
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-charcoal-lighter pt-4">
          Digital swatches are a starting point. Always test real samples.
        </p>

        {/* Version info */}
        <p className="text-center text-xs text-charcoal-lighter/50 pt-2">
          Version 1.2.0 · Last updated Jan 4, 2026 2:45 PM CST
        </p>
      </div>
    </div>
  )
}
