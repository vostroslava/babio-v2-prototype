export type PilotEventName =
  | 'log_entry_created'
  | 'ask_completed'
  | 'note_saved'
  | 'summary_copied'
  | 'profile_updated'
  | 'demo_reset'
  | 'feedback_recorded'

interface PilotEvent {
  name: PilotEventName
  at: string
  payload?: Record<string, string | number | boolean | undefined>
}

const PILOT_EVENTS_KEY = 'babio:v2-pilot-events'
const MAX_EVENTS = 100

export function trackPilotEvent(name: PilotEventName, payload?: PilotEvent['payload']) {
  const event: PilotEvent = {
    name,
    at: new Date().toISOString(),
    payload,
  }

  if (typeof window !== 'undefined') {
    try {
      const current = JSON.parse(window.localStorage.getItem(PILOT_EVENTS_KEY) || '[]') as PilotEvent[]
      window.localStorage.setItem(PILOT_EVENTS_KEY, JSON.stringify([event, ...current].slice(0, MAX_EVENTS)))
    } catch {
      // Pilot event tracking is non-critical.
    }
  }

  console.info('[babio-pilot-event]', event)
}
