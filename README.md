# Babio V2 Prototype

Working copy for turning the Babio MVP web emulator into an interactive PWA-style product prototype.

This copy is the active V2 workspace. The original MVP remains at:

```text
/Volumes/KINGSTON/2026-07-01-BAB-EID-1915/BABIO_VIDEO_PROJECT/babio-mvp-emulator
```

V2 is still not a production medical app. The near-term direction is: local profile, local tracker, structured Ask, Library, Sleep surface, scenario library, Studio/Record compatibility, no backend, no auth, no free-form AI chat.

Start from:

```text
docs/planning/2026-07-02-v2-implementation-plan.md
docs/planning/2026-07-02-v2-roadmap-synthesis.md
docs/planning/2026-07-02-stage-6-ai-hybrid-gate.md
```

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/studio
```

## Recording URLs

```text
http://127.0.0.1:5174/record/personalized-guidance-cta?autoplay=1&bg=navy&format=phone&frame=phone
http://127.0.0.1:5174/record/profile-overview?autoplay=1&bg=navy&format=phone&frame=phone
http://127.0.0.1:5174/record/community-to-guidance?autoplay=1&bg=navy&format=phone&frame=phone
http://127.0.0.1:5174/record/profile-pediatrician-summary?autoplay=1&bg=navy&format=phone&frame=phone
http://127.0.0.1:5174/record/baby-woke-up-again?autoplay=1&bg=green&format=9x16
http://127.0.0.1:5174/record/feeding-question?autoplay=1&bg=green&format=9x16
http://127.0.0.1:5174/record/is-this-normal?autoplay=1&bg=green&format=9x16
http://127.0.0.1:5174/record/daily-brief?autoplay=1&bg=green&format=9x16
http://127.0.0.1:5174/record/save-for-pediatrician?autoplay=1&bg=green&format=9x16
```

Useful params:

```text
bg=green | navy | transparent-like
format=9x16 | 4x5 | phone
frame=phone | screen
autoplay=1 | 0
speed=1 | 0.85 | 1.15
```

## Checks

```bash
npm run validate
npm run build
npm run lint
npm run test
```

`npm run validate` scans visible flow copy for disallowed medical/guarantee wording.

## V2 Status

- 20 total scripted flows in Studio.
- Live local core loop: Home, Tracker, Ask, Explore, Profile.
- Explore preserves Library and Sleep as sections; Profile owns baby context and saved notes.
- Premium light baby-care visual pass with warm surfaces, pastel actions, photo guidance card, and five-tab bottom navigation.
- Safety Gateway flow: `/record/first-fever-safety?autoplay=1&bg=green&format=9x16`.
- PWA manifest + service worker shell.
- Local pilot events in `localStorage` under `babio:v2-pilot-events`.
