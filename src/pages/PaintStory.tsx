import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Droplets, Heart } from 'lucide-react'
import { getColorById } from '../data/colors'
import { useAppContext } from '../App'

export default function PaintStory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shortlist } = useAppContext()

  const color = id ? getColorById(id) : null
  const scored = shortlist.find(s => s.color.id === id)

  if (!color) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-charcoal-light mb-4">Color not found.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const undertoneText = () => {
    const temp = color.undertone.temperature === 'neutral' ? '' : `${color.undertone.temperature} `
    const primary = color.undertone.leansPrimary === 'neutral' ? 'neutral' : color.undertone.leansPrimary
    const secondary = color.undertone.leansSecondary ? ` with ${color.undertone.leansSecondary} hints` : ''
    return `A ${temp}${primary}${secondary}`
  }

  // Similar colors that are different from current
  const similarColors = color.similarColors
    .map(s => getColorById(s.colorId))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Hero Swatch */}
      <div
        className="h-64 relative"
        style={{ backgroundColor: color.hex }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-charcoal hover:bg-white transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-charcoal hover:bg-white transition-colors shadow-sm">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Identity */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-charcoal mb-1">{color.name}</h1>
          <p className="text-charcoal-light">{color.brand} · {color.code}</p>
        </div>

        {/* Undertone Description */}
        <div className="mb-6">
          <p className="text-charcoal leading-relaxed">
            {undertoneText()}. Light Reflectance Value of {color.lrv} — {color.depthCategory === 'light' ? 'bright and airy' : color.depthCategory === 'mid' ? 'balanced depth' : 'rich and cozy'}.
          </p>
        </div>

        {/* Editorial Description */}
        <div className="mb-8 p-5 bg-cream-100 rounded-xl">
          <p className="font-serif text-lg text-charcoal leading-relaxed italic">
            "{color.description}"
          </p>
        </div>

        {/* Best In / Watch Out */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl border border-charcoal/5">
            <p className="text-xs text-charcoal-light uppercase tracking-wide mb-2">Best in</p>
            <p className="text-sm text-charcoal">{color.bestIn}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-charcoal/5">
            <p className="text-xs text-charcoal-light uppercase tracking-wide mb-2">Watch out</p>
            <p className="text-sm text-charcoal">{color.watchOut}</p>
          </div>
        </div>

        {/* Trim Recommendations */}
        {scored?.suggestedTrim && (
          <div className="mb-8">
            <h2 className="font-serif text-lg text-charcoal mb-4">Recommended Trim</h2>
            <div className="flex gap-3">
              {scored.suggestedTrim.crisp && (
                <div className="flex-1 p-4 bg-white rounded-xl border border-charcoal/5">
                  <div
                    className="w-full h-16 rounded-lg mb-3"
                    style={{ backgroundColor: scored.suggestedTrim.crisp.hex }}
                  />
                  <p className="text-sm font-medium text-charcoal">{scored.suggestedTrim.crisp.name}</p>
                  <p className="text-xs text-charcoal-light">Crisp option</p>
                </div>
              )}
              {scored.suggestedTrim.warm && (
                <div className="flex-1 p-4 bg-white rounded-xl border border-charcoal/5">
                  <div
                    className="w-full h-16 rounded-lg mb-3"
                    style={{ backgroundColor: scored.suggestedTrim.warm.hex }}
                  />
                  <p className="text-sm font-medium text-charcoal">{scored.suggestedTrim.warm.name}</p>
                  <p className="text-xs text-charcoal-light">Warm option</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Similar Colors */}
        {similarColors.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-lg text-charcoal mb-4">Similar Alternatives</h2>
            <div className="space-y-3">
              {color.similarColors.map((similar, i) => {
                const altColor = similarColors[i]
                if (!altColor) return null
                return (
                  <button
                    key={similar.colorId}
                    onClick={() => navigate(`/color/${similar.colorId}`)}
                    className="w-full flex items-center gap-4 p-3 bg-white rounded-xl border border-charcoal/5 hover:border-charcoal/15 transition-colors text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: altColor.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal">{altColor.name}</p>
                      <p className="text-xs text-charcoal-light">{similar.relationship}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Technical Specs */}
        <div className="mb-8">
          <h2 className="font-serif text-lg text-charcoal mb-4">Technical Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-charcoal/5">
              <p className="text-xs text-charcoal-light mb-1">Hex</p>
              <p className="text-sm font-mono text-charcoal">{color.hex}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-charcoal/5">
              <p className="text-xs text-charcoal-light mb-1">LRV</p>
              <p className="text-sm text-charcoal">{color.lrv}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-charcoal/5">
              <p className="text-xs text-charcoal-light mb-1">RGB</p>
              <p className="text-sm font-mono text-charcoal">{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-charcoal/5">
              <p className="text-xs text-charcoal-light mb-1">Finishes</p>
              <p className="text-sm text-charcoal capitalize">{color.suggestedFinishes.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {color.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-cream-100 text-charcoal-light text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/product-picker/${color.id}`)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            Choose paint type & finish
          </button>
          <button className="btn-secondary px-4">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
