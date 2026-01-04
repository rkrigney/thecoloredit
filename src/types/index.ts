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
  undertone: Undertone
  stability: number
  depthCategory: 'light' | 'mid' | 'dark'
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
  roomType: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hallway' | 'office' | 'nursery'
  lighting: {
    direction: 'north' | 'south' | 'east' | 'west' | 'unknown'
    primaryUsage: 'day' | 'night' | 'both'
    bulbTemp: 'warm' | 'neutral' | 'cool' | 'unknown'
  }
  fixedElements: string[]
  vibe: {
    cozyToCrisp: number
    calmToMoody: number
  }
  undertoneFears: string[]
  brandPreferences: string[]
  depthPreference: 'light' | 'mid' | 'dark' | 'any'
}

export interface ScoredColor {
  color: PaintColor
  tag: 'safe_win' | 'vibe_match' | 'wildcard'
  scores: {
    overall: number
    vibeMatch: number
    lightingTolerance: number
    undertoneSafety: number
    depthMatch: number
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
