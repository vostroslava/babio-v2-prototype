export type BabyFeedingStyle = 'breast' | 'bottle' | 'combo'
export type BabySleepSetup = 'bassinet' | 'crib' | 'shared-room'
export type BabioLogKind = 'sleep' | 'feed' | 'diaper' | 'comfort' | 'routine'

export interface BabyProfileV2 {
  id: string
  name: string
  ageWeeks: number
  ageLabel: string
  avatarEmoji: string
  feedingStyle: BabyFeedingStyle
  sleepSetup: BabySleepSetup
}

export interface BabioLogEntry {
  id: string
  kind: BabioLogKind
  label: string
  detail: string
  time: string
  createdAt: string
  askPrompt: string
}

export interface BabioNoteSection {
  label: string
  body: string
}

export interface BabioNoteEntry {
  id: string
  title: string
  subtitle: string
  createdAt: string
  sourceLogId?: string
  sections: BabioNoteSection[]
}

export interface GuidanceContextV2 {
  profile: BabyProfileV2
  logs: BabioLogEntry[]
  sourceLog?: BabioLogEntry
}

export interface GuidanceResultV2 {
  kind: 'guidance'
  topic: 'sleep' | 'feeding' | 'comfort' | 'routine' | 'pediatrician'
  title: string
  subtitle: string
  considered: string[]
  tryNow: string[]
  watch: string[]
  record: string[]
  safety: string
  noteTitle: string
}

export interface SafetyRouteV2 {
  kind: 'safety'
  title: string
  subtitle: string
  urgentActions: string[]
  collect: string[]
  safety: string
  noteTitle: string
}

export type GuidanceDecisionV2 = GuidanceResultV2 | SafetyRouteV2

export interface LastAskV2 {
  input: string
  sourceLogId?: string
  result: GuidanceDecisionV2
  createdAt: string
}

export interface BabioStoreState {
  version: 2
  profile: BabyProfileV2
  logs: BabioLogEntry[]
  notes: BabioNoteEntry[]
  lastAsk: LastAskV2 | null
}

export interface QuickLogPreset {
  kind: BabioLogKind
  label: string
  detail: string
  askPrompt: string
}
