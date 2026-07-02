# Babio Profile, Explore, and Community Stories Spec

Дата: 2026-07-02

Статус: proposed

## Зачем это нужно

Babio уже выглядит как живой baby-care app, но сейчас не хватает двух продуктовых опор:

1. Ясного личного кабинета ребенка, который объясняет, откуда берется персонализация.
2. Места для контента и social proof, где мама видит, что похожие ситуации бывают у других, но не получает опасные советы из открытого форума.

Новая архитектура должна усилить главную петлю Babio:

```text
baby profile -> quick log -> ask -> one calm step -> saved memory
```

При этом нельзя превращать продукт в медицинский чат, глубокий baby tracker или нерегулируемый форум.

## Ключевое решение

Нижнее меню должно стать:

```text
Home / Tracker / Ask / Explore / Profile
```

Почему так:

- `Profile` должен быть ключевой вкладкой, потому что это источник trust и персонализации.
- `Explore` должен объединить текущие `Library`, `Sleep` и будущий безопасный community layer.
- `Ask` остается центральным действием.
- `Tracker` остается источником свежего контекста.
- `Home` остается ежедневным dashboard.

Старые маршруты нельзя ломать:

```text
/app/library -> открывает Explore на секции Guides
/app/sleep -> открывает Explore на секции Sleep
/app/notes -> открывает Profile на секции Saved notes
/app/log -> остается alias для Tracker
```

## Продуктовая модель

### Profile

`Profile` это не аккаунт мамы. Это карточка ребенка и care context.

Главная идея экрана:

```text
Everything Babio knows before giving guidance.
```

Экран отвечает на вопрос: “Почему Babio может дать персональный следующий шаг именно для Emma?”

### Explore

`Explore` это не маркетинговая библиотека. Это спокойное место для:

- guides;
- sleep tools;
- community stories;
- saved learning moments.

Главная идея экрана:

```text
Learn, compare, then personalize for your baby.
```

### Community Stories

На ближайшем этапе это не открытый форум. Это curated community feed с заранее подготовленными историями и безопасными CTA.

Главная идея:

```text
Other parents recognize the moment. Babio personalizes the next step for your baby.
```

Нельзя давать пользователям ощущение, что советы других родителей заменяют педиатра или персональный guidance.

## Информационная архитектура

### Bottom nav

Новые tabs:

```text
Home
Tracker
Ask
Explore
Profile
```

Иконки:

- Home: `Home`
- Tracker: `ClipboardList`
- Ask: `MessageCircle`
- Explore: `Compass` или `BookOpenCheck`
- Profile: `Baby` или `UserRound`

Рекомендация: `Profile` лучше с иконкой `Baby`, чтобы это читалось как карточка ребенка, а не generic account.

### Header

На всех живых экранах должен быть кликабельный baby pill:

```text
🙂 Emma, 9 wk
```

Поведение:

- tap по avatar/name открывает `/app/profile`;
- notification button остается справа;
- на `Profile` header может показывать `Babio` + edit/settings action.

Это важно: пользователь должен в любой момент понимать, что все ответы привязаны к конкретному ребенку.

## Profile screen UX

### Первый viewport

Первый экран должен быть спокойным и премиальным. Не делать настройки списком.

Структура:

```text
Header
Baby profile hero
Today context
Primary action
Care context
Saved notes / pediatrician prep
```

### Baby profile hero

Верхний блок:

```text
🙂 Emma
9 weeks
Primary profile
```

Рядом или ниже:

```text
Feeding: Mixed
Sleep: Bassinet
Updated: Today
```

CTA:

```text
Update profile
```

Визуально:

- теплый молочный фон;
- карточка без тяжелой тени;
- pastel avatar circle;
- крупное имя;
- age label как сильный контекстный сигнал;
- 2-3 compact facts, без перегруза.

### Today context

Блок показывает то, что Babio учитывает прямо сейчас:

```text
Last sleep: 2:40 AM wake
Last feed: 2:10 AM
Recent note: Night wake pattern
```

CTA:

```text
Ask using this context
```

Нажатие:

- открывает `/app/ask`;
- input может быть prefilled: `What should I do next based on Emma’s recent sleep and feeding?`;
- Ask показывает context pills из профиля и последних логов.

### Care context

Read-only карточки:

```text
Feeding style
Mixed feeding

Sleep setup
Bassinet, shared room

Current focus
Night wakes, calm resets
```

Позже редактируется через modal или отдельный edit screen.

### Saved notes

Короткий preview последних сохраненных guidance notes:

```text
Night wake pattern
Saved today

Feeding question
Saved yesterday
```

CTA:

```text
Prepare pediatrician summary
```

Это переносит текущую силу Library/Notes в более логичное место: профиль ребенка.

## Profile edit UX

В первой реализации не нужен большой onboarding. Нужен легкий edit panel.

Поля MVP:

```text
Baby name
Age in weeks
Feeding style: Breast / Bottle / Mixed
Sleep setup: Bassinet / Crib / Shared room
Current focus: Sleep / Feeding / Comfort / Routine
Care notes
```

Не добавлять пока:

- медицинские диагнозы;
- medications;
- growth percentiles;
- allergy claims;
- upload документов;
- multiple caregivers;
- real auth/account settings.

### Save behavior

При сохранении:

- обновляется `localStorage`;
- Home, Ask, Tracker, Profile сразу показывают новые значения;
- создается pilot event `profile_updated`;
- показывается toast `Profile updated`;
- если поле пустое, используется безопасный fallback из seed profile.

## Explore screen UX

`Explore` должен заменить текущую пару `Library` + `Sleep`, но не потерять их функции.

### Top structure

```text
Header
Title: Explore
Subtitle: Gentle guidance, sleep tools, and parent stories.
Segmented control: Guides / Sleep / Community
Content area
```

### Guides section

Содержит текущую Library-логику:

- search;
- guide feature card;
- recommended rows;
- saved notes entry point can remain as secondary, but primary notes home moves to Profile.

CTA examples:

```text
Read guide
Ask Babio about this
Save for later
```

### Sleep section

Содержит текущую Sleep-логику:

- sleep sound player;
- timer chips;
- sound library;
- gentle sleep tip;
- CTA `Ask about tonight`.

Важно: Sleep больше не занимает отдельную bottom-nav вкладку, но остается полноценной секцией.

### Community section

MVP название:

```text
Parent stories
```

Не использовать слово `Forum` в первом UI, потому что оно обещает открытое пользовательское общение.

Структура:

```text
Age matched stories
Topics
Story cards
Safety note
```

Story card:

```text
8-10 weeks
Night wakes
"My baby woke again after a calm feed."
18 parents saved this moment
CTA: Personalize for Emma
```

Нажатие `Personalize for Emma`:

- открывает `/app/ask`;
- prefilled input: `Emma woke again after a calm feed. What is one calm next step tonight?`;
- source context содержит community story id;
- Ask result не говорит “другие мамы советуют”, а использует личный профиль и лог.

Story detail:

```text
What parents recognized
Common context
What Babio checks before guidance
Button: Get personalized guidance
```

Нельзя показывать:

- комментарии без модерации;
- советы пользователей как медицинскую рекомендацию;
- дозировки;
- диагнозы;
- “this is normal” без safety boundary.

## Visual direction

Общий стиль должен продолжать premium baby-care pass:

- теплый белый и молочный фон;
- пастельные accents;
- мягкие rounded cards;
- много воздуха, но без пустоты;
- крупная readable typography;
- маленькие informative chips;
- иконки в pastel circles;
- минимум темных блоков;
- никаких heavy dashboard tables.

### Profile visual hierarchy

Самое крупное на экране:

```text
Emma
9 weeks
```

Второй уровень:

```text
Today context
Ask using this context
```

Третий уровень:

```text
Feeding / Sleep setup / Focus / Notes
```

### Explore visual hierarchy

Самое крупное:

```text
Explore
```

Второй уровень:

```text
Guides / Sleep / Community segmented control
```

Третий уровень:

```text
content cards
```

Community cards должны выглядеть мягко и человечно, но не как social network.

## Data model changes

Текущий `BabyProfileV2`:

```ts
interface BabyProfileV2 {
  id: string
  name: string
  ageWeeks: number
  ageLabel: string
  avatarEmoji: string
  feedingStyle: BabyFeedingStyle
  sleepSetup: BabySleepSetup
}
```

Рекомендуемое расширение:

```ts
type BabyFocusArea = 'sleep' | 'feeding' | 'comfort' | 'routine'

interface BabyProfileV2 {
  id: string
  name: string
  ageWeeks: number
  ageLabel: string
  avatarEmoji: string
  feedingStyle: BabyFeedingStyle
  sleepSetup: BabySleepSetup
  focusAreas: BabyFocusArea[]
  careNotes: string
  updatedAt: string
}
```

Для Explore:

```ts
type ExploreSection = 'guides' | 'sleep' | 'community'
type CommunityTopic = 'night-wakes' | 'feeding' | 'crying' | 'routine' | 'pediatrician'

interface CommunityStory {
  id: string
  topic: CommunityTopic
  ageRangeLabel: string
  title: string
  summary: string
  parentSignal: string
  askPrompt: string
  safetyNote: string
}
```

Store actions:

```ts
updateProfile(profilePatch)
setExploreSection(section)
startAskFromCommunityStory(story)
```

Не хранить реальные user posts в localStorage на MVP. Community stories должны жить в `src/data/communityStories.ts` как curated fixtures.

## Routing changes

Нужно расширить `AppTab`:

```ts
type AppTab =
  | 'home'
  | 'ask'
  | 'tracker'
  | 'explore'
  | 'profile'
  | 'library'
  | 'sleep'
  | 'log'
  | 'notes'
```

`normalizeAppTab`:

```text
home -> home
tracker/log -> tracker
ask -> ask
explore/library/sleep/community -> explore
profile/notes -> profile
fallback -> home
```

`canonicalAppTab`:

```text
log -> tracker
library -> explore
sleep -> explore
community -> explore
notes -> profile
```

Routes:

```text
/app/home
/app/tracker
/app/ask
/app/explore
/app/explore/guides
/app/explore/sleep
/app/explore/community
/app/profile
/app/profile/notes
```

Для совместимости:

```text
/app/library -> same UI as /app/explore/guides
/app/sleep -> same UI as /app/explore/sleep
/app/notes -> same UI as /app/profile/notes
/app/log -> same UI as /app/tracker
```

В этой версии можно не делать полноценные nested routes, если проще держать `section` из path или query внутри `StaticAppScreen`.

## Component plan

Новые компоненты:

```text
LiveProfileScreen
BabyProfileHero
TodayContextCard
CareContextGrid
ProfileNotesPreview
ProfileEditPanel
LiveExploreScreen
ExploreSegmentedControl
GuideExploreSection
SleepExploreSection
CommunityStoriesSection
CommunityStoryCard
CommunityStoryDetail
```

Компоненты, которые нужно переиспользовать:

```text
AppHeader
BabyAvatar
BabySwitcher
GlassCard
GuidanceContextPill
PediatricianExportCard
LiveLibraryScreen content blocks
LiveSleepScreen content blocks
BottomNav
Toast
```

Рекомендация по коду:

- не увеличивать `App.tsx` бесконечно;
- вынести крупные live screens в `src/components/live/` на следующем этапе;
- но для первого вертикального среза допустимо добавить компоненты в `App.tsx`, если это быстрее и не ломает flow.

## Safety and copy rules

Community copy должна проходить те же ограничения, что guidance:

- нет диагнозов;
- нет medication/dosage;
- нет `this is normal` как заверения;
- нет `fix`, `cure`, `treat`;
- нет pressure/fear copy;
- всегда есть route back to personalized Ask;
- sensitive stories должны иметь micro safety note.

Пример безопасной community microcopy:

```text
Parent stories are shared moments, not medical advice. Babio checks Emma's profile and recent log before suggesting a next step.
```

Пример небезопасной copy:

```text
Other moms fixed this by changing the feeding schedule.
```

Заменить на:

```text
Some parents noticed feeding timing mattered. Ask Babio to check this against Emma's recent log.
```

## Recording scenarios

Нужно добавить 3 новых screencast flows.

### Flow 1: Profile overview

URL:

```text
/record/profile-overview?autoplay=1&bg=navy&format=phone&frame=phone
```

Сценарий:

1. Home показывает Emma card.
2. Tap по `Emma, 9 wk`.
3. Profile открывается.
4. Показывается `Today context`.
5. Tap `Ask using this context`.
6. Переход к Ask.

Цель ролика: показать персонализацию.

### Flow 2: Community to Ask

URL:

```text
/record/community-to-guidance?autoplay=1&bg=navy&format=phone&frame=phone
```

Сценарий:

1. Explore -> Community.
2. Story card: `My baby woke again after a calm feed`.
3. Tap `Personalize for Emma`.
4. Ask prefilled with profile/context.
5. Tap `Get Personalized Guidance`.
6. Result.

Цель ролика: показать, что community не заменяет Babio, а ведет к персональному guidance.

### Flow 3: Profile to pediatrician summary

URL:

```text
/record/profile-pediatrician-summary?autoplay=1&bg=navy&format=phone&frame=phone
```

Сценарий:

1. Profile.
2. Saved notes preview.
3. Tap `Prepare pediatrician summary`.
4. Summary screen/card.
5. Tap `Copy summary`.

Цель ролика: показать практическую ценность памяти и заметок.

## Implementation phases

### Phase 1: Navigation contract

Description: обновить типы, tab normalization, bottom nav и route aliases.

Acceptance:

- [ ] Bottom nav показывает `Home / Tracker / Ask / Explore / Profile`.
- [ ] `/app/library` и `/app/sleep` продолжают открываться.
- [ ] `/app/notes` продолжает открываться.
- [ ] Active tab подсвечивается как `Explore` или `Profile` для alias routes.

Verification:

- [ ] `npm run test`
- [ ] `npm run lint`
- [ ] Manual check: `/app/home`, `/app/explore`, `/app/profile`, `/app/library`, `/app/sleep`, `/app/notes`.

Likely files:

- `src/types.ts`
- `src/App.tsx`
- `src/index.css`

Scope: M.

### Phase 2: Read-only Profile screen

Description: добавить первый `LiveProfileScreen` без edit mode.

Acceptance:

- [ ] Profile показывает имя, возраст, feeding style, sleep setup.
- [ ] Profile показывает recent logs и saved notes preview.
- [ ] CTA `Ask using this context` открывает Ask.
- [ ] CTA `Prepare pediatrician summary` использует текущий summary/copy механизм или открывает notes section.

Verification:

- [ ] `npm run test`
- [ ] Manual: `/app/profile` renders, CTA to Ask works.

Likely files:

- `src/App.tsx`
- `src/index.css`
- `src/state/useBabioStore.ts` if CTA needs new helper.

Scope: M.

### Phase 3: Header profile entry

Description: сделать baby pill/avatar в header кликабельным.

Acceptance:

- [ ] Tap по `Emma, 9 wk` открывает `/app/profile`.
- [ ] В record/static mode header не ломает сценарии.
- [ ] На Profile активная вкладка подсвечена.

Verification:

- [ ] Manual: click header from Home, Ask, Tracker, Explore.
- [ ] Existing record flow still opens.

Likely files:

- `src/App.tsx`
- `src/index.css`

Scope: S.

### Phase 4: Explore shell

Description: добавить `LiveExploreScreen` с секциями Guides, Sleep, Community.

Acceptance:

- [ ] `/app/explore` открывает Guides by default.
- [ ] `/app/library` открывает Guides.
- [ ] `/app/sleep` открывает Sleep.
- [ ] Segmented control переключает Guides / Sleep / Community.
- [ ] Текущие Library и Sleep blocks переиспользованы, а не переписаны с нуля.

Verification:

- [ ] `npm run test`
- [ ] Manual: switch all Explore sections.

Likely files:

- `src/App.tsx`
- `src/index.css`
- `src/types.ts`

Scope: M.

### Phase 5: Curated Community Stories

Description: добавить фикстуры community stories и UI cards.

Acceptance:

- [ ] Есть `src/data/communityStories.ts`.
- [ ] Community section показывает 4-6 curated stories.
- [ ] Каждая story имеет topic, age range, title, summary, CTA.
- [ ] CTA `Personalize for Emma` открывает Ask с prefilled input.
- [ ] Community copy проходит validator.

Verification:

- [ ] `npm run validate`
- [ ] `npm run test`
- [ ] Manual: story -> Ask -> guidance.

Likely files:

- `src/data/communityStories.ts`
- `src/App.tsx`
- `src/index.css`
- `scripts/validate-content.mjs`

Scope: M.

### Phase 6: Profile edit

Description: добавить редактирование baby profile и сохранение в localStorage.

Acceptance:

- [ ] Можно изменить name, ageWeeks, feedingStyle, sleepSetup, focusAreas, careNotes.
- [ ] Сохранение обновляет Home, Ask, Tracker, Profile без reload.
- [ ] После reload изменения сохраняются.
- [ ] Есть reset demo path, который возвращает Emma seed.

Verification:

- [ ] `npm run test`
- [ ] Manual: edit -> save -> reload.

Likely files:

- `src/types/babio.ts`
- `src/state/useBabioStore.ts`
- `src/App.tsx`
- `src/index.css`

Scope: M.

### Phase 7: Recording flows

Description: добавить 3 новых record сценария под Profile и Community.

Acceptance:

- [ ] `profile-overview` есть в Studio.
- [ ] `community-to-guidance` есть в Studio.
- [ ] `profile-pediatrician-summary` есть в Studio.
- [ ] Каждый flow открывается через `/record/:flowId`.
- [ ] Сценарии помещаются в phone frame без обрезания нижним nav.

Verification:

- [ ] `npm run test`
- [ ] Visual QA screenshots with system Chrome.

Likely files:

- `src/types.ts`
- `src/data/babio.ts`
- `src/App.tsx`
- `src/index.css`

Scope: M.

## Rollout order

Рекомендуемый порядок:

1. `Profile` read-only + nav change.
2. Header tap to Profile.
3. `Explore` shell with existing Library/Sleep.
4. Community Stories curated feed.
5. Profile edit.
6. Recording flows.
7. GitHub Pages deploy.

Так мы быстро получаем ощущение полноценного приложения, но не открываем рискованный forum/backend/auth слой.

## Acceptance for the whole spec

- [ ] Нижнее меню выглядит как полноценное приложение: `Home / Tracker / Ask / Explore / Profile`.
- [ ] Карточка ребенка доступна из нижнего меню и из header.
- [ ] Ask явно использует Profile как источник персонализации.
- [ ] Notes/Pediatrician prep логически живут рядом с Profile.
- [ ] Library и Sleep не исчезают, а переезжают в Explore.
- [ ] Community есть как curated stories, а не открытый форум.
- [ ] Community ведет в personalized Ask, а не в советы от пользователей.
- [ ] Все старые routes и record links продолжают работать.
- [ ] `npm run test` и `npm run lint` проходят.
- [ ] Новый UI не перекрывается bottom nav на phone frame.

## Что не делаем в этом этапе

- backend;
- auth;
- real user accounts;
- открытый форум с комментариями;
- moderation tooling;
- push notifications;
- платные функции;
- real AI chat;
- medical intake forms;
- growth charts;
- diagnosis or treatment language.

## Открытые вопросы

1. Называть вкладку `Profile` или `Emma`?

Рекомендация: `Profile`, потому что label стабильный и понятный. Внутри экрана крупно показывать `Emma`.

2. Называть community секцию `Community` или `Parent stories`?

Рекомендация: в UI использовать `Parent stories`, в коде можно `community`.

3. Должен ли `Sleep` исчезнуть из bottom nav сразу?

Рекомендация: да, если появляется `Explore`. Но старый `/app/sleep` нужно сохранить как alias, чтобы не ломать ссылки и recording context.

4. Нужно ли делать edit profile в первом pass?

Рекомендация: нет. Сначала read-only Profile, чтобы быстро проверить архитектуру и визуал. Edit mode вторым pass.

5. Где показывать saved notes?

Рекомендация: основной entry в `Profile`, legacy `/app/notes` оставить как alias. В `Explore` можно оставить только secondary saved content entry.
