import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useAppContext } from '../App'
import { buildShortlist } from '../utils/recommendation'
import { UserRoomProfile } from '../types'

type Step = {
  id: string
  title: string
  subtitle?: string
  type: 'single' | 'multi' | 'slider'
  options?: Array<{ label: string; value: string }>
  sliders?: Array<{ label: string; left: string; right: string; key: string }>
}

const steps: Step[] = [
  {
    id: 'roomType',
    title: 'What room are you painting?',
    type: 'single',
    options: [
      { label: 'Living room', value: 'living' },
      { label: 'Bedroom', value: 'bedroom' },
      { label: 'Kitchen', value: 'kitchen' },
      { label: 'Bathroom', value: 'bathroom' },
      { label: 'Hallway', value: 'hallway' },
      { label: 'Home office', value: 'office' },
      { label: 'Nursery', value: 'nursery' },
      { label: 'Exterior', value: 'exterior' }
    ]
  },
  {
    id: 'lightDirection',
    title: 'Which way do the windows face?',
    subtitle: 'This affects how colors shift throughout the day.',
    type: 'single',
    options: [
      { label: 'North', value: 'north' },
      { label: 'South', value: 'south' },
      { label: 'East', value: 'east' },
      { label: 'West', value: 'west' },
      { label: 'Not sure', value: 'unknown' }
    ]
  },
  {
    id: 'primaryUsage',
    title: 'When do you use this room most?',
    type: 'single',
    options: [
      { label: 'Mostly daytime', value: 'day' },
      { label: 'Mostly evening', value: 'night' },
      { label: 'Both equally', value: 'both' }
    ]
  },
  {
    id: 'bulbTemp',
    title: 'What kind of light bulbs?',
    subtitle: 'Check the box — it says "K" for Kelvin.',
    type: 'single',
    options: [
      { label: 'Warm (2700K)', value: 'warm' },
      { label: 'Neutral (3000–3500K)', value: 'neutral' },
      { label: 'Cool (4000K+)', value: 'cool' },
      { label: 'Not sure', value: 'unknown' }
    ]
  },
  {
    id: 'fixedElements',
    title: "What's staying in the room?",
    subtitle: 'Select all that apply. This helps us avoid clashing.',
    type: 'multi',
    options: [
      { label: 'Warm wood floors', value: 'wood_warm' },
      { label: 'Cool wood floors', value: 'wood_cool' },
      { label: 'White cabinets', value: 'cabinets_white' },
      { label: 'Cream cabinets', value: 'cabinets_cream' },
      { label: 'Gray cabinets', value: 'cabinets_gray' },
      { label: 'White/marble counters', value: 'counters_white' },
      { label: 'Warm counters', value: 'counters_warm' },
      { label: 'Dark counters', value: 'counters_dark' },
      { label: 'Red brick', value: 'brick_red' },
      { label: 'Gray brick', value: 'brick_gray' },
      { label: 'Brass / gold hardware', value: 'hardware_brass' },
      { label: 'Chrome / nickel', value: 'hardware_chrome' },
      { label: 'Black hardware', value: 'hardware_black' }
    ]
  },
  {
    id: 'vibe',
    title: 'What feeling are you after?',
    type: 'slider',
    sliders: [
      { label: 'Temperature', left: 'Cozy & warm', right: 'Crisp & clean', key: 'cozyToCrisp' },
      { label: 'Mood', left: 'Calm & restful', right: 'Moody & dramatic', key: 'calmToMoody' }
    ]
  },
  {
    id: 'undertoneFears',
    title: 'Any undertones you want to avoid?',
    subtitle: "We'll steer away from colors that tend to shift this way.",
    type: 'multi',
    options: [
      { label: 'Turns green', value: 'fear_green' },
      { label: 'Turns pink', value: 'fear_pink' },
      { label: 'Turns purple', value: 'fear_purple' },
      { label: 'Looks baby-blue', value: 'fear_babyblue' },
      { label: 'Looks dingy gray', value: 'fear_dingy' },
      { label: 'Looks too yellow', value: 'fear_yellow' }
    ]
  },
  {
    id: 'brandPreferences',
    title: 'Any preferred brands?',
    subtitle: "Optional. We'll show matches across all brands otherwise.",
    type: 'multi',
    options: [
      { label: 'Sherwin-Williams', value: 'sw' },
      { label: 'Benjamin Moore', value: 'bm' },
      { label: 'Behr', value: 'behr' },
      { label: 'PPG', value: 'ppg' },
      { label: 'Any brand', value: 'any' }
    ]
  },
  {
    id: 'depthPreference',
    title: 'How light or dark?',
    type: 'single',
    options: [
      { label: 'Light & airy', value: 'light' },
      { label: 'Mid-tone', value: 'mid' },
      { label: 'Dark & cozy', value: 'dark' },
      { label: 'Show me options', value: 'any' }
    ]
  }
]

export default function RoomSetup() {
  const navigate = useNavigate()
  const { setProfile, setShortlist } = useAppContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({
    roomType: '',
    lightDirection: '',
    primaryUsage: '',
    bulbTemp: '',
    fixedElements: [],
    cozyToCrisp: 50,
    calmToMoody: 50,
    undertoneFears: [],
    brandPreferences: [],
    depthPreference: ''
  })

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }))
    if (!isLastStep) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200)
    }
  }

  const handleMultiSelect = (value: string) => {
    const current = (answers[step.id] as string[]) || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setAnswers(prev => ({ ...prev, [step.id]: updated }))
  }

  const handleSliderChange = (key: string, value: number) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step.type === 'single') {
      return !!answers[step.id]
    }
    if (step.type === 'multi') {
      return true // Multi-select is optional
    }
    return true
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Build the profile from answers
    const profile: UserRoomProfile = {
      roomType: answers.roomType as UserRoomProfile['roomType'],
      lighting: {
        direction: answers.lightDirection as UserRoomProfile['lighting']['direction'],
        primaryUsage: answers.primaryUsage as UserRoomProfile['lighting']['primaryUsage'],
        bulbTemp: answers.bulbTemp as UserRoomProfile['lighting']['bulbTemp']
      },
      fixedElements: answers.fixedElements as string[],
      vibe: {
        cozyToCrisp: answers.cozyToCrisp as number,
        calmToMoody: answers.calmToMoody as number
      },
      undertoneFears: answers.undertoneFears as string[],
      brandPreferences: answers.brandPreferences as string[],
      depthPreference: answers.depthPreference as UserRoomProfile['depthPreference']
    }

    setProfile(profile)

    // Generate shortlist
    const results = buildShortlist(profile)
    setShortlist(results)

    // Simulate processing time for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500))

    navigate('/shortlist')
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : navigate('/')}
          className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep
                  ? 'bg-charcoal'
                  : i < currentStep
                  ? 'bg-gold'
                  : 'bg-charcoal/20'
              }`}
            />
          ))}
        </div>

        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col">
        {/* Question */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-charcoal mb-2">
            {step.title}
          </h2>
          {step.subtitle && (
            <p className="text-charcoal-light text-sm">
              {step.subtitle}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex-1">
          {step.type === 'single' && step.options && (
            <div className="flex flex-wrap gap-3">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleSelect(opt.value)}
                  className={answers[step.id] === opt.value ? 'btn-pill-selected' : 'btn-pill'}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step.type === 'multi' && step.options && (
            <div className="flex flex-wrap gap-3">
              {step.options.map(opt => {
                const selected = ((answers[step.id] as string[]) || []).includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiSelect(opt.value)}
                    className={selected ? 'chip-selected' : 'chip'}
                  >
                    {selected && <Check className="w-4 h-4" />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {step.type === 'slider' && step.sliders && (
            <div className="space-y-8">
              {step.sliders.map(slider => (
                <div key={slider.key}>
                  <div className="flex justify-between text-sm text-charcoal-light mb-3">
                    <span>{slider.left}</span>
                    <span>{slider.right}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={answers[slider.key] as number}
                    onChange={(e) => handleSliderChange(slider.key, Number(e.target.value))}
                    className="w-full h-2 bg-charcoal/10 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-6
                             [&::-webkit-slider-thumb]:h-6
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-charcoal
                             [&::-webkit-slider-thumb]:shadow-md
                             [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 safe-area-inset-bottom">
        {isLastStep ? (
          <button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className="btn-primary flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
                Creating your shortlist...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create my 5-swatch shortlist
              </>
            )}
          </button>
        ) : step.type === 'multi' || step.type === 'slider' ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}

        {step.type === 'multi' && (
          <button
            onClick={() => {
              setAnswers(prev => ({ ...prev, [step.id]: [] }))
              setCurrentStep(prev => prev + 1)
            }}
            className="mt-3 w-full py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
          >
            {step.id === 'undertoneFears' ? 'No concerns' : step.id === 'fixedElements' ? 'None of these' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  )
}
