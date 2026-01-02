// Gemini API integration for room visualization
// Uses Imagen 3 via the Gemini API to recolor walls in uploaded room images

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

    console.log(`[Gemini] Preparing request for ${paintColor.name}`)
    console.log(`[Gemini] Image data length: ${base64Data.length} chars`)

    const prompt = `Edit this room image to change the wall color to ${paintColor.name} (hex: ${paintColor.hex}).
Keep all furniture, fixtures, decor, and other elements exactly the same.
Only change the paint color on the walls to the specified color.
Maintain the same lighting, shadows, and reflections but adjusted for the new wall color.
The result should look like a realistic photograph of the same room with freshly painted walls in ${paintColor.name}.`

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['image', 'text']
      }
    }

    console.log('[Gemini] Sending request to API...')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    console.log(`[Gemini] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Gemini] API error response:', JSON.stringify(errorData, null, 2))
      return { success: false, error: errorData.error?.message || `API request failed (${response.status})` }
    }

    const data = await response.json()
    console.log('[Gemini] Response received, parsing...')

    // Extract the generated image from the response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: { inlineData?: { data: string; mimeType?: string } }) => part.inlineData
    )

    if (imagePart?.inlineData?.data) {
      const mimeType = imagePart.inlineData.mimeType || 'image/png'
      const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`
      console.log(`[Gemini] Successfully generated image (${mimeType})`)
      return { success: true, imageUrl }
    }

    // Log the response structure if no image found
    console.error('[Gemini] No image in response. Response structure:', JSON.stringify(data, null, 2))

    // Check if there's text content explaining why
    const textPart = data.candidates?.[0]?.content?.parts?.find(
      (part: { text?: string }) => part.text
    )
    if (textPart?.text) {
      console.log('[Gemini] Text response:', textPart.text)
    }

    return { success: false, error: 'No image generated - model may not support image output' }
  } catch (error) {
    console.error('[Gemini] Error generating room visualization:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Cache for generated visualizations to avoid re-generating
const visualizationCache = new Map<string, string>()

export function getCacheKey(roomImageBase64: string, colorId: string): string {
  // Use a hash of the image + color ID as cache key
  const imageHash = roomImageBase64.slice(-100) // Use last 100 chars as simple hash
  return `${imageHash}-${colorId}`
}

export function getCachedVisualization(key: string): string | undefined {
  return visualizationCache.get(key)
}

export function cacheVisualization(key: string, imageUrl: string): void {
  visualizationCache.set(key, imageUrl)
}
