import { PaintColor, UserRoomProfile, ScoredColor } from '../types'
import { paintColors, trimColors } from '../data/colors'

/**
 * The Color Edit Weighted Algorithm
 *
 * This system sums up to 100 Points:
 * - Boldness (Chroma): 35 points
 * - Vibe (Depth & Temp): 25 points
 * - Lighting (LRV): 20 points
 * - Harmony (Direction): 20 points
 * - Avoid List: Kill switch (0%)
 */

// Check if color should be killed by avoid list
function isKilledByAvoidList(
  color: PaintColor,
  avoidList: UserRoomProfile['avoidList']
): { killed: boolean; reason: string } {
  const tags = color.tags.join(' ').toLowerCase()
  const watchOut = color.watchOut.toLowerCase()
  const undertone = color.undertone

  for (const avoid of avoidList) {
    switch (avoid) {
      case 'green':
        if (
          undertone.leansPrimary === 'green' ||
          undertone.leansSecondary === 'green' ||
          watchOut.includes('green') ||
          tags.includes('green')
        ) {
          return { killed: true, reason: 'Has green undertones you wanted to avoid' }
        }
        break

      case 'purple':
        if (
          undertone.leansPrimary === 'purple' ||
          undertone.leansSecondary === 'purple' ||
          watchOut.includes('purple') ||
          tags.includes('purple')
        ) {
          return { killed: true, reason: 'Has purple undertones you wanted to avoid' }
        }
        break

      case 'yellow_creamy':
        if (
          undertone.leansPrimary === 'yellow' ||
          watchOut.includes('yellow') ||
          watchOut.includes('creamy') ||
          watchOut.includes('cream')
        ) {
          return { killed: true, reason: 'Has yellow/creamy undertones you wanted to avoid' }
        }
        break

      case 'too_dark':
        if (color.lrv < 25) {
          return { killed: true, reason: 'Too dark for your preference' }
        }
        break

      case 'too_cold':
        if (
          undertone.temperature === 'cool' &&
          (undertone.leansPrimary === 'blue' || tags.includes('icy'))
        ) {
          return { killed: true, reason: 'Too cold/icy for your preference' }
        }
        break
    }
  }

  return { killed: false, reason: '' }
}

// Score boldness (35 points max)
function scoreBoldness(
  color: PaintColor,
  boldness: UserRoomProfile['boldness']
): number {
  const chroma = color.chroma

  switch (boldness) {
    case 'timeless':
      // Want low saturation colors
      if (chroma < 12) return 35       // Perfect match
      if (chroma < 18) return 15       // Okay, but maybe too colorful
      return 0                         // Too bold

    case 'a_little_color':
      // Want moderate saturation
      if (chroma >= 12 && chroma <= 30) return 35
      if (chroma < 12) return 10       // Too boring?
      return 10                        // Too bold?

    case 'statement':
      // Want high saturation
      if (chroma > 30) return 35
      if (chroma > 20) return 20
      return 0                         // Too boring

    default:
      return 17 // Middle ground
  }
}

// Score vibe (25 points max)
function scoreVibe(
  color: PaintColor,
  vibe: UserRoomProfile['vibe']
): number {
  const depth = color.depthCategory
  const temp = color.undertone.temperature
  let score = 0

  switch (vibe) {
    case 'moody_dramatic':
      if (depth === 'very_deep' || depth === 'dark') score += 25
      else if (depth === 'mid') score += 10
      break

    case 'clean_crisp':
      if (depth === 'light') score += 20
      if (temp === 'cool') score += 5 // Bonus for crisp cool tones
      break

    case 'cozy_warm':
      if (temp === 'warm') score += 25
      else if (temp === 'neutral') score += 15
      break

    case 'calm_muted':
      // Low chroma + mid-light depth
      if (color.chroma < 15 && (depth === 'light' || depth === 'mid')) score += 25
      else if (color.chroma < 20) score += 15
      break

    default:
      score = 12
  }

  return Math.min(25, score)
}

// Score lighting safety (20 points max)
function scoreLighting(
  color: PaintColor,
  lightLevel: number,
  vibe: UserRoomProfile['vibe']
): number {
  const lrv = color.lrv

  // Convert slider (0-100) to low/medium/high
  const isLowLight = lightLevel < 35
  const isHighLight = lightLevel > 65

  if (isLowLight) {
    // In low light, high LRV is safe. Low LRV is risky unless moody
    if (vibe === 'moody_dramatic') {
      return 20 // They want dark in dark, that's fine
    }

    if (lrv > 50) return 20
    if (lrv > 30) return 10
    return 0 // Too dark for this room
  }

  if (isHighLight) {
    // Lots of light? Anything goes, but very light colors might wash out
    if (lrv > 75) return 15 // Might look too washed out
    return 20
  }

  // Medium light - balanced
  return 18
}

// Score harmony/direction (20 points max)
function scoreHarmony(
  color: PaintColor,
  direction: UserRoomProfile['lightDirection'],
  fixedElements: UserRoomProfile['fixedElements']
): number {
  const temp = color.undertone.temperature
  let score = 0

  // Direction-based scoring
  switch (direction) {
    case 'north':
      // North light is cool - warm colors help balance
      if (temp === 'warm') score += 12
      else if (temp === 'neutral') score += 8
      else score += 2 // Cool might feel icy
      break

    case 'south':
      // South light is warm - cool/neutral colors balance
      if (temp === 'cool' || temp === 'neutral') score += 12
      else score += 8 // Warm is fine, just more intense
      break

    case 'east':
      // Morning light is cooler - warm colors work
      if (temp === 'warm') score += 10
      else score += 8
      break

    case 'west':
      // Afternoon light is warm - any temp works
      score += 10
      break

    default:
      score += 8
  }

  // Fixed elements harmony
  switch (fixedElements) {
    case 'warm':
      if (temp === 'warm') score += 8
      else if (temp === 'neutral') score += 5
      else score += 2
      break

    case 'cool':
      if (temp === 'cool') score += 8
      else if (temp === 'neutral') score += 5
      else score += 2
      break

    case 'mixed':
      if (temp === 'neutral') score += 8
      else score += 5
      break
  }

  return Math.min(20, score)
}

// Main scoring function
function computeOverallScore(
  color: PaintColor,
  profile: UserRoomProfile
): ScoredColor['scores'] {
  const boldnessScore = scoreBoldness(color, profile.boldness)
  const vibeScore = scoreVibe(color, profile.vibe)
  const lightingScore = scoreLighting(color, profile.lightLevel, profile.vibe)
  const harmonyScore = scoreHarmony(color, profile.lightDirection, profile.fixedElements)

  const overall = boldnessScore + vibeScore + lightingScore + harmonyScore

  return {
    overall,
    boldness: boldnessScore,
    vibe: vibeScore,
    lighting: lightingScore,
    harmony: harmonyScore
  }
}

// Generate reasoning text based on scores
function generateReasoning(
  color: PaintColor,
  profile: UserRoomProfile,
  scores: ScoredColor['scores']
): string {
  const parts: string[] = []

  // Boldness reasoning
  if (scores.boldness >= 30) {
    if (profile.boldness === 'timeless') {
      parts.push('perfectly timeless')
    } else if (profile.boldness === 'statement') {
      parts.push('makes a bold statement')
    } else {
      parts.push('just the right amount of color')
    }
  }

  // Vibe reasoning
  if (scores.vibe >= 20) {
    const vibeNames: Record<string, string> = {
      cozy_warm: 'cozy, warm feel',
      clean_crisp: 'clean, crisp aesthetic',
      calm_muted: 'calm, relaxed vibe',
      moody_dramatic: 'moody depth'
    }
    parts.push(vibeNames[profile.vibe] || 'great vibe match')
  }

  // Harmony reasoning
  if (scores.harmony >= 15) {
    if (profile.lightDirection === 'north' && color.undertone.temperature === 'warm') {
      parts.push('balances your north-facing light')
    } else if (profile.fixedElements === 'warm' && color.undertone.temperature === 'warm') {
      parts.push('harmonizes with your warm elements')
    } else if (profile.fixedElements === 'cool' && color.undertone.temperature === 'cool') {
      parts.push('complements your cool finishes')
    }
  }

  // Lighting reasoning
  if (scores.lighting >= 18) {
    parts.push('works great with your light')
  }

  if (parts.length === 0) {
    parts.push('versatile and well-balanced')
  }

  // Format as sentence
  const reasonText = parts.slice(0, 2).join(' and ')
  return `${scores.overall}% Match — ${reasonText.charAt(0).toUpperCase() + reasonText.slice(1)}.`
}

// Recommend trim colors
function recommendTrim(
  wallColor: PaintColor
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

  const warmOption = warmWhites.sort((a, b) => b.popularity - a.popularity)[0] || trimColors[0] || null
  const crispOption = crispWhites.sort((a, b) => b.popularity - a.popularity)[0] || trimColors[0] || null

  return { crisp: crispOption, warm: warmOption }
}

// Recommend finish based on room type
function recommendFinish(roomType?: UserRoomProfile['roomType']): string {
  const finishMap: Record<string, string> = {
    bathroom: 'Satin',
    kitchen: 'Eggshell',
    hallway: 'Eggshell',
    nursery: 'Eggshell',
    living: 'Eggshell',
    bedroom: 'Matte',
    office: 'Eggshell',
    kids: 'Eggshell',
    dining: 'Eggshell',
    other: 'Eggshell'
  }
  return roomType ? finishMap[roomType] || 'Eggshell' : 'Eggshell'
}

// Build the shortlist
export function buildShortlist(profile: UserRoomProfile): ScoredColor[] {
  // Score all colors
  const scored: Array<{
    color: PaintColor
    scores: ScoredColor['scores']
    killed: boolean
    killReason: string
  }> = paintColors.map(color => {
    const killCheck = isKilledByAvoidList(color, profile.avoidList)

    if (killCheck.killed) {
      return {
        color,
        scores: { overall: 0, boldness: 0, vibe: 0, lighting: 0, harmony: 0 },
        killed: true,
        killReason: killCheck.reason
      }
    }

    return {
      color,
      scores: computeOverallScore(color, profile),
      killed: false,
      killReason: ''
    }
  })

  // Filter out killed colors and sort by overall score
  const viable = scored
    .filter(s => !s.killed)
    .sort((a, b) => b.scores.overall - a.scores.overall)

  const shortlist: ScoredColor[] = []
  const usedIds = new Set<string>()

  // Top picks - highest overall scores
  const topPicks = viable.slice(0, 2)
  for (const candidate of topPicks) {
    const trim = recommendTrim(candidate.color)
    shortlist.push({
      color: candidate.color,
      scores: candidate.scores,
      tag: 'top_pick',
      reasoning: generateReasoning(candidate.color, profile, candidate.scores),
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
  }

  // Safe bets - high lighting + harmony scores (stable colors)
  const safeBets = viable
    .filter(s => !usedIds.has(s.color.id))
    .filter(s => s.scores.lighting >= 15 && s.scores.harmony >= 12)
    .slice(0, 2)

  for (const candidate of safeBets) {
    const trim = recommendTrim(candidate.color)
    shortlist.push({
      color: candidate.color,
      scores: candidate.scores,
      tag: 'safe_bet',
      reasoning: generateReasoning(candidate.color, profile, candidate.scores),
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
  }

  // Bold choice - higher boldness score, still good overall
  const boldChoices = viable
    .filter(s => !usedIds.has(s.color.id))
    .filter(s => s.scores.boldness >= 20 && s.scores.overall >= 50)
    .slice(0, 1)

  for (const candidate of boldChoices) {
    const trim = recommendTrim(candidate.color)
    shortlist.push({
      color: candidate.color,
      scores: candidate.scores,
      tag: 'bold_choice',
      reasoning: `${candidate.scores.overall}% Match — A bolder option that still works beautifully in your space.`,
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
  }

  // If we don't have 5 yet, fill with next best
  const remaining = viable.filter(s => !usedIds.has(s.color.id))
  while (shortlist.length < 5 && remaining.length > 0) {
    const candidate = remaining.shift()!
    const trim = recommendTrim(candidate.color)
    shortlist.push({
      color: candidate.color,
      scores: candidate.scores,
      tag: 'safe_bet',
      reasoning: generateReasoning(candidate.color, profile, candidate.scores),
      suggestedTrim: trim,
      suggestedFinish: recommendFinish(profile.roomType)
    })
    usedIds.add(candidate.color.id)
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

  const bulbDesc = profile.bulbFeel === 'warm' ? 'warm' : profile.bulbFeel === 'bright_white' ? 'bright' : 'regular'
  const timesToCheck = [
    'Morning with natural light',
    'Afternoon at peak brightness',
    `Evening with your ${bulbDesc} bulbs on`
  ]

  // Generate alternates based on avoid list
  const alternates: Array<{ ifLooksToo: string; tryInstead: string[] }> = []

  for (const avoid of profile.avoidList) {
    let description = ''
    let filterFn: (c: ScoredColor) => boolean

    switch (avoid) {
      case 'green':
        description = 'green'
        filterFn = c => c.color.undertone.leansPrimary !== 'green'
        break
      case 'purple':
        description = 'purple'
        filterFn = c => c.color.undertone.leansPrimary !== 'purple'
        break
      case 'yellow_creamy':
        description = 'yellow/creamy'
        filterFn = c => c.color.undertone.leansPrimary !== 'yellow'
        break
      case 'too_dark':
        description = 'dark'
        filterFn = c => c.color.lrv > 40
        break
      case 'too_cold':
        description = 'cold'
        filterFn = c => c.color.undertone.temperature !== 'cool'
        break
      default:
        continue
    }

    const alternatives = colors
      .filter(filterFn)
      .slice(0, 2)
      .map(c => c.color.name)

    if (alternatives.length > 0) {
      alternates.push({ ifLooksToo: description, tryInstead: alternatives })
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
