#!/usr/bin/env node
/**
 * Script to generate colors.ts from Salma's master CSV
 * Calculates LAB values, stability scores, bestIn tips, watchOut, and similar colors
 */

const fs = require('fs')
const path = require('path')

// Read and parse CSV
const csvPath = path.join(__dirname, '..', 'The Color Edit Master Data - Sheet1.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')

// Parse CSV (handle quoted fields with commas)
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = parseCSVLine(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith(',,,')) continue // Skip empty rows

    const values = parseCSVLine(line)
    if (values.length < 5) continue // Skip incomplete rows

    const row = {}
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx]?.trim() || ''
    })

    // Skip rows without a color name or hex
    if (!row['Color'] || !row['Hex']) continue

    rows.push(row)
  }

  return rows
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result
}

// Convert RGB to LAB color space
function rgbToLab(r, g, b) {
  // First convert RGB to XYZ
  let rr = r / 255
  let gg = g / 255
  let bb = b / 255

  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92

  rr *= 100
  gg *= 100
  bb *= 100

  // Observer = 2°, Illuminant = D65
  const x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375
  const y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750
  const z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041

  // Convert XYZ to LAB
  let xx = x / 95.047
  let yy = y / 100.000
  let zz = z / 108.883

  xx = xx > 0.008856 ? Math.pow(xx, 1/3) : (7.787 * xx) + (16 / 116)
  yy = yy > 0.008856 ? Math.pow(yy, 1/3) : (7.787 * yy) + (16 / 116)
  zz = zz > 0.008856 ? Math.pow(zz, 1/3) : (7.787 * zz) + (16 / 116)

  const l = (116 * yy) - 16
  const a = 500 * (xx - yy)
  const bVal = 200 * (yy - zz)

  return {
    l: Math.round(l * 10) / 10,
    a: Math.round(a * 10) / 10,
    b: Math.round(bVal * 10) / 10
  }
}

// Map brand name to brandId
function getBrandId(collectionSource) {
  const source = collectionSource.toLowerCase()
  if (source.includes('behr')) return 'behr'
  if (source.includes('sherwin') || source.includes('sw ')) return 'sw'
  if (source.includes('valspar')) return 'valspar'
  if (source.includes('glidden')) return 'glidden'
  if (source.includes('benjamin moore')) return 'bm'
  if (source.includes('hgtv')) return 'hgtv'
  if (source.includes('ppg')) return 'ppg'
  if (source.includes('dunn-edwards') || source.includes('dunn edwards')) return 'de'
  if (source.includes('farrow') || source.includes('ball')) return 'fb'
  if (source.includes('collection source')) return null // Skip header rows
  return 'other'
}

// Map brand name to display name
function getBrandName(collectionSource) {
  const source = collectionSource.toLowerCase()
  if (source.includes('behr')) return 'BEHR'
  if (source.includes('sherwin') || source.includes('sw ')) return 'Sherwin-Williams'
  if (source.includes('valspar')) return 'Valspar'
  if (source.includes('glidden')) return 'Glidden'
  if (source.includes('benjamin moore')) return 'Benjamin Moore'
  if (source.includes('hgtv')) return 'HGTV Home by Sherwin-Williams'
  if (source.includes('ppg')) return 'PPG'
  if (source.includes('dunn-edwards') || source.includes('dunn edwards')) return 'Dunn-Edwards'
  if (source.includes('farrow') || source.includes('ball')) return 'Farrow & Ball'
  return collectionSource
}

// Get product line from collection source
function getProductLine(collectionSource) {
  if (collectionSource.includes('2026')) return '2026 Color Trends'
  return 'Color Collection'
}

// Map temperature to our format
function mapTemperature(temp) {
  if (!temp) return 'neutral'
  const t = temp.toLowerCase()
  if (t === 'warm') return 'warm'
  if (t === 'cool') return 'cool'
  return 'neutral'
}

// Map undertone notes to primary/secondary undertones
function mapUndertone(undertoneRaw, undertoneNotes, temp) {
  const notes = (undertoneNotes || '').toLowerCase()
  const raw = (undertoneRaw || '').toLowerCase()

  // Define mapping from undertone keywords to our system
  const undertoneMap = {
    'green': 'green',
    'olive': 'green',
    'teal': 'green',
    'blue': 'blue',
    'navy': 'blue',
    'aqua': 'blue',
    'purple': 'purple',
    'violet': 'purple',
    'plum': 'purple',
    'lavender': 'purple',
    'pink': 'pink',
    'peach': 'pink',
    'blush': 'pink',
    'rose': 'pink',
    'yellow': 'yellow',
    'gold': 'yellow',
    'amber': 'yellow',
    'ochre': 'yellow',
    'cream': 'yellow',
    'orange': 'orange',
    'copper': 'orange',
    'terracotta': 'orange',
    'rust': 'orange',
    'coral': 'orange',
    'red': 'orange',
    'gray': 'neutral',
    'grey': 'neutral',
    'taupe': 'neutral',
    'beige': 'neutral',
    'brown': 'neutral',
    'earth': 'neutral',
    'espresso': 'neutral',
    'black': 'neutral',
    'slate': 'neutral'
  }

  const allNotes = `${notes} ${raw}`
  const found = []

  for (const [keyword, undertone] of Object.entries(undertoneMap)) {
    if (allNotes.includes(keyword) && !found.includes(undertone)) {
      found.push(undertone)
    }
  }

  // Default based on temperature if no undertones found
  if (found.length === 0) {
    if (temp === 'warm') return { primary: 'yellow', secondary: null }
    if (temp === 'cool') return { primary: 'blue', secondary: null }
    return { primary: 'neutral', secondary: null }
  }

  return {
    primary: found[0],
    secondary: found[1] || null
  }
}

// Calculate stability score based on undertone complexity
function calculateStability(undertones, riskTags, lrv) {
  let stability = 0.75 // Base stability

  // Colors with multiple undertones are less stable
  if (undertones.secondary) {
    stability -= 0.1
  }

  // Risk tags indicate instability
  const risks = (riskTags || '').toLowerCase()
  const riskFactors = [
    'shift', 'can_look', 'can_feel', 'can_go', 'shows_lap', 'muddy',
    'creamy', 'looks_white', 'looks_yellow', 'darkens'
  ]

  for (const risk of riskFactors) {
    if (risks.includes(risk)) {
      stability -= 0.05
    }
  }

  // Very light colors (high LRV) are generally more stable
  if (lrv > 70) stability += 0.1
  // Very dark colors can be trickier
  if (lrv < 15) stability -= 0.05

  // Clamp between 0.4 and 0.95
  return Math.max(0.4, Math.min(0.95, Math.round(stability * 100) / 100))
}

// Determine depth category from LRV
function getDepthCategory(lrv) {
  if (lrv >= 50) return 'light'
  if (lrv >= 20) return 'mid'
  return 'dark'
}

// Generate bestIn recommendations based on color properties
function generateBestIn(color, temp, family, styleTags, lrv) {
  const parts = []

  // Light direction recommendations
  if (temp === 'warm' || temp === 'Warm') {
    parts.push('South or west-facing rooms')
  } else if (temp === 'cool' || temp === 'Cool') {
    parts.push('North or east-facing rooms')
  }

  // Room type recommendations based on style tags
  const tags = [color['Style Tag 1'], color['Style Tag 2'], color['Style Tag 3'],
                color['Style Tag 4'], color['Style Tag 5']].filter(Boolean).join(' ').toLowerCase()

  if (tags.includes('cozy') || tags.includes('warm')) {
    parts.push('bedrooms, living rooms')
  }
  if (tags.includes('crisp') || tags.includes('clean') || tags.includes('modern')) {
    parts.push('kitchens, bathrooms, offices')
  }
  if (tags.includes('moody') || tags.includes('dramatic')) {
    parts.push('accent walls, dining rooms, studies')
  }
  if (tags.includes('calm') || tags.includes('serene')) {
    parts.push('bedrooms, nurseries, spa bathrooms')
  }
  if (tags.includes('organic') || tags.includes('earthy')) {
    parts.push('spaces with natural materials')
  }

  // LRV-based recommendations
  if (lrv > 70) {
    parts.push('smaller rooms to maximize light')
  } else if (lrv < 20) {
    parts.push('larger rooms with good natural light')
  }

  if (parts.length === 0) {
    return 'Versatile color for various spaces'
  }

  return parts.slice(0, 2).join(', ')
}

// Generate watchOut warnings from risk tags and undertones
function generateWatchOut(riskTags, undertoneRaw, undertoneNotes, temp) {
  const warnings = []
  const risks = (riskTags || '').toLowerCase()
  const notes = `${undertoneRaw || ''} ${undertoneNotes || ''}`.toLowerCase()

  // Map risk tags to warnings
  if (risks.includes('green_shift')) {
    warnings.push('May shift green in certain light')
  }
  if (risks.includes('pink_shift')) {
    warnings.push('Can read pink in cool light')
  }
  if (risks.includes('purple_shift')) {
    warnings.push('May show purple undertones')
  }
  if (risks.includes('blue_shift')) {
    warnings.push('Can shift blue in north light')
  }
  if (risks.includes('yellow_shift')) {
    warnings.push('May appear more yellow than expected')
  }
  if (risks.includes('orange_shift')) {
    warnings.push('Can lean orange in warm light')
  }
  if (risks.includes('gray_shift')) {
    warnings.push('May read grayer in low light')
  }
  if (risks.includes('brown_shift') || risks.includes('beige_shift')) {
    warnings.push('Can look muddy in cool light')
  }
  if (risks.includes('shows_lap_marks')) {
    warnings.push('Shows lap marks - maintain wet edge')
  }
  if (risks.includes('can_feel_cooler')) {
    warnings.push('May feel cooler than expected at night')
  }
  if (risks.includes('can_look_gray')) {
    warnings.push('Can appear gray in low light')
  }
  if (risks.includes('muddy')) {
    warnings.push('Can look muddy with wrong undertones nearby')
  }
  if (risks.includes('creamy')) {
    warnings.push('Reads creamy rather than pure white')
  }
  if (risks.includes('looks_white')) {
    warnings.push('Very subtle - may read as white')
  }
  if (risks.includes('darkens_room')) {
    warnings.push('Will significantly darken the room')
  }
  if (risks.includes('black_shift')) {
    warnings.push('Appears nearly black in low light')
  }
  if (risks.includes('rust_shift')) {
    warnings.push('Can lean rusty/burnt in warm light')
  }
  if (risks.includes('teal_shift')) {
    warnings.push('May shift teal in certain light')
  }
  if (risks.includes('school_bus_yellow')) {
    warnings.push('Very saturated - test before committing')
  }
  if (risks.includes('moody') || risks.includes('classic_cozy')) {
    // These aren't really warnings
  }

  // Undertone-based warnings
  if (notes.includes('green') && !warnings.some(w => w.includes('green'))) {
    warnings.push('Green undertone may show in certain light')
  }
  if (notes.includes('pink') && !warnings.some(w => w.includes('pink'))) {
    warnings.push('Pink undertone visible in cool light')
  }

  if (warnings.length === 0) {
    // Default warning based on temperature
    if (temp === 'warm' || temp === 'Warm') {
      return 'May read warmer in south-facing light'
    }
    if (temp === 'cool' || temp === 'Cool') {
      return 'May feel cooler in north-facing rooms'
    }
    return 'Always test with a sample first'
  }

  return warnings.slice(0, 2).join('; ')
}

// Calculate color distance for finding similar colors
function colorDistance(lab1, lab2) {
  const dL = lab1.l - lab2.l
  const dA = lab1.a - lab2.a
  const dB = lab1.b - lab2.b
  return Math.sqrt(dL * dL + dA * dA + dB * dB)
}

// Generate suggested finishes based on color depth
function getSuggestedFinishes(depthCategory, family) {
  const fam = (family || '').toLowerCase()

  // Whites and very light colors
  if (fam === 'white' || depthCategory === 'light') {
    return ['eggshell', 'satin']
  }

  // Dark and moody colors
  if (depthCategory === 'dark') {
    return ['eggshell', 'matte']
  }

  // Mid-tones
  return ['eggshell', 'matte']
}

// Extract style tags from CSV
function getStyleTags(row) {
  const tags = []

  // Add style tags
  for (let i = 1; i <= 5; i++) {
    const tag = row[`Style Tag ${i}`]
    if (tag) {
      tags.push(tag.toLowerCase())
    }
  }

  // Add family as tag
  const family = (row['Family'] || '').toLowerCase()
  if (family && !tags.includes(family)) {
    tags.push(family)
  }

  // Add temperature
  const temp = (row['Temp'] || '').toLowerCase()
  if (temp === 'warm') tags.push('warm')
  if (temp === 'cool') tags.push('cool')

  return tags
}

// Generate unique ID from brand and code
function generateId(brandId, code, name) {
  // Clean up code
  let cleanCode = (code || name || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${brandId}-${cleanCode}`
}

// Assign popularity score based on collection and position
function getPopularity(collectionSource, index, total) {
  // 2026 Color of the Year gets highest popularity
  const source = (collectionSource || '').toLowerCase()
  if (source.includes('color of the year')) return 0.95
  if (source.includes('2026')) return 0.85 - (index / total * 0.2)
  return 0.7 - (index / total * 0.2)
}

// Main processing
const rows = parseCSV(csvContent)
console.log(`Parsed ${rows.length} colors from CSV`)

// Process each row into a PaintColor object
const colors = []
const seenIds = new Set()

rows.forEach((row, index) => {
  // Skip if no valid data
  if (!row['Color'] || !row['R'] || !row['G'] || !row['B']) return

  const brandId = getBrandId(row['Collection Source Name'] || '')

  // Skip header rows (brandId is null)
  if (!brandId) return
  const code = row['Behr_ID'] || row['Color'] || ''
  let id = generateId(brandId, code, row['Color'])

  // Handle duplicate IDs
  if (seenIds.has(id)) {
    id = `${id}-${index}`
  }
  seenIds.add(id)

  const r = parseInt(row['R']) || 0
  const g = parseInt(row['G']) || 0
  const b = parseInt(row['B']) || 0
  const lrv = parseInt(row['LRV']) || 50
  const hex = row['Hex'] || `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  const lab = rgbToLab(r, g, b)
  const temp = row['Temp'] || 'neutral'
  const undertones = mapUndertone(row['Undertone_raw'], row['Undertone_notes'], temp)
  const depthCategory = getDepthCategory(lrv)
  const styleTags = getStyleTags(row)

  const color = {
    id,
    brand: getBrandName(row['Collection Source Name'] || ''),
    brandId,
    line: getProductLine(row['Collection Source Name'] || ''),
    name: row['Color'],
    code: row['Behr_ID'] || row['Color'],
    hex: hex.startsWith('#') ? hex : `#${hex}`,
    rgb: { r, g, b },
    lab,
    lrv,
    undertone: {
      temperature: mapTemperature(temp),
      leansPrimary: undertones.primary,
      leansSecondary: undertones.secondary
    },
    stability: calculateStability(undertones, row['Risk_tags'], lrv),
    depthCategory,
    popularity: getPopularity(row['Collection Source Name'], index, rows.length),
    tags: styleTags,
    description: row['Short_description'] || row['One_liner'] || `A ${temp.toLowerCase()} ${(row['Family'] || 'neutral').toLowerCase()} from the ${row['Collection Source Name'] || 'collection'}.`,
    bestIn: generateBestIn(row, temp, row['Family'], styleTags, lrv),
    watchOut: generateWatchOut(row['Risk_tags'], row['Undertone_raw'], row['Undertone_notes'], temp),
    suggestedTrims: [], // Will be filled in after all colors processed
    suggestedFinishes: getSuggestedFinishes(depthCategory, row['Family']),
    similarColors: [], // Will be filled in after all colors processed
    // Store trim info for later processing
    _trimCrisp: row['Trim_Crisp'] || row['Trim Crisp (Lower Case)'] || '',
    _trimWarm: row['Trim_Warm'] || ''
  }

  colors.push(color)
})

console.log(`Processed ${colors.length} valid colors`)

// Now find similar colors and trim suggestions
colors.forEach(color => {
  // Find similar colors by LAB distance
  const similar = colors
    .filter(c => c.id !== color.id)
    .map(c => ({
      color: c,
      distance: colorDistance(color.lab, c.lab)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)

  color.similarColors = similar.map(s => {
    let relationship = 'similar tone'
    if (s.color.brandId !== color.brandId) {
      relationship = 'cross-brand match'
    } else if (s.color.lrv > color.lrv + 10) {
      relationship = 'lighter version'
    } else if (s.color.lrv < color.lrv - 10) {
      relationship = 'darker version'
    } else if (s.color.undertone.temperature !== color.undertone.temperature) {
      relationship = s.color.undertone.temperature === 'warm' ? 'warmer alternative' : 'cooler alternative'
    }
    return { colorId: s.color.id, relationship }
  })

  // Find trim suggestions
  // Look for white/light colors that would work as trim
  const whiteTrimColors = colors.filter(c =>
    c.depthCategory === 'light' &&
    c.lrv > 75 &&
    (c.tags.includes('white') || c.name.toLowerCase().includes('white') || c.lrv > 85)
  )

  if (whiteTrimColors.length > 0) {
    // Find crisp white (cool/neutral) and warm white
    const crispTrim = whiteTrimColors.find(c =>
      c.undertone.temperature === 'cool' || c.undertone.temperature === 'neutral'
    )
    const warmTrim = whiteTrimColors.find(c =>
      c.undertone.temperature === 'warm'
    )

    if (crispTrim) color.suggestedTrims.push(crispTrim.id)
    if (warmTrim && warmTrim.id !== crispTrim?.id) color.suggestedTrims.push(warmTrim.id)
  }

  // Clean up temporary properties
  delete color._trimCrisp
  delete color._trimWarm
})

// Generate TypeScript output
const output = `import { PaintColor } from '../types'

export const paintColors: PaintColor[] = ${JSON.stringify(colors, null, 2)
  .replace(/"(\w+)":/g, '$1:')
  .replace(/null/g, 'null')
}

// Helper to get trim colors (whites with LRV > 80)
export const trimColors = paintColors.filter(c => c.lrv > 80 && c.depthCategory === 'light')

// Helper to get a color by ID
export function getColorById(id: string): PaintColor | undefined {
  return paintColors.find(c => c.id === id)
}

// Helper to get colors by brand
export function getColorsByBrand(brandId: string): PaintColor[] {
  return paintColors.filter(c => c.brandId === brandId)
}
`

// Write output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'colors.ts')
fs.writeFileSync(outputPath, output)
console.log(`Generated ${outputPath} with ${colors.length} colors`)

// Print summary by brand
const brandCounts = {}
colors.forEach(c => {
  brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1
})
console.log('\nColors by brand:')
Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
  console.log(`  ${brand}: ${count}`)
})
