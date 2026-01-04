import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

interface LightingSliderProps {
  imageUrl: string
  colorName: string
}

/**
 * LightingSlider - Preview paint colors under different lighting conditions
 *
 * Uses CSS filters to simulate warm (2700K) vs cool (5000K+) lighting
 * without requiring image re-generation. Slider crossfades between
 * warm and cool variants using opacity stacking.
 */
export default function LightingSlider({ imageUrl, colorName }: LightingSliderProps) {
  // Slider value: 0 = warm, 50 = neutral, 100 = cool
  const [lightingValue, setLightingValue] = useState(50)

  // Calculate opacities for warm/cool layers based on slider position
  // At 0: warmOpacity = 1, coolOpacity = 0
  // At 50: warmOpacity = 0, coolOpacity = 0 (neutral shows through)
  // At 100: warmOpacity = 0, coolOpacity = 1
  const warmOpacity = lightingValue < 50 ? (50 - lightingValue) / 50 : 0
  const coolOpacity = lightingValue > 50 ? (lightingValue - 50) / 50 : 0

  // Lighting labels
  const getLightingLabel = () => {
    if (lightingValue < 25) return 'Warm White (2700K)'
    if (lightingValue < 45) return 'Warm (3000K)'
    if (lightingValue < 55) return 'Neutral (3500K)'
    if (lightingValue < 75) return 'Cool (4500K)'
    return 'Daylight (5000K+)'
  }

  return (
    <div className="relative w-full">
      {/* Image Stack - Three layers: neutral base, warm overlay, cool overlay */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        {/* Base layer - Neutral (original image) */}
        <img
          src={imageUrl}
          alt={`Room with ${colorName}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Warm layer - Orange/yellow tint simulating incandescent light */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
          style={{
            filter: 'sepia(25%) saturate(120%) brightness(108%) hue-rotate(-8deg)',
            opacity: warmOpacity
          }}
        />

        {/* Cool layer - Blue tint simulating daylight */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
          style={{
            filter: 'saturate(95%) brightness(100%) hue-rotate(15deg) contrast(105%)',
            opacity: coolOpacity
          }}
        />

        {/* Lighting label overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {getLightingLabel()}
          </span>
        </div>
      </div>

      {/* Slider Control */}
      <div className="bg-charcoal/5 px-4 py-3 rounded-b-xl">
        <div className="flex items-center gap-3">
          <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={lightingValue}
            onChange={(e) => setLightingValue(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-amber-200 via-gray-200 to-blue-200 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-charcoal/20
                     [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <Moon className="w-4 h-4 text-blue-500 flex-shrink-0" />
        </div>
        <p className="text-center text-xs text-charcoal-light mt-2">
          Drag to preview lighting conditions
        </p>
      </div>
    </div>
  )
}
