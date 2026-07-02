import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  Battery,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Copy,
  Droplets,
  Flag,
  Heart,
  Home,
  Lamp,
  ListChecks,
  MessageCircle,
  Milk,
  Moon,
  NotebookTabs,
  Play,
  Plus,
  RotateCcw,
  SendHorizontal,
  ShieldPlus,
  Signal,
  Sparkles,
  StickyNote,
  Thermometer,
  Wifi,
} from 'lucide-react'
import type { ComponentType, FormEvent, SVGProps } from 'react'
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { babyProfile, flowOrder, flows } from './data/babio'
import { buildGuidanceResult, isSafetyRoute, quickLogPresets } from './data/guidanceRules'
import { trackPilotEvent } from './pilotEvents'
import { useBabioStore } from './state/useBabioStore'
import type {
  ActionButton,
  AppTab,
  AskState,
  BriefSection,
  ContextCard as ContextCardType,
  FlowDefinition,
  FlowId,
  FlowMoment,
  GuidanceResult,
  HomeState,
  LogItem,
  NoteEntry,
  RecordingBackground,
  RecordingFormat,
  RecordingOptions,
  SafetyGatewayState,
  ScreenKind,
} from './types'
import type {
  BabyProfileV2,
  BabioLogEntry,
  BabioLogKind,
  BabioNoteEntry,
  GuidanceDecisionV2,
  GuidanceResultV2,
  SafetyRouteV2,
} from './types/babio'

const iconMap = {
  baby: Baby,
  bottle: Milk,
  diaper: Droplets,
  flag: Flag,
  heart: Heart,
  lamp: Lamp,
  moon: Moon,
  note: StickyNote,
  play: Play,
  spark: Sparkles,
  thermometer: Thermometer,
}

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>

function IconByName({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && iconMap[name as keyof typeof iconMap]) || CircleHelp
  return <Icon className={className} aria-hidden="true" />
}

function App() {
  const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/studio" replace />} />
        <Route path="/studio" element={<StudioScreen />} />
        <Route path="/app/:tab" element={<AppTabRoute />} />
        <Route path="/flow/:flowId" element={<FlowRoute mode="flow" />} />
        <Route path="/record/:flowId" element={<FlowRoute mode="record" />} />
        <Route path="*" element={<Navigate to="/studio" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function getFlow(flowId: string | undefined) {
  return flowId && flowId in flows ? flows[flowId as FlowId] : flows['baby-woke-up-again']
}

function useRecordingOptions(mode: 'flow' | 'record'): RecordingOptions {
  const [searchParams] = useSearchParams()
  const formatParam = searchParams.get('format') as RecordingFormat | null
  const bgParam = searchParams.get('bg') as RecordingBackground | null
  const frameParam = searchParams.get('frame')
  const speedParam = Number(searchParams.get('speed') || '1')
  const autoplayParam = searchParams.get('autoplay')

  return {
    format: formatParam && ['9x16', '4x5', 'phone'].includes(formatParam) ? formatParam : '9x16',
    background:
      bgParam && ['green', 'navy', 'transparent-like'].includes(bgParam) ? bgParam : mode === 'record' ? 'green' : 'navy',
    frame: frameParam === 'screen' ? 'screen' : 'phone',
    autoplay: mode === 'record' ? autoplayParam !== '0' : autoplayParam === '1',
    speed: Number.isFinite(speedParam) && speedParam > 0 ? speedParam : 1,
  }
}

function FlowRoute({ mode }: { mode: 'flow' | 'record' }) {
  const { flowId } = useParams()
  const flow = getFlow(flowId)
  const options = useRecordingOptions(mode)

  return (
    <RecordingStage options={options} mode={mode}>
      <FlowRunner flow={flow} mode={mode} options={options} />
    </RecordingStage>
  )
}

function AppTabRoute() {
  const { tab } = useParams()
  const appTab = ['home', 'ask', 'log', 'notes'].includes(tab || '') ? (tab as AppTab) : 'home'

  return (
    <RecordingStage
      mode="flow"
      options={{ format: 'phone', background: 'navy', frame: 'phone', autoplay: false, speed: 1 }}
    >
      <StaticAppScreen tab={appTab} />
    </RecordingStage>
  )
}

function StudioScreen() {
  const [format, setFormat] = useState<RecordingFormat>('9x16')
  const [bg, setBg] = useState<RecordingBackground>('green')
  const [frame, setFrame] = useState<'phone' | 'screen'>('phone')
  const [momentFilter, setMomentFilter] = useState<FlowMoment | 'all'>('all')
  const query = `?autoplay=1&bg=${bg}&format=${format}&frame=${frame}`
  const visibleFlowOrder = flowOrder.filter((id) => momentFilter === 'all' || flows[id].moment === momentFilter)

  return (
    <main className="studio-shell">
      <section className="studio-hero">
        <div>
          <p className="studio-kicker">Babio MVP Emulator</p>
          <h1>Recording-ready app demo</h1>
          <p>
            V1 proof flows plus the first V2 interactive prototype flow. Mock data only, no backend, no real
            AI calls.
          </p>
        </div>
        <div className="studio-card">
          <span>Primary profile</span>
          <strong>Emma, 9 wk</strong>
          <small>{visibleFlowOrder.length} visible flows · V2 keeps Studio and Record URLs intact.</small>
        </div>
      </section>

      <section className="studio-controls" aria-label="Recording controls">
        <ControlGroup label="Moment">
          {(['all', 'sleep', 'feeding', 'comfort', 'routine', 'pediatrician'] as const).map((value) => (
            <button
              className={momentFilter === value ? 'is-selected' : ''}
              key={value}
              type="button"
              onClick={() => setMomentFilter(value)}
            >
              {value}
            </button>
          ))}
        </ControlGroup>
        <ControlGroup label="Format">
          {(['9x16', '4x5', 'phone'] as RecordingFormat[]).map((value) => (
            <button
              className={format === value ? 'is-selected' : ''}
              key={value}
              type="button"
              onClick={() => setFormat(value)}
            >
              {value}
            </button>
          ))}
        </ControlGroup>
        <ControlGroup label="Background">
          {(['green', 'navy', 'transparent-like'] as RecordingBackground[]).map((value) => (
            <button
              className={bg === value ? 'is-selected' : ''}
              key={value}
              type="button"
              onClick={() => setBg(value)}
            >
              {value}
            </button>
          ))}
        </ControlGroup>
        <ControlGroup label="Frame">
          {(['phone', 'screen'] as const).map((value) => (
            <button
              className={frame === value ? 'is-selected' : ''}
              key={value}
              type="button"
              onClick={() => setFrame(value)}
            >
              {value}
            </button>
          ))}
        </ControlGroup>
      </section>

      <section className="studio-grid">
        {visibleFlowOrder.map((id) => {
          const flow = flows[id]
          return (
            <article className="studio-flow-card" key={id}>
              <div className="studio-flow-meta">
                <span>{flow.version || 'v1'}</span>
                <span>{flow.moment || 'flow'}</span>
                <span>{Math.round(flow.recordingDurationMs / 100) / 10}s</span>
              </div>
              <h2>{flow.title}</h2>
              <p>{flow.description}</p>
              <div className="studio-actions">
                <Link to={`/flow/${id}`}>Open flow</Link>
                <Link to={`/record/${id}${query}`}>Record URL</Link>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control-group">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  )
}

function FlowRunner({
  flow,
  mode,
  options,
}: {
  flow: FlowDefinition
  mode: 'flow' | 'record'
  options: RecordingOptions
}) {
  const [manualIndex, setManualIndex] = useState(0)
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [toast, setToast] = useState<string | undefined>()

  useEffect(() => {
    setManualIndex(0)
    setTimelineIndex(0)
    setToast(undefined)
  }, [flow.id, mode])

  useEffect(() => {
    if (!options.autoplay) return undefined

    const timers = flow.timeline.slice(1).map((step, index) =>
      window.setTimeout(() => {
        setTimelineIndex(index + 1)
        setToast(step.toast)
      }, step.atMs / options.speed),
    )

    return () => timers.forEach(window.clearTimeout)
  }, [flow, options.autoplay, options.speed])

  const currentTimeline = flow.timeline[timelineIndex] || flow.timeline[0]
  const screen = options.autoplay ? currentTimeline.screen : flow.manualSequence[manualIndex]
  const tapTarget = options.autoplay ? currentTimeline.tapTarget : undefined
  const activeToast = options.autoplay ? currentTimeline.toast || toast : toast

  useEffect(() => {
    if (options.autoplay || screen !== 'loading') return undefined

    const timer = window.setTimeout(() => {
      setManualIndex((index) => Math.min(index + 1, flow.manualSequence.length - 1))
      if (flow.id === 'save-for-pediatrician') setToast('Saved to Notes')
    }, 1050)

    return () => window.clearTimeout(timer)
  }, [flow.id, flow.manualSequence.length, options.autoplay, screen])

  const advance = (action?: string) => {
    if (action === 'save-note' && flow.id !== 'save-for-pediatrician' && !flow.screens.notes) {
      setToast('Saved to Notes')
      return
    }

    if (action === 'save-note' && flow.screens.notes) {
      setToast('Saved to Notes')
    }

    setManualIndex((index) => Math.min(index + 1, flow.manualSequence.length - 1))
  }

  return (
    <PhoneShell
      activeTab={screen === 'notes' ? 'notes' : flow.startTab}
      frame={options.frame}
      statusBarTime={statusBarTimeForScreen(flow, screen)}
      recording={mode === 'record'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="screen-transition"
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          key={`${flow.id}-${screen}-${timelineIndex}`}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <ScreenRenderer flow={flow} screen={screen} onAction={advance} tapTarget={tapTarget} />
        </motion.div>
      </AnimatePresence>
      {activeToast ? <Toast text={activeToast} /> : null}
    </PhoneShell>
  )
}

function statusBarTimeForScreen(flow: FlowDefinition, screen: ScreenKind) {
  if (screen === 'home' || screen === 'dailyHome') return flow.screens.home?.statusBarTime || flow.statusBarTime
  if (screen === 'ask') return flow.screens.ask?.statusBarTime || flow.statusBarTime
  return flow.statusBarTime
}

function StaticAppScreen({ tab }: { tab: AppTab }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addNoteFromGuidance, addQuickLog, resetDemo, setLastAsk, state } = useBabioStore()
  const [toast, setToast] = useState<string | undefined>()
  const sourceLogId = searchParams.get('log') || undefined
  const sourceLog = sourceLogId ? state.logs.find((entry) => entry.id === sourceLogId) : undefined

  useEffect(() => {
    if (tab !== 'ask' || !sourceLog) return
    if (state.lastAsk?.sourceLogId === sourceLog.id) return

    const result = buildGuidanceResult(sourceLog.askPrompt, {
      profile: state.profile,
      logs: state.logs,
      sourceLog,
    })
    setLastAsk(sourceLog.askPrompt, result, sourceLog.id)
  }, [
    setLastAsk,
    sourceLog,
    sourceLog?.askPrompt,
    sourceLog?.id,
    state.lastAsk?.sourceLogId,
    state.logs,
    state.profile,
    tab,
  ])

  useEffect(() => {
    if (!toast) return undefined

    const timer = window.setTimeout(() => setToast(undefined), 1900)
    return () => window.clearTimeout(timer)
  }, [toast])

  const startAsk = (input: string, log?: BabioLogEntry) => {
    const result = buildGuidanceResult(input, {
      profile: state.profile,
      logs: state.logs,
      sourceLog: log,
    })
    setLastAsk(input, result, log?.id)
    trackPilotEvent('ask_completed', { topic: result.kind === 'guidance' ? result.topic : 'safety', sourceLogId: log?.id })
    navigate(log ? `/app/ask?log=${log.id}` : '/app/ask')
  }

  const handleAddLog = (presetIndex: number) => {
    const entry = addQuickLog(quickLogPresets[presetIndex])
    trackPilotEvent('log_entry_created', { kind: entry.kind, label: entry.label })
    setToast(`${entry.label} added`)
    return entry
  }

  const handleAddLogAndAsk = (presetIndex: number) => {
    const entry = handleAddLog(presetIndex)
    startAsk(entry.askPrompt, entry)
  }

  const handleSaveGuidance = () => {
    if (!state.lastAsk) return

    const linkedLog = state.lastAsk.sourceLogId
      ? state.logs.find((entry) => entry.id === state.lastAsk?.sourceLogId)
      : undefined
    addNoteFromGuidance(state.lastAsk.result, state.lastAsk.input, linkedLog)
    trackPilotEvent('note_saved', {
      kind: state.lastAsk.result.kind,
      sourceLogId: linkedLog?.id,
    })
    setToast('Saved to Notes')
    navigate('/app/notes')
  }

  const handleCopyNotes = () => {
    const summary = [
      `${state.profile.name}, ${state.profile.ageLabel}`,
      `Recent saved patterns: ${state.notes.slice(0, 3).map((note) => note.title).join(' · ')}`,
      '',
      ...state.notes
        .slice(0, 3)
        .map((note) => `${note.title}\n${note.sections.map((section) => `${section.label}: ${section.body}`).join('\n')}`),
    ].join('\n')

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(summary)
    }
    trackPilotEvent('summary_copied', { noteCount: state.notes.length })
    setToast('Summary copied')
  }

  const handleResetDemo = () => {
    resetDemo()
    trackPilotEvent('demo_reset')
    setToast('Demo reset')
    navigate('/app/home')
  }

  const statusBarTime = tab === 'home' || tab === 'ask' ? '3:14 AM' : '8:05 AM'

  return (
    <>
      <PhoneShell activeTab={tab} frame="phone" statusBarTime={statusBarTime}>
        {tab === 'home' ? (
          <LiveHomeScreen
            logs={state.logs}
            onAddLog={() => handleAddLog(0)}
            onAsk={(input, log) => startAsk(input, log)}
            onAskLatest={() => {
              const latest = state.logs[0]
              startAsk(latest?.askPrompt || 'She woke again and I need one calm next step.', latest)
            }}
            onReset={handleResetDemo}
            profile={state.profile}
          />
        ) : null}
        {tab === 'ask' ? (
          <LiveAskScreen
            lastAsk={state.lastAsk}
            logs={state.logs}
            onSave={handleSaveGuidance}
            onSubmit={(input) => startAsk(input, sourceLog)}
            profile={state.profile}
            sourceLog={sourceLog}
          />
        ) : null}
        {tab === 'log' ? (
          <LiveLogScreen
            logs={state.logs}
            onAddLog={handleAddLog}
            onAddLogAndAsk={handleAddLogAndAsk}
            onAsk={(entry) => startAsk(entry.askPrompt, entry)}
            profile={state.profile}
          />
        ) : null}
        {tab === 'notes' ? (
          <LiveNotesScreen notes={state.notes} onCopy={handleCopyNotes} onReset={handleResetDemo} profile={state.profile} />
        ) : null}
      </PhoneShell>
      {toast ? <Toast text={toast} /> : null}
    </>
  )
}

function LiveHomeScreen({
  logs,
  onAddLog,
  onAsk,
  onAskLatest,
  onReset,
  profile,
}: {
  logs: BabioLogEntry[]
  onAddLog: () => void
  onAsk: (input: string, log?: BabioLogEntry) => void
  onAskLatest: () => void
  onReset: () => void
  profile: BabyProfileV2
}) {
  const latest = logs[0]

  return (
    <section className="app-screen home-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <div className="live-title-row">
        <h1>One calm step for {profile.name}</h1>
        <button aria-label="Reset demo state" className="icon-button" type="button" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className="ask-bar live-ask-bar">
        <button type="button" onClick={() => onAsk('She woke again and I need one calm next step.')}>
          <span>Ask about sleep, feeding, crying...</span>
        </button>
        <button aria-label="Start ask" type="button" onClick={onAskLatest}>
          <SendHorizontal aria-hidden="true" />
        </button>
      </div>
      <GlassCard className="feature-card live-focus-card">
        <div>
          <h2>Night reset</h2>
          <p>{latest ? latest.detail : 'Add one quick log, then ask Babio what to try next.'}</p>
          <small>Profile + latest log stay on this device.</small>
        </div>
        <Moon className="feature-illustration" aria-hidden="true" />
        <div className="live-card-actions">
          <button className="action-button primary" type="button" onClick={onAskLatest}>
            Ask about this
          </button>
          <button className="action-button secondary" type="button" onClick={onAddLog}>
            Log night wake
          </button>
        </div>
      </GlassCard>
      <LiveDailyBriefCard logs={logs} profile={profile} />
    </section>
  )
}

function LiveDailyBriefCard({ logs, profile }: { logs: BabioLogEntry[]; profile: BabyProfileV2 }) {
  const feed = logs.find((entry) => entry.kind === 'feed')
  const sleep = logs.find((entry) => entry.kind === 'sleep')

  const items = [
    {
      icon: 'moon',
      title: 'Sleep',
      body: sleep ? 'Watch the next wake window.' : 'Log one nap or wake.',
    },
    {
      icon: 'bottle',
      title: 'Feeding',
      body: feed ? 'Keep the next feed calm.' : 'Add the next feed.',
    },
  ]

  return (
    <GlassCard className="live-daily-brief-card">
      <div className="live-card-heading">
        <h2>{profile.name}'s daily brief</h2>
        <span>Last 24h</span>
      </div>
      <div className="live-brief-rows">
        {items.map((item) => (
          <div className="live-brief-row" key={item.title}>
            <IconByName name={item.icon} />
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function LiveLogScreen({
  logs,
  onAddLog,
  onAddLogAndAsk,
  onAsk,
  profile,
}: {
  logs: BabioLogEntry[]
  onAddLog: (presetIndex: number) => void
  onAddLogAndAsk: (presetIndex: number) => void
  onAsk: (entry: BabioLogEntry) => void
  profile: BabyProfileV2
}) {
  return (
    <section className="app-screen log-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <h1>Today’s log</h1>
      <GlassCard className="quick-log-card">
        <h2>Quick add</h2>
        <div className="quick-log-grid">
          {quickLogPresets.map((preset, index) => (
            <button key={preset.label} type="button" onClick={() => onAddLog(index)}>
              <IconByName name={iconForLogKind(preset.kind)} />
              <span>{preset.label}</span>
              <Plus aria-hidden="true" />
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="timeline-card live-timeline-card">
        {logs.map((item) => (
          <div className="timeline-row live-timeline-row" key={item.id}>
            <span>{item.time}</span>
            <div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
            <button aria-label={`Ask about ${item.label}`} type="button" onClick={() => onAsk(item)}>
              <MessageCircle aria-hidden="true" />
            </button>
          </div>
        ))}
      </GlassCard>
      <button className="action-button primary" type="button" onClick={() => onAddLogAndAsk(0)}>
        Log night wake + Ask
      </button>
    </section>
  )
}

function LiveAskScreen({
  lastAsk,
  logs,
  onSave,
  onSubmit,
  profile,
  sourceLog,
}: {
  lastAsk: { input: string; result: GuidanceDecisionV2 } | null
  logs: BabioLogEntry[]
  onSave: () => void
  onSubmit: (input: string) => void
  profile: BabyProfileV2
  sourceLog?: BabioLogEntry
}) {
  const [input, setInput] = useState(sourceLog?.askPrompt || lastAsk?.input || 'She woke again and stayed awake.')

  useEffect(() => {
    if (sourceLog?.askPrompt) setInput(sourceLog.askPrompt)
  }, [sourceLog?.askPrompt])

  const submitAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <section className="app-screen ask-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <h1>Ask Babio</h1>
      <p className="screen-subtitle">A structured answer, not an open chat.</p>
      <form className={`live-ask-form ${lastAsk ? 'compact' : ''}`} onSubmit={submitAsk}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <button className="action-button primary" type="submit">
          Get one calm step
        </button>
      </form>
      {!lastAsk ? (
        <div className="quick-context">
          <h2>Quick context</h2>
          <div>
            <ContextCard item={{ icon: 'baby', label: profile.name, value: profile.ageLabel }} />
            <ContextCard item={{ icon: iconForLogKind(logs[0]?.kind || 'sleep'), label: 'Latest', value: logs[0]?.time || 'None' }} />
            <ContextCard item={{ icon: 'note', label: 'Notes', value: 'Not yet' }} />
          </div>
        </div>
      ) : null}
      {lastAsk ? <LiveGuidanceDecision result={lastAsk.result} onSave={onSave} /> : null}
    </section>
  )
}

function LiveGuidanceDecision({ onSave, result }: { onSave: () => void; result: GuidanceDecisionV2 }) {
  if (isSafetyRoute(result)) return <LiveSafetyRoute onSave={onSave} result={result} />

  return <LiveGuidanceResult onSave={onSave} result={result} />
}

function LiveGuidanceResult({ onSave, result }: { onSave: () => void; result: GuidanceResultV2 }) {
  const [primaryStep = 'Start with one calm reset.', ...nextSteps] = result.tryNow

  return (
    <div className="live-result-stack">
      <GlassCard className="steps-card">
        <h2>{result.title}</h2>
        <p className="live-result-subtitle">{result.subtitle}</p>
        <div className="step-list">
          <div className="advice-step" key={primaryStep}>
            <span className="step-index">1</span>
            <IconByName name="lamp" />
            <strong>{primaryStep}</strong>
          </div>
        </div>
      </GlassCard>
      {nextSteps.length > 0 ? <LiveSectionCard items={nextSteps} title="Then if needed" /> : null}
      <LiveSectionCard items={result.considered} title="What Babio used" />
      <LiveSectionCard items={result.watch} title="Watch" />
      <LiveSectionCard items={result.record} title="Record" />
      <SafetyCard text={result.safety} />
      <button className="action-button primary" type="button" onClick={onSave}>
        Save to Notes
      </button>
    </div>
  )
}

function LiveSafetyRoute({ onSave, result }: { onSave: () => void; result: SafetyRouteV2 }) {
  return (
    <div className="live-result-stack">
      <GlassCard className="safety-route-card">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h2>{result.title}</h2>
          <p>{result.subtitle}</p>
        </div>
      </GlassCard>
      <LiveSectionCard items={result.urgentActions} title="Use direct help" />
      <LiveSectionCard items={result.collect} title="Have ready" />
      <SafetyCard text={result.safety} />
      <button className="action-button secondary" type="button" onClick={onSave}>
        Save call notes
      </button>
    </div>
  )
}

function LiveNotesScreen({
  notes,
  onCopy,
  onReset,
  profile,
}: {
  notes: BabioNoteEntry[]
  onCopy: () => void
  onReset: () => void
  profile: BabyProfileV2
}) {
  return (
    <section className="app-screen notes-screen live-scroll-screen">
      <header className="notes-header">
        <h1>Notes</h1>
        <BabySwitcher profile={profile} />
      </header>
      <PediatricianExportCard notes={notes} profile={profile} />
      {notes.map((note) => (
        <GlassCard className="note-card" key={note.id}>
          <div className="note-title">
            <NotebookTabs aria-hidden="true" />
            <div>
              <h2>{note.title}</h2>
              <p>{note.subtitle}</p>
            </div>
          </div>
          {note.sections.map((section) => (
            <section className="note-section" key={`${note.id}-${section.label}`}>
              <h3>{section.label}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </GlassCard>
      ))}
      <div className="button-stack">
        <button className="action-button primary" type="button" onClick={onCopy}>
          <Copy aria-hidden="true" />
          Copy pediatrician summary
        </button>
        <button className="action-button secondary" type="button" onClick={onReset}>
          Reset demo
        </button>
      </div>
    </section>
  )
}

function PediatricianExportCard({ notes, profile }: { notes: BabioNoteEntry[]; profile: BabyProfileV2 }) {
  const latest = notes.slice(0, 2)

  return (
    <GlassCard className="pediatrician-export-card">
      <div className="note-title">
        <ShieldPlus aria-hidden="true" />
        <div>
          <h2>Pediatrician export</h2>
          <p>{profile.name}, {profile.ageLabel} · ready to copy</p>
        </div>
      </div>
      <section className="note-section">
        <h3>Recent patterns</h3>
        <p>{latest.map((note) => note.title).join(' · ') || 'No saved notes yet.'}</p>
      </section>
      <section className="note-section">
        <h3>Main question</h3>
        <p>{latest[0]?.sections.find((section) => section.label === 'Question')?.body || 'What should we watch next?'}</p>
      </section>
    </GlassCard>
  )
}

function LiveSectionCard({ items, title }: { items: string[]; title: string }) {
  return (
    <GlassCard className="live-section-card">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </GlassCard>
  )
}

function iconForLogKind(kind: BabioLogKind) {
  if (kind === 'feed') return 'bottle'
  if (kind === 'comfort') return 'heart'
  if (kind === 'routine') return 'flag'
  return kind
}

function ScreenRenderer({
  flow,
  screen,
  onAction,
  tapTarget,
}: {
  flow: FlowDefinition
  screen: ScreenKind
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  if (screen === 'home') return <HomeScreen state={flow.screens.home!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'dailyHome') return <DailyHomeScreen state={flow.screens.home!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'ask') return <AskScreen state={flow.screens.ask!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'loading') return <LoadingScreen state={flow.screens.loading} />
  if (screen === 'result') return <GuidanceResultScreen result={flow.screens.result!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'safety') return <SafetyGatewayScreen state={flow.screens.safety!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'dailyBrief') return <DailyBriefScreen brief={flow.screens.dailyBrief!} onAction={onAction} />
  if (screen === 'notes') return <NotesScreen note={flow.screens.notes!} />
  return <HomeScreen state={flow.screens.home!} onAction={onAction} />
}

function RecordingStage({
  children,
  mode,
  options,
}: {
  children: React.ReactNode
  mode: 'flow' | 'record'
  options: RecordingOptions
}) {
  return (
    <main
      className={`recording-stage stage-${options.format} bg-${options.background} mode-${mode}`}
      data-frame={options.frame}
    >
      {children}
    </main>
  )
}

function PhoneShell({
  activeTab,
  children,
  frame,
  recording = false,
  statusBarTime,
}: {
  activeTab: AppTab
  children: React.ReactNode
  frame: 'phone' | 'screen'
  recording?: boolean
  statusBarTime: string
}) {
  const shell = (
    <div className={`phone-screen ${frame === 'screen' ? 'screen-only' : ''}`}>
      <StatusBar time={statusBarTime} />
      <div className="phone-content">{children}</div>
      <BottomNav activeTab={activeTab} recording={recording} />
      <div className="home-indicator" />
    </div>
  )

  if (frame === 'screen') return shell

  return (
    <div className="phone-frame" aria-label="Babio mobile app emulator">
      <div className="device-side side-left top" />
      <div className="device-side side-left mid" />
      <div className="device-side side-right" />
      <div className="dynamic-island" />
      {shell}
    </div>
  )
}

function StatusBar({ time }: { time: string }) {
  return (
    <div className="status-bar" aria-label={`Status bar ${time}`}>
      <span>{time}</span>
      <div className="status-icons">
        <Signal aria-hidden="true" />
        <Wifi aria-hidden="true" />
        <Battery aria-hidden="true" />
      </div>
    </div>
  )
}

type BabyPillProfile = Pick<BabyProfileV2, 'name' | 'ageLabel' | 'avatarEmoji'>

function AppHeader({ centered = false, profile }: { centered?: boolean; profile?: BabyPillProfile }) {
  return (
    <header className={`app-header ${centered ? 'centered' : ''}`}>
      {centered ? <ArrowLeft className="back-icon" aria-label="Back" /> : null}
      <BabioLogo />
      <BabySwitcher profile={profile} />
    </header>
  )
}

function BabioLogo() {
  return <div className="babio-logo">Babio</div>
}

function BabySwitcher({ profile = babyProfile }: { profile?: BabyPillProfile }) {
  return (
    <div className="baby-pill">
      <span>{profile.avatarEmoji}</span>
      <strong>
        {profile.name}, {profile.ageLabel}
      </strong>
      <ChevronDown aria-hidden="true" />
    </div>
  )
}

function HomeScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: HomeState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen home-screen">
      <AppHeader />
      <h1>{state.title}</h1>
      {state.inputPlaceholder ? (
        <div className="ask-bar">
          <span>{state.inputPlaceholder}</span>
          <button aria-label="Send question" type="button">
            <SendHorizontal aria-hidden="true" />
          </button>
        </div>
      ) : null}
      {state.quickHelp ? <QuickHelp labels={state.quickHelp} /> : null}
      {state.logTitle && state.logItems ? <LogSummaryCard title={state.logTitle} items={state.logItems} /> : null}
      {state.featureTitle && state.primaryAction ? (
        <FeatureCard state={state} onAction={onAction} tapTarget={tapTarget} />
      ) : null}
    </section>
  )
}

function DailyHomeScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: HomeState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen home-screen morning">
      <AppHeader />
      <h1>{state.title}</h1>
      {state.featureTitle && state.primaryAction ? (
        <FeatureCard compact state={state} onAction={onAction} tapTarget={tapTarget} />
      ) : null}
      {state.contextTitle && state.contextItems ? <LogSummaryCard title={state.contextTitle} items={state.contextItems} /> : null}
    </section>
  )
}

function QuickHelp({ labels }: { labels: string[] }) {
  return (
    <div className="quick-help">
      <h2>Quick help</h2>
      <div className="chip-grid">
        {labels.map((label) => (
          <button className="quick-chip" key={label} type="button">
            <IconByName name={label.toLowerCase() === 'sleep' ? 'moon' : label.toLowerCase()} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({
  compact,
  state,
  onAction,
  tapTarget,
}: {
  compact?: boolean
  state: HomeState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <GlassCard className={`feature-card ${compact ? 'compact' : ''}`}>
      <div>
        <h2>{state.featureTitle}</h2>
        <p>{state.featureBody}</p>
        {compact ? <small>Based on Emma’s age + today’s log</small> : null}
      </div>
      {!compact ? <Baby className="feature-illustration" aria-hidden="true" /> : null}
      <ActionButtonView action={state.primaryAction!} onAction={onAction} tapTarget={tapTarget} />
    </GlassCard>
  )
}

function AskScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: AskState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen ask-screen">
      <AppHeader />
      <h1>{state.title}</h1>
      {state.subtitle ? <p className="screen-subtitle">{state.subtitle}</p> : null}
      <GlassCard className="question-card">
        <span>Question</span>
        <p>{state.input}</p>
      </GlassCard>
      <div className="quick-context">
        <h2>Quick context</h2>
        <div>
          {state.quickContext.map((item) => (
            <ContextCard item={item} key={`${item.label}-${item.value}`} />
          ))}
        </div>
      </div>
      {state.chips ? (
        <div className="support-chip-row">
          {state.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      ) : null}
      <ActionButtonView action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
    </section>
  )
}

function LoadingScreen({ state }: { state: { title: string; items: string[] } }) {
  return (
    <section className="app-screen loading-screen">
      <div className="loading-orb">
        <Sparkles aria-hidden="true" />
      </div>
      <h1>{state.title}</h1>
      <div className="loading-stack">
        {state.items.map((item, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="loading-row"
            initial={{ opacity: 0, y: 12 }}
            key={item}
            transition={{ delay: index * 0.12, duration: 0.36 }}
          >
            <span>
              <Check aria-hidden="true" />
            </span>
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function GuidanceResultScreen({
  result,
  onAction,
  tapTarget,
}: {
  result: GuidanceResult
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen result-screen">
      <AppHeader centered />
      <h1>{result.title}</h1>
      <p className="screen-subtitle">{result.subtitle}</p>
      <div className="context-grid">
        {result.contextCards.map((item) => (
          <ContextCard item={item} key={`${item.label}-${item.value}`} />
        ))}
      </div>
      <GlassCard className="steps-card">
        <h2>{result.mainCardTitle}</h2>
        <div className="step-list">
          {result.steps.map((step) => (
            <div className="advice-step" key={step.index}>
              <span className="step-index">{step.index}</span>
              <IconByName name={step.icon} />
              <strong>{step.title}</strong>
            </div>
          ))}
        </div>
      </GlassCard>
      {result.supportNote ? (
        <GlassCard className="support-note">
          <Sparkles aria-hidden="true" />
          <p>{result.supportNote}</p>
        </GlassCard>
      ) : null}
      {result.safetyNote ? <SafetyCard text={result.safetyNote.text} /> : null}
      <div className="button-stack">
        <ActionButtonView action={result.primaryAction} onAction={onAction} tapTarget={tapTarget} />
        {result.secondaryAction ? <ActionButtonView action={result.secondaryAction} onAction={onAction} /> : null}
      </div>
    </section>
  )
}

function SafetyGatewayScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: SafetyGatewayState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen safety-gateway-screen">
      <AppHeader centered profile={state.profile} />
      <GlassCard className="safety-gateway-hero">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h1>{state.title}</h1>
          <p>{state.subtitle}</p>
        </div>
      </GlassCard>
      <LiveSectionCard items={state.urgentItems} title={state.urgentTitle} />
      <LiveSectionCard items={state.collectItems} title={state.collectTitle} />
      <div className="button-stack">
        <ActionButtonView action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
      </div>
    </section>
  )
}

function DailyBriefScreen({
  brief,
  onAction,
}: {
  brief: {
    title: string
    subtitle: string
    sectionTitle: string
    sections: BriefSection[]
    footer: string
    primaryAction: ActionButton
    secondaryAction: ActionButton
  }
  onAction: (action?: string) => void
}) {
  return (
    <section className="app-screen brief-screen">
      <AppHeader />
      <h1>{brief.title}</h1>
      <p className="screen-subtitle">{brief.subtitle}</p>
      <h2>{brief.sectionTitle}</h2>
      <div className="brief-grid">
        {brief.sections.map((section) => (
          <GlassCard className="brief-card" key={section.title}>
            <IconByName name={section.icon} />
            <strong>{section.title}</strong>
            <span>{section.body}</span>
          </GlassCard>
        ))}
      </div>
      <p className="brief-footer">{brief.footer}</p>
      <div className="button-stack">
        <ActionButtonView action={brief.primaryAction} onAction={onAction} />
        <ActionButtonView action={brief.secondaryAction} onAction={onAction} />
      </div>
    </section>
  )
}

function NotesScreen({ note }: { note: NoteEntry }) {
  return (
    <section className="app-screen notes-screen">
      <header className="notes-header">
        <h1>Notes</h1>
        <BabySwitcher profile={note.profile} />
      </header>
      <GlassCard className="note-card">
        <div className="note-title">
          <NotebookTabs aria-hidden="true" />
          <div>
            <h2>{note.title}</h2>
            <p>{note.subtitle}</p>
          </div>
        </div>
        {note.sections.map((section) => (
          <section className="note-section" key={section.label}>
            <h3>{section.label}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </GlassCard>
    </section>
  )
}

function LogSummaryCard({ items, title }: { items: LogItem[]; title: string }) {
  return (
    <GlassCard className="log-summary-card">
      <h2>
        <ListChecks aria-hidden="true" />
        {title}
      </h2>
      {items.map((item) => (
        <div className="log-summary-row" key={item.id}>
          <IconByName name={item.type === 'feed' ? 'bottle' : item.type} />
          <span>{item.label}</span>
          <strong>{item.time}</strong>
        </div>
      ))}
    </GlassCard>
  )
}

function ContextCard({ item }: { item: ContextCardType }) {
  return (
    <GlassCard className="context-card">
      <IconByName name={item.icon} />
      <span>{item.label}</span>
      <strong>{item.value}</strong>
    </GlassCard>
  )
}

function SafetyCard({ text }: { text: string }) {
  return (
    <GlassCard className="safety-card">
      <ShieldPlus aria-hidden="true" />
      <p>{text}</p>
    </GlassCard>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card ${className}`}>{children}</div>
}

function ActionButtonView({
  action,
  onAction,
  tapTarget,
}: {
  action: ActionButton
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  const isTapTarget = tapTarget === action.label
  return (
    <button
      className={`action-button ${action.variant} ${isTapTarget ? 'is-tap-target' : ''}`}
      type="button"
      onClick={() => onAction(action.action)}
    >
      <span>{action.label}</span>
      {action.variant === 'primary' ? <ChevronRight aria-hidden="true" /> : null}
      {isTapTarget ? <TapIndicator /> : null}
    </button>
  )
}

function TapIndicator() {
  return (
    <span className="tap-indicator" aria-hidden="true">
      <span />
    </span>
  )
}

function Toast({ text }: { text: string }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="toast"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
    >
      <Check aria-hidden="true" />
      {text}
    </motion.div>
  )
}

const navItems: { tab: AppTab; label: string; Icon: LucideIcon; to: string }[] = [
  { tab: 'home', label: 'Home', Icon: Home, to: '/app/home' },
  { tab: 'ask', label: 'Ask', Icon: MessageCircle, to: '/app/ask' },
  { tab: 'log', label: 'Log', Icon: ClipboardList, to: '/app/log' },
  { tab: 'notes', label: 'Notes', Icon: NotebookTabs, to: '/app/notes' },
]

function BottomNav({ activeTab, recording }: { activeTab: AppTab; recording: boolean }) {
  return (
    <nav className="bottom-nav" aria-label="App navigation">
      {navItems.map(({ Icon, label, tab, to }) => {
        const content = (
          <>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </>
        )

        return recording ? (
          <span className={activeTab === tab ? 'active' : ''} key={tab}>
            {content}
          </span>
        ) : (
          <Link className={activeTab === tab ? 'active' : ''} key={tab} to={to}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export default App
