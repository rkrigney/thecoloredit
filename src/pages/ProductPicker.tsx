import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Shield } from 'lucide-react'
import { getColorById } from '../data/colors'
import { useAppContext } from '../App'
import { recommendProductLine, getPrimerRecommendation, estimateQuantity } from '../utils/recommendation'
import { ShoppingListItem } from '../types'

type Step = {
  id: string
  title: string
  subtitle?: string
  options: Array<{ label: string; value: string; hint?: string }>
}

const steps: Step[] = [
  {
    id: 'surface',
    title: 'What are you painting?',
    options: [
      { label: 'Walls', value: 'walls' },
      { label: 'Trim', value: 'trim' },
      { label: 'Doors', value: 'doors' },
      { label: 'Cabinets', value: 'cabinets' },
      { label: 'Ceiling', value: 'ceiling' }
    ]
  },
  {
    id: 'condition',
    title: "What's the surface like now?",
    options: [
      { label: 'New drywall', value: 'new_drywall' },
      { label: 'Previously painted (good shape)', value: 'painted_good' },
      { label: 'Previously painted (rough/chalky)', value: 'painted_rough' },
      { label: 'Glossy surface (semi-gloss/oil)', value: 'glossy' },
      { label: 'Stained wood or tannins', value: 'stained_wood' },
      { label: 'Cabinet (factory finish)', value: 'cabinet_slick' },
      { label: 'Brick / masonry', value: 'masonry' }
    ]
  },
  {
    id: 'priorities',
    title: 'What matters most?',
    subtitle: 'Pick up to 2',
    options: [
      { label: 'Easy wipe-clean', value: 'wipe_clean' },
      { label: 'Scuff resistance', value: 'scuff_resistance' },
      { label: 'Moisture resistance', value: 'moisture' },
      { label: 'Best touch-ups', value: 'touch_up' },
      { label: 'Lowest odor / low VOC', value: 'low_voc' },
      { label: 'Budget-friendly', value: 'budget' }
    ]
  },
  {
    id: 'sheen',
    title: 'What sheen?',
    options: [
      { label: 'Matte', value: 'matte', hint: 'Soft, hides flaws, marks easier' },
      { label: 'Eggshell', value: 'eggshell', hint: 'The safe default for most rooms' },
      { label: 'Satin', value: 'satin', hint: 'More wipeable, shows more texture' },
      { label: 'Semi-gloss', value: 'semigloss', hint: 'Trim/doors, high wipeability' },
      { label: 'Not sure — choose for me', value: 'auto', hint: "We'll pick based on your room" }
    ]
  },
  {
    id: 'roomSize',
    title: 'Room size?',
    subtitle: 'For quantity estimate',
    options: [
      { label: 'Small (bathroom, closet)', value: 'small' },
      { label: 'Medium (bedroom, office)', value: 'medium' },
      { label: 'Large (living room)', value: 'large' },
      { label: 'Very large (great room)', value: 'very_large' }
    ]
  }
]

export default function ProductPicker() {
  const { colorId } = useParams<{ colorId: string }>()
  const navigate = useNavigate()
  const { addToShoppingList, profile } = useAppContext()

  const color = colorId ? getColorById(colorId) : null
  const [currentStep, setCurrentStep] = useState(0)
  const [noRegretsMode, setNoRegretsMode] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    surface: '',
    condition: '',
    priorities: [],
    sheen: '',
    roomSize: ''
  })

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

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleSelect = (value: string) => {
    if (step.id === 'priorities') {
      const current = (answers.priorities as string[]) || []
      if (current.includes(value)) {
        setAnswers(prev => ({ ...prev, priorities: current.filter(v => v !== value) }))
      } else if (current.length < 2) {
        setAnswers(prev => ({ ...prev, priorities: [...current, value] }))
      }
    } else {
      setAnswers(prev => ({ ...prev, [step.id]: value }))
      if (!isLastStep && step.id !== 'priorities') {
        setTimeout(() => setCurrentStep(prev => prev + 1), 200)
      }
    }
  }

  const handleAddToList = () => {
    const priorities = answers.priorities as string[]
    const productLine = recommendProductLine(
      color.brandId,
      answers.surface as string,
      priorities,
      noRegretsMode
    )
    const primer = getPrimerRecommendation(answers.condition as string)
    const quantity = estimateQuantity(
      answers.roomSize as 'small' | 'medium' | 'large' | 'very_large',
      9,
      answers.surface as string
    )

    // Determine sheen based on room type from profile
    let sheen = answers.sheen as string
    if (sheen === 'auto') {
      const room = profile?.roomType || 'living'
      if (room === 'bathroom') sheen = 'satin'
      else if (room === 'kitchen' || room === 'hallway') sheen = 'eggshell'
      else if (room === 'bedroom' && !noRegretsMode) sheen = 'matte'
      else sheen = 'eggshell'
    }

    // Determine base from color LRV
    let base: 'light' | 'medium' | 'deep' | 'ultradeep' = 'light'
    if (color.lrv < 20) base = 'ultradeep'
    else if (color.lrv < 40) base = 'deep'
    else if (color.lrv < 60) base = 'medium'

    const item: ShoppingListItem = {
      id: `${color.id}-${answers.surface}-${Date.now()}`,
      roomName: profile?.roomType || 'living',
      surface: answers.surface as string,
      color,
      productLine: productLine.name,
      sheen,
      base,
      quantity: { gallons: quantity.gallons, coats: quantity.coats },
      primer: { needed: primer.needed, type: primer.type, gallons: primer.needed ? 1 : 0 },
      productSpec: {
        surface: answers.surface as string,
        room: profile?.roomType || 'living',
        condition: answers.condition as string,
        priorities,
        sheen,
        brand: color.brandId,
        noRegretsMode
      }
    }

    addToShoppingList(item)
    navigate('/shopping-list')
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-charcoal/5">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : navigate(-1)}
          className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-sm font-medium text-charcoal">{color.name}</span>
        </div>

        <div className="w-9" />
      </header>

      {/* Progress */}
      <div className="px-4 py-3 flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-charcoal' : 'bg-charcoal/15'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-4">
        <h2 className="font-serif text-2xl text-charcoal mb-2">{step.title}</h2>
        {step.subtitle && (
          <p className="text-charcoal-light text-sm mb-6">{step.subtitle}</p>
        )}

        {/* No Regrets Mode Toggle (show on first step) */}
        {currentStep === 0 && (
          <button
            onClick={() => setNoRegretsMode(!noRegretsMode)}
            className={`w-full mb-6 p-4 rounded-xl border flex items-center gap-3 transition-colors ${
              noRegretsMode
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-charcoal/10 hover:border-charcoal/20'
            }`}
          >
            <Shield className={`w-5 h-5 ${noRegretsMode ? 'text-emerald-600' : 'text-charcoal-light'}`} />
            <div className="flex-1 text-left">
              <p className={`text-sm font-medium ${noRegretsMode ? 'text-emerald-700' : 'text-charcoal'}`}>
                No-regrets mode
              </p>
              <p className="text-xs text-charcoal-light">
                Defaults to forgiving sheen + high durability
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${noRegretsMode ? 'bg-emerald-500' : 'bg-charcoal/20'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${noRegretsMode ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        )}

        {/* Options */}
        <div className="space-y-3">
          {step.options.map(opt => {
            const isSelected = step.id === 'priorities'
              ? ((answers.priorities as string[]) || []).includes(opt.value)
              : answers[step.id] === opt.value

            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  isSelected
                    ? 'bg-charcoal text-cream-50 border-charcoal'
                    : 'bg-white border-charcoal/10 hover:border-charcoal/20'
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium">{opt.label}</p>
                  {opt.hint && (
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-cream-50/70' : 'text-charcoal-light'}`}>
                      {opt.hint}
                    </p>
                  )}
                </div>
                {isSelected && <Check className="w-5 h-5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-6 pt-2 safe-area-inset-bottom">
        {isLastStep ? (
          <button
            onClick={handleAddToList}
            disabled={!answers.roomSize}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag className="w-5 h-5" />
            Add to shopping list
          </button>
        ) : step.id === 'priorities' ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
