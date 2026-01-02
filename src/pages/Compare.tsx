import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useAppContext } from '../App'

export default function Compare() {
  const navigate = useNavigate()
  const { compareColors, setCompareColors } = useAppContext()

  const [colorA, colorB] = compareColors

  if (!colorA || !colorB) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-charcoal-light mb-4">Select two colors to compare.</p>
          <button onClick={() => navigate('/shortlist')} className="btn-primary">
            Back to shortlist
          </button>
        </div>
      </div>
    )
  }

  const handlePick = (which: 'left' | 'right' | 'both') => {
    if (which === 'both') {
      setCompareColors([null, null])
      navigate('/shortlist')
    } else {
      // Could add to favorites or shopping list
      setCompareColors([null, null])
      navigate('/shortlist')
    }
  }

  const ComparisonRow = ({
    label,
    leftValue,
    rightValue,
    leftWins
  }: {
    label: string
    leftValue: string
    rightValue: string
    leftWins?: boolean | null
  }) => (
    <div className="flex border-b border-charcoal/5 last:border-0">
      <div className={`flex-1 p-3 text-sm ${leftWins === true ? 'bg-emerald-50/50' : ''}`}>
        {leftValue}
      </div>
      <div className="w-24 p-3 text-xs text-charcoal-light text-center bg-cream-100 flex items-center justify-center">
        {label}
      </div>
      <div className={`flex-1 p-3 text-sm text-right ${leftWins === false ? 'bg-emerald-50/50' : ''}`}>
        {rightValue}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-cream-50/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-charcoal/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCompareColors([null, null])
              navigate('/shortlist')
            }}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg text-charcoal">Compare</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Side by Side Swatches */}
      <div className="flex">
        <div
          className="flex-1 h-40 relative"
          style={{ backgroundColor: colorA.color.hex }}
        >
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-sm font-medium text-charcoal bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
              {colorA.color.name}
            </p>
          </div>
        </div>
        <div className="w-px bg-cream-50" />
        <div
          className="flex-1 h-40 relative"
          style={{ backgroundColor: colorB.color.hex }}
        >
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-sm font-medium text-charcoal bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-right">
              {colorB.color.name}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="p-4">
        <div className="bg-white rounded-xl border border-charcoal/5 overflow-hidden">
          <ComparisonRow
            label="Brand"
            leftValue={colorA.color.brand}
            rightValue={colorB.color.brand}
          />
          <ComparisonRow
            label="Code"
            leftValue={colorA.color.code}
            rightValue={colorB.color.code}
          />
          <ComparisonRow
            label="LRV"
            leftValue={String(colorA.color.lrv)}
            rightValue={String(colorB.color.lrv)}
            leftWins={colorA.color.lrv > colorB.color.lrv ? true : colorA.color.lrv < colorB.color.lrv ? false : null}
          />
          <ComparisonRow
            label="Undertone"
            leftValue={`${colorA.color.undertone.temperature}, ${colorA.color.undertone.leansPrimary}`}
            rightValue={`${colorB.color.undertone.temperature}, ${colorB.color.undertone.leansPrimary}`}
          />
          <ComparisonRow
            label="Stability"
            leftValue={`${Math.round(colorA.color.stability * 100)}%`}
            rightValue={`${Math.round(colorB.color.stability * 100)}%`}
            leftWins={colorA.color.stability > colorB.color.stability ? true : colorA.color.stability < colorB.color.stability ? false : null}
          />
          <ComparisonRow
            label="Match Score"
            leftValue={String(colorA.scores.overall)}
            rightValue={String(colorB.scores.overall)}
            leftWins={colorA.scores.overall > colorB.scores.overall ? true : colorA.scores.overall < colorB.scores.overall ? false : null}
          />
        </div>
      </div>

      {/* Pros/Cons */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Color A */}
          <div className="bg-white rounded-xl border border-charcoal/5 p-4">
            <p className="text-sm font-medium text-charcoal mb-3">{colorA.color.name}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-light">{colorA.color.bestIn}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <X className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-light">{colorA.color.watchOut}</span>
              </div>
            </div>
          </div>

          {/* Color B */}
          <div className="bg-white rounded-xl border border-charcoal/5 p-4">
            <p className="text-sm font-medium text-charcoal mb-3">{colorB.color.name}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-light">{colorB.color.bestIn}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <X className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-light">{colorB.color.watchOut}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="px-4 mt-4">
        <div className="bg-cream-100 rounded-xl p-4">
          <p className="text-sm text-charcoal-light text-center">
            Both colors work well for your space. {colorA.scores.overall > colorB.scores.overall
              ? `${colorA.color.name} scores slightly higher for your preferences.`
              : colorB.scores.overall > colorA.scores.overall
              ? `${colorB.color.name} scores slightly higher for your preferences.`
              : `They're equally matched for your preferences.`}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-charcoal/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => handlePick('left')}
            className="flex-1 btn-secondary text-sm"
          >
            Pick {colorA.color.name.split(' ')[0]}
          </button>
          <button
            onClick={() => handlePick('right')}
            className="flex-1 btn-secondary text-sm"
          >
            Pick {colorB.color.name.split(' ')[0]}
          </button>
          <button
            onClick={() => handlePick('both')}
            className="btn-secondary px-4 text-sm"
          >
            Keep both
          </button>
        </div>
      </div>
    </div>
  )
}
