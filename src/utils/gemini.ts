// Room visualization using serverless backend
// API key is securely stored on Cloudflare Workers - never exposed to browser

const API_ENDPOINT = 'https://color-edit-api.rkrigney.workers.dev'

interface GenerateImageResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

export async function generateRoomVisualization(
  roomImageBase64: string,
  paintColor: { name: string; hex: string }
): Promise<GenerateImageResponse> {
  try {
    console.log(`[Visualization] Requesting ${paintColor.name} (${paintColor.hex})`)

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomImageBase64,
        paintColor,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Visualization] API error:', data)
      return { success: false, error: data.error || `Request failed (${response.status})` }
    }

    if (data.success && data.imageUrl) {
      console.log('[Visualization] Successfully generated image')
      return { success: true, imageUrl: data.imageUrl }
    }

    return { success: false, error: data.error || 'No image generated' }
  } catch (error) {
    console.error('[Visualization] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
