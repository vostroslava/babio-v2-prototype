import { useCallback, useState } from 'react'
import type {
  BabyFocusArea,
  BabyFeedingStyle,
  BabioLogEntry,
  BabioNoteEntry,
  BabioStoreState,
  BabySleepSetup,
  GuidanceDecisionV2,
  GuidanceResultV2,
  QuickLogPreset,
  SafetyRouteV2,
} from '../types/babio'

const STORAGE_KEY = 'babio:v2-state'

const defaultState: BabioStoreState = {
  version: 2,
  profile: {
    id: 'emma-v2',
    name: 'Emma',
    ageWeeks: 9,
    ageLabel: '9 wk',
    avatarEmoji: '🙂',
    feedingStyle: 'combo',
    sleepSetup: 'bassinet',
    focusAreas: ['sleep', 'feeding'],
    careNotes: 'Night wakes, calm resets, and keeping feeds simple.',
    updatedAt: '2026-07-02T03:05:00.000Z',
  },
  logs: [
    {
      id: 'seed-wake-0240',
      kind: 'sleep',
      label: 'Night wake',
      detail: 'Woke at 2:40 AM and stayed awake 45 min',
      time: '2:40 AM',
      createdAt: '2026-07-02T02:40:00.000Z',
      askPrompt: 'She woke again at night and stayed awake for 45 minutes.',
    },
    {
      id: 'seed-feed-0210',
      kind: 'feed',
      label: 'Feeding',
      detail: 'Calm feed before the wake',
      time: '2:10 AM',
      createdAt: '2026-07-02T02:10:00.000Z',
      askPrompt: 'How should I connect the last feed with tonight’s wake-up?',
    },
  ],
  notes: [
    {
      id: 'seed-note-night',
      title: 'Night wake pattern',
      subtitle: 'Saved from the demo log.',
      createdAt: '2026-07-02T03:05:00.000Z',
      sourceLogId: 'seed-wake-0240',
      sections: [
        { label: 'Question', body: 'She woke again at night and stayed awake for 45 minutes.' },
        { label: 'Context', body: 'Emma, 9 wk · woke at 2:40 AM · calm feed at 2:10 AM.' },
        { label: 'What to record', body: 'Wake time, how long she stayed awake, what helped her settle.' },
      ],
    },
  ],
  lastAsk: null,
}

export function useBabioStore() {
  const [state, setState] = useState<BabioStoreState>(() => loadBabioState())

  const commit = useCallback((updater: (current: BabioStoreState) => BabioStoreState) => {
    setState((current) => {
      const next = normalizeState(updater(current))
      saveBabioState(next)
      return next
    })
  }, [])

  const addQuickLog = useCallback(
    (preset: QuickLogPreset) => {
      const entry = createLogEntry(preset)
      commit((current) => ({
        ...current,
        logs: [entry, ...current.logs].slice(0, 24),
      }))
      return entry
    },
    [commit],
  )

  const setLastAsk = useCallback(
    (input: string, result: GuidanceDecisionV2, sourceLogId?: string) => {
      commit((current) => ({
        ...current,
        lastAsk: {
          input,
          result,
          sourceLogId,
          createdAt: new Date().toISOString(),
        },
      }))
    },
    [commit],
  )

  const addNoteFromGuidance = useCallback(
    (result: GuidanceDecisionV2, input: string, sourceLog?: BabioLogEntry) => {
      const note = createNoteFromGuidance(result, input, sourceLog)
      commit((current) => ({
        ...current,
        notes: [note, ...current.notes].slice(0, 20),
      }))
      return note
    },
    [commit],
  )

  const resetDemo = useCallback(() => {
    const next = cloneDefaultState()
    saveBabioState(next)
    setState(next)
  }, [])

  const updateProfile = useCallback(
    (patch: {
      name?: string
      ageWeeks?: number
      avatarEmoji?: string
      feedingStyle?: BabyFeedingStyle
      sleepSetup?: BabySleepSetup
      focusAreas?: BabyFocusArea[]
      careNotes?: string
    }) => {
      commit((current) => {
        const nextAgeWeeks =
          typeof patch.ageWeeks === 'number' && Number.isFinite(patch.ageWeeks) && patch.ageWeeks > 0
            ? Math.round(patch.ageWeeks)
            : current.profile.ageWeeks
        const nextName = patch.name?.trim() || current.profile.name
        const nextAvatar = patch.avatarEmoji?.trim() || current.profile.avatarEmoji

        return {
          ...current,
          profile: {
            ...current.profile,
            ...patch,
            name: nextName,
            avatarEmoji: nextAvatar,
            ageWeeks: nextAgeWeeks,
            ageLabel: formatAgeLabel(nextAgeWeeks),
            focusAreas: patch.focusAreas && patch.focusAreas.length > 0 ? patch.focusAreas : current.profile.focusAreas,
            careNotes: typeof patch.careNotes === 'string' ? patch.careNotes.trim() : current.profile.careNotes,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },
    [commit],
  )

  return {
    state,
    addQuickLog,
    setLastAsk,
    addNoteFromGuidance,
    resetDemo,
    updateProfile,
  }
}

function loadBabioState(): BabioStoreState {
  if (typeof window === 'undefined') return cloneDefaultState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneDefaultState()
    return normalizeState(JSON.parse(raw) as Partial<BabioStoreState>)
  } catch {
    return cloneDefaultState()
  }
}

function saveBabioState(state: BabioStoreState) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}

function normalizeState(raw: Partial<BabioStoreState>): BabioStoreState {
  const fallback = cloneDefaultState()

  return {
    version: 2,
    profile: {
      ...fallback.profile,
      ...(raw.profile || {}),
      focusAreas:
        raw.profile && Array.isArray(raw.profile.focusAreas) && raw.profile.focusAreas.length > 0
          ? raw.profile.focusAreas
          : fallback.profile.focusAreas,
      careNotes: raw.profile?.careNotes || fallback.profile.careNotes,
      updatedAt: raw.profile?.updatedAt || fallback.profile.updatedAt,
    },
    logs: Array.isArray(raw.logs) ? raw.logs.filter(isLogEntry).slice(0, 24) : fallback.logs,
    notes: Array.isArray(raw.notes) ? raw.notes.filter(isNoteEntry).slice(0, 20) : fallback.notes,
    lastAsk: raw.lastAsk && raw.lastAsk.result ? raw.lastAsk : fallback.lastAsk,
  }
}

function cloneDefaultState(): BabioStoreState {
  return JSON.parse(JSON.stringify(defaultState)) as BabioStoreState
}

function createLogEntry(preset: QuickLogPreset): BabioLogEntry {
  const now = new Date()

  return {
    id: `${preset.kind}-${now.getTime()}`,
    kind: preset.kind,
    label: preset.label,
    detail: preset.detail,
    time: formatLogTime(now),
    createdAt: now.toISOString(),
    askPrompt: preset.askPrompt,
  }
}

function createNoteFromGuidance(result: GuidanceDecisionV2, input: string, sourceLog?: BabioLogEntry): BabioNoteEntry {
  const now = new Date()

  return {
    id: `note-${now.getTime()}`,
    title: result.noteTitle,
    subtitle: sourceLog ? `Saved from ${sourceLog.label.toLowerCase()}.` : 'Saved from Ask.',
    createdAt: now.toISOString(),
    sourceLogId: sourceLog?.id,
    sections: result.kind === 'safety' ? safetySections(result, input, sourceLog) : guidanceSections(result, input, sourceLog),
  }
}

function guidanceSections(result: GuidanceResultV2, input: string, sourceLog?: BabioLogEntry) {
  return [
    { label: 'Question', body: input },
    { label: 'Context', body: sourceLog ? sourceLog.detail : result.considered.join(' · ') },
    { label: 'Try now', body: result.tryNow.join(' · ') },
    { label: 'Watch', body: result.watch.join(' · ') },
    { label: 'Pediatrician note', body: result.safety },
  ]
}

function safetySections(result: SafetyRouteV2, input: string, sourceLog?: BabioLogEntry) {
  return [
    { label: 'Question', body: input },
    { label: 'Context', body: sourceLog ? sourceLog.detail : 'No source log selected.' },
    { label: 'Use direct help', body: result.urgentActions.join(' · ') },
    { label: 'Have ready', body: result.collect.join(' · ') },
  ]
}

function formatLogTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatAgeLabel(ageWeeks: number) {
  if (ageWeeks < 8) return `${ageWeeks} wk`
  if (ageWeeks < 52) return `${ageWeeks} wk`
  const months = Math.round(ageWeeks / 4.345)
  return `${months} mo`
}

function isLogEntry(value: unknown): value is BabioLogEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as BabioLogEntry
  return Boolean(entry.id && entry.kind && entry.label && entry.detail && entry.time && entry.createdAt && entry.askPrompt)
}

function isNoteEntry(value: unknown): value is BabioNoteEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as BabioNoteEntry
  return Boolean(entry.id && entry.title && entry.subtitle && Array.isArray(entry.sections))
}
