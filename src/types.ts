export type FlowId =
  | 'baby-woke-up-again'
  | 'night-reset-woke-again'
  | 'personalized-guidance-cta'
  | 'profile-overview'
  | 'community-to-guidance'
  | 'profile-pediatrician-summary'
  | 'short-nap-reset'
  | 'bedtime-reset'
  | 'early-morning-wake'
  | 'feeding-question'
  | 'still-hungry-after-feed'
  | 'fussy-after-feed'
  | 'evening-fussy-stretch'
  | 'is-this-normal'
  | 'tummy-time-protest'
  | 'daily-brief'
  | 'morning-reset-brief'
  | 'save-for-pediatrician'
  | 'doctor-visit-prep'
  | 'first-fever-safety'

export type AppTab = 'home' | 'ask' | 'tracker' | 'explore' | 'profile' | 'library' | 'sleep' | 'log' | 'notes'
export type RecordingFormat = '9x16' | '4x5' | 'phone'
export type RecordingBackground = 'green' | 'navy' | 'transparent-like'
export type FrameMode = 'phone' | 'screen'
export type FlowVersion = 'v1' | 'v2'
export type FlowMoment = 'sleep' | 'feeding' | 'comfort' | 'routine' | 'pediatrician'
export type ScreenKind =
  | 'home'
  | 'ask'
  | 'log'
  | 'notes'
  | 'profile'
  | 'profileSummary'
  | 'exploreCommunity'
  | 'loading'
  | 'guidancePreparing'
  | 'result'
  | 'safety'
  | 'dailyHome'
  | 'dailyBrief'

export interface BabyProfile {
  id: string
  name: string
  ageLabel: string
  avatarEmoji: string
}

export interface LogItem {
  id: string
  type: 'feed' | 'diaper' | 'sleep' | 'routine' | 'play'
  label: string
  time: string
  detail?: string
}

export interface ContextCard {
  icon: string
  label: string
  value: string
}

export interface AdviceStep {
  index: number
  icon: string
  title: string
  detail?: string
}

export interface SafetyNote {
  tone: 'neutral' | 'care' | 'urgent'
  text: string
}

export interface ActionButton {
  label: string
  variant: 'primary' | 'secondary' | 'ghost'
  action: string
}

export interface GuidanceResult {
  title: string
  subtitle: string
  contextCards: ContextCard[]
  mainCardTitle: string
  steps: AdviceStep[]
  supportNote?: string
  safetyNote?: SafetyNote
  primaryAction: ActionButton
  secondaryAction?: ActionButton
  presentation?: 'standard' | 'screencast'
}

export interface BriefSection {
  title: string
  body: string
  icon: string
}

export interface NoteEntry {
  id: string
  title: string
  subtitle: string
  profile?: Pick<BabyProfile, 'name' | 'ageLabel' | 'avatarEmoji'>
  sections: {
    label: string
    body: string
  }[]
}

export interface LoadingState {
  title: string
  items: string[]
}

export interface GuidancePreparingState {
  statusBarTime: string
  title: string
  subtitle: string
  input: string
  contextCards: ContextCard[]
  loadingTitle: string
  loadingBody: string
  loadingItems: string[]
}

export interface HomeState {
  statusBarTime: string
  title: string
  inputPlaceholder?: string
  quickHelp?: string[]
  logTitle?: string
  logItems?: LogItem[]
  featureTitle?: string
  featureBody?: string
  primaryAction?: ActionButton
  contextTitle?: string
  contextItems?: LogItem[]
}

export interface AskState {
  statusBarTime: string
  title: string
  subtitle?: string
  input: string
  quickContext: ContextCard[]
  chips?: string[]
  primaryAction: ActionButton
}

export interface DailyBriefState {
  title: string
  subtitle: string
  sectionTitle: string
  sections: BriefSection[]
  footer: string
  primaryAction: ActionButton
  secondaryAction: ActionButton
}

export interface SafetyGatewayState {
  title: string
  subtitle: string
  profile?: Pick<BabyProfile, 'name' | 'ageLabel' | 'avatarEmoji'>
  urgentTitle: string
  urgentItems: string[]
  collectTitle: string
  collectItems: string[]
  safetyNote: string
  primaryAction: ActionButton
}

export interface FlowScreens {
  home?: HomeState
  ask?: AskState
  loading: LoadingState
  guidancePreparing?: GuidancePreparingState
  profile?: ProfileRecordState
  profileSummary?: ProfileSummaryRecordState
  exploreCommunity?: ExploreCommunityRecordState
  result?: GuidanceResult
  safety?: SafetyGatewayState
  dailyBrief?: DailyBriefState
  notes?: NoteEntry
}

export interface ProfileRecordState {
  statusBarTime: string
  title: string
  subtitle: string
  profile: Pick<BabyProfile, 'name' | 'ageLabel' | 'avatarEmoji'>
  facts: ContextCard[]
  todayContext: ContextCard[]
  primaryAction: ActionButton
  secondaryAction?: ActionButton
}

export interface ProfileSummaryRecordState {
  statusBarTime: string
  title: string
  subtitle: string
  profile: Pick<BabyProfile, 'name' | 'ageLabel' | 'avatarEmoji'>
  notes: {
    label: string
    body: string
  }[]
  primaryAction: ActionButton
}

export interface ExploreCommunityRecordState {
  statusBarTime: string
  title: string
  subtitle: string
  story: {
    ageRangeLabel: string
    topicLabel: string
    title: string
    summary: string
    parentSignal: string
    safetyNote: string
  }
  primaryAction: ActionButton
}

export interface FlowTimelineStep {
  atMs: number
  screen: ScreenKind
  tapTarget?: string
  toast?: string
}

export interface FlowDefinition {
  id: FlowId
  title: string
  description: string
  version?: FlowVersion
  moment?: FlowMoment
  recordingDurationMs: number
  statusBarTime: string
  startTab: AppTab
  initialScreen: ScreenKind
  manualSequence: ScreenKind[]
  screens: FlowScreens
  timeline: FlowTimelineStep[]
}

export interface RecordingOptions {
  format: RecordingFormat
  background: RecordingBackground
  frame: FrameMode
  autoplay: boolean
  speed: number
}
