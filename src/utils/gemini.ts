// Room visualization using Google's Imagen 4.0 API
// Generates room images with specified paint colors

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

interface GenerateImageResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

// First, use Gemini to analyze the room and create a description
async function analyzeRoomImage(roomImageBase64: string): Promise<string> {
  const base64Data = roomImageBase64.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this room image and provide a brief description (2-3 sentences) of the room type, style, key furniture, and notable features. Focus on elements that would remain if the walls were repainted. Be specific about furniture placement and room characteristics.`
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }]
      })
    }
  )

  if (!response.ok) {
    console.error('[Gemini] Room analysis failed:', response.status)
    return 'A modern room with furniture and natural lighting'
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'A modern room with furniture and natural lighting'
  console.log('[Gemini] Room analysis:', text)
  return text
}

export async function generateRoomVisualization(
  roomImageBase64: string,
  paintColor: { name: string; hex: string }
): Promise<GenerateImageResponse> {
  if (!GEMINI_API_KEY) {
    console.warn('[Imagen] API key not configured - check VITE_GEMINI_API_KEY in .env')
    return { success: false, error: 'API key not configured' }
  }

  try {
    console.log(`[Imagen] Preparing visualization for ${paintColor.name} (${paintColor.hex})`)

    // Step 1: Analyze the room to get a description
    console.log('[Imagen] Analyzing room image...')
    const roomDescription = await analyzeRoomImage(roomImageBase64)

    // Step 2: Generate a new image with Imagen 4.0
    const prompt = `Professional interior design photograph of ${roomDescription}. The walls are freshly painted in ${paintColor.name} (a ${getColorDescription(paintColor.hex)} color, hex ${paintColor.hex}). Photorealistic, high quality interior photography, natural lighting, magazine quality. The wall color is prominently visible and accurately represents ${paintColor.name}.`

    console.log('[Imagen] Generation prompt:', prompt)
    console.log('[Imagen] Sending request to Imagen 4.0...')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '4:3',
            safetyFilterLevel: 'block_few',
            personGeneration: 'dont_allow'
          }
        })
      }
    )

    console.log(`[Imagen] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Imagen] API error:', JSON.stringify(errorData, null, 2))

      // Try fallback to gemini-2.0-flash-preview-image-generation
      console.log('[Imagen] Trying fallback model...')
      return await generateWithGeminiFlash(roomImageBase64, paintColor)
    }

    const data = await response.json()
    console.log('[Imagen] Response received')

    // Imagen returns predictions array with bytesBase64Encoded
    const imageData = data.predictions?.[0]?.bytesBase64Encoded
    if (imageData) {
      const imageUrl = `data:image/png;base64,${imageData}`
      console.log('[Imagen] Successfully generated image')
      return { success: true, imageUrl }
    }

    console.error('[Imagen] No image in response:', JSON.stringify(data, null, 2))

    // Fallback to Gemini Flash
    return await generateWithGeminiFlash(roomImageBase64, paintColor)

  } catch (error) {
    console.error('[Imagen] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Fallback: Use Gemini 2.0 Flash for image generation
async function generateWithGeminiFlash(
  roomImageBase64: string,
  paintColor: { name: string; hex: string }
): Promise<GenerateImageResponse> {
  console.log('[Gemini Flash] Trying image generation fallback...')

  const base64Data = roomImageBase64.replace(/^data:image\/\w+;base64,/, '')

  const prompt = `Edit this room image: repaint the walls to ${paintColor.name} (${paintColor.hex}). Keep all furniture and fixtures exactly the same. Only change the wall color. Output a photorealistic image.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
          ]
        }],
        generationConfig: {
          responseModalities: ['image', 'text']
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    console.error('[Gemini Flash] Error:', errorData)
    return { success: false, error: errorData.error?.message || 'Fallback failed' }
  }

  const data = await response.json()
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data: string } }) => part.inlineData
  )

  if (imagePart?.inlineData?.data) {
    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    console.log('[Gemini Flash] Successfully generated image')
    return { success: true, imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}` }
  }

  return { success: false, error: 'No image generated from any model' }
}

// Helper to describe a color from hex
function getColorDescription(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Determine lightness
  const lightness = (r + g + b) / 3
  const lightnessDesc = lightness > 200 ? 'very light' : lightness > 150 ? 'light' : lightness > 100 ? 'medium' : 'dark'

  // Determine dominant hue
  if (r > g && r > b) {
    return g > b ? `${lightnessDesc} warm orange-red` : `${lightnessDesc} red`
  } else if (g > r && g > b) {
    return r > b ? `${lightnessDesc} yellow-green` : `${lightnessDesc} green`
  } else if (b > r && b > g) {
    return r > g ? `${lightnessDesc} purple-blue` : `${lightnessDesc} blue`
  } else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
    return lightness > 200 ? 'off-white' : lightness > 150 ? 'light gray' : 'neutral gray'
  }

  return `${lightnessDesc} neutral`
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
