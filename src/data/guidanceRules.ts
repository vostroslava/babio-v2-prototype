import type {
  BabyProfileV2,
  GuidanceContextV2,
  GuidanceDecisionV2,
  GuidanceResultV2,
  QuickLogPreset,
  SafetyRouteV2,
} from '../types/babio'

export const quickLogPresets: QuickLogPreset[] = [
  {
    kind: 'sleep',
    label: 'Night wake',
    detail: 'Woke at 2:40 AM and stayed awake 45 min',
    askPrompt: 'She woke again at night and stayed awake for 45 minutes.',
  },
  {
    kind: 'feed',
    label: 'Feeding',
    detail: 'Fed 20 min ago and still seems unsettled',
    askPrompt: 'She fed 20 minutes ago and still seems unsettled.',
  },
  {
    kind: 'diaper',
    label: 'Diaper',
    detail: 'Wet diaper logged after the last feed',
    askPrompt: 'How should I think about diapers with feeding and sleep today?',
  },
  {
    kind: 'comfort',
    label: 'Fussy stretch',
    detail: 'Crying on and off during the evening',
    askPrompt: 'She is crying on and off this evening and I need one calm next step.',
  },
]

const hardSafetyPatterns = [
  /\btrouble breathing\b/i,
  /\bhard to breathe\b/i,
  /\bblue\b/i,
  /\bseizure\b/i,
  /\bconvulsion\b/i,
  /\bblood\b/i,
  /\bvery hard to wake\b/i,
  /\bnot waking\b/i,
  /\bdehydration\b/i,
]

const feverPattern = /\b(fever|temperature|temp|38|39|100\.4|102)\b/i

export function isSafetyRoute(result: GuidanceDecisionV2): result is SafetyRouteV2 {
  return result.kind === 'safety'
}

export function buildGuidanceResult(input: string, context: GuidanceContextV2): GuidanceDecisionV2 {
  const normalizedInput = input.trim()
  const lowerInput = normalizedInput.toLowerCase()

  if (needsSafetyRoute(lowerInput, context.profile)) {
    return buildSafetyRoute(context.profile)
  }

  if (hasAny(lowerInput, ['sleep', 'woke', 'wake', 'night', 'nap', 'bedtime'])) {
    return buildSleepGuidance(context)
  }

  if (hasAny(lowerInput, ['feed', 'feeding', 'bottle', 'hungry', 'milk', 'nursing'])) {
    return buildFeedingGuidance(context)
  }

  if (hasAny(lowerInput, ['cry', 'crying', 'fussy', 'unsettled', 'comfort', 'witching'])) {
    return buildComfortGuidance(context)
  }

  if (hasAny(lowerInput, ['doctor', 'pediatrician', 'appointment', 'visit', 'note'])) {
    return buildPediatricianGuidance(context)
  }

  return buildSleepGuidance(context)
}

function needsSafetyRoute(input: string, profile: BabyProfileV2) {
  if (hardSafetyPatterns.some((pattern) => pattern.test(input))) return true
  return profile.ageWeeks <= 12 && feverPattern.test(input)
}

function hasAny(input: string, terms: string[]) {
  return terms.some((term) => input.includes(term))
}

function buildSafetyRoute(profile: BabyProfileV2): SafetyRouteV2 {
  return {
    kind: 'safety',
    title: 'Get direct help now',
    subtitle: `${profile.name}'s safety comes first.`,
    urgentActions: [
      'If breathing looks difficult, call local urgent services now.',
      'If your baby is very hard to wake, seek direct clinical help now.',
      'If fever is present under 3 months, call your pediatrician or urgent line now.',
    ],
    collect: [
      'Time you first noticed it',
      'Temperature reading if you took one',
      'Last feed and last wet diaper',
    ],
    safety: 'Babio cannot replace a clinician. When you are unsure, choose direct help first.',
    noteTitle: 'Urgent care note',
  }
}

function buildSleepGuidance(context: GuidanceContextV2): GuidanceResultV2 {
  const { profile, sourceLog } = context

  return {
    kind: 'guidance',
    topic: 'sleep',
    title: 'One calm step for tonight',
    subtitle: `Based on ${profile.name}, ${profile.ageLabel}, and the latest log.`,
    considered: buildConsidered(context, sourceLog?.detail || 'Recent night waking'),
    tryNow: [
      'Keep the room dim and interactions quiet for the next reset.',
      'Do one diaper and comfort check before changing the plan.',
      'Offer a calm feed if hunger cues are clear, then return to the same sleep cue.',
    ],
    watch: ['Whether this repeats for 3 nights', 'Feed timing and wet diapers', 'How long the next wake lasts'],
    record: ['Wake time', 'How long she stayed awake', 'What helped her settle'],
    safety: 'Call your pediatrician promptly if breathing looks difficult, fever appears, wet diapers drop, or she is very hard to wake.',
    noteTitle: 'Night wake pattern',
  }
}

function buildFeedingGuidance(context: GuidanceContextV2): GuidanceResultV2 {
  const { profile, sourceLog } = context

  return {
    kind: 'guidance',
    topic: 'feeding',
    title: 'Keep the next feed simple',
    subtitle: `Using ${profile.name}'s age, feeding style, and recent log.`,
    considered: buildConsidered(context, sourceLog?.detail || 'Recent feeding question'),
    tryNow: [
      'Look for clear hunger cues before offering more.',
      'Keep the feed calm and pause for burping or a position change.',
      'Log the next wet diaper so the pattern is easier to discuss if needed.',
    ],
    watch: ['Energy after feeds', 'Wet diapers across the day', 'A sudden change from her usual rhythm'],
    record: ['Feed time', 'How long or how much', 'Diaper after the feed'],
    safety: 'Ask your pediatrician if feeding suddenly changes, wet diapers drop, or your baby seems unusually sleepy.',
    noteTitle: 'Feeding pattern',
  }
}

function buildComfortGuidance(context: GuidanceContextV2): GuidanceResultV2 {
  const { profile, sourceLog } = context

  return {
    kind: 'guidance',
    topic: 'comfort',
    title: 'Reset the room first',
    subtitle: `A low-stimulation step for ${profile.name}, ${profile.ageLabel}.`,
    considered: buildConsidered(context, sourceLog?.detail || 'Fussy stretch'),
    tryNow: [
      'Lower light and sound for 10 minutes.',
      'Try one steady hold, sway, or walk instead of changing tactics fast.',
      'Check diaper, clothing, fingers, and toes for simple discomfort.',
    ],
    watch: ['Whether the same window repeats tomorrow', 'If feeding or sleep shifted before the crying', 'Any new unusual sign'],
    record: ['Start time', 'What happened right before', 'What helped even a little'],
    safety: 'Call your pediatrician if the crying feels very unusual, your baby is very hard to wake, or you notice breathing trouble.',
    noteTitle: 'Fussy stretch note',
  }
}

function buildPediatricianGuidance(context: GuidanceContextV2): GuidanceResultV2 {
  const { profile, sourceLog } = context

  return {
    kind: 'guidance',
    topic: 'pediatrician',
    title: 'Make the question easy to answer',
    subtitle: `A clean note for ${profile.name}'s next visit or call.`,
    considered: buildConsidered(context, sourceLog?.detail || 'Question for pediatrician'),
    tryNow: [
      'Write the pattern in one sentence.',
      'Add the last feed, last diaper, and sleep timing.',
      'List what you tried without judging whether it was right.',
    ],
    watch: ['How many times it repeated', 'What changed from her normal rhythm', 'What you want the clinician to answer'],
    record: ['Pattern', 'Timing', 'Your exact question'],
    safety: 'If you feel something is urgent, contact your pediatrician or local urgent line directly.',
    noteTitle: 'Pediatrician question',
  }
}

function buildConsidered(context: GuidanceContextV2, fallback: string) {
  const latest = context.logs.slice(0, 2).map((entry) => `${entry.label}: ${entry.detail}`)

  return [
    `${context.profile.name}, ${context.profile.ageLabel}`,
    context.sourceLog ? context.sourceLog.detail : fallback,
    ...latest,
  ].slice(0, 4)
}
