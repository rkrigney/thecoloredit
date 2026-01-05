import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles, Upload, Camera, X } from 'lucide-react'
import { useAppContext } from '../App'
import { buildShortlist } from '../utils/recommendation'
import { UserRoomProfile } from '../types'

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
    type: 'slider'
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

// Sun animation component
function SunSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  // Calculate sun position and appearance based on slider value
  const sunY = 100 - (value * 0.8) // Sun rises as value increases
  const sunScale = 0.6 + (value / 100) * 0.6 // Sun gets bigger/brighter
  const skyOpacity = value / 100 // Sky gets brighter
  const rayCount = Math.floor(value / 15) + 2 // More rays as it gets brighter

  return (
    <div className="space-y-6">
      {/* Sun animation container */}
      <div className="relative h-40 bg-gradient-to-b from-slate-800 to-slate-600 rounded-2xl overflow-hidden transition-all duration-300"
           style={{
             background: `linear-gradient(to bottom,
               hsl(${200 + value * 0.3}, ${20 + value * 0.5}%, ${15 + value * 0.6}%) 0%,
               hsl(${40 + value * 0.2}, ${50 + value * 0.4}%, ${30 + value * 0.5}%) 100%)`
           }}>
        {/* Sun */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out"
          style={{
            bottom: `${sunY}%`,
            transform: `translateX(-50%) scale(${sunScale})`
          }}
        >
          {/* Sun glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, rgba(255, 200, 100, ${0.3 + skyOpacity * 0.4}) 0%, transparent 70%)`,
              width: '80px',
              height: '80px',
              marginLeft: '-20px',
              marginTop: '-20px'
            }}
          />
          {/* Sun body */}
          <div
            className="w-10 h-10 rounded-full transition-all duration-300"
            style={{
              background: `radial-gradient(circle,
                hsl(45, 100%, ${70 + value * 0.2}%) 0%,
                hsl(35, 100%, ${60 + value * 0.2}%) 100%)`,
              boxShadow: `0 0 ${20 + value * 0.3}px ${5 + value * 0.1}px rgba(255, 200, 100, ${0.3 + skyOpacity * 0.5})`
            }}
          />
          {/* Sun rays */}
          {Array.from({ length: rayCount }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 bg-yellow-200/60 rounded-full origin-bottom"
              style={{
                height: `${12 + (value / 100) * 8}px`,
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${(360 / rayCount) * i}deg) translateY(-24px)`,
                opacity: 0.4 + skyOpacity * 0.4
              }}
            />
          ))}
        </div>

        {/* Ground/horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-charcoal/40 to-transparent" />
      </div>

      {/* Slider */}
      <div>
        <div className="flex justify-between text-sm text-charcoal-light mb-3">
          <span>None</span>
          <span>Lots</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-charcoal/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-6
                   [&::-webkit-slider-thumb]:h-6
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-white"
        />
      </div>
    </div>
  )
}

export default function RoomSetup() {
  const navigate = useNavigate()
  const { setProfile, setShortlist, setRoomImage } = useAppContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({
    roomType: '',
    lightLevel: 50,
    lightDirection: '',
    bulbFeel: '',
    fixedElements: '',
    vibe: '',
    boldness: '',
    avoidList: []
  })

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

  const removeImage = () => {
    setImagePreview(null)
    setRoomImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }))
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
      // Remove if already selected
      setAnswers(prev => ({ ...prev, avoidList: current.filter(v => v !== value) }))
    } else if (current.length < maxSelections) {
      // Add if under limit
      setAnswers(prev => ({ ...prev, avoidList: [...current, value] }))
    }
  }

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, lightLevel: value }))
  }

  const canProceed = () => {
    if (step.type === 'single') {
      return !!answers[step.id]
    }
    if (step.type === 'avoid') {
      return true // Avoid list is optional
    }
    return true
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Build the profile from answers
    const profile: UserRoomProfile = {
      roomType: answers.roomType as UserRoomProfile['roomType'] || undefined,
      lightLevel: answers.lightLevel as number,
      lightDirection: answers.lightDirection as UserRoomProfile['lightDirection'],
      bulbFeel: answers.bulbFeel as UserRoomProfile['bulbFeel'],
      fixedElements: answers.fixedElements as UserRoomProfile['fixedElements'],
      vibe: answers.vibe as UserRoomProfile['vibe'],
      boldness: answers.boldness as UserRoomProfile['boldness'],
      avoidList: answers.avoidList as UserRoomProfile['avoidList']
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
      <div className="px-6 pt-4 pb-4 flex-1 flex flex-col overflow-y-auto">
        {/* Question */}
        <div className="mb-6">
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
        <div className="mb-4 flex-1">
          {/* Image upload with room type */}
          {step.type === 'image_with_room' && (
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="room-image-upload"
              />

              {!imagePreview ? (
                <div className="space-y-3">
                  <label
                    htmlFor="room-image-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-charcoal/20 rounded-2xl cursor-pointer hover:border-charcoal/40 hover:bg-cream-100 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-charcoal/40 mb-2" />
                    <span className="text-charcoal font-medium">Upload a photo</span>
                    <span className="text-charcoal-light text-sm mt-1">or drag and drop</span>
                  </label>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border border-charcoal/20 rounded-full flex items-center justify-center gap-2 text-charcoal hover:bg-cream-100 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Take a photo
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Room preview"
                    className="w-full max-h-48 object-cover rounded-2xl"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 bg-charcoal/80 text-white rounded-full hover:bg-charcoal transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Room type question */}
              <div>
                <p className="text-charcoal-light text-sm mb-3">What room are we working on? (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleRoomSelect(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        answers.roomType === opt.value
                          ? 'bg-charcoal text-white'
                          : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Light level slider with sun animation */}
          {step.type === 'slider' && (
            <SunSlider
              value={answers.lightLevel as number}
              onChange={handleSliderChange}
            />
          )}

          {/* Single select options */}
          {step.type === 'single' && step.options && (
            <div className="space-y-3">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleSelect(opt.value)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    answers[step.id] === opt.value
                      ? 'bg-charcoal text-white'
                      : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {opt.subtitle && (
                    <span className={`block text-sm mt-0.5 ${
                      answers[step.id] === opt.value ? 'text-white/70' : 'text-charcoal-light'
                    }`}>
                      {opt.subtitle}
                    </span>
                  )}
                </button>
              ))}
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
                    className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                      selected
                        ? 'bg-charcoal text-white'
                        : disabled
                        ? 'bg-charcoal/5 text-charcoal/40 cursor-not-allowed'
                        : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected
                        ? 'border-white bg-white'
                        : 'border-charcoal/30'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-charcoal" />}
                    </div>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-6 pt-2 safe-area-inset-bottom">
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
                Create my shortlist
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn-primary flex items-center justify-center gap-2"
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
            className="mt-3 w-full py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
          >
            No concerns — let's see everything
          </button>
        )}

        {step.type === 'image_with_room' && !imagePreview && (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="mt-3 w-full py-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
