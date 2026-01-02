import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Sun, Moon, Sunrise, Eye, ArrowRight, Lightbulb } from 'lucide-react'
import { useAppContext } from '../App'
import { generateSamplingPlan } from '../utils/recommendation'

export default function SamplingPlan() {
  const navigate = useNavigate()
  const { shortlist, profile } = useAppContext()

  if (!profile || shortlist.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-charcoal-light mb-4">No shortlist available.</p>
          <button onClick={() => navigate('/setup')} className="btn-primary">
            Start over
          </button>
        </div>
      </div>
    )
  }

  const plan = generateSamplingPlan(shortlist, profile)

  const timeIcons = [Sunrise, Sun, Moon]

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="px-4 py-4 flex items-center border-b border-charcoal/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="ml-2 font-serif text-lg text-charcoal">Sampling Plan</h1>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-charcoal mb-2">
            How to test your samples
          </h2>
          <p className="text-charcoal-light">
            Follow this plan to see how your colors really perform in your space.
          </p>
        </div>

        {/* Your colors */}
        <div className="mb-8">
          <h3 className="text-sm text-charcoal-light uppercase tracking-wide mb-3">
            Your shortlist
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
            {shortlist.map(scored => (
              <div
                key={scored.color.id}
                className="flex-shrink-0 w-20"
              >
                <div
                  className="w-20 h-16 rounded-xl mb-2"
                  style={{ backgroundColor: scored.color.hex }}
                />
                <p className="text-xs text-charcoal truncate">{scored.color.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Where to place */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            Where to place samples
          </h3>
          <div className="space-y-3">
            {plan.placements.map((placement, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal/5">
                <div className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-charcoal">{i + 1}</span>
                </div>
                <p className="text-sm text-charcoal pt-1">{placement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* When to check */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-gold" />
            When to check
          </h3>
          <div className="space-y-3">
            {plan.timesToCheck.map((time, i) => {
              const Icon = timeIcons[i]
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-charcoal/5">
                  <div className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-charcoal-light" />
                  </div>
                  <p className="text-sm text-charcoal">{time}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* What to compare against */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gold" />
            What to compare against
          </h3>
          <div className="p-4 bg-white rounded-xl border border-charcoal/5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-charcoal mt-2" />
              <p className="text-sm text-charcoal">Hold the sample next to your floors</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-charcoal mt-2" />
              <p className="text-sm text-charcoal">Hold it next to counters, cabinets, or fixed elements</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-charcoal mt-2" />
              <p className="text-sm text-charcoal">Step back and view from across the room</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-charcoal mt-2" />
              <p className="text-sm text-charcoal">Look at it from the hallway or doorway</p>
            </div>
          </div>
        </div>

        {/* If it's not right */}
        {plan.alternates.length > 0 && (
          <div className="mb-8">
            <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-gold" />
              If it's not quite right
            </h3>
            <div className="space-y-3">
              {plan.alternates.map((alt, i) => (
                <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">If it looks too {alt.ifLooksToo}:</span>{' '}
                    try {alt.tryInstead.join(' or ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro tips */}
        <div className="p-4 bg-cream-100 rounded-xl">
          <h4 className="text-sm font-medium text-charcoal mb-2">Pro tips</h4>
          <ul className="text-sm text-charcoal-light space-y-2">
            <li>• Paint samples are worth it — digital swatches can only get you so far</li>
            <li>• Use large sample boards (at least 12"×12") for accuracy</li>
            <li>• Apply 2 coats to your sample boards for true color</li>
            <li>• Live with samples for at least 24–48 hours before deciding</li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <button
          onClick={() => navigate('/shopping-list')}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Got it — show shopping list
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
