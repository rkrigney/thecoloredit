// Room visualization using Gemini 2.5 Flash Image (Nano Banana)
// Edits the user's actual room photo to show different paint colors
// Triggered rebuild for API key

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

interface GenerateImageResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

export async function generateRoomVisualization(
  roomImageBase64: string,
  paintColor: { name: string; hex: string }
): Promise<GenerateImageResponse> {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key not configured - check VITE_GEMINI_API_KEY in .env')
    return { success: false, error: 'API key not configured' }
  }

  try {
    // Remove the data URL prefix if present
    const base64Data = roomImageBase64.replace(/^data:image\/\w+;base64,/, '')

    console.log(`[Gemini] Preparing visualization for ${paintColor.name} (${paintColor.hex})`)
    console.log(`[Gemini] Image data length: ${base64Data.length} chars`)

    // Describe the color for better results
    const colorDesc = getColorDescription(paintColor.hex)

    const prompt = `Edit this room photo: repaint all the walls to ${paintColor.name}, which is a ${colorDesc} color (hex: ${paintColor.hex}).
Keep everything else exactly the same - all furniture, fixtures, flooring, ceiling, windows, and decor must remain unchanged.
Only change the wall paint color. The new wall color should look realistic with proper lighting and shadows.
Output a photorealistic edited version of this exact room with the walls painted ${paintColor.name}.`

    console.log('[Gemini] Sending request to gemini-2.5-flash-image...')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT']
          }
        })
      }
    )

    console.log(`[Gemini] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Gemini] API error:', errorText)

      // Try to parse as JSON for better error message
      try {
        const errorData = JSON.parse(errorText)
        return { success: false, error: errorData.error?.message || `API request failed (${response.status})` }
      } catch {
        return { success: false, error: `API request failed (${response.status})` }
      }
    }

    const data = await response.json()
    console.log('[Gemini] Response received, parsing...')

    // Extract the generated image from the response
    const parts = data.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png'
        const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`
        console.log(`[Gemini] Successfully generated image (${mimeType})`)
        return { success: true, imageUrl }
      }
      if (part.text) {
        console.log('[Gemini] Text response:', part.text)
      }
    }

    // Log full response if no image found
    console.error('[Gemini] No image in response:', JSON.stringify(data, null, 2))
    return { success: false, error: 'No image generated - check console for details' }

  } catch (error) {
    console.error('[Gemini] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper to describe a color from hex for better prompts
function getColorDescription(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const lightness = (r + g + b) / 3
  const lightnessDesc = lightness > 220 ? 'very light, almost white' :
                        lightness > 180 ? 'light' :
                        lightness > 120 ? 'medium' :
                        lightness > 60 ? 'medium-dark' : 'dark'

  // Check for neutrals first
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))
  if (maxDiff < 30) {
    if (lightness > 240) return 'bright white'
    if (lightness > 200) return 'off-white, creamy'
    if (lightness > 150) return 'light gray'
    if (lightness > 100) return 'medium gray'
    return 'dark gray, charcoal'
  }

  // Determine hue
  if (r >= g && r >= b) {
    if (g > b + 30) return `${lightnessDesc} warm yellow-orange`
    if (g > b) return `${lightnessDesc} warm peachy-orange`
    if (b > g) return `${lightnessDesc} pink or mauve`
    return `${lightnessDesc} red`
  } else if (g >= r && g >= b) {
    if (r > b) return `${lightnessDesc} yellow-green, warm`
    if (b > r) return `${lightnessDesc} teal or seafoam`
    return `${lightnessDesc} green`
  } else {
    if (r > g) return `${lightnessDesc} purple or violet`
    if (g > r) return `${lightnessDesc} cyan or aqua`
    return `${lightnessDesc} blue`
  }
}

// Cache for generated visualizations to avoid re-generating
const visualizationCache = new Map<string, string>()

export function getCacheKey(roomImageBase64: string, colorId: string): string {
  const imageHash = roomImageBase64.slice(-100)
  return `${imageHash}-${colorId}`
}

export function getCachedVisualization(key: string): string | undefined {
  return visualizationCache.get(key)
}

export function cacheVisualization(key: string, imageUrl: string): void {
  visualizationCache.set(key, imageUrl)
}
