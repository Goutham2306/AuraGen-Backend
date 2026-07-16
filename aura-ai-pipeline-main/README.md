# aura-ai-pipeline

This is the AI pipeline for **AuraGen** — the self-healing UI project I'm building with my team as part of the Advanced Generative AI Engineering program at Infotact Solutions.

My part of AuraGen: given a natural language prompt (or a frustration signal from the frontend), generate a valid, styled React component. That's it — no WebSocket handling, no frontend rendering, no telemetry logic. Just prompt in, JSX out.

## Team

- **Ullas** — frontend (Next.js/Tailwind dashboard, telemetry tracker, cognitive load meter)
- **Ayush (me)** — this repo: prompt engineering + `generateComponent()`
- **Goutham** — backend (WebSocket server that connects Ullas's frontend telemetry to my pipeline)

I'm also team lead on this, so this README is written to be handed off to both of them, not just documentation for myself.

## What's actually in here

- `system-prompt.js` — the system prompt that forces the model to always return a `WizardForm` component styled with Tailwind, and nothing else
- `generate-component.js` — the main function, `generateComponent(prompt)`. Takes a prompt, calls the model, returns `{ success, jsx, error }`
- `validate-component.js` — sanity-checks whatever the model returns: correct export name, braces actually balanced, no stray markdown fences, no sneaky `fetch()` calls, and that it's not suspiciously short
- `test-login-page.js` / `test-weather-app.js` — real test prompts I used to confirm the pipeline actually produces usable JSX, not just JSX that looks right at a glance
- `test-connection.js` — quick script to confirm the API key + model are wired up correctly before debugging anything else

## Why Gemini and not GPT-4o (for now)

We're supposed to be using GPT-4o, but we're still waiting on an OpenAI key for the team, so I swapped in Gemini (`gemini-flash-latest`) as a stand-in. Two things that cost me time here, in case future-me or a teammate hits the same issue:

- `gemini-1.5-flash` is deprecated — use `gemini-flash-latest`
- Gemini API keys don't all start with `AIzaSy` like the docs/tutorials assume — newer keys can look like `AQ.`, which had me convinced my key was invalid for a while

Swapping back to GPT-4o later should just mean changing the API call in `generate-component.js` — the prompt engineering and validation logic don't care which model is underneath.

## Handoff to Goutham

`generateComponent(prompt)` is the only function your WebSocket server needs to call. Pass it the prompt string, it returns:

```js
{ success: true, jsx: "...", error: null }
// or
{ success: false, jsx: null, error: "..." }
```

Everything upstream of that (telemetry → prompt construction) is Ullas's side, everything downstream (WebSocket → frontend) is yours. I'm not touching either.

## Setup

```bash
npm install
node test-connection.js   # confirms your API key works before you try anything else
```

If you're on Windows and npm scripts refuse to run in PowerShell, you probably need:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

(one-time fix, cost me an afternoon the first time I hit it)

## Status

Core pipeline works and is tested against real prompts. Next up: swap Gemini for GPT-4o once we have a key, then hand off to Gautham for WebSocket integration.
