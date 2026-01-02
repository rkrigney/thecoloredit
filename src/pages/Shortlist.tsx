import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShoppingBag, MapPin, GitCompare, Droplets } from 'lucide-react'
import { useAppContext } from '../App'
import { ScoredColor } from '../types'

const tagLabels: Record<string, { label: string; bg: string; text: string }> = {
  safe_win: { label: 'Safe Win', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  vibe_match: { label: 'Vibe Match', bg: 'bg-violet-50', text: 'text-violet-700' },
  wildcard: { label: 'Wildcard', bg: 'bg-amber-50', text: 'text-amber-700' }
}

function ColorCard({ scored, onCompare }: { scored: ScoredColor; onCompare: () => void }) {
  const navigate = useNavigate()
  const { color, tag, scores, reasoning, suggestedTrim, suggestedFinish } = scored
  const tagInfo = tagLabels[tag]

  const undertoneText = () => {
    const temp = color.undertone.temperature === 'neutral' ? '' : `${color.undertone.temperature} `
    const primary = color.undertone.leansPrimary === 'neutral' ? 'neutral' : `${color.undertone.leansPrimary} lean`
    return `${temp}${primary}`.trim()
  }

  return (
    <div className="card overflow-hidden">
      {/* Swatch */}
      <div
        className="h-32 relative"
        style={{ backgroundColor: color.hex }}
      >
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${tagInfo.bg} ${tagInfo.text}`}>
          {tagInfo.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Code */}
        <div className="mb-3">
          <h3 className="font-serif text-lg text-charcoal">{color.name}</h3>
          <p className="text-sm text-charcoal-light">{color.brand} {color.code}</p>
        </div>

        {/* Undertone & LRV */}
        <p className="text-sm text-charcoal-light mb-3 capitalize">
          {undertoneText()} · LRV {color.lrv}
        </p>

        {/* Best in / Watch out */}
        <div className="space-y-1.5 mb-4 text-sm">
          <p className="text-charcoal">
            <span className="text-charcoal-light">Best in:</span> {color.bestIn}
          </p>
          <p className="text-charcoal">
            <span className="text-charcoal-light">Watch out:</span> {color.watchOut}
          </p>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${scores.overall}%` }}
            />
          </div>
          <span className="text-sm font-medium text-charcoal">{scores.overall}</span>
        </div>

        {/* Reasoning */}
        <p className="text-sm text-charcoal italic mb-4">
          "{reasoning}"
        </p>

        {/* Trim & Finish */}
        <div className="flex gap-4 text-sm text-charcoal-light mb-4">
          <div>
            <span className="text-charcoal">Trim:</span>{' '}
            {suggestedTrim.crisp?.name || suggestedTrim.warm?.name || 'White'}
          </div>
          <div>
            <span className="text-charcoal">Finish:</span> {suggestedFinish}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/product-picker/${color.id}`)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            <Droplets className="w-4 h-4" />
            Choose paint type
          </button>
          <button
            onClick={onCompare}
            className="btn-secondary px-3"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View full story link */}
      <button
        onClick={() => navigate(`/color/${color.id}`)}
        className="w-full py-3 border-t border-charcoal/5 text-sm text-charcoal-light hover:text-charcoal hover:bg-cream-100 transition-colors flex items-center justify-center gap-2"
      >
        View paint story
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Shortlist() {
  const navigate = useNavigate()
  const { shortlist, profile, setCompareColors, compareColors } = useAppContext()

  if (!profile || shortlist.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-charcoal-light mb-4">No shortlist generated yet.</p>
          <button onClick={() => navigate('/setup')} className="btn-primary">
            Start over
          </button>
        </div>
      </div>
    )
  }

  const roomTypeLabels: Record<string, string> = {
    living: 'Living room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    hallway: 'Hallway',
    office: 'Home office',
    nursery: 'Nursery',
    exterior: 'Exterior'
  }

  const handleCompare = (scored: ScoredColor) => {
    if (!compareColors[0]) {
      setCompareColors([scored, null])
    } else if (!compareColors[1]) {
      setCompareColors([compareColors[0], scored])
      navigate('/compare')
    } else {
      setCompareColors([scored, null])
    }
  }

  const compareCount = [compareColors[0], compareColors[1]].filter(Boolean).length

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-cream-50/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/setup')}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-lg text-charcoal">Your Shortlist</h1>
            <p className="text-xs text-charcoal-light">{roomTypeLabels[profile.roomType]}</p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Disclaimer */}
      <div className="px-4 py-3 bg-cream-100 text-center">
        <p className="text-xs text-charcoal-light">
          Digital swatches are a starting point. Always test with real samples.
        </p>
      </div>

      {/* Color Cards */}
      <div className="p-4 space-y-4">
        {shortlist.map(scored => (
          <ColorCard
            key={scored.color.id}
            scored={scored}
            onCompare={() => handleCompare(scored)}
          />
        ))}
      </div>

      {/* Compare selection indicator */}
      {compareCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-charcoal text-cream-50 rounded-full py-3 px-4 flex items-center justify-between shadow-lg">
          <span className="text-sm">
            {compareCount}/2 colors selected
          </span>
          {compareCount === 2 ? (
            <button
              onClick={() => navigate('/compare')}
              className="text-sm font-medium flex items-center gap-2"
            >
              Compare now
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCompareColors([null, null])}
              className="text-sm text-cream-50/70"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/sampling-plan')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            Sampling plan
          </button>
          <button
            onClick={() => navigate('/shopping-list')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Shopping list
          </button>
          <button
            onClick={() => navigate('/stores')}
            className="btn-secondary px-4"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
