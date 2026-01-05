import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, ShoppingBag, MapPin, GitCompare, Droplets, Loader2, ImageIcon, Shuffle, RotateCcw } from 'lucide-react'
import { useAppContext } from '../App'
import { ScoredColor, PaintColor } from '../types'
import { generateRoomVisualization, getCacheKey, getCachedVisualization, cacheVisualization } from '../utils/gemini'
import { paintColors, trimColors } from '../data/colors'
import LightingSlider from '../components/LightingSlider'
import SaveShortlistButton from '../components/SaveShortlistButton'

// Fun reasoning phrases for surprise colors
const surpriseReasonings = [
  "Sometimes the best discoveries come from stepping outside your comfort zone.",
  "This unexpected gem might just be the fresh perspective your space needs.",
  "Trust the process—great design often comes from happy accidents.",
  "Why not? Life's too short for boring walls.",
  "A wild card pick that could become your new favorite.",
  "Sometimes you don't know what you want until you see it.",
  "The universe thinks you should consider this one.",
  "A curated pick from our favorites—no algorithm, just good taste.",
  "This color has been waiting for the right room. Maybe it's yours?",
  "Picked with love by our team. Give it a chance!"
]

// Generate 5 random surprise colors
function generateSurpriseShortlist(): ScoredColor[] {
  // Shuffle and pick 5 diverse colors
  const shuffled = [...paintColors].sort(() => Math.random() - 0.5)
  const selected: PaintColor[] = []

  // Try to get variety in depth categories
  const depths = ['light', 'mid', 'dark', 'very_deep']
  for (const depth of depths) {
    const match = shuffled.find(c => c.depthCategory === depth && !selected.includes(c))
    if (match && selected.length < 5) selected.push(match)
  }

  // Fill remaining slots randomly
  for (const color of shuffled) {
    if (selected.length >= 5) break
    if (!selected.includes(color)) selected.push(color)
  }

  // Convert to ScoredColors with fun tags and reasoning
  const tags: Array<'top_pick' | 'safe_bet' | 'bold_choice'> = ['top_pick', 'safe_bet', 'bold_choice', 'safe_bet', 'bold_choice']

  return selected.slice(0, 5).map((color, i) => {
    // Find a trim color
    const trim = trimColors.find(t => color.suggestedTrims.includes(t.id)) || trimColors[0]

    return {
      color,
      tag: tags[i],
      scores: {
        overall: Math.floor(Math.random() * 20) + 75, // 75-95
        boldness: Math.floor(Math.random() * 35),
        vibe: Math.floor(Math.random() * 25),
        lighting: Math.floor(Math.random() * 20),
        harmony: Math.floor(Math.random() * 20)
      },
      reasoning: surpriseReasonings[Math.floor(Math.random() * surpriseReasonings.length)],
      suggestedTrim: {
        crisp: trim,
        warm: null
      },
      suggestedFinish: color.suggestedFinishes[0] || 'eggshell'
    }
  })
}

const tagLabels: Record<string, { label: string; bg: string; text: string; border: string }> = {
  top_pick: { label: 'Top Pick', bg: 'bg-sage-50', text: 'text-sage', border: 'border-sage/20' },
  safe_bet: { label: 'Safe Bet', bg: 'bg-cream-100', text: 'text-charcoal-light', border: 'border-cream-300' },
  bold_choice: { label: 'Bold Choice', bg: 'bg-blush-light/50', text: 'text-blush-dark', border: 'border-blush/20' }
}

function ColorCard({ scored, onCompare, roomImage }: { scored: ScoredColor; onCompare: () => void; roomImage: string | null }) {
  const navigate = useNavigate()
  const { color, tag, scores, reasoning, suggestedTrim, suggestedFinish } = scored
  const tagInfo = tagLabels[tag]
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showVisualized, setShowVisualized] = useState(true)

  useEffect(() => {
    if (!roomImage) return

    const cacheKey = getCacheKey(roomImage, color.id)
    const cached = getCachedVisualization(cacheKey)

    if (cached) {
      setVisualizedImage(cached)
      return
    }

    // Auto-generate visualization when room image is available
    const generateVisualization = async () => {
      setIsGenerating(true)
      setGenerationError(null)
      console.log(`[Gemini] Starting visualization for ${color.name} (${color.hex})`)

      const result = await generateRoomVisualization(roomImage, { name: color.name, hex: color.hex })

      if (result.success && result.imageUrl) {
        console.log(`[Gemini] Successfully generated visualization for ${color.name}`)
        setVisualizedImage(result.imageUrl)
        cacheVisualization(cacheKey, result.imageUrl)
      } else {
        console.error(`[Gemini] Failed to generate visualization for ${color.name}:`, result.error)
        setGenerationError(result.error || 'Failed to generate')
      }
      setIsGenerating(false)
    }

    generateVisualization()
  }, [roomImage, color.id, color.name, color.hex])

  const undertoneText = () => {
    const temp = color.undertone.temperature === 'neutral' ? '' : `${color.undertone.temperature} `
    const primary = color.undertone.leansPrimary === 'neutral' ? 'neutral' : `${color.undertone.leansPrimary} lean`
    return `${temp}${primary}`.trim()
  }

  return (
    <div className="card overflow-hidden">
      {/* Swatch / Visualization with Lighting Slider */}
      {visualizedImage && showVisualized ? (
        <div className="relative">
          <LightingSlider imageUrl={visualizedImage} colorName={color.name} />
          {/* Tag badge */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-medium tracking-wide border ${tagInfo.bg} ${tagInfo.text} ${tagInfo.border} z-10`}>
            {tagInfo.label}
          </div>
          {/* Toggle button */}
          <button
            onClick={() => setShowVisualized(!showVisualized)}
            className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
            title="Show color swatch"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="aspect-[4/3] relative overflow-hidden">
        {/* Show loading or swatch when no visualization */}
        {isGenerating && roomImage ? (
          /* Loading state: blurred room image with spinner */
          <div className="w-full h-full relative">
            <img
              src={roomImage}
              alt="Your room"
              className="w-full h-full object-cover blur-sm brightness-75"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <span className="text-white text-sm font-medium drop-shadow-md">
                Painting walls...
              </span>
            </div>
          </div>
        ) : generationError && roomImage ? (
          /* Error state: show swatch with error message */
          <div className="w-full h-full relative">
            <div
              className="w-full h-full"
              style={{ backgroundColor: color.hex }}
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Visualization unavailable
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: color.hex }}
          />
        )}

        {/* Tag badge - shown when no visualization */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 text-xs font-medium tracking-wide border ${tagInfo.bg} ${tagInfo.text} ${tagInfo.border}`}>
          {tagInfo.label}
        </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Name, Code & Swatch */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-serif text-lg text-charcoal">{color.name}</h3>
            <p className="text-sm text-charcoal-light">{color.brand} {color.code}</p>
          </div>
          {/* Color swatch */}
          <div
            className="w-12 h-12 rounded-lg shadow-md border border-charcoal/10 flex-shrink-0"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} - ${color.hex}`}
          />
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
          <div className="flex-1 h-1 bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-sage transition-all"
              style={{ width: `${scores.overall}%` }}
            />
          </div>
          <span className="text-sm font-medium text-charcoal">{scores.overall}</span>
        </div>

        {/* Reasoning */}
        <p className="text-sm text-editorial mb-4">
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
        className="w-full py-4 border-t border-cream-200 text-sm text-charcoal-light hover:text-sage hover:bg-sage-50 transition-colors flex items-center justify-center gap-2"
      >
        View paint story
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Shortlist() {
  const navigate = useNavigate()
  const { shortlist, profile, setCompareColors, compareColors, roomImage } = useAppContext()

  // State for surprise mode
  const [isSurpriseMode, setIsSurpriseMode] = useState(false)
  const [surpriseColors, setSurpriseColors] = useState<ScoredColor[]>([])

  // The colors to display (either original shortlist or surprise colors)
  const displayedColors = isSurpriseMode ? surpriseColors : shortlist

  const handleSurpriseMe = () => {
    const newSurpriseColors = generateSurpriseShortlist()
    setSurpriseColors(newSurpriseColors)
    setIsSurpriseMode(true)
    // Clear any compare selections
    setCompareColors([null, null])
  }

  const handleBackToOriginal = () => {
    setIsSurpriseMode(false)
    setCompareColors([null, null])
  }

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
    hallway: 'Hall / entry',
    office: 'Office',
    kids: "Kids' room",
    dining: 'Dining room',
    other: 'Room',
    skip: 'Room'
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
      <header className="page-header">
        <div className="flex items-center justify-between" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => isSurpriseMode ? handleBackToOriginal() : navigate('/setup')}
            className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-title text-charcoal">
              {isSurpriseMode ? 'Surprise Picks' : 'Your Shortlist'}
            </h1>
            <p className="text-xs text-charcoal-lighter tracking-wide">
              {isSurpriseMode ? 'Hand-curated just for fun' : (profile.roomType ? roomTypeLabels[profile.roomType] : 'Your space')}
            </p>
          </div>
          <SaveShortlistButton shortlist={displayedColors} profile={profile} />
        </div>
      </header>

      {/* Back to original shortlist banner (when in surprise mode) */}
      {isSurpriseMode && (
        <div className="px-6 py-3 bg-blush-light/30 border-b border-blush/20">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
              onClick={handleBackToOriginal}
              className="w-full flex items-center justify-center gap-2 text-sm text-blush-dark hover:text-blush transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Back to your personalized shortlist
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-6 py-4 bg-cream-100 text-center border-b border-cream-200">
        <p className="text-xs text-charcoal-light font-serif italic">
          Digital swatches are a starting point. Always test with real samples.
        </p>
      </div>

      {/* Surprise me section (only show when NOT in surprise mode) */}
      {!isSurpriseMode && (
        <div className="px-6 py-5 border-b border-cream-200" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSurpriseMe}
              className="btn-secondary flex items-center gap-2 flex-shrink-0"
            >
              <Shuffle className="w-4 h-4" />
              Surprise me!
            </button>
            <p className="text-xs text-charcoal-light">
              Don't love these colors? Click to generate five more top paint picks hand-curated by us.
            </p>
          </div>
        </div>
      )}

      {/* Room image indicator */}
      {roomImage && (
        <div className="px-6 py-3 bg-sage-50 text-center border-b border-sage/20">
          <p className="text-xs text-sage">
            AI is visualizing each color on your room photo
          </p>
        </div>
      )}

      {/* Color Cards */}
      <div className="p-4 space-y-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {displayedColors.map(scored => (
          <ColorCard
            key={scored.color.id}
            scored={scored}
            onCompare={() => handleCompare(scored)}
            roomImage={roomImage}
          />
        ))}
      </div>

      {/* Compare selection indicator */}
      {compareCount > 0 && (
        <div className="fixed bottom-20 left-6 right-6 bg-sage text-cream-50 py-4 px-5 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
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
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-cream-200 px-6 py-4 safe-area-inset-bottom">
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
