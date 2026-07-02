# Implementation Plan: Babio V2 Prototype

Дата: 2026-07-02

Рабочая копия:

```text
/Volumes/KINGSTON/2026-07-01-BAB-EID-1915/BABIO_VIDEO_PROJECT/babio-v2-prototype
```

Исходный стабильный MVP:

```text
/Volumes/KINGSTON/2026-07-01-BAB-EID-1915/BABIO_VIDEO_PROJECT/babio-mvp-emulator
```

## Overview

Делаем из статичного recording emulator интерактивный PWA-style прототип. Главная цель V2: не production medical app, а живое приложение, которое можно дать в руки, снять в paid social и проверить основной trust-loop:

```text
baby profile -> quick log -> ask -> one calm step -> save to notes
```

Текущий `/studio`, `/flow/:flowId`, `/record/:flowId` должен продолжать работать, потому что это производственный инструмент для креативов.

## Current Progress

Статус на 2026-07-02:

- [x] Создана отдельная рабочая копия `babio-v2-prototype`.
- [x] Stage 0 baseline сохранен: `/studio` и старый `/record/baby-woke-up-again` открываются.
- [x] Stage 1 core loop реализован для живых вкладок `/app/home`, `/app/log`, `/app/ask`, `/app/notes`.
- [x] Добавлены V2-типы: `src/types/babio.ts`.
- [x] Добавлен localStorage store с versioning: `src/state/useBabioStore.ts`.
- [x] Добавлен локальный rules engine: `src/data/guidanceRules.ts`.
- [x] Ask показывает structured answer и сохраняет результат в Notes.
- [x] Validator расширен на `guidanceRules.ts`.
- [x] Добавлен первый V2 recording flow: `/record/night-reset-woke-again?autoplay=1&bg=green&format=9x16`.
- [x] Studio показывает V1/V2 badges, moment badges и фильтр по moment.
- [x] Проверки прошли: `npm run test`, `npm run lint`.
- [x] Browser QA через Playwright + system Chrome: Home -> Ask -> Save to Notes -> reload Notes, Studio filter, старый Record URL, новый V2 Record URL.
- [x] Stage 2: библиотека расширена до 16 total flows, включая sleep, feeding, comfort, routine, pediatrician.
- [x] Stage 3: добавлен отдельный Safety Gateway flow `/record/first-fever-safety?autoplay=1&bg=green&format=9x16`.
- [x] Stage 4: live Home показывает Daily Brief, live Notes показывает Pediatrician Export и copy summary.
- [x] Stage 5: добавлены PWA manifest, service worker shell и local pilot event buffer.
- [x] Browser QA Stage 5: manifest доступен, service worker ready, events пишутся в `babio:v2-pilot-events`.

Следующая стадия: Stage 6 gate. AI-гибрид не подключать в код, пока scripted flows не пройдут пилотную проверку.

## Architecture Decisions

1. **Работаем в копии.** Исходный `babio-mvp-emulator` остается стабильной версией.
2. **Сначала local-only.** Профиль, логи, заметки и последний Ask хранятся в `localStorage`.
3. **Нет свободного AI-чата в V2 core.** Ask работает через локальный rules engine и готовые безопасные шаблоны.
4. **Один data contract для app и record.** Ручной режим и recording mode используют одни и те же V2 data objects.
5. **Safety встроен в модель.** Guidance result всегда содержит safety note или safety route.
6. **Studio остается обязательным.** Любой новый flow должен быть доступен в Studio и в Record URL.

## Dependency Graph

```text
Types and contracts
  -> localStorage store
  -> guidance rules and safety rules
  -> app tabs connected to state
  -> V2 flow presets
  -> Studio filters and record mode
  -> validation and browser QA
```

## Phase 0: Copy Freeze and Baseline

### Task 0.1: Mark V2 working copy

**Description:** Переименовать package и README так, чтобы рабочая папка не путалась с исходным MVP.

**Acceptance criteria:**

- [ ] `package.json` называется `babio-v2-prototype`.
- [ ] README явно говорит, что это V2 copy.
- [ ] README указывает исходный MVP и V2 planning docs.

**Verification:**

- [ ] `npm install` проходит в копии.
- [ ] `npm run validate` проходит после установки зависимостей.

**Dependencies:** None.

**Files likely touched:**

- `package.json`
- `package-lock.json`
- `README.md`

**Estimated scope:** XS.

### Task 0.2: Baseline check

**Description:** Проверить, что копия запускается и текущие v1 flows не сломаны.

**Acceptance criteria:**

- [ ] `/studio` открывается.
- [ ] `/app/home` открывается.
- [ ] Все 5 текущих record URLs открываются.
- [ ] `npm run test` проходит.

**Verification:**

- [ ] `npm run test`
- [ ] Manual browser check at `http://127.0.0.1:5174/studio`

**Dependencies:** Task 0.1.

**Files likely touched:** None.

**Estimated scope:** S.

## Phase 1: V2 Contracts and Local Store

### Task 1.1: Add V2 domain types

**Description:** Вынести V2 data contract в отдельные типы, чтобы перестать держать весь будущий продукт в `App.tsx` и `babio.ts`.

**Acceptance criteria:**

- [ ] Есть `BabyProfileV2`, `LogEntry`, `NoteEntry`, `GuidanceResult`, `SafetyRoute`, `FlowPresetV2`.
- [ ] Типы покрывают `profile -> log -> ask -> notes`.
- [ ] Старые V1 flow types не ломаются.

**Verification:**

- [ ] `npm run build`

**Dependencies:** Phase 0.

**Files likely touched:**

- `src/types/babio.ts`
- `src/data/babio.ts`

**Estimated scope:** S.

### Task 1.2: Add localStorage store

**Description:** Добавить клиентский store с versioning и безопасной загрузкой состояния.

**Acceptance criteria:**

- [ ] Store читает и пишет `profile`, `logs`, `notes`, `lastAsk`.
- [ ] Есть default seed state для demo.
- [ ] Есть reset action для Studio/demo.
- [ ] Ошибка парсинга localStorage не ломает приложение.

**Verification:**

- [ ] `npm run build`
- [ ] Manual: изменить state, reload, убедиться что данные сохранились.

**Dependencies:** Task 1.1.

**Files likely touched:**

- `src/state/useBabioStore.ts`
- `src/types/babio.ts`
- `src/data/babio.ts`

**Estimated scope:** M.

## Phase 2: First Vertical Slice

### Task 2.1: Connect Home and Log to real state

**Description:** Home должен показывать профиль и последние записи из store. Log должен уметь добавлять быстрые записи.

**Acceptance criteria:**

- [ ] Home показывает имя, возраст и last log.
- [ ] Log создает sleep/feed/diaper/comfort entry за 1-2 тапа.
- [ ] После reload log сохраняется.
- [ ] Existing static tabs still render if no local state exists.

**Verification:**

- [ ] `npm run build`
- [ ] Manual: add log, reload, return to Home.

**Dependencies:** Task 1.2.

**Files likely touched:**

- `src/App.tsx`
- `src/state/useBabioStore.ts`
- `src/index.css`

**Estimated scope:** M.

### Task 2.2: Add local guidance rules

**Description:** Создать локальный deterministic rules engine для Ask без LLM.

**Acceptance criteria:**

- [ ] Есть правила для sleep, feeding, crying/comfort, pediatrician prep.
- [ ] Каждый result имеет секции: considered, tryNow, watch, record, safety.
- [ ] Dangerous input can return `SafetyRoute` instead of normal advice.

**Verification:**

- [ ] Unit-like script or build check validates required result sections.
- [ ] `npm run validate`

**Dependencies:** Task 1.1.

**Files likely touched:**

- `src/data/guidanceRules.ts`
- `src/types/babio.ts`
- `scripts/validate-content.mjs`

**Estimated scope:** M.

### Task 2.3: Connect Ask and Notes

**Description:** Ask принимает текст или context из Log, показывает structured result и сохраняет его в Notes.

**Acceptance criteria:**

- [ ] Ask can be prefilled from a log entry.
- [ ] Result shows one calm step and safety note.
- [ ] `Save to Notes` creates a note.
- [ ] Notes displays saved guidance with source log context.

**Verification:**

- [ ] `npm run build`
- [ ] Manual: log -> ask -> save -> notes -> reload.

**Dependencies:** Tasks 1.2, 2.2.

**Files likely touched:**

- `src/App.tsx`
- `src/data/guidanceRules.ts`
- `src/state/useBabioStore.ts`
- `src/index.css`

**Estimated scope:** M.

## Checkpoint A: Core Loop Works

Run after Phase 2:

- [ ] `npm run test`
- [ ] Manual path works in under 90 seconds.
- [ ] Reload does not erase profile/log/notes.
- [ ] No unsafe copy in visible guidance.

## Phase 3: Recording-Compatible V2 Flow

### Task 3.1: Add `night-reset-woke-again` V2 flow

**Description:** Добавить первый V2 сценарий для paid social и product testing.

**Acceptance criteria:**

- [ ] Flow preset: Emma, 9 weeks.
- [ ] Flow path: Home -> Log -> Ask -> Guidance -> Save to Notes.
- [ ] Record URL plays without manual input.
- [ ] Copy avoids diagnosis, promises, medical certainty.

**Verification:**

- [ ] `npm run test`
- [ ] Manual: `/record/night-reset-woke-again?autoplay=1&bg=green&format=9x16`

**Dependencies:** Checkpoint A.

**Files likely touched:**

- `src/data/babio.ts`
- `src/data/guidanceRules.ts`
- `src/App.tsx`
- `scripts/validate-content.mjs`

**Estimated scope:** M.

### Task 3.2: Studio labels for V1/V2

**Description:** Studio должен различать старые static flows и новые interactive V2 flows.

**Acceptance criteria:**

- [ ] V2 flow has visible badge.
- [ ] Studio can filter by moment: sleep, feeding, comfort, routine, pediatrician.
- [ ] Existing recording controls still work.

**Verification:**

- [ ] Manual: Studio filter and recording links.
- [ ] `npm run build`

**Dependencies:** Task 3.1.

**Files likely touched:**

- `src/App.tsx`
- `src/data/babio.ts`
- `src/index.css`

**Estimated scope:** S-M.

## Checkpoint B: First V2 Recording Ready

Run after Phase 3:

- [ ] `npm run test`
- [ ] Browser check desktop and mobile viewport.
- [ ] Green background recording route is clean.
- [ ] First V2 screencast can be captured in 25-35 seconds.

## Phase 4: Safety and Validation

### Task 4.1: Expand unsafe copy validator

**Description:** Расширить validator под V2 guidance и safety grammar.

**Acceptance criteria:**

- [ ] Validator scans V1 flows, V2 guidance rules, safety route copy.
- [ ] Blocks diagnosis/promise/fix language.
- [ ] Requires safety section for every normal guidance result.

**Verification:**

- [ ] `npm run validate`

**Dependencies:** Task 2.2.

**Files likely touched:**

- `scripts/validate-content.mjs`
- `src/data/guidanceRules.ts`

**Estimated scope:** S.

### Task 4.2: Emergency Gateway UI

**Description:** Опасные запросы должны вести в отдельный короткий safety screen, а не в обычный совет.

**Acceptance criteria:**

- [ ] Red-flag keywords produce safety route.
- [ ] Safety screen is readable and calm.
- [ ] It does not provide treatment or dosing.
- [ ] Record mode can show safety route as a scenario.

**Verification:**

- [ ] Manual red-flag inputs.
- [ ] `npm run test`

**Dependencies:** Tasks 2.2, 2.3.

**Files likely touched:**

- `src/App.tsx`
- `src/data/guidanceRules.ts`
- `src/index.css`

**Estimated scope:** M.

## Phase 5: Scenario Library

### Task 5.1: Add 12-15 scripted safe moments

**Description:** Расширить библиотеку сценариев для product depth и creative variation.

**Acceptance criteria:**

- [ ] Minimum 15 total flows/moments.
- [ ] Groups include sleep, feeding, comfort, routine, pediatrician prep.
- [ ] Each flow has record URL and Studio metadata.
- [ ] All pass validator.

**Verification:**

- [ ] `npm run test`
- [ ] Manual sample: one flow per group.

**Dependencies:** Checkpoint B, Task 4.1.

**Files likely touched:**

- `src/data/babio.ts`
- `src/data/guidanceRules.ts`
- `scripts/validate-content.mjs`

**Estimated scope:** M-L, split by group if needed.

## Phase 6: PWA and Pilot Readiness

### Task 6.1: Add PWA shell

**Description:** Сделать базовую установочную PWA-обертку без backend.

**Acceptance criteria:**

- [ ] Manifest exists.
- [ ] App has icon/name/theme color.
- [ ] Basic offline shell works for static assets.

**Verification:**

- [ ] `npm run build`
- [ ] Browser Application panel check.

**Dependencies:** Checkpoint B.

**Files likely touched:**

- `public/manifest.webmanifest`
- `public/*`
- `index.html`

**Estimated scope:** S.

### Task 6.2: Add pilot feedback hooks

**Description:** Добавить легкие event stubs и feedback prompt без аналитического SDK.

**Acceptance criteria:**

- [ ] Events are emitted to console or local event buffer.
- [ ] Ask result has "стало понятнее?" feedback control.
- [ ] No external analytics dependency yet.

**Verification:**

- [ ] Manual console check.
- [ ] `npm run build`

**Dependencies:** Phase 2.

**Files likely touched:**

- `src/state/useBabioStore.ts`
- `src/App.tsx`
- `src/index.css`

**Estimated scope:** S-M.

## Open Decisions Before Implementation

1. **Язык V2 UI:** оставляем English для US moms и paid social, или делаем dual copy позже. Рекомендация: сейчас English only, как текущий MVP.
2. **Safety strictness:** для red flags делаем hard block. Рекомендация: hard block для явно опасного, soft warning для чувствительного.
3. **First slice baby age:** использовать 9 weeks или 4 months. Рекомендация: 9 weeks для night-wake сценария, 4 months оставить в старых flows.
4. **Port:** V2 запускать на `5174`, чтобы не конфликтовать с текущим MVP на `5173`.

## Immediate Next Step

Начать с Phase 0 verification, затем Task 1.1 и Task 1.2. Кодовая цель первой реализации:

```text
src/types/babio.ts
src/state/useBabioStore.ts
src/data/guidanceRules.ts
```

После этого подключать UI к store и собирать первый vertical slice.
