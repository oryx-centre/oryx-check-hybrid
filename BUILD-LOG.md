# Oryx Check — Build Log

**Built:** Wed 26 Nov 2026 (~05:10–05:30 IST), code only.
**Status:** App source complete in this directory. NOT deployed, NOT pushed
to any repo, NOT submitted to Devpost, ₹0 spent. The public repo
`oryx-centre/oryx-check-hybrid` already exists (created by the parent,
README + LICENSE only, commit 7fa7b9d) — this code has NOT been pushed
to it; pushing is the parent's step.

## What was built

One-page, one-flow hybrid claim-checker ("Oryx Check"), per
`../buildhybridai-2026-scope-26nov.md`:

| File | What it does |
|---|---|
| `index.html` | App shell + UI wiring (inline ES module): claim/source inputs, 10 demo-claim chips, Check button, two verdict cards, audit-verdict strip, copy-as-text, history, About section with the two DOIs. |
| `styles.css` | Plain styles, no framework; verdict colour coding (Verified green, Broken red, Unverifiable amber, Title mismatch purple). |
| `src/firebase-config.js` | Firebase web config — **all values `"FILL-IN"` placeholders**, clearly marked, with fill-in instructions. Never invents config values. |
| `src/firebase.js` | Firebase init, App Check (debug provider, guarded on a real site key), `getAI` + `GoogleAIBackend`, Firestore handle. Degrades gracefully when unconfigured (clear status message, no silent failure). |
| `src/nano.js` | On-device triage: `LanguageModel.availability()` pre-check, `ONLY_ON_DEVICE` model with `onDeviceParams.promptOptions.responseConstraint` (JSON schema: verdict enum + reason + confidence), `initializeDeviceModel()` called after the Check-button gesture and before `generateContent()`, as the docs require. |
| `src/verify.js` | Cloud evidence check: `gemini-2.5-flash`, `ONLY_IN_CLOUD`, `generationConfig` with `responseMimeType: "application/json"` + response schema (verdict enum, exact-passage `quote`, `reasoning`, confidence). Prompt requires quoting the exact passage; empty quote when no passage supports/contradicts. |
| `src/corpus.js` | 10 demo claims, copied verbatim from the dataset (see Corpus below). |
| `src/store.js` | Check history: Firestore collection `checks` (anonymous, no PII), localStorage fallback when Firestore is unavailable. |
| `firebase.json` | Hosting config (serves this directory). |
| `.firebaserc` | Project alias `"FILL-IN"` placeholder. |
| `LICENSE` | Apache-2.0. |
| `README.md` | Setup, run, deploy, test checklist, claim rules, "what was built during the submission period". |

## API surface verified live (26 Nov 2026)

Re-verified against the live Firebase docs before writing the integration
code (the scoper's verification held, with two corrections noted):

- **Get started:** https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
  - `getAI(firebaseApp, { backend: new GoogleAIBackend() })` — confirmed.
  - Modes confirmed: `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`,
    `ONLY_IN_CLOUD`. (Correction to the scope doc: the cloud-preferring mode
    is `PREFER_IN_CLOUD`, not a second `ONLY_IN_CLOUD`; this build uses
    `ONLY_ON_DEVICE` for triage and `ONLY_IN_CLOUD` for the cloud check, so
    each step's behaviour is visible and honest — no silent fallback.)
  - `model.initializeDeviceModel(callback)` must be called after a user
    gesture and before `generateContent()` — implemented in `nano.js`.
  - On-device needs Firebase AI Logic SDK v12.5.0+ and Chrome Desktop
    v139+ with flag `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`;
    single-turn text only; JSON/enum structured output supported.
  - App Check is auto-enforced by the AI Logic setup workflow; debug
    provider via `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` before
    `initializeAppCheck` — implemented in `firebase.js` (guarded on a
    real reCAPTCHA site key).
  - `LanguageModel.availability()` / `LanguageModel.create()` pre-check
    and model download — implemented in `nano.js`.
- **Structured output:** https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output
  - `Schema` helpers confirmed: `Schema.object()`, `Schema.enumString()`,
    `Schema.string()`, `Schema.array()`, `Schema.number()`, with
    `optionalProperties`.
  - Hybrid modes: cloud config via `inCloudParams` (`model` +
    `generationConfig.responseMimeType`/`responseSchema`); on-device via
    `onDeviceParams.promptOptions.responseConstraint`.
  - Non-hybrid modes use only the applicable config — the pattern this
    build follows (top-level `model` + `generationConfig` for
    `ONLY_IN_CLOUD`; `onDeviceParams` only for `ONLY_ON_DEVICE`).
  - Note: my first guess at this page's URL 404'd
    (`/ai-logic/structured-output` does not exist); the correct URL was
    found through the get-started page's own link. The code follows the
    verified page, not the guessed one.

## Corpus — provenance and verification

10 claims, 3 Verified / 3 Broken / 2 Unverifiable / 2 Title mismatch,
drawn from `~/workspace/oryx-ai-commercial/llm-dataset/train-v2.jsonl`
and `eval-v2-chat.jsonl`. Verified programmatically: every entry's
`claim`, `citedSource`, `url`, `auditVerdict`, `auditEvidence` and `doi`
match its named dataset row (`datasetFile` / `datasetRow`) character for
character — **10/10 exact matches**. Sources: 194-audit arm A, 194-audit
arm B (GLM), 66-citation study. Nothing invented.

Each entry also carries `sourceText` — the text handed to the cloud model
as the source to check against: the cited-source line + URL + the audit's
own recorded fetch note for that source. Composed only from verbatim
dataset fields; labelled in the UI as coming from the audit's fetch notes.

Claim rules enforced in the code and UI: model verdicts labelled
experimental output; the audit's verdict shown in a separate strip for
demo claims, never mixed; no certification / "verified by Oryx" /
compliance language; no internal eval numbers; no "in production / used
by clients" claims; the two published DOIs cited as the research behind
the idea; nothing about registration status.

## Tests run (all local — no Firebase project exists yet, so no live model call was possible)

- **JS syntax:** all 6 `src/*.js` modules + the `index.html` inline module
  pass `node --check` (as `.mjs` copies — `node --check` treats `.js`
  as CommonJS, so ES-module files must be checked as `.mjs`). 7/7.
- **HTML structure:** parsed with Python's `html.parser` — no unclosed
  tags, no mismatched/stray tags; all 18 element IDs the inline script
  references exist.
- **JSON configs:** `firebase.json` and `.firebaserc` parse cleanly.
- **Corpus verbatim:** 10/10 entries match dataset rows exactly (above).
- **Response parsers:** `parseTriageResponse` / `parseVerifyResponse`
  extracted from the shipped files and run against 8 cases — valid JSON,
  invalid JSON (throws), verdict outside the taxonomy (throws), missing
  confidence (defaults `low`), empty quote allowed, quote preserved
  verbatim. 8/8 pass.
- **Local serve:** `python3 -m http.server` served all 11 files with
  HTTP 200; `index.html` contains the import map (Firebase 12.5.0) and
  the module script.
- **Secret sweep:** no `AIza…` keys, no private keys, no service-account
  material anywhere in the tree. The only `apiKey` is `"FILL-IN"`.
- **Not testable yet (needs the Firebase project + a Nano-capable
  browser):** a live end-to-end run (claim → on-device verdict → cloud
  verdict with quoted passage → saved history), the App Check debug
  token flow, and the Nano availability states on the demo machine.

## Still missing (parent / Amartya steps — not this build)

1. **Firebase project** (free Spark, no billing) — creation is blocked
   on Amartya's Google 2-step approval (per parent context). Then:
   register the Web app, run the AI Logic guided setup (Gemini Developer
   API), enable Firestore + Hosting, and paste the real values into
   `src/firebase-config.js` (all `"FILL-IN"` fields), the reCAPTCHA site
   key, and `.firebaserc`.
2. **App Check debug token** — register the demo machine's token in the
   console (see README §2). Open issue: a debug token is per-browser,
   so judges testing the hosted URL from another browser will not have
   a registered token and their AI Logic calls may be rejected. Decide
   at Firebase setup whether to register additional tokens, document
   the token for judges, or leave App Check unenforced for the demo.
   (Recorded here; not decided by this build.)
3. **Nano verification on the demo machine** — Chrome v139+, flag on,
   model downloaded (README §3). Go/no-go per the scope doc §2: if Nano
   does not run by end of Thu 27 Nov, the hybrid story is gone.
4. **Push to the repo** — `oryx-centre/oryx-check-hybrid` exists
   (README + LICENSE only). Push this directory's contents there.
   Do NOT push to the private `oryx-ai-beta` repo.
5. **Demo video** (Amartya, ≤3 min, public YouTube, showing the app
   functioning) and the **Devpost submission click** before Tue 1 Dec
   2026, 03:30 IST.

## Problems hit

- Firebase structured-output doc URL guessed wrong (404); recovered via
  the get-started page's own link — code follows the verified page.
- `node --check` rejects ES-module `.js` files as CommonJS; worked
  around by checking `.mjs` copies (code itself unchanged).
- One test-server run backgrounded and had to be killed before the
  secret sweep could run in the right directory; re-ran cleanly.
- The local HTTP server test only proves files serve — it cannot prove
  the Firebase calls work without a project. That is the known gap
  listed under "Not testable yet" above.
