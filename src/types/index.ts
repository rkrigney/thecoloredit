export interface Lab {
  l: number
  a: number
  b: number
}

export interface Undertone {
  temperature: 'warm' | 'cool' | 'neutral'
  leansPrimary: 'green' | 'blue' | 'purple' | 'pink' | 'yellow' | 'orange' | 'neutral'
  leansSecondary?: 'green' | 'blue' | 'purple' | 'pink' | 'yellow' | 'orange' | 'neutral' | null
}

export interface PaintColor {
  id: string
  brand: string
  brandId: string
  line?: string
  name: string
  code: string
  hex: string
  rgb: { r: number; g: number; b: number }
  lab: Lab
  lrv: number
  chroma: number // Color saturation/intensity for boldness scoring
  undertone: Undertone
  stability: number
  depthCategory: 'light' | 'mid' | 'dark' | 'very_deep'
  popularity: number
  tags: string[]
  description: string
  bestIn: string
  watchOut: string
  suggestedTrims: string[]
  suggestedFinishes: ('flat' | 'matte' | 'eggshell' | 'satin' | 'semigloss' | 'gloss')[]
  similarColors: Array<{ colorId: string; relationship: string }>
}

export interface UserRoomProfile {
  roomType?: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hallway' | 'office' | 'kids' | 'dining' | 'other' | 'skip'
  lightLevel: number // 0-100 slider (none to lots)
  lightDirection: 'east' | 'west' | 'south' | 'north' | 'unknown'
  bulbFeel: 'warm' | 'neutral' | 'bright_white' | 'unknown'
  fixedElements: 'warm' | 'cool' | 'mixed'
  vibe: 'cozy_warm' | 'clean_crisp' | 'calm_muted' | 'moody_dramatic'
  boldness: 'timeless' | 'a_little_color' | 'statement'
  avoidList: Array<'green' | 'purple' | 'yellow_creamy' | 'too_dark' | 'too_cold'>
}

export interface ScoredColor {
  color: PaintColor
  tag: 'top_pick' | 'safe_bet' | 'bold_choice'
  scores: {
    overall: number
    boldness: number    // 35 points max
    vibe: number        // 25 points max
    lighting: number    // 20 points max
    harmony: number     // 20 points max
  }
  reasoning: string
  suggestedTrim: {
    crisp: PaintColor | null
    warm: PaintColor | null
  }
  suggestedFinish: string
}

export interface ProductSpec {
  surface: string
  room: string
  condition: string
  priorities: string[]
  sheen: string
  brand: string
  noRegretsMode: boolean
}

export interface ShoppingListItem {
  id: string
  roomName: string
  surface: string
  color: PaintColor
  productLine: string
  sheen: string
  base: string
  quantity: { gallons: number; coats: number }
  primer: { needed: boolean; type: string | null; gallons: number }
  productSpec?: ProductSpec
}

export interface Store {
  id: string
  name: string
  brandAffiliation: string[]
  storeType: 'brand_store' | 'big_box' | 'hardware' | 'independent'
  distance: number
  address: string
  city: string
  state: string
  phone: string
  hours: string
  isOpen: boolean
  isFavorite: boolean
}
