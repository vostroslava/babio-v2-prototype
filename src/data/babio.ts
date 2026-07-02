import type {
  ActionButton,
  AskState,
  BabyProfile,
  BriefSection,
  ContextCard,
  FlowDefinition,
  FlowId,
  FlowMoment,
  GuidanceResult,
  HomeState,
  LogItem,
  NoteEntry,
  SafetyGatewayState,
} from '../types'

export const babyProfile: BabyProfile = {
  id: 'emma',
  name: 'Emma',
  ageLabel: '4 mo',
  avatarEmoji: '🙂',
}

export const nightLog: LogItem[] = [
  { id: 'feed-0248', type: 'feed', label: 'Last feed', time: '2:48 AM' },
  { id: 'diaper-0130', type: 'diaper', label: 'Last diaper', time: '1:30 AM' },
  { id: 'sleep-42', type: 'sleep', label: 'Last sleep', time: '42 min ago' },
]

export const morningLog: LogItem[] = [
  { id: 'wake-0652', type: 'routine', label: 'Wake-up', time: '6:52 AM' },
  { id: 'feed-0710', type: 'feed', label: 'Feed', time: '7:10 AM' },
  { id: 'diaper-0738', type: 'diaper', label: 'Diaper', time: '7:38 AM' },
]

export const todayLog: LogItem[] = [
  { id: 'feed-0248', type: 'feed', label: 'Feeding', time: '2:48 AM' },
  { id: 'diaper-0130', type: 'diaper', label: 'Diaper', time: '1:30 AM' },
  { id: 'sleep-0032', type: 'sleep', label: 'Sleep started', time: '12:32 AM' },
  { id: 'routine-2010', type: 'routine', label: 'Bedtime routine', time: '8:10 PM' },
]

export const quickHelp = ['Sleep', 'Feeding', 'Crying', 'Diaper', 'Routine', 'Milestones']

const nightHome: HomeState = {
  statusBarTime: '3:14 AM',
  title: 'How can I help right now?',
  inputPlaceholder: 'Ask about sleep, feeding, crying...',
  quickHelp,
  logTitle: 'Tonight',
  logItems: nightLog,
  featureTitle: 'Baby woke up again',
  featureBody: 'Get calm, personalized next steps based on Emma’s age and routine.',
  primaryAction: {
    label: 'Get next steps',
    variant: 'primary',
    action: 'show-loading',
  },
}

const wokeResult: GuidanceResult = {
  title: 'Baby woke up again',
  subtitle: 'Based on Emma’s age and tonight’s log',
  contextCards: [
    { icon: 'bottle', label: 'Last feed', value: '2:48 AM' },
    { icon: 'moon', label: 'Last sleep', value: '42 min ago' },
  ],
  mainCardTitle: 'Try this now',
  steps: [
    { index: 1, icon: 'diaper', title: 'Check diaper + comfort' },
    { index: 2, icon: 'lamp', title: 'Keep lights low and soothe' },
    { index: 3, icon: 'bottle', title: 'Offer a quiet feed if hungry' },
  ],
  safetyNote: {
    tone: 'care',
    text: 'Call your pediatrician if symptoms feel urgent.',
  },
  primaryAction: { label: 'Save to Notes', variant: 'primary', action: 'save-note' },
  secondaryAction: { label: 'Track sleep', variant: 'secondary', action: 'track-sleep' },
}

const nightResetHome: HomeState = {
  statusBarTime: '3:14 AM',
  title: 'One calm step for Emma',
  inputPlaceholder: 'Ask about sleep, feeding, crying...',
  logTitle: 'Latest context',
  logItems: [
    { id: 'v2-wake-0240', type: 'sleep', label: 'Night wake', time: '2:40 AM' },
    { id: 'v2-feed-0210', type: 'feed', label: 'Calm feed', time: '2:10 AM' },
  ],
  featureTitle: 'Night reset',
  featureBody: 'Woke at 2:40 AM and stayed awake 45 min.',
  primaryAction: {
    label: 'Ask about this',
    variant: 'primary',
    action: 'open-ask',
  },
}

const nightResetAsk: AskState = {
  statusBarTime: '3:14 AM',
  title: 'Ask Babio',
  subtitle: 'A structured answer, not an open chat.',
  input: 'She woke again at night and stayed awake for 45 minutes.',
  quickContext: [
    { icon: 'baby', label: 'Emma', value: '9 wk' },
    { icon: 'moon', label: 'Latest', value: '2:40 AM' },
    { icon: 'note', label: 'Notes', value: 'Ready' },
  ],
  primaryAction: {
    label: 'Get Personalized Guidance',
    variant: 'primary',
    action: 'show-loading',
  },
}

const nightResetResult: GuidanceResult = {
  title: 'One calm step for tonight',
  subtitle: 'Based on Emma, 9 wk, and the latest log.',
  contextCards: [
    { icon: 'baby', label: 'Emma', value: '9 wk' },
    { icon: 'moon', label: 'Wake', value: '2:40 AM' },
  ],
  mainCardTitle: 'Try first',
  steps: [{ index: 1, icon: 'lamp', title: 'Keep the room dim and interactions quiet for the next reset.' }],
  supportNote: 'Then check diaper and comfort before changing the plan.',
  safetyNote: {
    tone: 'care',
    text: 'Call your pediatrician promptly if breathing looks difficult, fever appears, wet diapers drop, or she is very hard to wake.',
  },
  primaryAction: { label: 'Save to Notes', variant: 'primary', action: 'save-note' },
}

const nightResetNote: NoteEntry = {
  id: 'night-reset-v2-note',
  title: 'Night wake pattern',
  subtitle: 'Saved from the V2 night reset flow.',
  profile: {
    name: 'Emma',
    ageLabel: '9 wk',
    avatarEmoji: '🙂',
  },
  sections: [
    { label: 'Question', body: 'She woke again at night and stayed awake for 45 minutes.' },
    { label: 'Context', body: 'Emma, 9 wk · wake at 2:40 AM · calm feed at 2:10 AM.' },
    { label: 'Try now', body: 'Keep the room dim and interactions quiet for the next reset.' },
    { label: 'Watch', body: 'Whether this repeats for 3 nights · feed timing · wet diapers.' },
  ],
}

const feedingResult: GuidanceResult = {
  title: 'Feeding question',
  subtitle: 'Based on Emma’s age and recent log',
  contextCards: [
    { icon: 'bottle', label: 'Last feed', value: '6:40 AM' },
    { icon: 'diaper', label: 'Last diaper', value: '6:05 AM' },
  ],
  mainCardTitle: 'Try this next',
  steps: [
    { index: 1, icon: 'spark', title: 'Look for hunger cues' },
    { index: 2, icon: 'bottle', title: 'Offer a calm feed if cueing' },
    { index: 3, icon: 'diaper', title: 'Track feed + diaper after' },
  ],
  supportNote: 'Breast, bottle, or combo: keep it simple.',
  safetyNote: {
    tone: 'neutral',
    text: 'Ask your pediatrician if feeding suddenly changes or you’re worried.',
  },
  primaryAction: { label: 'Log feeding', variant: 'primary', action: 'log-feeding' },
  secondaryAction: { label: 'Save to Notes', variant: 'secondary', action: 'save-note' },
}

const normalResult: GuidanceResult = {
  title: 'What to watch',
  subtitle: 'For Emma, 4 mo',
  contextCards: [
    { icon: 'baby', label: 'Emma', value: '4 mo' },
    { icon: 'play', label: 'Today', value: 'Play + routine' },
  ],
  mainCardTitle: 'Today’s next step',
  steps: [
    { index: 1, icon: 'play', title: 'Try 2 minutes of supported play' },
    { index: 2, icon: 'heart', title: 'Watch energy, feeding, and sleep together' },
    { index: 3, icon: 'note', title: 'Save the pattern if it repeats' },
  ],
  supportNote: 'Babies vary day to day.',
  safetyNote: {
    tone: 'care',
    text: 'Ask your pediatrician if you’re concerned or a skill disappears.',
  },
  primaryAction: { label: 'Save question', variant: 'primary', action: 'save-question' },
  secondaryAction: { label: 'Track this', variant: 'secondary', action: 'track-this' },
}

const briefSections: BriefSection[] = [
  { title: 'Sleep', body: 'Watch sleepy cues', icon: 'moon' },
  { title: 'Feeding', body: 'Keep the next feed calm', icon: 'bottle' },
  { title: 'Routine', body: 'Simple morning, simple bedtime', icon: 'flag' },
  { title: 'Play', body: 'Try 2 minutes of supported play', icon: 'play' },
]

const pediatricianNote: NoteEntry = {
  id: 'night-wake-note',
  title: 'Saved for pediatrician',
  subtitle: 'A clean note from tonight’s log.',
  sections: [
    { label: 'Question', body: 'Baby woke up again' },
    {
      label: 'Context',
      body: 'Last feed 2:48 AM · Last sleep 42 min ago · Last diaper 1:30 AM',
    },
    { label: 'What we tried', body: 'Diaper check · low lights · quiet feed if hungry' },
    { label: 'Ask pediatrician', body: 'Is this wake-up pattern expected for Emma’s age?' },
  ],
}

interface GuidanceFlowSpec {
  id: FlowId
  title: string
  description: string
  moment: FlowMoment
  statusBarTime: string
  question: string
  contextCards: ContextCard[]
  chips?: string[]
  loadingTitle: string
  loadingItems: string[]
  resultTitle: string
  resultSubtitle: string
  mainCardTitle: string
  steps: {
    icon: string
    title: string
  }[]
  supportNote: string
  safetyText: string
  noteTitle: string
  noteContext: string
}

function makeGuidanceFlow(spec: GuidanceFlowSpec): FlowDefinition {
  const saveAction: ActionButton = { label: 'Save to Notes', variant: 'primary', action: 'save-note' }
  const result: GuidanceResult = {
    title: spec.resultTitle,
    subtitle: spec.resultSubtitle,
    contextCards: spec.contextCards.slice(0, 2),
    mainCardTitle: spec.mainCardTitle,
    steps: spec.steps.map((step, index) => ({
      index: index + 1,
      icon: step.icon,
      title: step.title,
    })),
    supportNote: spec.supportNote,
    safetyNote: {
      tone: 'care',
      text: spec.safetyText,
    },
    primaryAction: saveAction,
  }

  const note: NoteEntry = {
    id: `${spec.id}-note`,
    title: spec.noteTitle,
    subtitle: 'Saved from a V2 scripted moment.',
    profile: {
      name: 'Emma',
      ageLabel: '9 wk',
      avatarEmoji: '🙂',
    },
    sections: [
      { label: 'Question', body: spec.question },
      { label: 'Context', body: spec.noteContext },
      { label: 'Try now', body: spec.steps.map((step) => step.title).join(' · ') },
      { label: 'Watch', body: spec.supportNote },
    ],
  }

  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    version: 'v2',
    moment: spec.moment,
    recordingDurationMs: 7600,
    statusBarTime: spec.statusBarTime,
    startTab: 'ask',
    initialScreen: 'ask',
    manualSequence: ['ask', 'loading', 'result', 'notes'],
    screens: {
      ask: {
        statusBarTime: spec.statusBarTime,
        title: 'Ask Babio',
        subtitle: 'One structured answer for this moment.',
        input: spec.question,
        quickContext: spec.contextCards,
        chips: spec.chips,
        primaryAction: {
          label: 'Get Personalized Guidance',
          variant: 'primary',
          action: 'show-loading',
        },
      },
      loading: {
        title: spec.loadingTitle,
        items: spec.loadingItems,
      },
      result,
      notes: note,
    },
    timeline: [
      { atMs: 0, screen: 'ask' },
      { atMs: 750, screen: 'ask', tapTarget: 'Get Personalized Guidance' },
      { atMs: 1050, screen: 'loading' },
      { atMs: 2250, screen: 'result' },
      { atMs: 5400, screen: 'result', tapTarget: 'Save to Notes' },
      { atMs: 5800, screen: 'notes', toast: 'Saved to Notes' },
      { atMs: 7600, screen: 'notes', toast: 'Saved to Notes' },
    ],
  }
}

function makeSafetyFlow(): FlowDefinition {
  const safety: SafetyGatewayState = {
    title: 'Use direct help',
    subtitle: 'For a young baby with fever, Babio leaves advice mode.',
    profile: {
      name: 'Emma',
      ageLabel: '9 wk',
      avatarEmoji: '🙂',
    },
    urgentTitle: 'Do this first',
    urgentItems: [
      'Call your pediatrician or urgent line now.',
      'Use urgent services for breathing, color, or alertness worries.',
      'Avoid new home steps while waiting.',
    ],
    collectTitle: 'Have this ready',
    collectItems: ['Temperature reading and time', 'Age in weeks', 'Last feed and last wet diaper'],
    safetyNote: 'Babio cannot replace direct clinical help. When a young baby has fever or looks unwell, choose direct help first.',
    primaryAction: {
      label: 'Save call notes',
      variant: 'primary',
      action: 'save-note',
    },
  }

  return {
    id: 'first-fever-safety',
    title: 'First Fever Safety',
    description: 'Stage 3 safety gateway: a young baby fever query routes away from standard advice.',
    version: 'v2',
    moment: 'pediatrician',
    recordingDurationMs: 7200,
    statusBarTime: '10:18 PM',
    startTab: 'ask',
    initialScreen: 'ask',
    manualSequence: ['ask', 'loading', 'safety', 'notes'],
    screens: {
      ask: {
        statusBarTime: '10:18 PM',
        title: 'Ask Babio',
        subtitle: 'Safety-sensitive questions get routed differently.',
        input: 'She is 9 weeks and has a temperature of 100.4.',
        quickContext: [
          { icon: 'baby', label: 'Emma', value: '9 wk' },
          { icon: 'thermometer', label: 'Temp', value: '100.4' },
          { icon: 'note', label: 'Need', value: 'Call notes' },
        ],
        chips: ['Fever', 'Under 3 months', 'Call prep'],
        primaryAction: {
          label: 'Check safety route',
          variant: 'primary',
          action: 'show-loading',
        },
      },
      loading: {
        title: 'Checking safety first...',
        items: ['Age under 3 months', 'Fever wording', 'Routing to direct help'],
      },
      safety,
      notes: {
        id: 'first-fever-safety-note',
        title: 'Call notes',
        subtitle: 'Saved from the safety route.',
        profile: {
          name: 'Emma',
          ageLabel: '9 wk',
          avatarEmoji: '🙂',
        },
        sections: [
          { label: 'Question', body: 'She is 9 weeks and has a temperature of 100.4.' },
          { label: 'Have ready', body: 'Temperature reading and time · age in weeks · last feed · last wet diaper.' },
          { label: 'Use direct help', body: 'Call pediatrician or local urgent line now.' },
        ],
      },
    },
    timeline: [
      { atMs: 0, screen: 'ask' },
      { atMs: 800, screen: 'ask', tapTarget: 'Check safety route' },
      { atMs: 1100, screen: 'loading' },
      { atMs: 2350, screen: 'safety' },
      { atMs: 5200, screen: 'safety', tapTarget: 'Save call notes' },
      { atMs: 5600, screen: 'notes', toast: 'Saved to Notes' },
      { atMs: 7200, screen: 'notes', toast: 'Saved to Notes' },
    ],
  }
}

const scenarioFlows: Record<
  | 'short-nap-reset'
  | 'bedtime-reset'
  | 'early-morning-wake'
  | 'still-hungry-after-feed'
  | 'fussy-after-feed'
  | 'evening-fussy-stretch'
  | 'tummy-time-protest'
  | 'morning-reset-brief'
  | 'doctor-visit-prep',
  FlowDefinition
> = {
  'short-nap-reset': makeGuidanceFlow({
    id: 'short-nap-reset',
    title: 'Short Nap Reset',
    description: 'Safe sleep moment: short daytime nap, one low-pressure reset.',
    moment: 'sleep',
    statusBarTime: '1:22 PM',
    question: 'She woke after a 28 minute nap. What should I try next?',
    contextCards: [
      { icon: 'baby', label: 'Emma', value: '9 wk' },
      { icon: 'moon', label: 'Nap', value: '28 min' },
      { icon: 'flag', label: 'Next', value: 'Reset' },
    ],
    chips: ['Short nap', 'Sleep cue', 'Try now'],
    loadingTitle: 'Checking the nap context...',
    loadingItems: ['Age window', 'Nap length', 'One reset step'],
    resultTitle: 'Try one gentle reset',
    resultSubtitle: 'Short naps can happen at this age. Keep the next step simple.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'lamp', title: 'Keep the room dim for 10 minutes before switching activities.' },
      { icon: 'heart', title: 'Try one steady soothing method, then stop if she is fully awake.' },
    ],
    supportNote: 'Watch whether short naps repeat across the next 2-3 days.',
    safetyText: 'Ask your pediatrician if sleep changes come with fever, feeding drop, or unusual low energy.',
    noteTitle: 'Short nap pattern',
    noteContext: 'Emma, 9 wk · woke after 28 minute nap · trying one gentle reset.',
  }),
  'bedtime-reset': makeGuidanceFlow({
    id: 'bedtime-reset',
    title: 'Bedtime Reset',
    description: 'Evening routine moment: bedtime resistance without sleep-training claims.',
    moment: 'sleep',
    statusBarTime: '8:36 PM',
    question: 'Bedtime is suddenly taking forever and I keep changing tactics.',
    contextCards: [
      { icon: 'baby', label: 'Emma', value: '9 wk' },
      { icon: 'lamp', label: 'Room', value: 'Bright' },
      { icon: 'moon', label: 'Bedtime', value: 'Long' },
    ],
    chips: ['Bedtime', 'Routine', 'Low light'],
    loadingTitle: 'Finding a smaller bedtime step...',
    loadingItems: ['Routine cue', 'Stimulation level', 'One repeatable action'],
    resultTitle: 'Make bedtime smaller',
    resultSubtitle: 'The goal is a repeatable cue, not a perfect night.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'lamp', title: 'Lower lights and sound before the next soothing attempt.' },
      { icon: 'flag', title: 'Use the same short cue twice instead of adding new tactics.' },
    ],
    supportNote: 'Record start time, the cue used, and what helped even a little.',
    safetyText: 'Call your pediatrician if bedtime difficulty comes with breathing worry, fever, or a sudden feeding change.',
    noteTitle: 'Bedtime reset',
    noteContext: 'Long bedtime · high stimulation possible · repeat one short cue.',
  }),
  'early-morning-wake': makeGuidanceFlow({
    id: 'early-morning-wake',
    title: 'Early Morning Wake',
    description: 'Sleep moment: early wake with environment and diaper checks.',
    moment: 'sleep',
    statusBarTime: '5:08 AM',
    question: 'She keeps waking around 5 AM and I do not know what to change.',
    contextCards: [
      { icon: 'moon', label: 'Wake', value: '5:08 AM' },
      { icon: 'diaper', label: 'Diaper', value: 'Check' },
      { icon: 'lamp', label: 'Light', value: 'Low' },
    ],
    chips: ['Early wake', 'Diaper', 'Light'],
    loadingTitle: 'Checking the morning pattern...',
    loadingItems: ['Wake time', 'Room cue', 'Simple log'],
    resultTitle: 'Treat it like night first',
    resultSubtitle: 'Before changing the day, make the early wake quiet and track it.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'lamp', title: 'Keep the room dark and quiet for the first reset.' },
      { icon: 'diaper', title: 'Check diaper once, then return to the same sleep cue.' },
    ],
    supportNote: 'Watch whether it repeats at the same time for 3 mornings.',
    safetyText: 'Ask your pediatrician if early wakes come with feeding changes, fewer wet diapers, or unusual low energy.',
    noteTitle: 'Early wake pattern',
    noteContext: 'Wake around 5 AM · checking light, diaper, and repeat pattern.',
  }),
  'still-hungry-after-feed': makeGuidanceFlow({
    id: 'still-hungry-after-feed',
    title: 'Still Hungry?',
    description: 'Feeding moment: hunger cues and diaper context without quantity rules.',
    moment: 'feeding',
    statusBarTime: '7:18 AM',
    question: 'She just fed and still seems hungry. What should I check?',
    contextCards: [
      { icon: 'bottle', label: 'Feed', value: '20 min ago' },
      { icon: 'diaper', label: 'Diaper', value: 'Next' },
      { icon: 'baby', label: 'Emma', value: '9 wk' },
    ],
    chips: ['Hunger cues', 'Diaper', 'After feed'],
    loadingTitle: 'Checking feeding context...',
    loadingItems: ['Last feed', 'Cue pattern', 'Diaper signal'],
    resultTitle: 'Check cues, then keep it calm',
    resultSubtitle: 'Use the next few minutes to separate hunger from settling.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'spark', title: 'Look for clear hunger cues before offering more.' },
      { icon: 'diaper', title: 'Log the next wet diaper so the pattern is easier to discuss.' },
    ],
    supportNote: 'Watch energy after feeds and whether this is a sudden change from her usual rhythm.',
    safetyText: 'Ask your pediatrician if feeding drops suddenly, wet diapers drop, or your baby seems unusually sleepy.',
    noteTitle: 'Feeding cues',
    noteContext: 'Fed 20 min ago · still unsettled · checking cues and diaper pattern.',
  }),
  'fussy-after-feed': makeGuidanceFlow({
    id: 'fussy-after-feed',
    title: 'Fussy After Feed',
    description: 'Feeding comfort moment: position, pause, and record pattern.',
    moment: 'feeding',
    statusBarTime: '6:54 PM',
    question: 'She gets fussy after feeds and I keep guessing what it means.',
    contextCards: [
      { icon: 'bottle', label: 'Feed', value: 'Recent' },
      { icon: 'heart', label: 'Comfort', value: 'Fussy' },
      { icon: 'note', label: 'Pattern', value: 'Track' },
    ],
    chips: ['After feed', 'Burp pause', 'Position'],
    loadingTitle: 'Looking at after-feed context...',
    loadingItems: ['Feed timing', 'Comfort cue', 'What to record'],
    resultTitle: 'Pause before changing plans',
    resultSubtitle: 'A small comfort reset can make the pattern clearer.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'heart', title: 'Hold upright calmly for a short pause after the feed.' },
      { icon: 'note', title: 'Record what changed: position, burp, diaper, or sleep cue.' },
    ],
    supportNote: 'Watch whether fussiness happens after every feed or only at one time of day.',
    safetyText: 'Call your pediatrician if fussiness feels very unusual, feeding drops, or your baby seems hard to wake.',
    noteTitle: 'After-feed pattern',
    noteContext: 'Recent feed · fussy after feed · checking position and repeat pattern.',
  }),
  'evening-fussy-stretch': makeGuidanceFlow({
    id: 'evening-fussy-stretch',
    title: 'Evening Fussy Stretch',
    description: 'Comfort moment: low-stimulation reset for the hard evening window.',
    moment: 'comfort',
    statusBarTime: '7:46 PM',
    question: 'She cries on and off every evening and I need one calm step.',
    contextCards: [
      { icon: 'heart', label: 'Window', value: 'Evening' },
      { icon: 'lamp', label: 'Room', value: 'Dim' },
      { icon: 'flag', label: 'Goal', value: 'Reset' },
    ],
    chips: ['Evening', 'Crying', 'Low stimulation'],
    loadingTitle: 'Choosing a low-stimulation reset...',
    loadingItems: ['Time of day', 'Room intensity', 'One steady tactic'],
    resultTitle: 'Reset the room first',
    resultSubtitle: 'Change the environment before changing every tactic.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'lamp', title: 'Lower light and sound for 10 minutes.' },
      { icon: 'heart', title: 'Use one steady hold or walk instead of switching quickly.' },
    ],
    supportNote: 'Record start time, what happened before it, and what helped even a little.',
    safetyText: 'Call your pediatrician if crying sounds very unusual, breathing worries you, or your baby is very hard to wake.',
    noteTitle: 'Evening fussy stretch',
    noteContext: 'Evening crying on and off · trying low stimulation and one steady soothing tactic.',
  }),
  'tummy-time-protest': makeGuidanceFlow({
    id: 'tummy-time-protest',
    title: 'Tummy Time Protest',
    description: 'Development moment: supported play without milestone anxiety.',
    moment: 'comfort',
    statusBarTime: '11:12 AM',
    question: 'She gets upset during tummy time. What is a gentle way to try?',
    contextCards: [
      { icon: 'play', label: 'Play', value: 'Tummy' },
      { icon: 'heart', label: 'Mood', value: 'Upset' },
      { icon: 'baby', label: 'Emma', value: '9 wk' },
    ],
    chips: ['Tummy time', 'Play', 'Gentle'],
    loadingTitle: 'Finding a gentler play option...',
    loadingItems: ['Age', 'Energy', 'Short play step'],
    resultTitle: 'Shrink the play window',
    resultSubtitle: 'A tiny version still counts as observation and practice.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'play', title: 'Try 30 seconds on your chest instead of the floor.' },
      { icon: 'heart', title: 'Stop before she is fully upset and record what she tolerated.' },
    ],
    supportNote: 'Watch energy, head comfort, and whether a shorter attempt goes better later.',
    safetyText: 'Ask your pediatrician if a skill seems to disappear or you are worried about comfort or movement.',
    noteTitle: 'Tummy time note',
    noteContext: 'Tummy time upset · trying short supported play on parent chest.',
  }),
  'morning-reset-brief': makeGuidanceFlow({
    id: 'morning-reset-brief',
    title: 'Morning Reset Brief',
    description: 'Routine moment: one focus for a day after a rough night.',
    moment: 'routine',
    statusBarTime: '8:04 AM',
    question: 'The night was rough. What should I focus on this morning?',
    contextCards: [
      { icon: 'moon', label: 'Night', value: 'Rough' },
      { icon: 'flag', label: 'Focus', value: 'One step' },
      { icon: 'bottle', label: 'Next', value: 'Calm feed' },
    ],
    chips: ['Morning', 'Daily brief', 'One focus'],
    loadingTitle: 'Building a simple morning focus...',
    loadingItems: ['Night log', 'Next feed', 'Keep the day simple'],
    resultTitle: 'Pick one morning anchor',
    resultSubtitle: 'After a rough night, keep the morning predictable.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'bottle', title: 'Make the next feed calm and unhurried.' },
      { icon: 'flag', title: 'Choose one anchor: feed, diaper, or short walk.' },
    ],
    supportNote: 'Watch whether a simple morning lowers stress for both of you.',
    safetyText: 'Ask your pediatrician if the rough night comes with feeding changes, fever, or fewer wet diapers.',
    noteTitle: 'Morning reset',
    noteContext: 'Rough night · choosing one morning anchor and calm next feed.',
  }),
  'doctor-visit-prep': makeGuidanceFlow({
    id: 'doctor-visit-prep',
    title: 'Doctor Visit Prep',
    description: 'Pediatrician moment: turn logs into a concise question list.',
    moment: 'pediatrician',
    statusBarTime: '9:24 AM',
    question: 'We have a visit in two days. What should I bring from the log?',
    contextCards: [
      { icon: 'note', label: 'Visit', value: '2 days' },
      { icon: 'moon', label: 'Sleep', value: 'Pattern' },
      { icon: 'bottle', label: 'Feed', value: 'Recent' },
    ],
    chips: ['Visit prep', 'Question list', 'Logs'],
    loadingTitle: 'Preparing a clean visit note...',
    loadingItems: ['Recent pattern', 'What you tried', 'Question list'],
    resultTitle: 'Bring the pattern, not every detail',
    resultSubtitle: 'A short note is easier to use at the visit.',
    mainCardTitle: 'Try first',
    steps: [
      { icon: 'note', title: 'Write the pattern in one sentence.' },
      { icon: 'flag', title: 'Add what changed from her usual rhythm and your main question.' },
    ],
    supportNote: 'Record timing, repeats, what you tried, and what you want answered.',
    safetyText: 'If something feels urgent before the visit, contact your pediatrician or local urgent line directly.',
    noteTitle: 'Visit prep',
    noteContext: 'Visit in two days · collecting pattern, timing, and one main question.',
  }),
}

export const flows: Record<FlowId, FlowDefinition> = {
  'baby-woke-up-again': {
    id: 'baby-woke-up-again',
    title: 'Baby woke up again',
    description: 'Night flow: one calm next step based on Emma’s age and tonight’s log.',
    version: 'v1',
    moment: 'sleep',
    recordingDurationMs: 6500,
    statusBarTime: '3:14 AM',
    startTab: 'home',
    initialScreen: 'home',
    manualSequence: ['home', 'loading', 'result'],
    screens: {
      home: nightHome,
      loading: {
        title: 'Personalizing tonight’s next step...',
        items: ['Using Emma’s age', 'Checking tonight’s log', 'Matching sleep + feeding context'],
      },
      result: wokeResult,
    },
    timeline: [
      { atMs: 0, screen: 'home' },
      { atMs: 800, screen: 'home', tapTarget: 'Get next steps' },
      { atMs: 1050, screen: 'loading' },
      { atMs: 2300, screen: 'result' },
      { atMs: 6500, screen: 'result' },
    ],
  },
  'night-reset-woke-again': {
    id: 'night-reset-woke-again',
    title: 'V2 Night Reset',
    description: 'V2 core loop: latest log, structured Ask, one calm step, and saved note.',
    version: 'v2',
    moment: 'sleep',
    recordingDurationMs: 8200,
    statusBarTime: '3:14 AM',
    startTab: 'home',
    initialScreen: 'home',
    manualSequence: ['home', 'ask', 'loading', 'result', 'notes'],
    screens: {
      home: nightResetHome,
      ask: nightResetAsk,
      loading: {
        title: 'Building one calm step...',
        items: ['Using Emma’s profile', 'Reading the latest log', 'Keeping the answer structured'],
      },
      result: nightResetResult,
      notes: nightResetNote,
    },
    timeline: [
      { atMs: 0, screen: 'home' },
      { atMs: 700, screen: 'home', tapTarget: 'Ask about this' },
      { atMs: 1000, screen: 'ask' },
      { atMs: 1900, screen: 'ask', tapTarget: 'Get Personalized Guidance' },
      { atMs: 2200, screen: 'loading' },
      { atMs: 3400, screen: 'result' },
      { atMs: 6100, screen: 'result', tapTarget: 'Save to Notes' },
      { atMs: 6500, screen: 'notes', toast: 'Saved to Notes' },
      { atMs: 8200, screen: 'notes', toast: 'Saved to Notes' },
    ],
  },
  ...scenarioFlows,
  'first-fever-safety': makeSafetyFlow(),
  'feeding-question': {
    id: 'feeding-question',
    title: 'Feeding question',
    description: 'Morning Ask flow: feeding guidance without shame or medical claims.',
    version: 'v1',
    moment: 'feeding',
    recordingDurationMs: 6000,
    statusBarTime: '7:42 AM',
    startTab: 'ask',
    initialScreen: 'ask',
    manualSequence: ['ask', 'loading', 'result'],
    screens: {
      ask: {
        statusBarTime: '7:42 AM',
        title: 'What’s happening?',
        input: 'She fed at 6:40 AM and still seems hungry.',
        quickContext: [
          { icon: 'baby', label: 'Emma', value: '4 mo' },
          { icon: 'bottle', label: 'Last feed', value: '6:40 AM' },
          { icon: 'diaper', label: 'Last diaper', value: '6:05 AM' },
        ],
        chips: ['Still hungry', 'Bottle amount', 'Fussy after feed', 'Diaper check'],
        primaryAction: {
          label: 'Get feeding guidance',
          variant: 'primary',
          action: 'show-loading',
        },
      },
      loading: {
        title: 'Personalizing feeding guidance...',
        items: ['Emma’s age', 'Last feed', 'Diaper log'],
      },
      result: feedingResult,
    },
    timeline: [
      { atMs: 0, screen: 'ask' },
      { atMs: 700, screen: 'ask', tapTarget: 'Get feeding guidance' },
      { atMs: 1000, screen: 'loading' },
      { atMs: 2150, screen: 'result' },
      { atMs: 6000, screen: 'result' },
    ],
  },
  'is-this-normal': {
    id: 'is-this-normal',
    title: 'Is this normal?',
    description: 'Observation flow: what to watch and what to track, without medical certainty.',
    version: 'v1',
    moment: 'comfort',
    recordingDurationMs: 6500,
    statusBarTime: '2:16 PM',
    startTab: 'ask',
    initialScreen: 'ask',
    manualSequence: ['ask', 'loading', 'result'],
    screens: {
      ask: {
        statusBarTime: '2:16 PM',
        title: 'Is this normal?',
        subtitle: 'Tell Babio what you’re noticing.',
        input: 'She hates tummy time today. Is that normal?',
        quickContext: [
          { icon: 'baby', label: 'Emma', value: '4 mo' },
          { icon: 'moon', label: 'Sleep', value: 'Today' },
          { icon: 'bottle', label: 'Feeding', value: 'Recent' },
          { icon: 'play', label: 'Play', value: 'Today' },
        ],
        primaryAction: {
          label: 'Check what to watch',
          variant: 'primary',
          action: 'show-loading',
        },
      },
      loading: {
        title: 'Checking today’s context...',
        items: ['Emma’s age', 'Recent routine', 'What you noticed'],
      },
      result: normalResult,
    },
    timeline: [
      { atMs: 0, screen: 'ask' },
      { atMs: 800, screen: 'ask', tapTarget: 'Check what to watch' },
      { atMs: 1050, screen: 'loading' },
      { atMs: 2300, screen: 'result' },
      { atMs: 6500, screen: 'result' },
    ],
  },
  'daily-brief': {
    id: 'daily-brief',
    title: 'Daily Brief',
    description: 'Morning Home flow: a simple focus for sleep, feeding, routine, and play.',
    version: 'v1',
    moment: 'routine',
    recordingDurationMs: 6500,
    statusBarTime: '8:05 AM',
    startTab: 'home',
    initialScreen: 'dailyHome',
    manualSequence: ['dailyHome', 'loading', 'dailyBrief'],
    screens: {
      home: {
        statusBarTime: '8:05 AM',
        title: 'Good morning',
        contextTitle: 'Today so far',
        contextItems: morningLog,
        featureTitle: 'Emma’s Daily Brief',
        featureBody: 'A simple focus for sleep, feeding, routine, and play.',
        primaryAction: {
          label: 'Create brief',
          variant: 'primary',
          action: 'show-loading',
        },
      },
      loading: {
        title: 'Building Emma’s Daily Brief...',
        items: ['Sleep', 'Feeding', 'Routine', 'Play'],
      },
      dailyBrief: {
        title: 'Your Baby’s Daily Brief',
        subtitle: 'Based on Emma’s age + today’s log',
        sectionTitle: 'Today’s focus',
        sections: briefSections,
        footer: 'You can adjust this as the day changes.',
        primaryAction: { label: 'Start today', variant: 'primary', action: 'start-today' },
        secondaryAction: { label: 'Save brief', variant: 'secondary', action: 'save-brief' },
      },
    },
    timeline: [
      { atMs: 0, screen: 'dailyHome' },
      { atMs: 800, screen: 'dailyHome', tapTarget: 'Create brief' },
      { atMs: 1050, screen: 'loading' },
      { atMs: 2400, screen: 'dailyBrief' },
      { atMs: 6500, screen: 'dailyBrief' },
    ],
  },
  'save-for-pediatrician': {
    id: 'save-for-pediatrician',
    title: 'Save for pediatrician',
    description: 'Save-to-notes flow: turn a night moment into a clean note.',
    version: 'v1',
    moment: 'pediatrician',
    recordingDurationMs: 5800,
    statusBarTime: '3:14 AM',
    startTab: 'notes',
    initialScreen: 'result',
    manualSequence: ['result', 'loading', 'notes'],
    screens: {
      loading: {
        title: 'Saving for pediatrician...',
        items: ['Adding tonight’s log', 'Adding what you tried', 'Creating a clean note'],
      },
      result: wokeResult,
      notes: pediatricianNote,
    },
    timeline: [
      { atMs: 0, screen: 'result' },
      { atMs: 700, screen: 'result', tapTarget: 'Save to Notes' },
      { atMs: 1000, screen: 'loading' },
      { atMs: 1800, screen: 'notes', toast: 'Saved to Notes' },
      { atMs: 5800, screen: 'notes', toast: 'Saved to Notes' },
    ],
  },
}

export const flowOrder: FlowId[] = [
  'baby-woke-up-again',
  'night-reset-woke-again',
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

export const unsafeCopy = [
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
