import { PaintColor, UserRoomProfile, ScoredColor } from '../types'
import { paintColors, trimColors } from '../data/colors'

// Compute vibe match score
function computeVibeMatch(color: PaintColor, vibe: { cozyToCrisp: number; calmToMoody: number }): number {
  const { lab, lrv } = color
  const chroma = Math.sqrt(lab.a ** 2 + lab.b ** 2)
  const warmth = lab.a * 0.6 + lab.b * 0.4

  // Temperature match
  let tempMatch: number
  if (vibe.cozyToCrisp < 50) {
    tempMatch = (warmth + 10) / 20
  } else {
    tempMatch = (-warmth + 10) / 20
  }
  tempMatch = Math.max(0, Math.min(1, tempMatch))

  // Mood match
  let moodMatch: number
  if (vibe.calmToMoody < 50) {
    moodMatch = (1 - chroma / 30) * 0.5 + (lrv / 100) * 0.5
  } else {
    moodMatch = (chroma / 30) * 0.3 + (1 - lrv / 100) * 0.7
  }
  moodMatch = Math.max(0, Math.min(1, moodMatch))

  return (tempMatch + moodMatch) / 2
}

// Compute lighting tolerance score
function computeLightingTolerance(
  color: PaintColor,
  lighting: UserRoomProfile['lighting']
): number {
  const { stability } = color

  const uncertaintyFactors = [
    lighting.direction === 'unknown',
    lighting.bulbTemp === 'unknown',
    lighting.primaryUsage === 'both'
  ]
  const uncertainty = uncertaintyFactors.filter(Boolean).length / 3

  const baseTolerance = stability
  const uncertaintyPenalty = uncertainty * (1 - stability) * 0.3

  return Math.max(0.3, baseTolerance - uncertaintyPenalty)
}

// Compute undertone safety score
function computeUndertoneSafety(
  undertone: PaintColor['undertone'],
  fears: string[]
): number {
  const fearMapping: Record<string, string> = {
    fear_green: 'green',
    fear_pink: 'pink',
    fear_purple: 'purple',
    fear_babyblue: 'blue',
    fear_dingy: 'neutral',
    fear_yellow: 'yellow'
  }

  if (fears.length === 0) return 1.0

  let penalty = 0
  for (const fear of fears) {
    const fearedUndertone = fearMapping[fear]
    if (fearedUndertone === undertone.leansPrimary) {
      penalty += 0.5
    } else if (fearedUndertone === undertone.leansSecondary) {
      penalty += 0.25
    }
  }

  return Math.max(0.2, 1.0 - penalty)
}

// Compute depth match score
function computeDepthMatch(
  colorDepth: 'light' | 'mid' | 'dark',
  preference: 'light' | 'mid' | 'dark' | 'any'
): number {
  if (preference === 'any') return 0.8
  if (colorDepth === preference) return 1.0

  const adjacent: Record<string, number> = {
    'light-mid': 0.6,
    'mid-light': 0.6,
    'mid-dark': 0.6,
    'dark-mid': 0.6,
    'light-dark': 0.3,
    'dark-light': 0.3
  }

  return adjacent[`${colorDepth}-${preference}`] ?? 0.5
}

// Filter by brand preferences
function filterByBrand(colors: PaintColor[], preferences: string[]): PaintColor[] {
  if (preferences.length === 0 || preferences.includes('any')) {
    return colors
  }
  return colors.filter(c => preferences.includes(c.brandId))
}

// Generate reasoning text
function generateReasoning(
  color: PaintColor,
  profile: UserRoomProfile,
  scores: ScoredColor['scores']
): string {
  const reasons: string[] = []

  // Vibe reasoning
  if (scores.vibeMatch > 0.8) {
    if (profile.vibe.cozyToCrisp < 40) {
      reasons.push('warm, cozy feel')
    } else if (profile.vibe.cozyToCrisp > 60) {
      reasons.push('crisp, clean aesthetic')
    }
  }

  // Undertone safety
  if (profile.undertoneFears.length > 0 && scores.undertoneSafety > 0.8) {
    reasons.push('avoids the undertones you flagged')
  }

  // Fixed elements
  if (profile.fixedElements.includes('wood_warm') && color.undertone.temperature === 'warm') {
    reasons.push('complements your warm wood')
  }
  if (profile.fixedElements.includes('hardware_brass') && color.undertone.temperature === 'warm') {
    reasons.push('pairs well with brass')
  }
  if (profile.fixedElements.includes('hardware_chrome') && color.undertone.temperature !== 'warm') {
    reasons.push('works with chrome hardware')
  }

  // Stability
  if (scores.lightingTolerance > 0.85) {
    reasons.push('stable in varying light')
  }

  if (reasons.length === 0) {
    reasons.push('balanced undertones and good versatility')
  }

  return reasons.slice(0, 2).join(', ').replace(/^./, s => s.toUpperCase()) + '.'
}

// Recommend trim colors
function recommendTrim(
  wallColor: PaintColor,
  _vibe: { cozyToCrisp: number }
): { crisp: PaintColor | null; warm: PaintColor | null } {
  const wallUndertone = wallColor.undertone

  const warmWhites = trimColors.filter(t =>
    t.undertone.temperature === 'warm' &&
    t.undertone.leansPrimary !== wallUndertone.leansPrimary
  )

  const crispWhites = trimColors.filter(t =>
    (t.undertone.temperature === 'cool' || t.undertone.temperature === 'neutral') &&
    t.undertone.leansPrimary !== wallUndertone.leansPrimary
  )

  const warmOption = warmWhites.sort((a, b) => b.popularity - a.popularity)[0] || null
  const crispOption = crispWhites.sort((a, b) => b.popularity - a.popularity)[0] || null

  return { crisp: crispOption, warm: warmOption }
}

// Recommend finish
function recommendFinish(roomType: string): string {
  const finishMap: Record<string, string> = {
    bathroom: 'Satin',
    kitchen: 'Eggshell',
    hallway: 'Eggshell',
    nursery: 'Eggshell',
    living: 'Eggshell',
    bedroom: 'Matte',
    office: 'Eggshell',
    exterior: 'Satin'
  }
  return finishMap[roomType] || 'Eggshell'
}

// Main scoring function
function computeOverallScore(
  color: PaintColor,
  profile: UserRoomProfile
): ScoredColor['scores'] {
  const weights = {
    vibe: 0.25,
    lighting: 0.20,
    undertone: 0.20,
    depth: 0.10,
    trend: 0.25
  }

  const vibeMatch = computeVibeMatch(color, profile.vibe)
  const lightingTolerance = computeLightingTolerance(color, profile.lighting)
  const undertoneSafety = computeUndertoneSafety(color.undertone, profile.undertoneFears)
  const depthMatch = computeDepthMatch(color.depthCategory, profile.depthPreference)

  const overall =
    weights.vibe * vibeMatch +
    weights.lighting * lightingTolerance +
    weights.undertone * undertoneSafety +
    weights.depth * depthMatch +
    weights.trend * color.popularity

  return {
    overall: Math.round(overall * 100),
    vibeMatch,
    lightingTolerance,
    undertoneSafety,
    depthMatch
  }
}

// Build the shortlist
export function buildShortlist(profile: UserRoomProfile): ScoredColor[] {
  // Filter by brand and depth preferences
  let candidates = filterByBrand(paintColors, profile.brandPreferences)

  // Filter by depth if specified
  if (profile.depthPreference !== 'any') {
    const depthCandidates = candidates.filter(c => c.depthCategory === profile.depthPreference)
    if (depthCandidates.length >= 10) {
      candidates = depthCandidates
    }
  }

  // Exclude trim-only colors
  candidates = candidates.filter(c => !c.tags.includes('trim') || c.tags.length > 1)

  // Score all candidates
  const scored = candidates.map(color => ({
    color,
    scores: computeOverallScore(color, profile)
  }))

  // Sort by overall score
  scored.sort((a, b) => b.scores.overall - a.scores.overall)

  const shortlist: ScoredColor[] = []
  const usedIds = new Set<string>()

  // Pick 2 Safe Wins (high stability + undertone safety)
  const safeCandidates = scored.filter(
    s =>
      s.scores.lightingTolerance >= 0.75 &&
      s.scores.undertoneSafety >= 0.8 &&
      !usedIds.has(s.color.id)
  )

  for (const candidate of safeCandidates.slice(0, 2)) {
    const trim = recommendTrim(candidate.color, profile.vibe)
    shortlist.push({
      ...candidate,
      tag: 'safe_win',
      reasoning: generateReasoning(candidate.color, profile, candidate.scores),
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
  }

  // Pick 2 Vibe Matches (highest vibe match)
  const vibeCandidates = scored
    .filter(s => !usedIds.has(s.color.id))
    .sort((a, b) => b.scores.vibeMatch - a.scores.vibeMatch)

  for (const candidate of vibeCandidates.slice(0, 2)) {
    const trim = recommendTrim(candidate.color, profile.vibe)
    shortlist.push({
      ...candidate,
      tag: 'vibe_match',
      reasoning: generateReasoning(candidate.color, profile, candidate.scores),
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
  }

  // Pick 1 Wildcard (high vibe, slightly lower safety)
  const wildcardCandidates = scored.filter(
    s =>
      !usedIds.has(s.color.id) &&
      s.scores.vibeMatch >= 0.6 &&
      s.scores.undertoneSafety >= 0.5
  )

  if (wildcardCandidates.length > 0) {
    const candidate = wildcardCandidates[0]
    const trim = recommendTrim(candidate.color, profile.vibe)
    shortlist.push({
      ...candidate,
      tag: 'wildcard',
      reasoning: 'A bit bolder — adds personality while staying within your comfort zone.',
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
  }

  return shortlist.slice(0, 5)
}

// Generate sampling plan
export function generateSamplingPlan(
  colors: ScoredColor[],
  profile: UserRoomProfile
): {
  placements: string[]
  timesToCheck: string[]
  alternates: Array<{ ifLooksToo: string; tryInstead: string[] }>
} {
  const placements = [
    'Near the door frame or trim',
    'In the darkest corner of the room',
    'On the main wall at eye level'
  ]

  const timesToCheck = [
    'Morning with natural light',
    'Afternoon at peak brightness',
    `Evening with your ${profile.lighting.bulbTemp === 'warm' ? 'warm' : 'regular'} bulbs on`
  ]

  // Generate alternates based on undertone fears
  const alternates: Array<{ ifLooksToo: string; tryInstead: string[] }> = []

  if (profile.undertoneFears.includes('fear_pink')) {
    const alternatives = colors
      .filter(c => c.color.undertone.leansPrimary !== 'pink')
      .slice(0, 2)
      .map(c => c.color.name)
    if (alternatives.length > 0) {
      alternates.push({ ifLooksToo: 'pink', tryInstead: alternatives })
    }
  }

  if (profile.undertoneFears.includes('fear_green')) {
    const alternatives = colors
      .filter(c => c.color.undertone.leansPrimary !== 'green')
      .slice(0, 2)
      .map(c => c.color.name)
    if (alternatives.length > 0) {
      alternates.push({ ifLooksToo: 'green', tryInstead: alternatives })
    }
  }

  if (profile.undertoneFears.includes('fear_yellow')) {
    const alternatives = colors
      .filter(c => c.color.undertone.leansPrimary !== 'yellow')
      .slice(0, 2)
      .map(c => c.color.name)
    if (alternatives.length > 0) {
      alternates.push({ ifLooksToo: 'yellow', tryInstead: alternatives })
    }
  }

  return { placements, timesToCheck, alternates }
}

// Recommend product line based on room and priorities
export function recommendProductLine(
  brand: string,
  surface: string,
  priorities: string[],
  noRegretsMode: boolean
): { tier: string; name: string; why: string } {
  const isHighTraffic =
    priorities.includes('wipe_clean') ||
    priorities.includes('scuff_resistance') ||
    noRegretsMode

  const productLines: Record<string, Record<string, { better: { name: string; why: string }; best: { name: string; why: string } }>> = {
    bm: {
      walls: {
        better: { name: 'Regal Select', why: 'Great coverage and washability for most rooms' },
        best: { name: 'Aura', why: 'Premium durability and color richness' }
      },
      trim: {
        better: { name: 'Advance', why: 'Smooth, hard finish for trim and doors' },
        best: { name: 'Advance', why: 'Smooth, hard finish for trim and doors' }
      },
      cabinets: {
        better: { name: 'Advance', why: 'Self-leveling for smooth cabinet finish' },
        best: { name: 'Advance', why: 'Self-leveling for smooth cabinet finish' }
      }
    },
    sw: {
      walls: {
        better: { name: 'Duration Home', why: 'Excellent washability for active homes' },
        best: { name: 'Emerald Interior', why: 'Best-in-class durability and coverage' }
      },
      trim: {
        better: { name: 'ProClassic', why: 'Hard, durable finish for trim' },
        best: { name: 'Emerald Urethane', why: 'Maximum hardness and flow' }
      },
      cabinets: {
        better: { name: 'ProClassic', why: 'Smooth application for cabinets' },
        best: { name: 'Emerald Urethane', why: 'Professional-grade cabinet finish' }
      }
    },
    behr: {
      walls: {
        better: { name: 'Ultra', why: 'Good coverage and durability' },
        best: { name: 'Dynasty', why: 'One-coat coverage with scuff defense' }
      },
      trim: {
        better: { name: 'Ultra', why: 'Durable finish for trim' },
        best: { name: 'Dynasty', why: 'Premium hardness for trim' }
      },
      cabinets: {
        better: { name: 'Cabinet & Trim Enamel', why: 'Designed for cabinet durability' },
        best: { name: 'Cabinet & Trim Enamel', why: 'Designed for cabinet durability' }
      }
    }
  }

  const surfaceType = surface === 'doors' || surface === 'trim' ? 'trim' : surface === 'cabinets' ? 'cabinets' : 'walls'
  const brandLines = productLines[brand] || productLines.sw
  const surfaceLines = brandLines[surfaceType] || brandLines.walls

  if (isHighTraffic) {
    return { tier: 'Best', ...surfaceLines.best }
  }

  return { tier: 'Better', ...surfaceLines.better }
}

// Determine if primer is needed
export function getPrimerRecommendation(
  condition: string
): { needed: boolean; type: string | null; why: string } {
  const primerRules: Record<string, { needed: boolean; type: string | null; why: string }> = {
    new_drywall: { needed: true, type: 'Drywall primer', why: 'Seals porous new drywall for even coverage' },
    painted_good: { needed: false, type: null, why: 'Existing paint provides a good base' },
    painted_rough: { needed: true, type: 'Bonding primer', why: 'Helps new paint adhere to rough surfaces' },
    glossy: { needed: true, type: 'Bonding primer', why: 'Creates tooth for paint adhesion on slick surfaces' },
    stained_wood: { needed: true, type: 'Stain-blocking primer', why: 'Prevents wood tannins from bleeding through' },
    cabinet_slick: { needed: true, type: 'Bonding primer', why: 'Essential for adhesion on factory finishes' },
    masonry: { needed: true, type: 'Masonry primer', why: 'Seals alkaline surfaces and improves adhesion' }
  }

  return primerRules[condition] || { needed: false, type: null, why: 'Standard surface preparation' }
}

// Estimate quantity needed
export function estimateQuantity(
  roomSize: 'small' | 'medium' | 'large' | 'very_large',
  ceilingHeight: number,
  surface: string
): { gallons: number; coats: number; note: string } {
  const sqftBySize: Record<string, number> = {
    small: 200,
    medium: 400,
    large: 600,
    very_large: 900
  }

  const heightMultiplier = ceilingHeight / 8
  const baseSqft = sqftBySize[roomSize] * heightMultiplier
  const coveragePerGallon = 375
  const coats = 2
  const buffer = 1.1

  let totalCoverage = baseSqft * coats * buffer

  // Adjust for surface type
  if (surface === 'trim' || surface === 'doors') {
    totalCoverage = baseSqft * 0.15 * coats * buffer
  } else if (surface === 'ceiling') {
    totalCoverage = baseSqft * 0.8 * coats * buffer
  }

  const gallons = Math.ceil(totalCoverage / coveragePerGallon)

  return {
    gallons,
    coats,
    note: 'Includes 10% buffer for touch-ups'
  }
}
