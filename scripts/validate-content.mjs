import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const babioSource = readFileSync(join(root, 'src/data/babio.ts'), 'utf8')
const guidanceSource = readFileSync(join(root, 'src/data/guidanceRules.ts'), 'utf8')
const communitySource = readFileSync(join(root, 'src/data/communityStories.ts'), 'utf8')

const unsafeCopy = [
  'diagnose',
  'diagnosis',
  'treatment',
  'cure',
  'symptom checker',
  'medical ai',
  'ai doctor',
  'pediatrician in your pocket',
  'replace your doctor',
  'stop calling your pediatrician',
  'guaranteed',
  'never worry again',
  'fix sleep',
  'fix sleep tonight',
  'perfect plan',
  'knows exactly what’s wrong',
  'detect illness',
  'detect developmental delay',
  'your baby is behind',
  'prevent sids',
  'emergency hook',
  'chatgpt for moms',
  'openai',
  'single mom?',
  'no partner?',
  'raising your baby alone?',
  'be a better mom',
  'parent the right way',
]

const visibleData = [
  babioSource.replace(/export const unsafeCopy = \[[\s\S]*?\]\n/, ''),
  guidanceSource,
  communitySource,
].join('\n')
const normalized = visibleData.toLowerCase()
const hits = unsafeCopy.filter((phrase) => normalized.includes(phrase))

if (hits.length > 0) {
  console.error('Unsafe visible Babio copy found:')
  for (const hit of hits) console.error(`- ${hit}`)
  process.exit(1)
}

const requiredRoutes = [
  'baby-woke-up-again',
  'night-reset-woke-again',
  'personalized-guidance-cta',
  'profile-overview',
  'community-to-guidance',
  'profile-pediatrician-summary',
  'short-nap-reset',
  'bedtime-reset',
  'early-morning-wake',
  'feeding-question',
  'still-hungry-after-feed',
  'fussy-after-feed',
  'evening-fussy-stretch',
  'is-this-normal',
  'tummy-time-protest',
  'daily-brief',
  'morning-reset-brief',
  'save-for-pediatrician',
  'doctor-visit-prep',
  'first-fever-safety',
]

const missing = requiredRoutes.filter((route) => !babioSource.includes(`'${route}'`))

if (missing.length > 0) {
  console.error('Missing required flow ids:')
  for (const route of missing) console.error(`- ${route}`)
  process.exit(1)
}

const requiredGuidanceFields = ['tryNow', 'watch', 'record', 'safety']
const missingGuidanceFields = requiredGuidanceFields.filter((field) => !guidanceSource.includes(field))

if (missingGuidanceFields.length > 0) {
  console.error('Missing required guidance fields:')
  for (const field of missingGuidanceFields) console.error(`- ${field}`)
  process.exit(1)
}

console.log('Babio content validation passed.')
