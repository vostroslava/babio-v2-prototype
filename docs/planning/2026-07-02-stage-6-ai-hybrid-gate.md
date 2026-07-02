# Stage 6 AI Hybrid Gate

Дата: 2026-07-02

Stage 6 не означает "сразу подключить LLM". Для Babio V2 правильный критерий: AI-гибрид можно подключать только после того, как scripted-версия доказала, что core loop понятен и безопасен.

## Current Scripted Evidence

- 16 total flows доступны в Studio.
- Живой core loop работает: Home -> Log -> Ask -> Notes.
- Safety Gateway существует как отдельный flow.
- Daily Brief и Pediatrician Export есть в live app.
- PWA shell и pilot event buffer готовы.
- Проверки проходят: `npm run test`, `npm run lint`.

## AI Is Blocked Until These Gates Pass

- [ ] Минимум 5-10 moderated user tests.
- [ ] Пользователь без объяснения понимает "one calm step".
- [ ] Пользователь понимает, что Babio не заменяет педиатра.
- [ ] Safety Gateway не воспринимается как обычный совет.
- [ ] В pilot events есть реальные `ask_completed`, `note_saved`, `summary_copied`.
- [ ] Нет новых unsafe copy findings после расширения сценариев.

## Allowed AI Architecture Later

1. Local safety filter runs first.
2. Red-flag input never goes to LLM; it routes to Safety Gateway.
3. LLM endpoint returns strict JSON only.
4. JSON must match a `GuidanceResult` schema.
5. Local scripted result is always the fallback.
6. No diagnosis, dosage, treatment plan, or certainty language.

## First AI Slice Later

Only one narrow slice:

```text
input + profile + latest logs -> JSON GuidanceResult -> same UI cards
```

Do not add free-form chat UI. Do not add backend accounts. Do not replace scripted flows until the hybrid result is safer and more useful than the local template.
