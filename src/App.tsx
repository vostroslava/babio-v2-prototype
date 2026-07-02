import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  Battery,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Compass,
  Copy,
  Droplets,
  Flag,
  Heart,
  Headphones,
  Home,
  Lamp,
  ListChecks,
  MessageCircle,
  Milk,
  Moon,
  NotebookTabs,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  SendHorizontal,
  ShieldPlus,
  Signal,
  Sparkles,
  StickyNote,
  Thermometer,
  Volume2,
  Wifi,
} from 'lucide-react'
import type { ComponentType, FormEvent, SVGProps } from 'react'
import { useEffect, useRef, useState } from 'react'
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
import { communityStories } from './data/communityStories'
import { buildGuidanceResult, isSafetyRoute, quickLogPresets } from './data/guidanceRules'
import { trackPilotEvent } from './pilotEvents'
import { useBabioStore } from './state/useBabioStore'
import motherBabyCard from './assets/mother-baby-card.webp'
import type {
  ActionButton,
  AppTab,
  AskState,
  BriefSection,
  ContextCard as ContextCardType,
  FlowDefinition,
  FlowId,
  FlowMoment,
  GuidancePreparingState,
  GuidanceResult,
  HomeState,
  LogItem,
  NoteEntry,
  ExploreCommunityRecordState,
  ProfileRecordState,
  ProfileSummaryRecordState,
  RecordingBackground,
  RecordingFormat,
  RecordingOptions,
  SafetyGatewayState,
  ScreenKind,
  TypingAskRecordState,
} from './types'
import type {
  BabyProfileV2,
  BabyFocusArea,
  BabioLogEntry,
  BabioLogKind,
  BabioNoteEntry,
  CommunityStory,
  ExploreSection,
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
        <Route path="/app/:tab/:section" element={<AppTabRoute />} />
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
  const { section, tab } = useParams()
  const appTab = normalizeAppTab(tab)

  return (
    <RecordingStage
      mode="flow"
      options={{ format: 'phone', background: 'navy', frame: 'phone', autoplay: false, speed: 1 }}
    >
      <StaticAppScreen rawSection={section} rawTab={tab} tab={appTab} />
    </RecordingStage>
  )
}

function normalizeAppTab(tab: string | undefined): AppTab {
  if (tab === 'home' || tab === 'ask' || tab === 'tracker' || tab === 'explore' || tab === 'profile') return tab
  if (tab === 'library' || tab === 'sleep' || tab === 'community') return 'explore'
  if (tab === 'log' || tab === 'notes') return tab
  return 'home'
}

function canonicalAppTab(tab: AppTab): AppTab {
  if (tab === 'log') return 'tracker'
  if (tab === 'library' || tab === 'sleep') return 'explore'
  if (tab === 'notes') return 'profile'
  return tab
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
    if (options.autoplay || (screen !== 'loading' && screen !== 'guidancePreparing')) return undefined

    const timer = window.setTimeout(() => {
      setManualIndex((index) => Math.min(index + 1, flow.manualSequence.length - 1))
      if (flow.id === 'save-for-pediatrician') setToast('Saved to Notes')
    }, 1050)

    return () => window.clearTimeout(timer)
  }, [flow.id, flow.manualSequence.length, options.autoplay, screen])

  const advance = (action?: string) => {
    if (action === 'copy-summary') {
      setToast('Summary copied')
      return
    }

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
  if (screen === 'profile') return flow.screens.profile?.statusBarTime || flow.statusBarTime
  if (screen === 'profileSummary') return flow.screens.profileSummary?.statusBarTime || flow.statusBarTime
  if (screen === 'exploreCommunity') return flow.screens.exploreCommunity?.statusBarTime || flow.statusBarTime
  if (screen === 'typingAsk' || screen === 'typingAskReady') return flow.screens.typingAsk?.statusBarTime || flow.statusBarTime
  if (screen === 'guidancePreparing') return flow.screens.guidancePreparing?.statusBarTime || flow.statusBarTime
  return flow.statusBarTime
}

function StaticAppScreen({
  rawSection,
  rawTab,
  tab,
}: {
  rawSection?: string
  rawTab?: string
  tab: AppTab
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addNoteFromGuidance, addQuickLog, resetDemo, setLastAsk, state, updateProfile } = useBabioStore()
  const [toast, setToast] = useState<string | undefined>()
  const activeTab = canonicalAppTab(tab)
  const exploreSection = resolveExploreSection(rawTab, rawSection)
  const profileSection = resolveProfileSection(rawTab, rawSection)
  const sourceLogId = searchParams.get('log') || undefined
  const sourceLog = sourceLogId ? state.logs.find((entry) => entry.id === sourceLogId) : undefined

  useEffect(() => {
    if (activeTab !== 'ask' || !sourceLog) return
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
    activeTab,
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

  const handleAskFromProfile = () => {
    const input = `What should I do next based on ${state.profile.name}'s recent sleep and feeding?`
    startAsk(input, state.logs[0])
  }

  const handleAskFromCommunity = (story: CommunityStory) => {
    const storyPrompt = story.askPrompt.replace(/\bEmma\b/g, state.profile.name)
    const result = buildGuidanceResult(storyPrompt, {
      profile: state.profile,
      logs: state.logs,
    })
    setLastAsk(storyPrompt, result)
    trackPilotEvent('ask_completed', { topic: result.kind === 'guidance' ? result.topic : 'safety', source: 'community_story', storyId: story.id })
    navigate(`/app/ask?story=${story.id}`)
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
    navigate('/app/profile/notes')
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

  const handleProfileUpdate = (patch: Parameters<typeof updateProfile>[0]) => {
    updateProfile(patch)
    trackPilotEvent('profile_updated', { focusAreas: patch.focusAreas?.join(',') || state.profile.focusAreas.join(',') })
    setToast('Profile updated')
  }

  const statusBarTime =
    activeTab === 'home' || activeTab === 'ask' || (activeTab === 'explore' && exploreSection === 'sleep') ? '3:14 AM' : '8:05 AM'

  return (
    <>
      <PhoneShell activeTab={activeTab} frame="phone" statusBarTime={statusBarTime}>
        {activeTab === 'home' ? (
          <LiveHomeScreen
            logs={state.logs}
            onAddLog={() => handleAddLog(0)}
            onAsk={(input, log) => startAsk(input, log)}
            onAskLatest={() => {
              const latest = state.logs[0]
              startAsk(latest?.askPrompt || 'She woke again and I need one calm next step.', latest)
            }}
            profile={state.profile}
          />
        ) : null}
        {activeTab === 'ask' ? (
          <LiveAskScreen
            lastAsk={state.lastAsk}
            logs={state.logs}
            onSave={handleSaveGuidance}
            onSubmit={(input) => startAsk(input, sourceLog)}
            profile={state.profile}
            sourceLog={sourceLog}
          />
        ) : null}
        {activeTab === 'tracker' ? (
          <LiveLogScreen
            logs={state.logs}
            onAddLog={handleAddLog}
            onAddLogAndAsk={handleAddLogAndAsk}
            onAsk={(entry) => startAsk(entry.askPrompt, entry)}
            profile={state.profile}
          />
        ) : null}
        {activeTab === 'library' ? (
          <LiveLibraryScreen notes={state.notes} onCopy={handleCopyNotes} onReset={handleResetDemo} profile={state.profile} />
        ) : null}
        {activeTab === 'explore' ? (
          <LiveExploreScreen
            notes={state.notes}
            onAskCommunity={handleAskFromCommunity}
            onAskSleep={() => {
              const sleepLog = state.logs.find((entry) => entry.kind === 'sleep') || state.logs[0]
              startAsk(sleepLog?.askPrompt || 'She woke again and I need one calm next step.', sleepLog)
            }}
            onCopy={handleCopyNotes}
            onReset={handleResetDemo}
            onSectionChange={(section) => navigate(`/app/explore/${section}`)}
            profile={state.profile}
            section={exploreSection}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <LiveProfileScreen
            logs={state.logs}
            notes={state.notes}
            onAskUsingContext={handleAskFromProfile}
            onCopySummary={handleCopyNotes}
            onEditProfile={handleProfileUpdate}
            onOpenNotes={() => navigate('/app/profile/notes')}
            profile={state.profile}
            section={profileSection}
          />
        ) : null}
      </PhoneShell>
      {toast ? <Toast text={toast} /> : null}
    </>
  )
}

function resolveExploreSection(rawTab?: string, rawSection?: string): ExploreSection {
  if (rawTab === 'sleep' || rawSection === 'sleep') return 'sleep'
  if (rawTab === 'community' || rawSection === 'community') return 'community'
  return 'guides'
}

function resolveProfileSection(rawTab?: string, rawSection?: string): ProfileSection {
  if (rawTab === 'notes' || rawSection === 'notes') return 'notes'
  return 'overview'
}

type ProfileSection = 'overview' | 'notes'

function LiveProfileScreen({
  logs,
  notes,
  onAskUsingContext,
  onCopySummary,
  onEditProfile,
  onOpenNotes,
  profile,
  section,
}: {
  logs: BabioLogEntry[]
  notes: BabioNoteEntry[]
  onAskUsingContext: () => void
  onCopySummary: () => void
  onEditProfile: (patch: {
    name?: string
    ageWeeks?: number
    avatarEmoji?: string
    feedingStyle?: BabyProfileV2['feedingStyle']
    sleepSetup?: BabyProfileV2['sleepSetup']
    focusAreas?: BabyFocusArea[]
    careNotes?: string
  }) => void
  onOpenNotes: () => void
  profile: BabyProfileV2
  section: ProfileSection
}) {
  const [isEditing, setIsEditing] = useState(false)
  const lastSleep = logs.find((entry) => entry.kind === 'sleep')
  const lastFeed = logs.find((entry) => entry.kind === 'feed')
  const latestNote = notes[0]

  return (
    <section className="app-screen profile-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <div className="profile-hero">
        <div className="profile-avatar-large" aria-hidden="true">
          {profile.avatarEmoji}
        </div>
        <div>
          <span>Primary profile</span>
          <h1>{profile.name}</h1>
          <p>
            {profile.ageLabel} · {formatFeedingStyle(profile.feedingStyle)} · {formatSleepSetup(profile.sleepSetup)}
          </p>
        </div>
        <button className="icon-button profile-edit-button" aria-label="Edit profile" type="button" onClick={() => setIsEditing((value) => !value)}>
          <NotebookTabs aria-hidden="true" />
        </button>
      </div>

      {isEditing ? (
        <ProfileEditPanel
          onCancel={() => setIsEditing(false)}
          onSave={(patch) => {
            onEditProfile(patch)
            setIsEditing(false)
          }}
          profile={profile}
        />
      ) : null}

      <GlassCard className="today-context-card">
        <div className="live-card-heading">
          <h2>Today context</h2>
          <span>Used by Ask</span>
        </div>
        <div className="profile-context-rows">
          <ProfileContextRow Icon={Moon} label="Last sleep" value={lastSleep ? `${lastSleep.time} · ${lastSleep.label}` : 'No sleep log yet'} />
          <ProfileContextRow Icon={Milk} label="Last feed" value={lastFeed ? `${lastFeed.time} · ${lastFeed.label}` : 'No feed log yet'} />
          <ProfileContextRow Icon={NotebookTabs} label="Recent note" value={latestNote?.title || 'No saved note yet'} />
        </div>
        <button className="action-button primary" type="button" onClick={onAskUsingContext}>
          Ask using this context
          <SendHorizontal aria-hidden="true" />
        </button>
      </GlassCard>

      <div className="care-context-grid">
        <CareContextTile Icon={Milk} label="Feeding style" value={formatFeedingStyle(profile.feedingStyle)} />
        <CareContextTile Icon={Moon} label="Sleep setup" value={formatSleepSetup(profile.sleepSetup)} />
        <CareContextTile Icon={Flag} label="Current focus" value={profile.focusAreas.map(formatFocusArea).join(', ')} />
        <CareContextTile Icon={StickyNote} label="Care notes" value={profile.careNotes || 'No extra notes yet'} />
      </div>

      <GlassCard className="profile-notes-card">
        <div className="live-card-heading">
          <h2>{section === 'notes' ? 'Saved notes' : 'Pediatrician prep'}</h2>
          <span>{notes.length} saved</span>
        </div>
        <PediatricianExportCard notes={notes} profile={profile} />
        <div className="profile-note-preview-list">
          {notes.slice(0, section === 'notes' ? 6 : 2).map((note) => (
            <button className="profile-note-preview" key={note.id} type="button" onClick={onOpenNotes}>
              <NotebookTabs aria-hidden="true" />
              <span>
                <strong>{note.title}</strong>
                <small>{note.subtitle}</small>
              </span>
              <ChevronRight aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="button-stack">
          <button className="action-button primary" type="button" onClick={onCopySummary}>
            <Copy aria-hidden="true" />
            Prepare pediatrician summary
          </button>
          {section !== 'notes' ? (
            <button className="action-button secondary" type="button" onClick={onOpenNotes}>
              View saved notes
            </button>
          ) : null}
        </div>
      </GlassCard>
    </section>
  )
}

function ProfileContextRow({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="profile-context-row">
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function CareContextTile({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <GlassCard className="care-context-tile">
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </GlassCard>
  )
}

function ProfileEditPanel({
  onCancel,
  onSave,
  profile,
}: {
  onCancel: () => void
  onSave: (patch: {
    name: string
    ageWeeks: number
    avatarEmoji: string
    feedingStyle: BabyProfileV2['feedingStyle']
    sleepSetup: BabyProfileV2['sleepSetup']
    focusAreas: BabyFocusArea[]
    careNotes: string
  }) => void
  profile: BabyProfileV2
}) {
  const [name, setName] = useState(profile.name)
  const [ageWeeks, setAgeWeeks] = useState(String(profile.ageWeeks))
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji)
  const [feedingStyle, setFeedingStyle] = useState(profile.feedingStyle)
  const [sleepSetup, setSleepSetup] = useState(profile.sleepSetup)
  const [focusAreas, setFocusAreas] = useState<BabyFocusArea[]>(profile.focusAreas)
  const [careNotes, setCareNotes] = useState(profile.careNotes)
  const focusOptions: BabyFocusArea[] = ['sleep', 'feeding', 'comfort', 'routine']

  const toggleFocus = (focus: BabyFocusArea) => {
    setFocusAreas((current) => {
      if (current.includes(focus)) return current.filter((item) => item !== focus)
      return [...current, focus]
    })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      name,
      ageWeeks: Number(ageWeeks) || profile.ageWeeks,
      avatarEmoji,
      feedingStyle,
      sleepSetup,
      focusAreas,
      careNotes,
    })
  }

  return (
    <GlassCard className="profile-edit-panel">
      <form onSubmit={submit}>
        <div className="live-card-heading">
          <h2>Update profile</h2>
          <span>Local demo</span>
        </div>
        <label>
          <span>Baby name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <div className="profile-edit-grid">
          <label>
            <span>Age in weeks</span>
            <input inputMode="numeric" value={ageWeeks} onChange={(event) => setAgeWeeks(event.target.value)} />
          </label>
          <label>
            <span>Avatar</span>
            <input value={avatarEmoji} onChange={(event) => setAvatarEmoji(event.target.value)} />
          </label>
        </div>
        <label>
          <span>Feeding style</span>
          <select value={feedingStyle} onChange={(event) => setFeedingStyle(event.target.value as BabyProfileV2['feedingStyle'])}>
            <option value="breast">Breastfeeding</option>
            <option value="bottle">Bottle feeding</option>
            <option value="combo">Mixed feeding</option>
          </select>
        </label>
        <label>
          <span>Sleep setup</span>
          <select value={sleepSetup} onChange={(event) => setSleepSetup(event.target.value as BabyProfileV2['sleepSetup'])}>
            <option value="bassinet">Bassinet</option>
            <option value="crib">Crib</option>
            <option value="shared-room">Shared room</option>
          </select>
        </label>
        <div className="focus-toggle-group" aria-label="Current focus">
          {focusOptions.map((focus) => (
            <button className={focusAreas.includes(focus) ? 'is-selected' : ''} key={focus} type="button" onClick={() => toggleFocus(focus)}>
              {formatFocusArea(focus)}
            </button>
          ))}
        </div>
        <label>
          <span>Care notes</span>
          <textarea value={careNotes} onChange={(event) => setCareNotes(event.target.value)} />
        </label>
        <div className="button-stack">
          <button className="action-button primary" type="submit">
            Save profile
          </button>
          <button className="action-button secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </GlassCard>
  )
}

function formatFeedingStyle(style: BabyProfileV2['feedingStyle']) {
  if (style === 'breast') return 'Breastfeeding'
  if (style === 'bottle') return 'Bottle feeding'
  return 'Mixed feeding'
}

function formatSleepSetup(setup: BabyProfileV2['sleepSetup']) {
  if (setup === 'crib') return 'Crib'
  if (setup === 'shared-room') return 'Shared room'
  return 'Bassinet'
}

function formatFocusArea(focus: BabyFocusArea) {
  if (focus === 'feeding') return 'Feeding'
  if (focus === 'comfort') return 'Comfort'
  if (focus === 'routine') return 'Routine'
  return 'Sleep'
}

function LiveHomeScreen({
  logs,
  onAddLog,
  onAsk,
  onAskLatest,
  profile,
}: {
  logs: BabioLogEntry[]
  onAddLog: () => void
  onAsk: (input: string, log?: BabioLogEntry) => void
  onAskLatest: () => void
  profile: BabyProfileV2
}) {
  const latest = logs[0]
  const lastFeed = logs.find((entry) => entry.kind === 'feed')
  const lastSleep = logs.find((entry) => entry.kind === 'sleep')

  return (
    <section className="app-screen home-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <div className="premium-home-hero">
        <div>
          <span>Good morning</span>
          <h1>{profile.name} is doing okay.</h1>
          <p>Babio keeps the next step clear, calm, and safe.</p>
        </div>
      </div>

      <GlassCard className="premium-now-card">
        <div>
          <span>What matters now</span>
          <h2>{latest ? latest.label : 'Start with one quick log'}</h2>
          <p>{latest ? latest.detail : 'Add one quick log, then ask Babio what to try next.'}</p>
        </div>
        <div className="premium-status-grid">
          <StatusMetric label="Last feed" value={lastFeed?.time || '2h ago'} tone="mint" />
          <StatusMetric label="Last sleep" value={lastSleep?.time || '38m ago'} tone="lavender" />
          <StatusMetric label="Watch next" value="Wake window" tone="blush" />
        </div>
        <button className="action-button primary premium-ask-cta" type="button" onClick={onAskLatest}>
          Ask Babio
          <SendHorizontal aria-hidden="true" />
        </button>
      </GlassCard>

      <QuickActionTiles
        onAsk={() => onAsk('She woke again and I need one calm next step.')}
        onLog={onAddLog}
        onSleep={onAskLatest}
      />

      <div className="premium-safety-note">
        <ShieldPlus aria-hidden="true" />
        <span>Babio flags when direct pediatric help is safer than app guidance.</span>
      </div>

      <GlassCard className="premium-advice-card">
        <img alt="" src={motherBabyCard} />
        <div>
          <span>Today’s guide</span>
          <h2>How to reset a long night wake</h2>
          <p>Use the latest log to choose one calm step before adding more stimulation.</p>
          <button type="button" onClick={onAskLatest}>
            Ask about this <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </GlassCard>
      <LiveDailyBriefCard logs={logs} profile={profile} />
    </section>
  )
}

function StatusMetric({ label, tone, value }: { label: string; tone: 'blush' | 'lavender' | 'mint'; value: string }) {
  return (
    <div className={`status-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function QuickActionTiles({
  onAsk,
  onLog,
  onSleep,
}: {
  onAsk: () => void
  onLog: () => void
  onSleep: () => void
}) {
  const actions = [
    { label: 'Milk', Icon: Milk, tone: 'blush', onClick: onLog },
    { label: 'Sleep', Icon: Moon, tone: 'lavender', onClick: onSleep },
    { label: 'Diaper', Icon: Droplets, tone: 'mint', onClick: onLog },
    { label: 'Ask', Icon: MessageCircle, tone: 'cream', onClick: onAsk },
  ]

  return (
    <div className="premium-action-grid" aria-label="Quick actions">
      {actions.map(({ Icon, label, onClick, tone }) => (
        <button className={`premium-action-tile ${tone}`} key={label} type="button" onClick={onClick}>
          <span>
            <Icon aria-hidden="true" />
          </span>
          <strong>{label}</strong>
        </button>
      ))}
    </div>
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
      <div className="premium-screen-title">
        <h1>Growth & care</h1>
        <p>Track the patterns that help Babio answer better.</p>
      </div>
      <GlassCard className="tracker-chart-card">
        <div className="live-card-heading">
          <h2>Today’s rhythm</h2>
          <span>Last 24h</span>
        </div>
        <div className="soft-chart" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="tracker-legend">
          <span><Moon aria-hidden="true" /> Sleep</span>
          <span><Milk aria-hidden="true" /> Feeding</span>
          <span><Heart aria-hidden="true" /> Comfort</span>
        </div>
      </GlassCard>
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
        <div className="live-card-heading timeline-heading">
          <h2>Recent care log</h2>
          <span>{logs.length} items</span>
        </div>
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
  const [isPreparing, setIsPreparing] = useState(false)
  const submitTimerRef = useRef<number | undefined>(undefined)
  const latestLog = sourceLog || logs[0]

  useEffect(() => {
    if (sourceLog?.askPrompt) setInput(sourceLog.askPrompt)
  }, [sourceLog?.askPrompt])

  useEffect(() => {
    if (lastAsk) setIsPreparing(false)
  }, [lastAsk])

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current)
    }
  }, [])

  const submitAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setIsPreparing(true)

    if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current)
    submitTimerRef.current = window.setTimeout(() => {
      onSubmit(trimmed)
    }, 1150)
  }

  return (
    <section className="app-screen ask-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <h1>Ask Babio</h1>
      <p className="screen-subtitle">A structured answer, not an open chat.</p>
      <form className={`live-ask-form guidance-form-card ${lastAsk ? 'compact' : ''} ${isPreparing ? 'is-preparing' : ''}`} onSubmit={submitAsk}>
        <div className="ask-form-heading">
          <span>Personalized guidance</span>
          <h2>{lastAsk ? 'Ask another detail' : 'Tell Babio what happened'}</h2>
          <p>Babio uses {profile.name}'s profile, recent log, and safety signals before giving one next step.</p>
        </div>
        <label className="sr-only" htmlFor="babio-guidance-input">
          What happened?
        </label>
        <textarea
          id="babio-guidance-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isPreparing}
        />
        {!isPreparing ? (
          <div className="guidance-context-strip" aria-label="Guidance context">
            <GuidanceContextPill Icon={Baby} label="Profile" value={`${profile.name}, ${profile.ageLabel}`} />
            <GuidanceContextPill
              Icon={latestLog ? iconComponentForLogKind(latestLog.kind) : NotebookTabs}
              label="Latest log"
              value={latestLog?.time || 'Not yet'}
            />
            <GuidanceContextPill Icon={ShieldPlus} label="Safety" value="Checked first" />
          </div>
        ) : null}
        <button className="action-button primary guidance-submit-button" type="submit" disabled={isPreparing || !input.trim()}>
          {isPreparing ? (
            <>
              <Sparkles aria-hidden="true" />
              Preparing guidance...
            </>
          ) : (
            <>
              Get Personalized Guidance
              <SendHorizontal aria-hidden="true" />
            </>
          )}
        </button>
      </form>
      {isPreparing ? <GuidancePreparingCard latestLog={latestLog} profile={profile} /> : null}
      {lastAsk && !isPreparing ? <LiveGuidanceDecision result={lastAsk.result} onSave={onSave} /> : null}
    </section>
  )
}

function GuidanceContextPill({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="guidance-context-pill">
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function GuidancePreparingCard({
  latestLog,
  profile,
}: {
  latestLog?: BabioLogEntry
  profile: BabyProfileV2
}) {
  const rows = [
    latestLog ? `Reading ${profile.name}'s profile + latest log` : `Reading ${profile.name}'s profile`,
    'Checking safety signals before advice',
  ]

  return (
    <GlassCard className="guidance-preparing-card" role="status" aria-live="polite">
      <div className="guidance-preparing-heading">
        <Sparkles aria-hidden="true" />
        <div>
          <h2>Personalizing guidance</h2>
          <p>Babio is turning the context into one safe next step.</p>
        </div>
      </div>
      <div className="guidance-progress-line" aria-hidden="true" />
      <div className="guidance-preparing-rows">
        {rows.map((row, index) => (
          <div className="guidance-preparing-row" key={row}>
            <span>{index + 1}</span>
            <strong>{row}</strong>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function LiveExploreScreen({
  notes,
  onAskCommunity,
  onAskSleep,
  onCopy,
  onReset,
  onSectionChange,
  profile,
  section,
}: {
  notes: BabioNoteEntry[]
  onAskCommunity: (story: CommunityStory) => void
  onAskSleep: () => void
  onCopy: () => void
  onReset: () => void
  onSectionChange: (section: ExploreSection) => void
  profile: BabyProfileV2
  section: ExploreSection
}) {
  return (
    <section className="app-screen explore-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <div className="premium-screen-title">
        <h1>Explore</h1>
        <p>Gentle guidance, sleep tools, and parent stories.</p>
      </div>
      <ExploreSegmentedControl active={section} onChange={onSectionChange} />
      {section === 'guides' ? <GuideExploreSection notes={notes} onCopy={onCopy} onReset={onReset} profile={profile} /> : null}
      {section === 'sleep' ? <SleepExploreSection onAskSleep={onAskSleep} /> : null}
      {section === 'community' ? <CommunityStoriesSection onAskCommunity={onAskCommunity} profile={profile} /> : null}
    </section>
  )
}

function ExploreSegmentedControl({
  active,
  onChange,
}: {
  active: ExploreSection
  onChange: (section: ExploreSection) => void
}) {
  const items: { label: string; section: ExploreSection }[] = [
    { label: 'Guides', section: 'guides' },
    { label: 'Sleep', section: 'sleep' },
    { label: 'Community', section: 'community' },
  ]

  return (
    <div className="explore-segmented-control" role="tablist" aria-label="Explore sections">
      {items.map((item) => (
        <button
          aria-selected={active === item.section}
          className={active === item.section ? 'is-selected' : ''}
          key={item.section}
          role="tab"
          type="button"
          onClick={() => onChange(item.section)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function GuideExploreSection({
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
  const recommendations = [
    { label: 'Sleep', title: 'The 5 S’s of a calmer reset', meta: '4 min guide' },
    { label: 'Feeding', title: 'Latching and bottle rhythm', meta: '3 min guide' },
    { label: 'Safety', title: 'When fever needs direct help', meta: 'Checklist' },
  ]

  return (
    <>
      <div className="library-search" role="search">
        <Search aria-hidden="true" />
        <span>Search advice, notes, and guides...</span>
      </div>
      <GlassCard className="library-feature-card">
        <img alt="" src={motherBabyCard} />
        <div>
          <span>Daily feature</span>
          <h2>Why is my baby crying?</h2>
          <p>Use recent sleep, feeding, and comfort logs before guessing.</p>
        </div>
      </GlassCard>
      <div className="recommendation-list">
        <div className="live-card-heading">
          <h2>Recommended for {profile.name}</h2>
          <span>Guides</span>
        </div>
        {recommendations.map((item) => (
          <GlassCard className="recommendation-row" key={item.title}>
            <span>{item.label}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </div>
            <ChevronRight aria-hidden="true" />
          </GlassCard>
        ))}
      </div>
      <PediatricianExportCard notes={notes} profile={profile} />
      <div className="button-stack">
        <button className="action-button primary" type="button" onClick={onCopy}>
          <Copy aria-hidden="true" />
          Copy pediatrician summary
        </button>
        <button className="action-button secondary" type="button" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Reset demo
        </button>
      </div>
    </>
  )
}

function SleepExploreSection({ onAskSleep }: { onAskSleep: () => void }) {
  const sounds = [
    { label: 'White noise', Icon: Volume2, tone: 'blush' },
    { label: 'Rain', Icon: Droplets, tone: 'lavender' },
    { label: 'Lullaby', Icon: Headphones, tone: 'mint' },
    { label: 'Heartbeat', Icon: Heart, tone: 'cream' },
  ]

  return (
    <>
      <GlassCard className="sleep-sanctuary-card">
        <Moon aria-hidden="true" />
        <div>
          <h1>Sleep sanctuary</h1>
          <p>Curated sounds and calm context before the next sleep question.</p>
        </div>
      </GlassCard>
      <GlassCard className="sleep-player-card">
        <Volume2 aria-hidden="true" />
        <span>Now playing</span>
        <h2>White Noise</h2>
        <button aria-label="Pause white noise" type="button">
          <Pause aria-hidden="true" />
        </button>
        <div className="sleep-timer" aria-label="Sleep timer">
          <span className="active">15m</span>
          <span>30m</span>
          <span>1h</span>
        </div>
      </GlassCard>
      <div className="sleep-sound-grid">
        {sounds.map(({ Icon, label, tone }) => (
          <button className={`sleep-sound-tile ${tone}`} key={label} type="button">
            <Icon aria-hidden="true" />
            <strong>{label}</strong>
          </button>
        ))}
      </div>
      <GlassCard className="sleep-tip-card">
        <Lamp aria-hidden="true" />
        <div>
          <h2>Gentle sleep tip</h2>
          <p>Keep the reset boring: low light, steady sound, one repeated soothing step.</p>
        </div>
      </GlassCard>
      <button className="action-button primary" type="button" onClick={onAskSleep}>
        Ask about tonight
        <SendHorizontal aria-hidden="true" />
      </button>
    </>
  )
}

function CommunityStoriesSection({
  onAskCommunity,
  profile,
}: {
  onAskCommunity: (story: CommunityStory) => void
  profile: BabyProfileV2
}) {
  return (
    <>
      <GlassCard className="community-intro-card">
        <div>
          <span>Parent stories</span>
          <h2>Moments other parents recognize</h2>
          <p>Shared stories are starting points. Babio still personalizes the next step for {profile.name}.</p>
        </div>
      </GlassCard>
      <div className="community-topic-strip" aria-label="Community topics">
        <span>Wakes</span>
        <span>Feeding</span>
        <span>Crying</span>
        <span>Routine</span>
      </div>
      <div className="community-story-list">
        {communityStories.map((story) => (
          <CommunityStoryCard babyName={profile.name} key={story.id} onAsk={() => onAskCommunity(story)} story={story} />
        ))}
      </div>
      <GlassCard className="community-safety-note">
        <ShieldPlus aria-hidden="true" />
        <p>Parent stories are shared moments, not clinical advice. Babio checks profile, recent log, and safety signals before guidance.</p>
      </GlassCard>
    </>
  )
}

function CommunityStoryCard({ babyName, onAsk, story }: { babyName: string; onAsk: () => void; story: CommunityStory }) {
  return (
    <GlassCard className="community-story-card">
      <div className="community-story-meta">
        <span>{story.ageRangeLabel}</span>
        <span>{story.topicLabel}</span>
      </div>
      <h2>{story.title}</h2>
      <p>{story.summary}</p>
      <small>{story.parentSignal}</small>
      <button className="action-button secondary" type="button" onClick={onAsk}>
        Personalize for {babyName}
        <SendHorizontal aria-hidden="true" />
      </button>
    </GlassCard>
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

function LiveLibraryScreen({
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
  const recommendations = [
    { label: 'Sleep', title: 'The 5 S’s of a calmer reset', meta: '4 min guide' },
    { label: 'Feeding', title: 'Latching and bottle rhythm', meta: '3 min guide' },
    { label: 'Safety', title: 'When fever needs direct help', meta: 'Checklist' },
  ]

  return (
    <section className="app-screen notes-screen library-screen live-scroll-screen">
      <AppHeader profile={profile} />
      <div className="premium-screen-title">
        <h1>Care library</h1>
        <p>Saved guidance, gentle tips, and pediatrician-ready notes.</p>
      </div>
      <div className="library-search" role="search">
        <Search aria-hidden="true" />
        <span>Search advice, notes, and guides...</span>
      </div>
      <GlassCard className="library-feature-card">
        <img alt="" src={motherBabyCard} />
        <div>
          <span>Daily feature</span>
          <h2>Why is my baby crying?</h2>
          <p>Use recent sleep, feeding, and comfort logs before guessing.</p>
        </div>
      </GlassCard>
      <div className="recommendation-list">
        <div className="live-card-heading">
          <h2>Recommended for you</h2>
          <span>View all</span>
        </div>
        {recommendations.map((item) => (
          <GlassCard className="recommendation-row" key={item.title}>
            <span>{item.label}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </div>
            <ChevronRight aria-hidden="true" />
          </GlassCard>
        ))}
      </div>
      <PediatricianExportCard notes={notes} profile={profile} />
      <div className="live-card-heading saved-heading">
        <h2>Saved notes</h2>
        <span>{notes.length}</span>
      </div>
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
          <RotateCcw aria-hidden="true" />
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

function iconComponentForLogKind(kind: BabioLogKind): LucideIcon {
  if (kind === 'feed') return Milk
  if (kind === 'diaper') return Droplets
  if (kind === 'comfort') return Heart
  if (kind === 'routine') return Flag
  return Moon
}

function iconComponentForName(name?: string): LucideIcon {
  if (name === 'baby') return Baby
  if (name === 'bottle' || name === 'feed') return Milk
  if (name === 'diaper') return Droplets
  if (name === 'heart' || name === 'comfort') return Heart
  if (name === 'flag' || name === 'routine') return Flag
  if (name === 'lamp') return Lamp
  if (name === 'note') return NotebookTabs
  if (name === 'play') return Play
  if (name === 'spark') return Sparkles
  if (name === 'thermometer') return Thermometer
  if (name === 'moon' || name === 'sleep') return Moon
  return CircleHelp
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
  if (screen === 'profile') return <ProfileRecordScreen state={flow.screens.profile!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'exploreCommunity') return <ExploreCommunityRecordScreen state={flow.screens.exploreCommunity!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'profileSummary') return <ProfileSummaryRecordScreen state={flow.screens.profileSummary!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'typingAsk' || screen === 'typingAskReady') {
    return (
      <TypingAskRecordScreen
        ready={screen === 'typingAskReady'}
        state={flow.screens.typingAsk!}
        onAction={onAction}
        tapTarget={tapTarget}
      />
    )
  }
  if (screen === 'ask') return <AskScreen state={flow.screens.ask!} onAction={onAction} tapTarget={tapTarget} />
  if (screen === 'loading') return <LoadingScreen state={flow.screens.loading} />
  if (screen === 'guidancePreparing') return <GuidancePreparingScreen state={flow.screens.guidancePreparing!} />
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
  const profileContent = profile ? (
    <Link className="header-profile-pill" to="/app/profile">
      <BabyAvatar profile={profile} />
      <span>
        {profile.name}, {profile.ageLabel}
      </span>
    </Link>
  ) : (
    <>
      <BabyAvatar profile={profile} />
      <BabioLogo />
    </>
  )

  return (
    <header className={`app-header ${centered ? 'centered' : ''}`}>
      {centered ? <ArrowLeft className="back-icon" aria-label="Back" /> : null}
      <div className="brand-cluster">{profileContent}</div>
      <button className="notification-button" aria-label="Notifications" type="button">
        <Bell aria-hidden="true" />
      </button>
    </header>
  )
}

function BabioLogo() {
  return <div className="babio-logo">Babio</div>
}

function BabyAvatar({ profile = babyProfile }: { profile?: BabyPillProfile }) {
  return (
    <span className="baby-avatar" aria-label={`${profile.name}, ${profile.ageLabel}`}>
      {profile.avatarEmoji}
    </span>
  )
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

function ProfileRecordScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: ProfileRecordState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen profile-screen">
      <AppHeader profile={state.profile} />
      <div className="profile-hero">
        <div className="profile-avatar-large" aria-hidden="true">
          {state.profile.avatarEmoji}
        </div>
        <div>
          <span>Primary profile</span>
          <h1>{state.profile.name}</h1>
          <p>{state.profile.ageLabel} · personalized care context</p>
        </div>
      </div>
      <div className="care-context-grid">
        {state.facts.map((fact) => (
          <CareContextTile Icon={iconComponentForName(fact.icon)} key={`${fact.label}-${fact.value}`} label={fact.label} value={fact.value} />
        ))}
      </div>
      <GlassCard className="today-context-card">
        <div className="live-card-heading">
          <h2>{state.title}</h2>
          <span>{state.subtitle}</span>
        </div>
        <div className="profile-context-rows">
          {state.todayContext.map((item) => (
            <ProfileContextRow Icon={iconComponentForName(item.icon)} key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
          ))}
        </div>
        <ActionButtonView action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
      </GlassCard>
    </section>
  )
}

function ExploreCommunityRecordScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: ExploreCommunityRecordState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen explore-screen">
      <AppHeader />
      <div className="premium-screen-title">
        <h1>{state.title}</h1>
        <p>{state.subtitle}</p>
      </div>
      <ExploreSegmentedControl active="community" onChange={() => undefined} />
      <GlassCard className="community-story-card hero-story-card">
        <div className="community-story-meta">
          <span>{state.story.ageRangeLabel}</span>
          <span>{state.story.topicLabel}</span>
        </div>
        <h2>{state.story.title}</h2>
        <p>{state.story.summary}</p>
        <small>{state.story.parentSignal}</small>
        <ActionButtonView action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
      </GlassCard>
      <GlassCard className="community-safety-note">
        <ShieldPlus aria-hidden="true" />
        <p>{state.story.safetyNote}</p>
      </GlassCard>
    </section>
  )
}

function ProfileSummaryRecordScreen({
  state,
  onAction,
  tapTarget,
}: {
  state: ProfileSummaryRecordState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className="app-screen profile-screen">
      <AppHeader centered profile={state.profile} />
      <h1>{state.title}</h1>
      <p className="screen-subtitle">{state.subtitle}</p>
      <GlassCard className="pediatrician-export-card summary-record-card">
        <div className="note-title">
          <ShieldPlus aria-hidden="true" />
          <div>
            <h2>Pediatrician summary</h2>
            <p>{state.profile.name}, {state.profile.ageLabel} · ready to copy</p>
          </div>
        </div>
        {state.notes.map((note) => (
          <section className="note-section" key={note.label}>
            <h3>{note.label}</h3>
            <p>{note.body}</p>
          </section>
        ))}
      </GlassCard>
      <div className="button-stack">
        <ActionButtonView action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
      </div>
    </section>
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
      <GlassCard className="live-ask-form guidance-form-card static-guidance-form">
        <div className="ask-form-heading">
          <span>Personalized guidance</span>
          <h2>Tell Babio what happened</h2>
          <p>Babio uses Emma’s profile, recent log, and safety signals before giving one next step.</p>
        </div>
        <div className="readonly-guidance-input" aria-label="Question">
          {state.input}
        </div>
        <div className="guidance-context-strip" aria-label="Guidance context">
          {state.quickContext.slice(0, 3).map((item) => (
            <GuidanceContextPill
              Icon={iconComponentForName(item.icon)}
              key={`${item.label}-${item.value}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
        <GuidanceSubmitAction action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
      </GlassCard>
      {state.chips ? <SupportChips chips={state.chips} /> : null}
    </section>
  )
}

function TypingAskRecordScreen({
  ready,
  state,
  onAction,
  tapTarget,
}: {
  ready: boolean
  state: TypingAskRecordState
  onAction: (action?: string) => void
  tapTarget?: string
}) {
  return (
    <section className={`app-screen ask-screen typing-ask-screen ${ready ? 'is-ready' : ''}`}>
      <AppHeader profile={state.profile} />
      <h1>{state.title}</h1>
      <p className="screen-subtitle">{state.subtitle}</p>
      <GlassCard className="live-ask-form guidance-form-card typing-guidance-card">
        <div className="ask-form-heading">
          <span>Personalized guidance</span>
          <h2>Tell Babio what happened</h2>
          <p>Babio uses {state.profile.name}’s profile, recent log, and safety signals before giving one next step.</p>
        </div>
        <div className="readonly-guidance-input typing-guidance-input" aria-label="Typed question">
          <span className="typing-text">{state.typedText}</span>
          <span className="typing-caret" aria-hidden="true" />
        </div>
        <div className="guidance-context-strip compact" aria-label="Guidance context">
          {state.quickContext.map((item) => (
            <GuidanceContextPill
              Icon={iconComponentForName(item.icon)}
              key={`${item.label}-${item.value}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
        {ready ? (
          <GuidanceSubmitAction action={state.primaryAction} onAction={onAction} tapTarget={tapTarget} />
        ) : (
          <button className="action-button primary guidance-submit-button" type="button" disabled>
            <span>{state.primaryAction.label}</span>
            <SendHorizontal aria-hidden="true" />
          </button>
        )}
      </GlassCard>
      <FakeIosKeyboard />
    </section>
  )
}

function FakeIosKeyboard() {
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

  return (
    <div className="fake-ios-keyboard" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div className={`keyboard-row row-${rowIndex + 1}`} key={row}>
          {rowIndex === 2 ? <span className="keyboard-key utility">shift</span> : null}
          {Array.from(row).map((letter) => (
            <span className="keyboard-key" key={letter}>
              {letter}
            </span>
          ))}
          {rowIndex === 2 ? <span className="keyboard-key utility">delete</span> : null}
        </div>
      ))}
      <div className="keyboard-row row-4">
        <span className="keyboard-key utility wide">123</span>
        <span className="keyboard-key space">space</span>
        <span className="keyboard-key utility wide">return</span>
      </div>
    </div>
  )
}

function SupportChips({ chips }: { chips: string[] }) {
  return (
    <div className="support-chip-row">
      {chips.map((chip) => (
        <span key={chip}>{chip}</span>
      ))}
    </div>
  )
}

function GuidanceSubmitAction({
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
      className={`action-button primary guidance-submit-button ${isTapTarget ? 'is-tap-target' : ''}`}
      type="button"
      onClick={() => onAction(action.action)}
    >
      <span>{action.label}</span>
      <SendHorizontal aria-hidden="true" />
      {isTapTarget ? <TapIndicator /> : null}
    </button>
  )
}

function GuidancePreparingScreen({ state }: { state: GuidancePreparingState }) {
  return (
    <section className="app-screen ask-screen">
      <AppHeader />
      <h1>{state.title}</h1>
      <p className="screen-subtitle">{state.subtitle}</p>
      <GlassCard className="live-ask-form guidance-form-card static-guidance-form is-preparing">
        <div className="ask-form-heading">
          <span>Personalized guidance</span>
          <h2>Tell Babio what happened</h2>
          <p>Babio uses the profile, recent log, and safety signals before giving one next step.</p>
        </div>
        <div className="readonly-guidance-input compact" aria-label="Question">
          {state.input}
        </div>
        <button className="action-button primary guidance-submit-button" type="button" disabled>
          <Sparkles aria-hidden="true" />
          Preparing guidance...
        </button>
      </GlassCard>
      <GlassCard className="guidance-preparing-card" role="status" aria-live="polite">
        <div className="guidance-preparing-heading">
          <Sparkles aria-hidden="true" />
          <div>
            <h2>{state.loadingTitle}</h2>
            <p>{state.loadingBody}</p>
          </div>
        </div>
        <div className="guidance-progress-line" aria-hidden="true" />
        <div className="guidance-preparing-rows">
          {state.loadingItems.map((row, index) => (
            <div className="guidance-preparing-row" key={row}>
              <span>{index + 1}</span>
              <strong>{row}</strong>
            </div>
          ))}
        </div>
      </GlassCard>
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
    <section className={`app-screen result-screen ${result.presentation === 'screencast' ? 'result-screen-compact' : ''}`}>
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

function GlassCard({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  )
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
  { tab: 'tracker', label: 'Tracker', Icon: ClipboardList, to: '/app/tracker' },
  { tab: 'ask', label: 'Ask', Icon: MessageCircle, to: '/app/ask' },
  { tab: 'explore', label: 'Explore', Icon: Compass, to: '/app/explore' },
  { tab: 'profile', label: 'Profile', Icon: Baby, to: '/app/profile' },
]

function BottomNav({ activeTab, recording }: { activeTab: AppTab; recording: boolean }) {
  const canonicalActiveTab = canonicalAppTab(activeTab)

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
          <span className={canonicalActiveTab === tab ? 'active' : ''} key={tab}>
            {content}
          </span>
        ) : (
          <Link className={canonicalActiveTab === tab ? 'active' : ''} key={tab} to={to}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export default App
