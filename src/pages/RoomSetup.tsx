import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles, Upload, Camera } from 'lucide-react'
import { useAppContext } from '../App'
import { buildShortlist } from '../utils/recommendation'
import { UserRoomProfile } from '../types'
import warmAndCozyIllustration from '../4-Warm-and-Cozy.png'

type Step = {
  id: string
  title: string
  subtitle?: string
  type: 'single' | 'multi' | 'slider' | 'image_with_room' | 'avoid'
  options?: Array<{ label: string; value: string; subtitle?: string }>
  maxSelections?: number
}

const steps: Step[] = [
  {
    id: 'roomAndImage',
    title: 'Show us your room',
    subtitle: "Upload a photo and we'll visualize each color on your walls.",
    type: 'image_with_room'
  },
  {
    id: 'lightLevel',
    title: 'How much natural light does this room get?',
    type: 'single',
    options: [
      { label: 'None (no windows)', value: 'none' },
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'Lots', value: 'lots' }
    ]
  },
  {
    id: 'lightDirection',
    title: 'When does this room get the most natural light?',
    type: 'single',
    options: [
      { label: 'Morning', value: 'east', subtitle: 'east' },
      { label: 'Afternoon / evening', value: 'west', subtitle: 'west' },
      { label: 'Most of the day', value: 'south', subtitle: 'south' },
      { label: 'Mostly indirect/shaded', value: 'north', subtitle: 'north' },
      { label: 'Not sure / no windows', value: 'unknown' }
    ]
  },
  {
    id: 'bulbFeel',
    title: 'At night, your bulbs feel…',
    type: 'single',
    options: [
      { label: 'Warm & cozy', value: 'warm' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Bright white', value: 'bright_white' },
      { label: 'Not sure / mixed', value: 'unknown' }
    ]
  },
  {
    id: 'fixedElements',
    title: "Are there existing colors in your space that you'll need to work around?",
    subtitle: 'Think floors, cabinets, light fixtures...',
    type: 'single',
    options: [
      { label: 'Warm', value: 'warm', subtitle: 'honey/orange wood, beige/tan, brass/gold fixtures, earthy finishes' },
      { label: 'Cool', value: 'cool', subtitle: 'gray wood/tile, blue-gray, chrome/nickel fixtures, crisp modern finishes' },
      { label: 'Mixed', value: 'mixed', subtitle: 'a little of everything' }
    ]
  },
  {
    id: 'vibe',
    title: 'How do you want the room to feel?',
    type: 'single',
    options: [
      { label: 'Cozy & warm', value: 'cozy_warm' },
      { label: 'Clean & crisp', value: 'clean_crisp' },
      { label: 'Calm & muted', value: 'calm_muted' },
      { label: 'Moody & dramatic', value: 'moody_dramatic' }
    ]
  },
  {
    id: 'boldness',
    title: 'How bold do you want to go?',
    type: 'single',
    options: [
      { label: 'Timeless', value: 'timeless', subtitle: 'easy to live with' },
      { label: 'A little color', value: 'a_little_color', subtitle: 'soft but noticeable' },
      { label: 'Statement', value: 'statement', subtitle: 'dramatic and daring' }
    ]
  },
  {
    id: 'avoidList',
    title: 'What do you absolutely want to avoid?',
    subtitle: 'Pick up to 2',
    type: 'avoid',
    maxSelections: 2,
    options: [
      { label: 'Looking green', value: 'green' },
      { label: 'Looking purple', value: 'purple' },
      { label: 'Looking yellow/creamy', value: 'yellow_creamy' },
      { label: 'Feeling too dark', value: 'too_dark' },
      { label: 'Feeling too cold/icy', value: 'too_cold' }
    ]
  }
]

const roomOptions = [
  { label: 'Living room', value: 'living' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Bathroom', value: 'bathroom' },
  { label: 'Hall / entry', value: 'hallway' },
  { label: 'Office', value: 'office' },
  { label: "Kids' room", value: 'kids' },
  { label: 'Dining room', value: 'dining' },
  { label: 'Other', value: 'other' },
  { label: 'Skip', value: 'skip' }
]

export default function RoomSetup() {
  const navigate = useNavigate()
  const { setProfile, setShortlist, setRoomImage } = useAppContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    roomType: '',
    lightLevel: '',
    lightDirection: '',
    bulbFeel: '',
    fixedElements: '',
    vibe: '',
    boldness: '',
    avoidList: []
  })

  // Track illustration visibility and animation completion
  const [showIllustration, setShowIllustration] = useState(false)
  const [illustrationReady, setIllustrationReady] = useState(false)

  // Reset illustration state when step changes
  useEffect(() => {
    setShowIllustration(false)
    setIllustrationReady(false)
  }, [currentStep])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setRoomImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }))

    // Special case: bulbFeel with "warm" selected - show illustration first
    if (step.id === 'bulbFeel' && value === 'warm') {
      // Trigger illustration pop-in
      setTimeout(() => setShowIllustration(true), 200)
      // Mark as ready after animation completes (500ms animation)
      setTimeout(() => setIllustrationReady(true), 700)
      // Don't auto-progress - wait for user to click continue
      return
    }

    if (!isLastStep) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200)
    }
  }

  const handleRoomSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, roomType: value }))
  }

  const handleAvoidSelect = (value: string) => {
    const current = (answers.avoidList as string[]) || []
    const maxSelections = step.maxSelections || 2

    if (current.includes(value)) {
      setAnswers(prev => ({ ...prev, avoidList: current.filter(v => v !== value) }))
    } else if (current.length < maxSelections) {
      setAnswers(prev => ({ ...prev, avoidList: [...current, value] }))
    }
  }

  const canProceed = () => {
    if (step.type === 'single') {
      return !!answers[step.id]
    }
    if (step.type === 'avoid') {
      return true
    }
    return true
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    const profile: UserRoomProfile = {
      roomType: answers.roomType as UserRoomProfile['roomType'] || undefined,
      lightLevel: answers.lightLevel as UserRoomProfile['lightLevel'],
      lightDirection: answers.lightDirection as UserRoomProfile['lightDirection'],
      bulbFeel: answers.bulbFeel as UserRoomProfile['bulbFeel'],
      fixedElements: answers.fixedElements as UserRoomProfile['fixedElements'],
      vibe: answers.vibe as UserRoomProfile['vibe'],
      boldness: answers.boldness as UserRoomProfile['boldness'],
      avoidList: answers.avoidList as UserRoomProfile['avoidList']
    }

    setProfile(profile)

    const results = buildShortlist(profile)
    setShortlist(results)

    await new Promise(resolve => setTimeout(resolve, 1500))

    navigate('/shortlist')
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-cream-200">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : navigate('/')}
          className="p-2 -ml-2 text-charcoal-light hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'bg-sage w-6'
                  : i < currentStep
                  ? 'bg-sage'
                  : 'bg-cream-300'
              }`}
            />
          ))}
        </div>

        <div className="w-9" />
      </header>

      {/* Content */}
      <div className="px-6 pt-8 pb-4 flex-1 flex flex-col overflow-y-auto">
        {/* Question */}
        <div className="mb-8">
          <h2 className="font-serif text-title text-charcoal mb-2">
            {step.title}
          </h2>
          {step.subtitle && (
            <p className="text-charcoal-light text-sm">
              {step.subtitle}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="mb-4 flex-1">
          {/* Image upload with room type */}
          {step.type === 'image_with_room' && (
            <div className="space-y-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="room-image-upload"
              />

              <div className="space-y-4">
                {!imagePreview ? (
                  <label
                    htmlFor="room-image-upload"
                    className="flex flex-col items-center justify-center w-full h-44 border border-cream-300 bg-white cursor-pointer hover:border-sage hover:bg-sage-50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-charcoal-lighter mb-3" />
                    <span className="text-charcoal font-medium">Upload a photo</span>
                    <span className="text-charcoal-lighter text-sm mt-1">or drag and drop</span>
                  </label>
                ) : (
                  <div
                    className="w-full border border-cream-300 bg-white overflow-hidden cursor-pointer hover:border-sage transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ maxWidth: '800px' }}
                  >
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {imagePreview ? 'Replace image' : 'Take a photo'}
                </button>
              </div>

              {/* Room type question */}
              <div>
                <p className="section-label mb-4">What room are we working on?</p>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleRoomSelect(opt.value)}
                      className={answers.roomType === opt.value ? 'btn-pill-selected' : 'btn-pill'}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Single select options */}
          {step.type === 'single' && step.options && (
            <div className="space-y-3">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleSelect(opt.value)}
                  className={`w-full text-left p-5 border transition-all ${
                    answers[step.id] === opt.value
                      ? 'bg-sage text-cream-50 border-sage'
                      : 'bg-white text-charcoal border-cream-200 hover:border-sage hover:bg-sage-50'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.subtitle && (
                    <span className={`block text-sm mt-1 ${
                      answers[step.id] === opt.value ? 'text-cream-50/80' : 'text-charcoal-light'
                    }`}>
                      {opt.subtitle}
                    </span>
                  )}
                </button>
              ))}

              {/* Warm & Cozy Illustration - pops in when that option is selected */}
              {step.id === 'bulbFeel' && showIllustration && (
                <div
                  className={`mt-6 transition-all duration-500 ease-out ${
                    showIllustration ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                  }`}
                >
                  <img
                    src={warmAndCozyIllustration}
                    alt="Warm and cozy lighting illustration"
                    className="w-full rounded-lg shadow-sm"
                    style={{ maxWidth: '800px' }}
                  />
                </div>
              )}

              {/* Continue button appears beneath illustration when ready */}
              {step.id === 'bulbFeel' && answers.bulbFeel === 'warm' && illustrationReady && (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Avoid list (multi-select with limit) */}
          {step.type === 'avoid' && step.options && (
            <div className="space-y-3">
              {step.options.map(opt => {
                const selected = ((answers.avoidList as string[]) || []).includes(opt.value)
                const atLimit = ((answers.avoidList as string[]) || []).length >= (step.maxSelections || 2)
                const disabled = !selected && atLimit

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAvoidSelect(opt.value)}
                    disabled={disabled}
                    className={`w-full text-left p-5 border transition-all flex items-center gap-4 ${
                      selected
                        ? 'bg-sage text-cream-50 border-sage'
                        : disabled
                        ? 'bg-cream-100 text-charcoal-lighter border-cream-200 cursor-not-allowed'
                        : 'bg-white text-charcoal border-cream-200 hover:border-sage hover:bg-sage-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      selected
                        ? 'border-cream-50 bg-cream-50'
                        : 'border-charcoal/30'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-sage" />}
                    </div>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA - hidden when showing inline continue after illustration */}
      {!(step.id === 'bulbFeel' && answers.bulbFeel === 'warm') && (
      <div className="px-6 pb-8 pt-4 safe-area-inset-bottom border-t border-cream-200 bg-cream-50">
        {isLastStep ? (
          <button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
                Creating your shortlist...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create my shortlist
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {step.type === 'image_with_room' && imagePreview ? 'Looks great!' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step.type === 'avoid' && (
          <button
            onClick={() => {
              setAnswers(prev => ({ ...prev, avoidList: [] }))
              handleGenerate()
            }}
            className="btn-ghost w-full mt-3"
          >
            No concerns — let's see everything
          </button>
        )}

        {step.type === 'image_with_room' && !imagePreview && (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn-ghost w-full mt-3"
          >
            Skip for now
          </button>
        )}
      </div>
      )}
    </div>
  )
}
