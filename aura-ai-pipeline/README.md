# Aura AI Pipeline

This is the AI pipeline part of **AuraGen** — a self-healing UI system we're building for our Advanced Generative AI Engineering Program at Infotact Solutions. Basically the idea is: if a user is struggling on a webpage (too much clicking, hesitating too long), the UI regenerates itself to be simpler. This repo is the part that actually generates the new component.

## Team & Repos

We're 3 people, 3 separate repos, all talking to each other over Socket.io instead of one shared codebase:

* **Ayush (me, team lead)** – this repo, handles the AI generation
* **Goutham** – [AuraGen-Backend](https://github.com/Goutham2306/AuraGen-Backend), Node + Socket.io server that connects frontend and AI
* **Ullas** – [AuraGen](https://github.com/ullasbr0214/AuraGen), the Next.js frontend that tracks mouse behavior

## What this repo does

My job was simple on paper: take a prompt describing what the user needs, generate a working React component, send back the JSX. In practice it took a while to get right.

* **system-prompt.js** – the system prompt that tells Gemini how to behave and what format to return
* **generate-component.js** – the actual `generateComponent()` function, this is what Goutham's backend calls
* **validate-component.js** – checks the JSX Gemini returns is actually valid before sending it back
* **test-connection.js** – quick script to check the Gemini API key is working
* **test-login-page.js / test-weather-app.js** – test prompts I used to simulate frustration scenarios (like a broken login form or a messy weather widget) and see what the model generates

## Using Gemini (not GPT-4o)

We're using Gemini Flash instead of OpenAI because we didn't have an OpenAI key. A few things that tripped me up while setting this up, in case anyone else hits the same stuff:

* Gemini API keys look different from what you'd expect — mine started with `AQ.` not `AIzaSy` like older examples online show, so don't panic if yours looks weird too
* `gemini-1.5-flash` is deprecated now, had to switch to `gemini-flash-latest`
* Gemini kept wrapping its JSX output in markdown code fences (` ```jsx `) even when I told it not to, so `validate-component.js` also strips those out before validating
* If you're on Windows and PowerShell won't let you run npm scripts, run this once: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## How it connects to the rest of the project

I don't run a server. Goutham's backend directly imports `generateComponent()` from this repo and calls it whenever the frontend sends a telemetry event (basically when `hesitation > 2 || clicks > 4`). Whatever I return gets sent back to the frontend over the `component` socket event. So my whole scope ends at this one function — the actual websocket handling is on Goutham's side, not mine.

## Main function

```javascript
generateComponent(prompt)
```

Returns:

```javascript
{
  success: true,
  jsx: "...",
  error: null
}
```

or on failure:

```javascript
{
  success: false,
  jsx: null,
  error: "..."
{
  success: false,
  jsx: null,
  error: "..."
}
```

## Running it locally

```bash
npm install
node test-connection.js
```

If that prints a successful response, the Gemini key is working and you're good.

## Status

Pipeline's done and tested — returns valid JSX for the test prompts, confirmed working with Goutham's backend on his end too. Ullas still needs to swap the mock socket connection in his frontend for a real one, and once that's done all three pieces should work together end to end.