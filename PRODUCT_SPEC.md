# The Color Edit — Product Specification

**Product Promise:** Get to a confident 5-swatch shortlist (with trim + finish guidance) in under 5 minutes.

**Version:** 1.0 MVP
**Platform:** iOS-first
**Design Language:** Farrow & Ball-inspired — quiet, editorial, curated, premium

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [UX Principles](#2-ux-principles)
3. [Information Architecture](#3-information-architecture)
4. [Screen Specifications](#4-screen-specifications)
5. [Data Models & JSON Schemas](#5-data-models--json-schemas)
6. [Recommendation Engine](#6-recommendation-engine)
7. [Buy Nearby Module](#7-buy-nearby-module)
8. [Paint Product Picker](#8-paint-product-picker)
9. [Quantity Estimator](#9-quantity-estimator)
10. [Shopping List](#10-shopping-list)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Roadmap: MVP vs V2](#12-roadmap-mvp-vs-v2)

---

## 1. Product Overview

### Target User
Informed homeowner with taste, but little time. Knows what they like but overwhelmed by options. Values quality over quantity. Willing to invest in getting it right.

### Core Value Proposition
- **Speed:** 5-swatch shortlist in under 5 minutes
- **Confidence:** Every recommendation includes "why" and "watch-outs"
- **Completeness:** Color + trim + finish + where to buy + quantity

### Product Principles
1. **Curated, not comprehensive** — Show 6–10 options max; default output is 5
2. **Button-driven** — Minimal typing; every choice is a tap
3. **Transparent reasoning** — Plain-language explanations for every recommendation
4. **Premium calm** — Whitespace, typography-forward, swatches as "printed cards"

---

## 2. UX Principles

### Visual Language
- **Typography:** Serif for headlines, clean sans-serif for body
- **Color palette:** Off-white backgrounds (#FDFBF7), charcoal text (#2C2C2C), accent gold (#B8A47C)
- **Swatch presentation:** Cards with soft shadows, slight rounded corners, printed-card aesthetic
- **Whitespace:** Generous margins; cards breathe
- **Motion:** Subtle, purposeful transitions; no playfulness

### Interaction Patterns
- **Single-select buttons:** Pill-shaped, outlined until selected, filled when active
- **Multi-select chips:** Rounded rectangles with checkmarks
- **Sliders:** Labeled endpoints, haptic feedback at midpoint
- **Cards:** Swipe to dismiss, tap to expand
- **Progress:** Subtle step indicator (dots, not numbers)

### Microcopy Tone
- Calm, confident, knowledgeable
- Never condescending
- Assumes intelligence, not expertise
- Example: "This gray has a green undertone that warms in south light."

---

## 3. Information Architecture

```
Home
├── Get my 5-swatch shortlist → Room Setup Flow → Shortlist 5
│   ├── Color Card → Paint Story
│   ├── Choose paint type & finish → Product Picker
│   ├── Compare A vs B
│   └── Export shopping list
├── Browse Collections
│   ├── Trends & Editorial
│   ├── By Room
│   └── By Mood
├── My House Palette
│   ├── Saved Rooms
│   ├── Favorite Colors
│   └── Shopping Lists
└── Buy Nearby
    ├── Store Finder
    ├── Preferred Stores
    └── Call-ahead Checklist
```

---

## 4. Screen Specifications

### A. Home Screen

**Layout:** Full-bleed hero, stacked CTAs

**Components:**
- Hero: Muted lifestyle image with editorial overlay
- Primary CTA button
- Secondary link
- Tertiary link

**Button Copy:**
| Element | Label |
|---------|-------|
| Primary CTA | `Get my 5-swatch shortlist` |
| Secondary | `Browse Collections` |
| Tertiary | `My House Palette` |

---

### B. Room Setup Flow

**Structure:** Single scrolling flow with card-based sections. Each card auto-advances on selection (single-select) or has "Continue" button (multi-select).

**Progress indicator:** 9 dots at top, current highlighted

---

#### Card 1: Room Type

**Prompt:** `What room are you painting?`

**Buttons (single-select):**
| Label | Value |
|-------|-------|
| `Living room` | `living` |
| `Bedroom` | `bedroom` |
| `Kitchen` | `kitchen` |
| `Bathroom` | `bathroom` |
| `Hallway` | `hallway` |
| `Home office` | `office` |
| `Nursery` | `nursery` |
| `Exterior` | `exterior` |

---

#### Card 2: Light Direction

**Prompt:** `Which way do the windows face?`

**Helper text:** `This affects how colors shift throughout the day.`

**Buttons (single-select):**
| Label | Value |
|-------|-------|
| `North` | `north` |
| `South` | `south` |
| `East` | `east` |
| `West` | `west` |
| `Not sure` | `unknown` |

---

#### Card 3: Primary Usage Time

**Prompt:** `When do you use this room most?`

**Buttons (single-select):**
| Label | Value |
|-------|-------|
| `Mostly daytime` | `day` |
| `Mostly evening` | `night` |
| `Both equally` | `both` |

---

#### Card 4: Bulb Temperature

**Prompt:** `What kind of light bulbs?`

**Helper text:** `Check the box — it says "K" for Kelvin.`

**Buttons (single-select):**
| Label | Value |
|-------|-------|
| `Warm (2700K)` | `warm` |
| `Neutral (3000–3500K)` | `neutral` |
| `Cool (4000K+)` | `cool` |
| `Not sure` | `unknown` |

---

#### Card 5: Fixed Elements

**Prompt:** `What's staying in the room?`

**Helper text:** `Select all that apply. This helps us avoid clashing.`

**Chips (multi-select):**

*Wood & Cabinets:*
| Label | Value |
|-------|-------|
| `Warm wood floors` | `wood_warm` |
| `Cool wood floors` | `wood_cool` |
| `White cabinets` | `cabinets_white` |
| `Cream cabinets` | `cabinets_cream` |
| `Gray cabinets` | `cabinets_gray` |

*Counters & Stone:*
| Label | Value |
|-------|-------|
| `White/marble counters` | `counters_white` |
| `Warm counters` | `counters_warm` |
| `Dark counters` | `counters_dark` |
| `Red brick` | `brick_red` |
| `Gray brick` | `brick_gray` |
| `Warm stone` | `stone_warm` |
| `Cool stone` | `stone_cool` |

*Hardware:*
| Label | Value |
|-------|-------|
| `Brass / gold hardware` | `hardware_brass` |
| `Chrome / nickel` | `hardware_chrome` |
| `Black hardware` | `hardware_black` |

**Button:** `Continue` or `None of these`

---

#### Card 6: Vibe

**Prompt:** `What feeling are you after?`

**Option A — Sliders:**

Slider 1: `Cozy` ←——●——→ `Crisp`
Slider 2: `Calm` ←——●——→ `Moody`

**Option B — Button pairs:**

| Prompt | Left | Right |
|--------|------|-------|
| Temperature | `Cozy & warm` | `Crisp & clean` |
| Mood | `Calm & restful` | `Moody & dramatic` |

---

#### Card 7: Undertone Fears

**Prompt:** `Any undertones you want to avoid?`

**Helper text:** `We'll steer away from colors that tend to shift this way.`

**Chips (multi-select):**
| Label | Value |
|-------|-------|
| `Turns green` | `fear_green` |
| `Turns pink` | `fear_pink` |
| `Turns purple` | `fear_purple` |
| `Looks baby-blue` | `fear_babyblue` |
| `Looks dingy gray` | `fear_dingy` |
| `Looks too yellow` | `fear_yellow` |

**Button:** `Continue` or `No concerns`

---

#### Card 8: Brand Preference

**Prompt:** `Any preferred brands?`

**Helper text:** `Optional. We'll show matches across all brands otherwise.`

**Chips (multi-select):**
| Label | Value |
|-------|-------|
| `Sherwin-Williams` | `sw` |
| `Benjamin Moore` | `bm` |
| `Behr` | `behr` |
| `PPG` | `ppg` |
| `Valspar` | `valspar` |
| `Any brand` | `any` |

**Button:** `Continue`

---

#### Card 9: Depth Preference

**Prompt:** `How light or dark?`

**Buttons (single-select):**
| Label | Value |
|-------|-------|
| `Light & airy` | `light` |
| `Mid-tone` | `mid` |
| `Dark & cozy` | `dark` |
| `Show me options` | `any` |

---

#### Final CTA

**Button:** `Create my 5-swatch shortlist`

---

### C. Shortlist 5 Screen

**Layout:**
- Header: "Your Shortlist" + room context
- 5 color cards in vertical scroll
- Sticky bottom bar with actions

**Color Card Components:**

```
┌─────────────────────────────────────────┐
│  [SWATCH BLOCK — 120pt height]          │
│                                         │
│  Tag: "Safe Win"                        │
├─────────────────────────────────────────┤
│  Pale Oak                               │
│  Benjamin Moore OC-20                   │
│                                         │
│  Warm greige with a hint of pink        │
│  LRV 69 · Light                         │
│                                         │
│  Best in: South/west light, warm woods  │
│  Watch out: Can read pink in north light│
│                                         │
│  Confidence: 92                         │
│  "Balances your warm wood without       │
│   clashing with chrome hardware."       │
│                                         │
│  Trim: Chantilly Lace (crisp) ▾         │
│  Finish: Eggshell                       │
│                                         │
│  [ Choose paint type ]  [ Compare ]     │
└─────────────────────────────────────────┘
```

**Card Tags:**
| Tag | Meaning |
|-----|---------|
| `Safe Win` | High stability, low undertone risk |
| `Vibe Match` | Strong alignment to mood preferences |
| `Wildcard` | Slightly bolder; still plausible |

**Bottom Bar Buttons:**
| Label | Action |
|-------|--------|
| `Compare A vs B` | Opens comparison view |
| `Export list` | Generates shopping list |
| `Find stores` | Opens Buy Nearby |

---

### D. Paint Story Screen

**Layout:** Full color detail page

**Sections:**

1. **Hero swatch** — Full-width color block
2. **Color identity**
   - Name, brand, code
   - Undertone description (2 lines)
   - LRV with explanation
3. **Editorial description** — 2–3 lines, premium tone
4. **Curated pairings**
   - 1–2 trim whites
   - 2–3 complementary accents
5. **Similar alternatives**
   - "Less green" / "Less pink" / "Lighter" options
6. **Technical specs**
   - Hex, RGB
   - Best finishes
   - Recommended rooms

**Example Editorial Copy:**
> A sophisticated greige that reads warm without veering into beige territory.
> Grounded enough for a living room, soft enough for a bedroom.
> Pairs beautifully with warm brass and aged oak.

---

### E. Compare A vs B Screen

**Layout:** Side-by-side split view

**Components per side:**
- Swatch (half-width)
- Name + code
- 3–4 bullet comparison points

**Comparison Categories:**
- Undertone
- Light stability
- Best rooms
- Watch-outs

**Bottom:**
| Label | Action |
|-------|--------|
| `Pick left` | Selects A |
| `Pick right` | Selects B |
| `Keep both` | Returns to list |

---

### F. Sampling Plan Screen

**Prompt:** `Here's how to test your samples`

**Sections:**

**1. Where to place (3 locations)**
- Near the trim/door frame
- In the darkest corner
- On the main wall at eye level

**2. When to check (3 times)**
- Morning (natural light)
- Afternoon (peak brightness)
- Evening (with your bulbs on)

**3. What to compare against**
- Hold sample next to your floor
- Hold sample next to counters/cabinets
- View from across the room

**4. If it's not right**
> "If [Color A] looks too green, try [Alt 1] or [Alt 2]."

**Button:** `Got it — show shopping list`

---

## 5. Data Models & JSON Schemas

### 5.1 PaintColor

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaintColor",
  "type": "object",
  "required": ["id", "brand", "name", "code", "hex", "lab", "lrv", "undertone"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier"
    },
    "brand": {
      "type": "string",
      "description": "Paint brand name"
    },
    "brandId": {
      "type": "string",
      "description": "Reference to Brand object"
    },
    "line": {
      "type": "string",
      "description": "Product line or collection name"
    },
    "name": {
      "type": "string",
      "description": "Color name"
    },
    "code": {
      "type": "string",
      "description": "Brand-specific color code/SKU"
    },
    "hex": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "Hex color value"
    },
    "rgb": {
      "type": "object",
      "properties": {
        "r": { "type": "integer", "minimum": 0, "maximum": 255 },
        "g": { "type": "integer", "minimum": 0, "maximum": 255 },
        "b": { "type": "integer", "minimum": 0, "maximum": 255 }
      }
    },
    "lab": {
      "type": "object",
      "required": ["l", "a", "b"],
      "properties": {
        "l": { "type": "number", "minimum": 0, "maximum": 100 },
        "a": { "type": "number", "minimum": -128, "maximum": 127 },
        "b": { "type": "number", "minimum": -128, "maximum": 127 }
      },
      "description": "CIE Lab color values for perceptual matching"
    },
    "lch": {
      "type": "object",
      "properties": {
        "l": { "type": "number" },
        "c": { "type": "number" },
        "h": { "type": "number" }
      },
      "description": "LCH color values"
    },
    "lrv": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Light Reflectance Value"
    },
    "undertone": {
      "type": "object",
      "required": ["temperature", "leansPrimary"],
      "properties": {
        "temperature": {
          "type": "string",
          "enum": ["warm", "cool", "neutral"]
        },
        "leansPrimary": {
          "type": "string",
          "enum": ["green", "blue", "purple", "pink", "yellow", "orange", "neutral"]
        },
        "leansSecondary": {
          "type": "string",
          "enum": ["green", "blue", "purple", "pink", "yellow", "orange", "neutral", null]
        }
      }
    },
    "stability": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "How stable the color is under varying light (1 = very stable)"
    },
    "depthCategory": {
      "type": "string",
      "enum": ["light", "mid", "dark"]
    },
    "popularity": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Popularity/trend score"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Collection tags, trend tags, etc."
    },
    "year": {
      "type": "integer",
      "description": "Year introduced or featured"
    },
    "description": {
      "type": "string",
      "description": "Editorial description for Paint Story"
    },
    "bestIn": {
      "type": "string",
      "description": "1-line 'best in' guidance"
    },
    "watchOut": {
      "type": "string",
      "description": "1-line 'watch out' warning"
    },
    "suggestedTrims": {
      "type": "array",
      "items": { "type": "string" },
      "description": "IDs of recommended trim colors"
    },
    "suggestedFinishes": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["flat", "matte", "eggshell", "satin", "semigloss", "gloss"]
      }
    },
    "similarColors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "colorId": { "type": "string" },
          "relationship": { "type": "string" }
        }
      },
      "description": "Similar colors with relationship (e.g., 'less green', 'lighter')"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "bm-oc-20",
  "brand": "Benjamin Moore",
  "brandId": "bm",
  "line": "Off-White Collection",
  "name": "Pale Oak",
  "code": "OC-20",
  "hex": "#D9D0C3",
  "rgb": { "r": 217, "g": 208, "b": 195 },
  "lab": { "l": 83.2, "a": 1.8, "b": 7.2 },
  "lch": { "l": 83.2, "c": 7.4, "h": 76 },
  "lrv": 69,
  "undertone": {
    "temperature": "warm",
    "leansPrimary": "pink",
    "leansSecondary": "yellow"
  },
  "stability": 0.72,
  "depthCategory": "light",
  "popularity": 0.91,
  "tags": ["bestseller", "greige", "neutral", "warm neutral"],
  "year": 2019,
  "description": "A sophisticated greige that reads warm without veering into beige territory. Grounded enough for a living room, soft enough for a bedroom. Pairs beautifully with warm brass and aged oak.",
  "bestIn": "South/west light, rooms with warm wood tones",
  "watchOut": "Can read pink in cool north light",
  "suggestedTrims": ["bm-oc-17", "bm-oc-65"],
  "suggestedFinishes": ["eggshell", "matte"],
  "similarColors": [
    { "colorId": "bm-oc-28", "relationship": "less pink" },
    { "colorId": "sw-7036", "relationship": "cross-brand match" }
  ]
}
```

---

### 5.2 UserRoomProfile

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UserRoomProfile",
  "type": "object",
  "required": ["id", "userId", "roomType", "createdAt"],
  "properties": {
    "id": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "name": {
      "type": "string",
      "description": "User-provided room name"
    },
    "roomType": {
      "type": "string",
      "enum": ["living", "bedroom", "kitchen", "bathroom", "hallway", "office", "nursery", "exterior"]
    },
    "lighting": {
      "type": "object",
      "properties": {
        "direction": {
          "type": "string",
          "enum": ["north", "south", "east", "west", "unknown"]
        },
        "primaryUsage": {
          "type": "string",
          "enum": ["day", "night", "both"]
        },
        "bulbTemp": {
          "type": "string",
          "enum": ["warm", "neutral", "cool", "unknown"]
        }
      }
    },
    "fixedElements": {
      "type": "array",
      "items": { "type": "string" }
    },
    "vibe": {
      "type": "object",
      "properties": {
        "cozyToCrisp": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "description": "0 = very cozy, 100 = very crisp"
        },
        "calmToMoody": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "description": "0 = very calm, 100 = very moody"
        }
      }
    },
    "undertoneFears": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["fear_green", "fear_pink", "fear_purple", "fear_babyblue", "fear_dingy", "fear_yellow"]
      }
    },
    "brandPreferences": {
      "type": "array",
      "items": { "type": "string" }
    },
    "depthPreference": {
      "type": "string",
      "enum": ["light", "mid", "dark", "any"]
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "room-abc123",
  "userId": "user-xyz789",
  "name": "Main bedroom",
  "roomType": "bedroom",
  "lighting": {
    "direction": "south",
    "primaryUsage": "both",
    "bulbTemp": "warm"
  },
  "fixedElements": ["wood_warm", "hardware_brass", "counters_white"],
  "vibe": {
    "cozyToCrisp": 30,
    "calmToMoody": 20
  },
  "undertoneFears": ["fear_pink", "fear_purple"],
  "brandPreferences": ["bm", "sw"],
  "depthPreference": "light",
  "createdAt": "2026-01-02T10:30:00Z",
  "updatedAt": "2026-01-02T10:35:00Z"
}
```

---

### 5.3 RecommendationResult

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RecommendationResult",
  "type": "object",
  "required": ["id", "roomProfileId", "colors", "createdAt"],
  "properties": {
    "id": {
      "type": "string"
    },
    "roomProfileId": {
      "type": "string"
    },
    "colors": {
      "type": "array",
      "minItems": 5,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["colorId", "tag", "score", "reasoning"],
        "properties": {
          "colorId": {
            "type": "string"
          },
          "tag": {
            "type": "string",
            "enum": ["safe_win", "vibe_match", "wildcard"]
          },
          "score": {
            "type": "object",
            "properties": {
              "overall": { "type": "number", "minimum": 0, "maximum": 100 },
              "vibeMatch": { "type": "number", "minimum": 0, "maximum": 1 },
              "lightingTolerance": { "type": "number", "minimum": 0, "maximum": 1 },
              "undertoneSafety": { "type": "number", "minimum": 0, "maximum": 1 },
              "depthMatch": { "type": "number", "minimum": 0, "maximum": 1 }
            }
          },
          "reasoning": {
            "type": "string",
            "description": "1-line explanation of why this color was chosen"
          },
          "suggestedTrim": {
            "type": "object",
            "properties": {
              "crispOptionId": { "type": "string" },
              "warmOptionId": { "type": "string" }
            }
          },
          "suggestedFinish": {
            "type": "string",
            "enum": ["flat", "matte", "eggshell", "satin", "semigloss", "gloss"]
          }
        }
      }
    },
    "samplingPlan": {
      "type": "object",
      "properties": {
        "placements": {
          "type": "array",
          "items": { "type": "string" }
        },
        "timesToCheck": {
          "type": "array",
          "items": { "type": "string" }
        },
        "alternates": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "ifLooksToo": { "type": "string" },
              "tryInstead": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "rec-def456",
  "roomProfileId": "room-abc123",
  "colors": [
    {
      "colorId": "bm-oc-20",
      "tag": "safe_win",
      "score": {
        "overall": 92,
        "vibeMatch": 0.88,
        "lightingTolerance": 0.95,
        "undertoneSafety": 0.91,
        "depthMatch": 1.0
      },
      "reasoning": "Balances your warm wood without clashing with the brass hardware.",
      "suggestedTrim": {
        "crispOptionId": "bm-oc-17",
        "warmOptionId": "bm-oc-65"
      },
      "suggestedFinish": "eggshell"
    },
    {
      "colorId": "sw-7015",
      "tag": "safe_win",
      "score": {
        "overall": 89,
        "vibeMatch": 0.82,
        "lightingTolerance": 0.93,
        "undertoneSafety": 0.94,
        "depthMatch": 1.0
      },
      "reasoning": "A true neutral that avoids the pink and purple undertones you flagged.",
      "suggestedTrim": {
        "crispOptionId": "sw-7757",
        "warmOptionId": "sw-7012"
      },
      "suggestedFinish": "eggshell"
    },
    {
      "colorId": "bm-hc-172",
      "tag": "vibe_match",
      "score": {
        "overall": 85,
        "vibeMatch": 0.94,
        "lightingTolerance": 0.78,
        "undertoneSafety": 0.82,
        "depthMatch": 1.0
      },
      "reasoning": "Nails the cozy, calm vibe with gentle warmth.",
      "suggestedTrim": {
        "crispOptionId": "bm-oc-17",
        "warmOptionId": "bm-oc-131"
      },
      "suggestedFinish": "matte"
    },
    {
      "colorId": "sw-6119",
      "tag": "vibe_match",
      "score": {
        "overall": 83,
        "vibeMatch": 0.91,
        "lightingTolerance": 0.76,
        "undertoneSafety": 0.85,
        "depthMatch": 1.0
      },
      "reasoning": "A softer neutral that feels restful without looking flat.",
      "suggestedTrim": {
        "crispOptionId": "sw-7757",
        "warmOptionId": "sw-7012"
      },
      "suggestedFinish": "eggshell"
    },
    {
      "colorId": "bm-2163-40",
      "tag": "wildcard",
      "score": {
        "overall": 74,
        "vibeMatch": 0.89,
        "lightingTolerance": 0.65,
        "undertoneSafety": 0.72,
        "depthMatch": 0.9
      },
      "reasoning": "A bit bolder — adds personality while staying within your comfort zone.",
      "suggestedTrim": {
        "crispOptionId": "bm-oc-17",
        "warmOptionId": "bm-oc-65"
      },
      "suggestedFinish": "eggshell"
    }
  ],
  "samplingPlan": {
    "placements": [
      "Near the door frame or trim",
      "In the darkest corner of the room",
      "On the main wall at eye level"
    ],
    "timesToCheck": [
      "Morning with natural light",
      "Afternoon at peak brightness",
      "Evening with your warm bulbs on"
    ],
    "alternates": [
      {
        "ifLooksToo": "pink",
        "tryInstead": ["sw-7015", "bm-oc-28"]
      },
      {
        "ifLooksToo": "yellow",
        "tryInstead": ["bm-hc-172", "sw-6119"]
      }
    ]
  },
  "createdAt": "2026-01-02T10:36:00Z"
}
```

---

### 5.4 Brand

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Brand",
  "type": "object",
  "required": ["id", "name", "shortCode"],
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "shortCode": {
      "type": "string",
      "description": "Abbreviation used in UI and data (e.g., 'BM', 'SW')"
    },
    "website": {
      "type": "string",
      "format": "uri"
    },
    "colorSearchUrl": {
      "type": "string",
      "description": "URL template for deep-linking to color pages"
    },
    "retailers": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Common retailers that carry this brand"
    },
    "productLines": {
      "type": "array",
      "items": { "type": "string" },
      "description": "References to ProductLine objects"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "bm",
  "name": "Benjamin Moore",
  "shortCode": "BM",
  "website": "https://www.benjaminmoore.com",
  "colorSearchUrl": "https://www.benjaminmoore.com/en-us/paint-colors/color/{code}",
  "retailers": ["Benjamin Moore dealers", "Ace Hardware", "independent paint stores"],
  "productLines": ["bm-regal", "bm-aura", "bm-advance", "bm-scuffx"]
}
```

---

### 5.5 Palette (Collection)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Palette",
  "type": "object",
  "required": ["id", "name", "colors"],
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": ["editorial", "trend", "user_saved", "room_based"]
    },
    "colors": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of color IDs"
    },
    "heroImageUrl": {
      "type": "string",
      "format": "uri"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "year": {
      "type": "integer"
    },
    "featured": {
      "type": "boolean"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "palette-soft-sanctuary",
  "name": "Soft Sanctuary",
  "description": "Quiet, enveloping neutrals for spaces that restore.",
  "type": "editorial",
  "colors": ["bm-oc-20", "sw-7015", "bm-hc-172", "sw-6119", "bm-2163-40"],
  "heroImageUrl": "https://cdn.thecoloredit.app/palettes/soft-sanctuary.jpg",
  "tags": ["neutral", "calm", "bedroom", "2026"],
  "year": 2026,
  "featured": true
}
```

---

### 5.6 Store

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Store",
  "type": "object",
  "required": ["id", "name", "location"],
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "brandAffiliation": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Brand IDs this store carries"
    },
    "storeType": {
      "type": "string",
      "enum": ["brand_store", "big_box", "hardware", "independent", "unknown"]
    },
    "location": {
      "type": "object",
      "required": ["lat", "lon", "address"],
      "properties": {
        "lat": { "type": "number" },
        "lon": { "type": "number" },
        "address": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zip": { "type": "string" }
      }
    },
    "phone": {
      "type": "string"
    },
    "hours": {
      "type": "object",
      "description": "Operating hours by day"
    },
    "source": {
      "type": "string",
      "enum": ["apple_maps", "google", "manual"]
    },
    "isFavorite": {
      "type": "boolean"
    },
    "lastVerified": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "store-12345",
  "name": "Sherwin-Williams - Downtown",
  "brandAffiliation": ["sw"],
  "storeType": "brand_store",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060,
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "phone": "+1-212-555-0123",
  "hours": {
    "monday": "7:00 AM - 6:00 PM",
    "tuesday": "7:00 AM - 6:00 PM",
    "wednesday": "7:00 AM - 6:00 PM",
    "thursday": "7:00 AM - 6:00 PM",
    "friday": "7:00 AM - 6:00 PM",
    "saturday": "8:00 AM - 5:00 PM",
    "sunday": "10:00 AM - 4:00 PM"
  },
  "source": "apple_maps",
  "isFavorite": true,
  "lastVerified": "2026-01-01T12:00:00Z"
}
```

---

### 5.7 ProductLine

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProductLine",
  "type": "object",
  "required": ["id", "brand", "name", "tier"],
  "properties": {
    "id": {
      "type": "string"
    },
    "brand": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "tier": {
      "type": "string",
      "enum": ["good", "better", "best"]
    },
    "useCases": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["walls", "trim", "doors", "cabinets", "ceiling", "exterior"]
      }
    },
    "sheensSupported": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["flat", "matte", "eggshell", "satin", "semigloss", "gloss"]
      }
    },
    "durabilityScore": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "moistureScore": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "scuffResistance": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "touchUpFriendliness": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "vocLevel": {
      "type": "string",
      "enum": ["standard", "low", "zero"]
    },
    "priceTier": {
      "type": "string",
      "enum": ["budget", "mid", "premium"]
    },
    "dryTime": {
      "type": "string",
      "description": "Human-readable dry time"
    },
    "cureTime": {
      "type": "string",
      "description": "Human-readable cure time"
    },
    "notes": {
      "type": "string"
    }
  }
}
```

**Example Instance:**

```json
{
  "id": "bm-regal",
  "brand": "bm",
  "name": "Regal Select",
  "tier": "better",
  "useCases": ["walls"],
  "sheensSupported": ["flat", "matte", "eggshell", "satin", "semigloss"],
  "durabilityScore": 0.8,
  "moistureScore": 0.75,
  "scuffResistance": 0.78,
  "touchUpFriendliness": 0.85,
  "vocLevel": "low",
  "priceTier": "mid",
  "dryTime": "1 hour to touch",
  "cureTime": "14 days for full cure",
  "notes": "Great all-around choice for most rooms. Excellent coverage and hide."
}
```

---

### 5.8 ProductRecommendation

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProductRecommendation",
  "type": "object",
  "required": ["id", "paintColorId", "productLineId", "sheen"],
  "properties": {
    "id": {
      "type": "string"
    },
    "paintColorId": {
      "type": "string"
    },
    "productLineId": {
      "type": "string"
    },
    "sheen": {
      "type": "string",
      "enum": ["flat", "matte", "eggshell", "satin", "semigloss", "gloss"]
    },
    "primerNeeded": {
      "type": "boolean"
    },
    "primerType": {
      "type": "string",
      "enum": ["drywall", "bonding", "stain_blocking", "masonry", null]
    },
    "primerProductId": {
      "type": "string"
    },
    "quantityEstimate": {
      "type": "object",
      "properties": {
        "gallons": { "type": "number" },
        "coats": { "type": "integer" },
        "sqftCoverage": { "type": "integer" }
      }
    },
    "reasoning": {
      "type": "string"
    },
    "cautions": {
      "type": "string"
    },
    "deepLinks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "retailer": { "type": "string" },
          "url": { "type": "string", "format": "uri" },
          "storeId": { "type": "string" }
        }
      }
    }
  }
}
```

---

### 5.9 ShoppingListItem

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ShoppingListItem",
  "type": "object",
  "required": ["id", "roomName", "surface", "colorId"],
  "properties": {
    "id": {
      "type": "string"
    },
    "roomName": {
      "type": "string"
    },
    "surface": {
      "type": "string",
      "enum": ["walls", "trim", "doors", "cabinets", "ceiling", "exterior"]
    },
    "colorId": {
      "type": "string"
    },
    "colorName": {
      "type": "string"
    },
    "colorCode": {
      "type": "string"
    },
    "brand": {
      "type": "string"
    },
    "productLineId": {
      "type": "string"
    },
    "productLineName": {
      "type": "string"
    },
    "sheen": {
      "type": "string"
    },
    "base": {
      "type": "string",
      "enum": ["light", "medium", "deep", "ultradeep"]
    },
    "quantity": {
      "type": "object",
      "properties": {
        "gallons": { "type": "number" },
        "coats": { "type": "integer" }
      }
    },
    "primer": {
      "type": "object",
      "properties": {
        "needed": { "type": "boolean" },
        "type": { "type": "string" },
        "gallons": { "type": "number" }
      }
    },
    "supplies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item": { "type": "string" },
          "recommendation": { "type": "string" }
        }
      }
    },
    "callAheadScript": {
      "type": "string",
      "description": "Pre-formatted script for calling the store"
    }
  }
}
```

---

## 6. Recommendation Engine

### 6.1 Computing Undertone Tags from Lab/LCH

```python
def compute_undertone(lab: dict, lrv: float) -> dict:
    """
    Compute undertone tags from Lab color values.

    Lab values:
    - L: 0-100 (lightness)
    - a: negative = green, positive = red/pink
    - b: negative = blue, positive = yellow
    """
    l, a, b = lab['l'], lab['a'], lab['b']

    # Temperature: based on overall warmth
    # Warm = positive a and/or positive b
    # Cool = negative a and/or negative b
    warmth_score = (a * 0.6) + (b * 0.4)

    if warmth_score > 2:
        temperature = "warm"
    elif warmth_score < -2:
        temperature = "cool"
    else:
        temperature = "neutral"

    # Primary undertone lean
    leans_primary = "neutral"
    leans_secondary = None

    # Thresholds for undertone detection (adjust based on testing)
    if a < -3 and b > 3:
        leans_primary = "green"  # Negative a + positive b
    elif a < -3 and b < -3:
        leans_primary = "blue"   # Both negative
    elif a < -3:
        leans_primary = "blue"   # Negative a, neutral b
    elif a > 4 and b < -2:
        leans_primary = "purple" # Positive a + negative b
    elif a > 4:
        leans_primary = "pink"   # Positive a, neutral/positive b
    elif b > 6:
        leans_primary = "yellow" # Strong positive b
    elif b > 3 and a > 0:
        leans_primary = "orange" # Warm yellow-red

    # Secondary undertone for complex colors
    if leans_primary == "green" and a > -5:
        leans_secondary = "yellow"
    elif leans_primary == "pink" and b > 3:
        leans_secondary = "yellow"

    return {
        "temperature": temperature,
        "leansPrimary": leans_primary,
        "leansSecondary": leans_secondary
    }
```

### 6.2 Computing Stability Rating

```python
def compute_stability(lab: dict, lrv: float) -> float:
    """
    Estimate how much a color shifts under different lighting.

    Factors that reduce stability:
    - High chroma (saturated colors shift more)
    - Certain undertone combinations
    - Very light or very dark colors
    - Colors near metamerism-prone zones

    Returns: 0-1 (1 = very stable)
    """
    l, a, b = lab['l'], lab['a'], lab['b']

    # Calculate chroma (saturation in LCH)
    chroma = (a**2 + b**2) ** 0.5

    # Base stability (neutral gray = most stable)
    stability = 1.0

    # Penalize high chroma
    # Low chroma (< 5) = stable, high chroma (> 20) = unstable
    chroma_penalty = min(chroma / 30, 0.4)
    stability -= chroma_penalty

    # Penalize colors with complex undertones (green-yellows, purple-grays)
    if (a < -2 and b > 2) or (a > 2 and b < -2):
        stability -= 0.15  # Complex undertone = less predictable

    # Penalize very light colors (more sensitive to reflected light)
    if lrv > 75:
        stability -= 0.1

    # Penalize very dark colors (harder to see true undertone)
    if lrv < 15:
        stability -= 0.1

    # Metamerism-prone zones (greens and mauves)
    if -8 < a < -2 and 5 < b < 15:  # Green-yellow zone
        stability -= 0.1
    if 2 < a < 8 and -8 < b < 0:    # Mauve-purple zone
        stability -= 0.1

    return max(0.3, min(1.0, stability))
```

### 6.3 Depth Category from LRV

```python
def compute_depth_category(lrv: float) -> str:
    """
    Categorize color depth based on Light Reflectance Value.
    """
    if lrv >= 55:
        return "light"
    elif lrv >= 25:
        return "mid"
    else:
        return "dark"
```

### 6.4 Scoring Model for Shortlist 5

```python
def compute_overall_score(
    color: dict,
    profile: dict,
    weights: dict = None
) -> dict:
    """
    Score a candidate color against user preferences.

    Returns dict with overall score and component scores.
    """
    if weights is None:
        weights = {
            'vibe': 0.30,
            'lighting': 0.25,
            'undertone': 0.25,
            'depth': 0.15,
            'trend': 0.05
        }

    scores = {}

    # 1. Vibe Match
    scores['vibeMatch'] = compute_vibe_match(color, profile['vibe'])

    # 2. Lighting Tolerance
    scores['lightingTolerance'] = compute_lighting_tolerance(
        color,
        profile['lighting']
    )

    # 3. Undertone Safety
    scores['undertoneSafety'] = compute_undertone_safety(
        color['undertone'],
        profile.get('undertoneFears', [])
    )

    # 4. Depth Match
    scores['depthMatch'] = compute_depth_match(
        color['depthCategory'],
        profile.get('depthPreference', 'any')
    )

    # 5. Trend Fit (optional)
    scores['trendFit'] = color.get('popularity', 0.5)

    # Calculate weighted overall
    overall = (
        weights['vibe'] * scores['vibeMatch'] +
        weights['lighting'] * scores['lightingTolerance'] +
        weights['undertone'] * scores['undertoneSafety'] +
        weights['depth'] * scores['depthMatch'] +
        weights['trend'] * scores['trendFit']
    )

    scores['overall'] = round(overall * 100)

    return scores


def compute_vibe_match(color: dict, vibe: dict) -> float:
    """
    Match color attributes to user's cozy/crisp + calm/moody preferences.

    Vibe is 0-100 for each axis:
    - cozyToCrisp: 0 = very cozy, 100 = very crisp
    - calmToMoody: 0 = very calm, 100 = very moody
    """
    lab = color['lab']
    lrv = color['lrv']
    chroma = (lab['a']**2 + lab['b']**2) ** 0.5

    cozy_crisp = vibe.get('cozyToCrisp', 50)
    calm_moody = vibe.get('calmToMoody', 50)

    # Cozy colors: warm (positive a/b), lower chroma, medium LRV
    # Crisp colors: cool (negative a/b), clean, lighter LRV
    warmth = (lab['a'] * 0.6) + (lab['b'] * 0.4)

    # User wants cozy (low value) = prefer warm colors
    # User wants crisp (high value) = prefer cool colors
    if cozy_crisp < 50:
        temp_match = (warmth + 10) / 20  # Normalize warm to 0-1
    else:
        temp_match = (-warmth + 10) / 20  # Normalize cool to 0-1
    temp_match = max(0, min(1, temp_match))

    # Calm colors: low chroma, higher LRV
    # Moody colors: can be higher chroma or darker
    if calm_moody < 50:
        mood_match = (1 - (chroma / 30)) * 0.5 + (lrv / 100) * 0.5
    else:
        mood_match = (chroma / 30) * 0.3 + (1 - lrv / 100) * 0.7
    mood_match = max(0, min(1, mood_match))

    return (temp_match + mood_match) / 2


def compute_lighting_tolerance(color: dict, lighting: dict) -> float:
    """
    Score based on color stability and user's lighting certainty.
    """
    stability = color.get('stability', 0.7)

    # If user is uncertain about lighting, penalize unstable colors more
    uncertainty_factors = [
        lighting.get('direction') == 'unknown',
        lighting.get('bulbTemp') == 'unknown',
        lighting.get('primaryUsage') == 'both'
    ]
    uncertainty = sum(uncertainty_factors) / 3

    # More uncertainty = rely more heavily on stability
    base_tolerance = stability
    uncertainty_penalty = uncertainty * (1 - stability) * 0.3

    return max(0.3, base_tolerance - uncertainty_penalty)


def compute_undertone_safety(undertone: dict, fears: list) -> float:
    """
    Penalize colors that match user's undertone fears.
    """
    fear_mapping = {
        'fear_green': 'green',
        'fear_pink': 'pink',
        'fear_purple': 'purple',
        'fear_babyblue': 'blue',
        'fear_dingy': 'neutral',  # Dingy = dull neutral
        'fear_yellow': 'yellow'
    }

    if not fears:
        return 1.0

    primary = undertone.get('leansPrimary', 'neutral')
    secondary = undertone.get('leansSecondary')

    penalty = 0
    for fear in fears:
        feared_undertone = fear_mapping.get(fear)
        if feared_undertone == primary:
            penalty += 0.5
        elif feared_undertone == secondary:
            penalty += 0.25

    return max(0.2, 1.0 - penalty)


def compute_depth_match(color_depth: str, preference: str) -> float:
    """
    Match color depth to user preference.
    """
    if preference == 'any':
        return 0.8

    if color_depth == preference:
        return 1.0

    # Adjacent matches (light-mid, mid-dark)
    adjacent = {
        ('light', 'mid'): 0.6,
        ('mid', 'light'): 0.6,
        ('mid', 'dark'): 0.6,
        ('dark', 'mid'): 0.6,
        ('light', 'dark'): 0.3,
        ('dark', 'light'): 0.3,
    }

    return adjacent.get((color_depth, preference), 0.5)
```

### 6.5 Building the Shortlist 5

```python
def build_shortlist(
    candidates: list,
    profile: dict,
    count: int = 5
) -> list:
    """
    Build the final shortlist from scored candidates.

    Output structure:
    - 2 Safe Wins (high stability + high undertone safety)
    - 2 Vibe Matches (top vibe alignment)
    - 1 Wildcard (high vibe but lower safety)
    """
    # Score all candidates
    scored = []
    for color in candidates:
        scores = compute_overall_score(color, profile)
        scored.append({
            'color': color,
            'scores': scores
        })

    # Sort by overall score
    scored.sort(key=lambda x: x['scores']['overall'], reverse=True)

    shortlist = []
    used_ids = set()

    # 1. Pick 2 Safe Wins
    # Highest overall where stability + undertone safety are both high
    safe_candidates = [
        s for s in scored
        if s['scores']['lightingTolerance'] >= 0.75
        and s['scores']['undertoneSafety'] >= 0.8
    ]
    for candidate in safe_candidates[:2]:
        if candidate['color']['id'] not in used_ids:
            shortlist.append({
                **candidate,
                'tag': 'safe_win'
            })
            used_ids.add(candidate['color']['id'])

    # 2. Pick 2 Vibe Matches
    # Highest vibe_match among remaining
    vibe_candidates = [
        s for s in scored
        if s['color']['id'] not in used_ids
    ]
    vibe_candidates.sort(
        key=lambda x: x['scores']['vibeMatch'],
        reverse=True
    )
    for candidate in vibe_candidates[:2]:
        if candidate['color']['id'] not in used_ids:
            shortlist.append({
                **candidate,
                'tag': 'vibe_match'
            })
            used_ids.add(candidate['color']['id'])

    # 3. Pick 1 Wildcard
    # High vibe but slightly lower safety — still acceptable
    wildcard_candidates = [
        s for s in scored
        if s['color']['id'] not in used_ids
        and s['scores']['vibeMatch'] >= 0.7
        and s['scores']['undertoneSafety'] >= 0.5  # Still acceptable
    ]
    if wildcard_candidates:
        # Sort by vibe, pick first
        wildcard_candidates.sort(
            key=lambda x: x['scores']['vibeMatch'],
            reverse=True
        )
        shortlist.append({
            **wildcard_candidates[0],
            'tag': 'wildcard'
        })

    return shortlist[:count]
```

### 6.6 Trim Recommendation Logic

```python
def recommend_trim(
    wall_color: dict,
    vibe: dict,
    trim_options: list
) -> dict:
    """
    Recommend trim whites based on wall color and user preferences.

    Returns: { crispOptionId, warmOptionId }
    """
    wall_undertone = wall_color['undertone']
    cozy_crisp = vibe.get('cozyToCrisp', 50)

    # Filter trim candidates (whites with LRV > 80)
    white_trims = [t for t in trim_options if t['lrv'] > 80]

    # Separate into warm and crisp whites
    warm_whites = [
        t for t in white_trims
        if t['undertone']['temperature'] == 'warm'
    ]
    crisp_whites = [
        t for t in white_trims
        if t['undertone']['temperature'] in ['cool', 'neutral']
    ]

    # Avoid amplifying problematic undertones
    # If wall leans green, avoid whites that also lean green
    def undertone_compatible(wall_ut, trim_ut):
        wall_lean = wall_ut.get('leansPrimary', 'neutral')
        trim_lean = trim_ut.get('leansPrimary', 'neutral')

        # Avoid matching problematic undertones
        if wall_lean in ['green', 'pink', 'purple']:
            return trim_lean != wall_lean
        return True

    # Filter for compatibility
    warm_whites = [
        t for t in warm_whites
        if undertone_compatible(wall_undertone, t['undertone'])
    ]
    crisp_whites = [
        t for t in crisp_whites
        if undertone_compatible(wall_undertone, t['undertone'])
    ]

    # Pick top options by popularity/stability
    warm_option = max(warm_whites, key=lambda t: t.get('popularity', 0.5), default=None)
    crisp_option = max(crisp_whites, key=lambda t: t.get('popularity', 0.5), default=None)

    return {
        'crispOptionId': crisp_option['id'] if crisp_option else None,
        'warmOptionId': warm_option['id'] if warm_option else None
    }
```

### 6.7 Finish Recommendation Logic

```python
def recommend_finish(
    room_type: str,
    surface: str,
    priorities: list = None,
    no_regrets_mode: bool = False
) -> str:
    """
    Recommend paint finish based on room, surface, and priorities.
    """
    if priorities is None:
        priorities = []

    # Surface-specific defaults
    surface_defaults = {
        'trim': 'semigloss',
        'doors': 'semigloss',
        'cabinets': 'semigloss',
        'ceiling': 'flat'
    }

    if surface in surface_defaults:
        return surface_defaults[surface]

    # Room-specific wall defaults
    room_defaults = {
        'bathroom': 'satin',
        'kitchen': 'eggshell',
        'hallway': 'eggshell',
        'kids': 'satin',
        'nursery': 'eggshell',
        'living': 'eggshell',
        'bedroom': 'matte',
        'office': 'eggshell'
    }

    base_finish = room_defaults.get(room_type, 'eggshell')

    # Adjust based on priorities
    if 'wipe_clean' in priorities or 'scuff_resistance' in priorities:
        if base_finish == 'matte':
            base_finish = 'eggshell'
        elif base_finish == 'eggshell':
            base_finish = 'satin'

    if 'hide_flaws' in priorities:
        if base_finish == 'satin':
            base_finish = 'eggshell'
        elif base_finish == 'eggshell':
            base_finish = 'matte'

    # No-regrets mode: default to more durable
    if no_regrets_mode:
        if base_finish == 'matte':
            base_finish = 'eggshell'

    return base_finish
```

### 6.8 Cross-Brand Color Matching

```python
import math

def ciede2000(lab1: dict, lab2: dict) -> float:
    """
    Calculate CIEDE2000 color difference.
    Simplified implementation - use a proper library in production.

    Returns: ΔE (lower = more similar)
    """
    # This is a simplified version - production should use colormath library
    L1, a1, b1 = lab1['l'], lab1['a'], lab1['b']
    L2, a2, b2 = lab2['l'], lab2['a'], lab2['b']

    # Simple Euclidean as placeholder (replace with proper CIEDE2000)
    delta_e = math.sqrt(
        (L2 - L1)**2 +
        (a2 - a1)**2 +
        (b2 - b1)**2
    )

    return delta_e


def find_cross_brand_matches(
    source_color: dict,
    candidates: list,
    max_delta_e: float = 5.0,
    limit: int = 5
) -> list:
    """
    Find matching colors from other brands.

    Returns list of matches with quality scores.
    """
    source_brand = source_color['brand']
    source_lab = source_color['lab']

    matches = []

    for candidate in candidates:
        # Skip same brand
        if candidate['brand'] == source_brand:
            continue

        delta_e = ciede2000(source_lab, candidate['lab'])

        if delta_e <= max_delta_e:
            # Match quality: inverse of delta_e, scaled to 0-100
            quality = max(0, 100 - (delta_e * 10))

            matches.append({
                'colorId': candidate['id'],
                'brand': candidate['brand'],
                'name': candidate['name'],
                'code': candidate['code'],
                'deltaE': round(delta_e, 2),
                'matchQuality': round(quality)
            })

    # Sort by quality (best matches first)
    matches.sort(key=lambda x: x['matchQuality'], reverse=True)

    return matches[:limit]
```

---

## 7. Buy Nearby Module

### 7.1 Store Discovery

**Search Keywords for MapKit:**
```swift
let searchQueries = [
    "Sherwin-Williams",
    "Benjamin Moore",
    "Home Depot",
    "Lowe's",
    "Ace Hardware",
    "True Value",
    "PPG Paints",
    "paint store",
    "hardware store"
]
```

**Store List Card UI:**
```
┌─────────────────────────────────────────┐
│  Sherwin-Williams                       │
│  Downtown                               │
│  0.8 mi · Open until 6 PM               │
│                                         │
│  Carries: SW                            │
│                                         │
│  [ Directions ]  [ Call ]  [ ♡ Save ]   │
└─────────────────────────────────────────┘
```

**Button Labels:**
| Label | Action |
|-------|--------|
| `Directions` | Opens Maps with route |
| `Call` | Opens phone dialer |
| `Save as preferred` | Adds to favorites |
| `Set as my store` | Primary store for shopping |

### 7.2 Availability (MVP Approach)

**No scraping.** Instead, provide:

1. **Call-ahead Script** (one-tap copy):
```
"Hi, I'm looking for [Brand] [Product Line],
[Sheen] finish, [Base] base, 1 gallon,
color code [CODE]. Do you have it in stock
or can you mix it today?"
```

2. **Retailer Deep Links** (V2):
- Link to brand's online color page
- Link to retailer's store locator with product context

### 7.3 Preferred Stores

**Screen: My Stores**

```
┌─────────────────────────────────────────┐
│  My Preferred Stores                    │
│                                         │
│  ★ Sherwin-Williams Downtown    0.8 mi  │
│    Primary for: SW colors               │
│                                         │
│  ★ Home Depot Suburban          2.1 mi  │
│    Primary for: Behr, PPG               │
│                                         │
│  [ + Add another store ]                │
└─────────────────────────────────────────┘
```

---

## 8. Paint Product Picker

### 8.1 Flow Location

After "Shortlist 5" → each color card has button: `Choose paint type & finish`

Shopping list updates automatically after wizard completion.

### 8.2 Wizard Steps (10-15 taps)

#### Step 1: What are you painting?

**Prompt:** `What surface?`

| Label | Value |
|-------|-------|
| `Walls` | `walls` |
| `Trim` | `trim` |
| `Doors` | `doors` |
| `Cabinets` | `cabinets` |
| `Ceiling` | `ceiling` |
| `Exterior siding` | `exterior_siding` |
| `Exterior trim/doors` | `exterior_trim` |
| `Brick / masonry` | `masonry` |

---

#### Step 2: Where is it?

**Prompt:** `What room?`

| Label | Value |
|-------|-------|
| `Bedroom` | `bedroom` |
| `Living / dining` | `living` |
| `Kitchen` | `kitchen` |
| `Bathroom` | `bathroom` |
| `Hallway / entry` | `hallway` |
| `Kids room / playroom` | `kids` |
| `Laundry / utility` | `utility` |
| `Exterior` | `exterior` |

---

#### Step 3: Surface condition

**Prompt:** `What's the surface like now?`

| Label | Value |
|-------|-------|
| `New drywall` | `new_drywall` |
| `Previously painted (good shape)` | `painted_good` |
| `Previously painted (rough/chalky)` | `painted_rough` |
| `Glossy surface (semi-gloss/oil)` | `glossy` |
| `Stained wood or tannins` | `stained_wood` |
| `Cabinet (factory finish)` | `cabinet_slick` |
| `Brick / masonry` | `masonry` |

---

#### Step 4: Priorities

**Prompt:** `What matters most? (pick up to 2)`

| Label | Value |
|-------|-------|
| `Easy wipe-clean` | `wipe_clean` |
| `Scuff resistance` | `scuff_resistance` |
| `Moisture resistance` | `moisture` |
| `Best touch-ups` | `touch_up` |
| `Lowest odor / low VOC` | `low_voc` |
| `Budget-friendly` | `budget` |
| `One-coat coverage` | `one_coat` |

---

#### Step 5: Sheen preference

**Prompt:** `What sheen?`

| Label | Helper | Value |
|-------|--------|-------|
| `Matte` | Soft, hides flaws, marks easier | `matte` |
| `Eggshell` | The safe default for most rooms | `eggshell` |
| `Satin` | More wipeable, shows more texture | `satin` |
| `Semi-gloss` | Trim/doors, high wipeability | `semigloss` |
| `Not sure` | We'll choose for you | `auto` |

**Popover: "Help me choose sheen"**
| Prompt | Recommendation |
|--------|----------------|
| `I want to hide wall texture` | Matte or Eggshell |
| `I have kids & sticky hands` | Eggshell or Satin |
| `I hate seeing roller marks` | Eggshell |
| `I want it to look luxe & soft` | Matte |
| `This is a bathroom` | Satin (walls), Semi-gloss (trim) |

---

#### Step 6: Brand availability

**Prompt:** `Which brands work for you?`

| Label | Value |
|-------|-------|
| `Any brand` | `any` |
| `Sherwin-Williams` | `sw` |
| `Benjamin Moore` | `bm` |
| `Home Depot brands` | `hd` |
| `Lowe's brands` | `lowes` |
| `Match my preferred store` | `store_match` |

---

#### Step 7: No-Regrets Mode

**Toggle:** `No-regrets mode`

**Helper text:** `Defaults to forgiving sheen + high durability. Perfect for busy households.`

| State | Behavior |
|-------|----------|
| ON | Upgrades matte → eggshell, boosts tier to "Better" minimum |
| OFF | Allows delicate matte and specialty choices |

---

### 8.3 Output Card

```
┌─────────────────────────────────────────┐
│  Paint Spec for: Hallway Walls          │
│                                         │
│  Recommended line: Better tier          │
│  Regal Select (Benjamin Moore)          │
│  "Great all-around washability."        │
│                                         │
│  Sheen: Eggshell                        │
│  "Chosen for wipeability without        │
│   looking shiny."                       │
│                                         │
│  Primer: Yes — Drywall primer           │
│  "New drywall needs sealing first."     │
│                                         │
│  Base: Light (auto-filled)              │
│  Coats: 2 (typical)                     │
│  Cure: Handle gently for 2–4 weeks      │
│                                         │
│  [ Add to list ]  [ Compare ]  [ Find ] │
└─────────────────────────────────────────┘
```

### 8.4 Primer Rules

**Show "Primer needed?" as YES/NO with one sentence why.**

| Condition | Primer Needed | Type | Reason |
|-----------|---------------|------|--------|
| New drywall | Yes | Drywall | Seals porous surface |
| Lots of spackle/patches | Yes | Drywall | Evens absorption |
| Dark → very light | Yes | Any | Prevents bleed-through |
| Glossy/oil surface | Yes | Bonding | Creates tooth for adhesion |
| Stained wood/tannins | Yes | Stain-blocking | Prevents bleed |
| Cabinets (slick) | Yes | Bonding | Adhesion on smooth surface |
| Masonry/brick | Yes | Masonry | Controls alkali, seals |
| Good previously painted | No | — | Existing paint is fine base |

**Primer type buttons:**
| Label | Value |
|-------|-------|
| `Drywall primer` | `drywall` |
| `Bonding primer` | `bonding` |
| `Stain-blocking primer` | `stain_blocking` |
| `Masonry primer` | `masonry` |
| `Not sure — choose for me` | `auto` |

### 8.5 Good/Better/Best Tier Mapping

**Sherwin-Williams:**
| Use Case | Better | Best |
|----------|--------|------|
| Walls | Duration Home | Emerald Interior |
| Trim/Doors | ProClassic Enamel | Emerald Urethane |
| Cabinets | ProClassic Enamel | Emerald Urethane |

**Benjamin Moore:**
| Use Case | Better | Best |
|----------|--------|------|
| Walls | Regal Select | Aura / Scuff-X |
| Trim/Doors | Advance | Advance |
| Cabinets | Advance | Advance |

**Home Depot (Behr):**
| Use Case | Good | Better | Best |
|----------|------|--------|------|
| Walls | Pro | Ultra | Dynasty/Marquee |
| Trim | Ultra | Ultra | — |

**In-app copy:**
> "Best is worth it for hallways, kids' rooms, and kitchens. Better is plenty for low-traffic bedrooms."

---

## 9. Quantity Estimator

### 9.1 Wall Estimate Wizard

**Step 1: Ceiling height**
| Label | Value (ft) |
|-------|------------|
| `8 feet` | `8` |
| `9 feet` | `9` |
| `10 feet` | `10` |
| `Vaulted / varies` | `12` |

**Step 2: Room size**
| Label | Approx sq ft walls |
|-------|-------------------|
| `Small (bathroom, closet)` | 200 |
| `Medium (bedroom, office)` | 400 |
| `Large (living room, primary)` | 600 |
| `Very large (great room)` | 900 |
| `I'll enter dimensions` | custom |

**Step 3 (if custom): Enter dimensions**
- Length (ft): `____`
- Width (ft): `____`

**Step 4: Windows/doors**
| Label | Deduction |
|-------|-----------|
| `Few (1-2 windows)` | 20 sq ft |
| `Average (2-4 windows, 1-2 doors)` | 50 sq ft |
| `Many (lots of glass)` | 100 sq ft |

### 9.2 Calculation Logic

```python
def estimate_paint_quantity(
    wall_sqft: int,
    coats: int = 2,
    coverage_per_gallon: int = 375,
    buffer: float = 0.1
) -> dict:
    """
    Estimate gallons needed.

    Default coverage: 375 sq ft/gallon (conservative)
    Default: 2 coats
    Buffer: 10% extra
    """
    total_coverage_needed = wall_sqft * coats
    gallons_needed = total_coverage_needed / coverage_per_gallon
    gallons_with_buffer = gallons_needed * (1 + buffer)

    # Round up to nearest practical unit
    if gallons_with_buffer <= 1.2:
        recommendation = 1
        size = "gallon"
    elif gallons_with_buffer <= 2.5:
        recommendation = 2
        size = "gallons"
    elif gallons_with_buffer <= 4:
        recommendation = 1
        size = "5-gallon bucket"
    else:
        recommendation = math.ceil(gallons_with_buffer)
        size = "gallons"

    return {
        "calculatedGallons": round(gallons_with_buffer, 1),
        "recommendation": recommendation,
        "size": size,
        "coats": coats,
        "sqftCoverage": coverage_per_gallon,
        "note": "Includes 10% buffer for touch-ups and waste"
    }
```

### 9.3 Trim Estimate

| Label | Typical gallons |
|-------|-----------------|
| `Minimal (one door, baseboards only)` | 0.5 |
| `Normal (baseboards + door frames)` | 1 |
| `Lots (crown molding, wainscoting)` | 1.5–2 |

---

## 10. Shopping List

### 10.1 List Item Display

```
┌─────────────────────────────────────────┐
│  Hallway — Walls                        │
│                                         │
│  Pale Oak (OC-20)                       │
│  Benjamin Moore · Regal Select          │
│  Eggshell · Light Base                  │
│                                         │
│  Quantity: 2 gallons (2 coats)          │
│                                         │
│  Primer: Drywall primer, 1 gallon       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Call-ahead script          [📋] │    │
│  │ "Hi, I'm looking for Benjamin   │    │
│  │  Moore Regal Select, Eggshell,  │    │
│  │  Light base, 2 gallons, color   │    │
│  │  OC-20 Pale Oak..."             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [ Find at my store ]                   │
└─────────────────────────────────────────┘
```

### 10.2 Export Options

| Label | Format |
|-------|--------|
| `Copy as text` | Plain text to clipboard |
| `Share list` | iOS share sheet |
| `Email to myself` | Opens mail with list |
| `Save as PDF` | Generates PDF |

### 10.3 Supplies Recommendations

| Roller nap by surface |
|-----------------------|
| Smooth walls: 3/8" nap |
| Textured walls: 1/2" nap |
| Rough texture: 3/4" nap |
| Cabinets: Foam roller or 1/4" velour |

---

## 11. Risks & Mitigations

### 11.1 Digital Swatches Vary

**Risk:** Colors display differently on every screen. OLED vs LCD, brightness settings, ambient light all affect perception.

**Mitigation UX:**

**Disclaimer (shown on first color result):**
> "Digital swatches are a starting point, not a final match. We strongly recommend ordering physical samples before committing."

**Persistent reminder (footer on color cards):**
> "Always test with real samples in your space."

---

### 11.2 LRV Data Quality

**Risk:** Not all paint brands publish LRV. Values may be estimated or missing.

**Mitigation:**
- Calculate approximate LRV from Lab values when missing:
  ```python
  approximate_lrv = lab['l']  # L* correlates closely with LRV
  ```
- Flag "estimated" LRVs in data
- Display confidence indicator for matching

---

### 11.3 Undertone Perception is Subjective

**Risk:** Users may perceive undertones differently based on their vision, context, and expectations.

**Mitigation UX:**

**Educational popover (one-time):**
> "Undertones are tricky — the same color can look different to different people. Our descriptions are based on professional analysis, but trust your own eyes when you see samples in person."

---

### 11.4 Availability Unknown

**Risk:** We can't guarantee a store has stock without real-time inventory APIs.

**Mitigation:**
- Call-ahead script
- "Check availability" links to retailer sites
- Prominent: "Call before you drive"

**Copy:**
> "Stock varies by store. We recommend calling ahead to confirm availability and have them mix your color."

---

### 11.5 Camera Color Matching (Future)

**Risk:** Camera-captured colors are unreliable due to lighting, white balance, camera quality.

**Mitigation (V2):**
- If implemented, show confidence score
- Provide "refine" options
- Strong disclaimer

---

## 12. Roadmap: MVP vs V2

### MVP Features

| Feature | Status |
|---------|--------|
| Room Setup wizard (9 cards) | MVP |
| Shortlist 5 generation | MVP |
| Color cards with reasoning | MVP |
| Trim + finish recommendations | MVP |
| Compare A vs B | MVP |
| Sampling plan | MVP |
| Shopping list export | MVP |
| Store finder (MapKit) | MVP |
| Call-ahead script | MVP |
| Paint Product Picker | MVP |
| Quantity estimator | MVP |

### V2 Features

| Feature | Notes |
|---------|-------|
| AR room preview | Complex; requires ARKit + careful expectation setting |
| Camera color capture | Requires white balance calibration; accuracy concerns |
| True inventory integration | Requires retailer partnerships |
| Deep links with store context | Requires retailer API access |
| Community palettes | User-generated collections |
| Pro mode | For contractors/designers |
| iPad optimization | Larger canvas for comparisons |
| watchOS complications | Quick access to shopping list |
| Retailer partnerships | Affiliate/commerce integration |

---

## Appendix A: Complete Button Copy Reference

### Home Screen
- `Get my 5-swatch shortlist`
- `Browse Collections`
- `My House Palette`

### Room Setup Flow
- `Continue`
- `None of these`
- `No concerns`
- `Any brand`
- `Show me options`
- `Create my 5-swatch shortlist`
- `Not sure — choose for me`
- `I'll decide later`

### Shortlist Screen
- `Compare A vs B`
- `Export list`
- `Find stores`
- `Choose paint type & finish`

### Color Card Actions
- `Compare`
- `Add to list`
- `View paint story`
- `Find nearby`

### Compare Screen
- `Pick left`
- `Pick right`
- `Keep both`

### Product Picker
- `Choose paint type & finish`
- `No-regrets mode`
- `Add to shopping list`
- `Compare to alternative`
- `Find nearby stores`
- `Help me choose sheen`

### Store Finder
- `Directions`
- `Call`
- `Save as preferred`
- `Set as my store`
- `Find another store`

### Shopping List
- `Copy as text`
- `Share list`
- `Email to myself`
- `Save as PDF`
- `Find at my store`

### Sampling Plan
- `Got it — show shopping list`

---

## Appendix B: Example Output for Sample User

### Input Profile

```json
{
  "roomType": "bedroom",
  "lighting": {
    "direction": "south",
    "primaryUsage": "both",
    "bulbTemp": "warm"
  },
  "fixedElements": ["wood_warm", "hardware_brass"],
  "vibe": {
    "cozyToCrisp": 30,
    "calmToMoody": 20
  },
  "undertoneFears": ["fear_pink", "fear_purple"],
  "brandPreferences": ["bm", "sw"],
  "depthPreference": "light"
}
```

### Output: Shortlist 5

#### 1. Safe Win: Pale Oak (Benjamin Moore OC-20)
- **Undertone:** Warm greige with a hint of blush
- **LRV:** 69 (Light)
- **Best in:** South light, warm wood floors
- **Watch out:** Can read pink in cool north light
- **Confidence:** 92
- **Why:** "Balances your warm wood without the pink you're avoiding."
- **Trim:** Chantilly Lace (crisp) / White Dove (warm)
- **Finish:** Eggshell

#### 2. Safe Win: Accessible Beige (Sherwin-Williams SW 7036)
- **Undertone:** True neutral greige
- **LRV:** 58 (Light)
- **Best in:** Any light, flexible neutral
- **Watch out:** Can feel flat in dark rooms
- **Confidence:** 89
- **Why:** "Avoids the pink and purple undertones you flagged."
- **Trim:** Pure White (crisp) / Creamy (warm)
- **Finish:** Eggshell

#### 3. Vibe Match: Revere Pewter (Benjamin Moore HC-172)
- **Undertone:** Warm gray with green undertone
- **LRV:** 55 (Light-Mid)
- **Best in:** Cozy spaces with warm light
- **Watch out:** Green undertone shows in north light
- **Confidence:** 85
- **Why:** "Nails the cozy, calm vibe you're after."
- **Trim:** White Dove (warm) / Simply White (balanced)
- **Finish:** Matte

#### 4. Vibe Match: Antique White (Sherwin-Williams SW 6119)
- **Undertone:** Creamy warm white-beige
- **LRV:** 72 (Light)
- **Best in:** Restful bedrooms, living rooms
- **Watch out:** May feel too yellow in cool light
- **Confidence:** 83
- **Why:** "Soft, calm, and warm without being beige."
- **Trim:** Pure White (crisp) / Dover White (warm)
- **Finish:** Eggshell

#### 5. Wildcard: Soft Chamois (Benjamin Moore OC-13)
- **Undertone:** Warm golden cream
- **LRV:** 65 (Light)
- **Best in:** South-facing rooms, golden hour
- **Watch out:** Can feel too yellow in harsh light
- **Confidence:** 74
- **Why:** "A bit bolder — adds warmth while staying sophisticated."
- **Trim:** White Dove (warm) / Chantilly Lace (crisp)
- **Finish:** Eggshell

### Sampling Plan

**Place samples:**
1. Near your door frame (to see against trim)
2. In the corner farthest from the window
3. On the main wall at eye level

**Check at these times:**
1. Morning with natural light streaming in
2. Afternoon at peak brightness
3. Evening with your warm (2700K) bulbs on

**Compare against:**
- Hold the sample next to your warm wood floors
- Step back and view from across the room

**If it's not right:**
- If Pale Oak looks too pink → try Accessible Beige or Revere Pewter
- If Revere Pewter looks too green → try Accessible Beige or Antique White
- If colors feel too warm overall → try Accessible Beige (truest neutral)

---

*End of Product Specification*
