# Oryx Check — hybrid claim-checker

A #BuildHybridAI 2026 entry (Web/Chrome). Paste a claim and get an
instant on-device verdict from Gemini Nano, then a full evidence-grounded
check from cloud Gemini 2.5 Flash — every check shown, claim by claim.

Built 26–30 Nov 2026 by Oryx Centre for Strategic Futures (oryxai.in)
for the #BuildHybridAI 2026 hackathon (Google/Firebase, $30,000 prizes).
Submission deadline: Mon 30 Nov 2026, 2:00 PM PT = Tue 1 Dec 2026, 03:30 IST.

## What it is

One page, one flow:

1. **On-device triage — Gemini Nano** (Firebase AI Logic, `ONLY_ON_DEVICE`).
   An instant first-pass verdict — Verified / Broken / Unverifiable /
   Title mismatch — with a one-line reason. Runs entirely in the browser;
   nothing leaves the device. Badge: "Checked on-device".
2. **Cloud evidence check — Gemini 2.5 Flash** (Firebase AI Logic,
   `ONLY_IN_CLOUD`). The same claim checked against the source text you
   provided. The model must quote the exact passage that supports or
   contradicts the claim. Badge: "Checked in the cloud — evidence shown".
3. **Check card.** Both verdicts side by side, the quoted passage, a
   plain-English summary, and a copy-as-text button. History is saved
   (Firestore, anonymous, no PII — localStorage fallback if Firestore
   is unavailable).

The verdict taxonomy and the 10 demo claims come from Oryx's published
research: the 194-citation audit (DOI 10.5281/zenodo.23731235) and the
66-citation study (DOI 10.5281/zenodo.23718472). The demo claims are real
claims from those audits; the audit's own verdict for each is shown
separately from the model's live verdicts, never mixed.

**What this is not:** it is not the Oryx Evidence Audit product, not an
audit, not a certification, and the model verdicts are experimental
output — the app says so on the page.

## Files

| File | Purpose |
|---|---|
| `index.html` | Single-page app shell + UI wiring (inline module script). |
| `styles.css` | Plain styles, no framework. |
| `src/firebase-config.js` | Firebase web config — **PLACEHOLDER values ("FILL-IN") until the Firebase project is created.** |
| `src/firebase.js` | Firebase init, App Check (debug provider), AI Logic service (`getAI` + `GoogleAIBackend`), Firestore. |
| `src/nano.js` | On-device triage: Nano availability check, `ONLY_ON_DEVICE` model, JSON structured verdict. |
| `src/verify.js` | Cloud evidence check: `gemini-2.5-flash`, `ONLY_IN_CLOUD`, quote-the-passage prompt, JSON structured verdict. |
| `src/corpus.js` | 10 demo claims, copied verbatim from the dataset rows named in each entry (`datasetFile` / `datasetRow`). |
| `src/store.js` | Check history: Firestore first, localStorage fallback. |
| `firebase.json` | Firebase Hosting config (serves this directory). |
| `.firebaserc` | Firebase project alias — **"FILL-IN" until the project is created.** |
| `LICENSE` | Apache-2.0 (the hackathon rules' preferred license). |
| `BUILD-LOG.md` | What was built, what API surface was verified, what is still missing. |

Stack: plain HTML/CSS/JS + Firebase JS SDK v12.5.0 (ES modules via the
gstatic CDN import map in `index.html`). No framework, no build step
beyond `firebase deploy`.

## Setup

### 1. Firebase project (free Spark plan, no billing)

1. In the [Firebase console](https://console.firebase.google.com), create
   a project and register a **Web app**.
2. In the console, go to **AI Services > AI Logic** and run the guided
   setup. Choose the **Gemini Developer API** backend. This workflow
   automatically enforces **App Check** for AI Logic.
3. Enable **Firestore** (production mode is fine — the app writes
   anonymous check records only) and **Hosting**.
4. Copy the web app's `firebaseConfig` from Project settings and paste
   the values into `src/firebase-config.js`, replacing every `"FILL-IN"`.
   Also fill in `appCheckSiteKey` (reCAPTCHA Enterprise site key, from
   the console's App Check section) and the project id in `.firebaserc`.

### 2. App Check debug token

The app uses the App Check **debug provider** for local development and
for the hosted demo (debug tokens are explicitly accepted by the
hackathon rules).

1. With `appCheckDebug = true` in `src/firebase-config.js`, run the app
   once. The browser console prints a debug token:
   `AppCheck debug token: "123a4567-..."`.
2. In the console, go to **Security > App Check > Apps**, open the web
   app, and select **Manage debug tokens** to register that token.

Note: a debug token is tied to the browser it was generated in. The demo
machine's token is the one to register before recording the video. If
judges test the hosted URL from another browser, their App Check token
will not be registered — this is a known open item (see BUILD-LOG.md).

### 3. Chrome setup for Gemini Nano (demo machine)

1. Chrome on Desktop, **v139 or higher** (`chrome://settings/help`).
2. Enable the flag `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`
   and restart Chrome.
3. Pre-download the on-device model before the video: open DevTools >
   Console and run `await LanguageModel.availability()` (expect
   `available`, `downloading`, or `downloadable`), then
   `await LanguageModel.create()` if it says `downloadable`.

## Run locally

```bash
# From this directory. Any static server works; Firebase's is simplest:
npx firebase-tools serve --only hosting
# or:
python3 -m http.server 8000
```

Then open http://localhost:8000 (or the port shown). Note: on-device
inference works on localhost per the Firebase docs, but the model still
needs the Chrome flag and the downloaded model (see §3 above).

## Deploy

```bash
firebase login
firebase use --add        # pick the Firebase project (replaces "FILL-IN" in .firebaserc)
firebase deploy --only hosting
```

The public Hosting URL is the project URL for the Devpost submission.

## Test checklist

- [ ] Config filled in (`src/firebase-config.js`, `.firebaserc`) — the
      status line at the top of the page says "Firebase: connected".
- [ ] Nano availability line reports `available` in Chrome v139+ with
      the flag on; reports the plain "not available" message in other
      browsers, and the cloud check still works there.
- [ ] Each of the 10 demo claims: click the chip, press Check, and
      confirm the triage card and the cloud card both render, the audit
      verdict strip shows the published audit's verdict separately, and
      the history list gains an entry.
- [ ] A pasted claim with no source text: triage runs, cloud check says
      no passage supports or contradicts it (quote empty), verdict
      Unverifiable.
- [ ] A pasted claim with source text: cloud card quotes an exact
      passage from the provided text.
- [ ] Copy button copies the check card as text.
- [ ] Secrets sweep: `grep -ri "apiKey" src/` shows only `"FILL-IN"`;
      no service-account key, no server key, no PII anywhere in the repo.

## Claim rules (hard — do not break these)

- Model verdicts are labelled experimental output, never presented as
  Oryx's audit results. The audit's own verdicts (demo corpus) are
  labelled as the published audit's verdicts and shown separately.
- No certification / "verified by Oryx" / compliance language anywhere.
- No internal eval numbers (no 38/50, no 19/50 — different models,
  different task, unmeasured here).
- No "in production / used by clients" claims. This is a hackathon
  prototype built 26–30 Nov 2026; the Oryx Evidence Audit product is
  in invite-only beta and is separate.
- The two published DOIs may be cited as the research behind the idea.
- Nothing about Oryx's registration status.
- The verdicts come from Gemini (Nano on-device, 2.5 Flash in the cloud)
  via Firebase AI Logic — the submission says exactly that.

## What was built during the submission period

Everything in this repo was newly created 26–30 Nov 2026 for
#BuildHybridAI 2026: the web app, the Firebase wiring, the Nano
integration, the cloud verification flow, the demo corpus loader, this
README, and the demo video. Reused as knowledge (not code): Oryx's
verdict taxonomy, the claim-checking prompt pattern from the audit
pipeline, and the demo corpus (real claims from the published audits).
