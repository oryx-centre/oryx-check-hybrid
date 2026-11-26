// On-device triage for Oryx Check — Gemini Nano via Firebase AI Logic.
//
// What this does: a fast first-pass verdict on a claim, computed entirely
// in the browser by the on-device model. Nothing leaves the device.
//
// Verified against the live Firebase docs (26 Nov 2026):
//   https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
//   https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output
//   - On-device inference needs Firebase AI Logic SDK v12.5.0+ and
//     Chrome on Desktop v139+ with the flag
//     chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
//   - Only single-turn text generation (not chat); JSON/enum structured
//     output is supported.
//   - getGenerativeModel(ai, { mode: InferenceMode.ONLY_ON_DEVICE,
//       onDeviceParams: { promptOptions: { responseConstraint: schema } } })
//   - model.initializeDeviceModel() MUST be called after a user gesture
//     (e.g. a button click) and BEFORE generateContent().
//   - LanguageModel.availability() pre-check (Chrome Prompt API).
//
// The triage verdict is the MODEL's experimental output. It is labelled
// "Checked on-device" in the UI and is never presented as Oryx's audit
// result.

import {
  getGenerativeModel,
  InferenceMode,
  Schema,
} from "firebase/ai";
import { getAIInstance } from "./firebase.js";
import { VERDICTS } from "./corpus.js";

// Structured-output schema for the triage verdict (Firebase Schema helpers).
const TRIAGE_SCHEMA = Schema.object({
  properties: {
    verdict: Schema.enumString({ enum: VERDICTS }),
    reason: Schema.string(),
    confidence: Schema.enumString({ enum: ["high", "medium", "low"] }),
  },
});

const TRIAGE_PROMPT = `You are doing a fast first-pass triage of a single claim, the way a fact-checker would skim it before a full check.

Claim:
"""{{CLAIM}}"""

Source text provided with the claim (may be empty):
"""{{SOURCE}}"""

Verdict taxonomy — use exactly one of these values:
- Verified: the source text directly supports the claim.
- Broken: the source text contradicts the claim, or the cited source cannot be found / does not exist as cited.
- Unverifiable: the source text is not enough to confirm or deny the claim (for example it is blocked, missing, or does not cover the point).
- Title mismatch: the cited source exists but is a different document from the one cited (for example a different title, topic, or paper at the same link).

Rules:
- Judge ONLY against the source text provided. Do not use outside knowledge.
- If no source text is provided, say so in the reason and use Unverifiable unless the claim itself is self-contradictory.
- Keep the reason to one sentence.
- Confidence is "high" only when the source text clearly settles the claim; otherwise "medium" or "low".

Reply with JSON only, matching the schema: { "verdict": ..., "reason": ..., "confidence": ... }.`;

let onDeviceModel = null;

/**
 * Check whether the on-device model can run in this browser.
 * @returns {Promise<{available: boolean, status: string, detail: string}>}
 *   status is one of: "available" | "downloading" | "downloadable" |
 *   "unavailable" | "unsupported" (no Prompt API in this browser).
 */
export async function checkNanoAvailability() {
  if (typeof LanguageModel === "undefined") {
    return {
      available: false,
      status: "unsupported",
      detail:
        "On-device model not available on this browser — this needs Chrome on Desktop v139+ with the Gemini Nano flag enabled (chrome://flags/#prompt-api-for-gemini-nano-multimodal-input). The cloud check still works.",
    };
  }
  try {
    const availability = await LanguageModel.availability();
    if (availability === "available") {
      return { available: true, status: "available", detail: "On-device model is ready." };
    }
    if (availability === "downloading") {
      return { available: false, status: "downloading", detail: "On-device model is still downloading — try again in a moment." };
    }
    if (availability === "downloadable") {
      return {
        available: false,
        status: "downloadable",
        detail: "On-device model can be downloaded — press Check and it will start downloading (first run is slow).",
      };
    }
    return { available: false, status: "unavailable", detail: "On-device model reported: " + availability + "." };
  } catch (err) {
    return { available: false, status: "unavailable", detail: "Could not check on-device availability: " + err.message };
  }
}

/**
 * Build (once) the on-device model instance.
 * @returns {object} the GenerativeModel for ONLY_ON_DEVICE.
 */
function getOnDeviceModel() {
  if (onDeviceModel) return onDeviceModel;
  const ai = getAIInstance();
  onDeviceModel = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_ON_DEVICE,
    onDeviceParams: {
      promptOptions: { responseConstraint: TRIAGE_SCHEMA },
    },
  });
  return onDeviceModel;
}

/**
 * Run the on-device triage for one claim.
 * Must be called from a user gesture (button click) — it calls
 * initializeDeviceModel() first, as the Firebase docs require.
 *
 * @param {string} claim - the claim to triage.
 * @param {string} [sourceText] - source text to check against (may be "").
 * @param {function(number):void} [onDownloadProgress] - 0..1 download progress.
 * @returns {Promise<{verdict: string, reason: string, confidence: string, path: "on-device"}>}
 * @throws {Error} if the on-device model is unavailable or the response
 *   cannot be parsed (caller shows the error and still offers the cloud check).
 */
export async function triageClaim(claim, sourceText = "", onDownloadProgress = null) {
  const model = getOnDeviceModel();

  // Required: initialise the device model after the user gesture and
  // before any generateContent() call. Awaits the download when needed.
  await model.initializeDeviceModel((progress) => {
    if (typeof onDownloadProgress === "function") onDownloadProgress(progress);
  });

  const prompt = TRIAGE_PROMPT.replace("{{CLAIM}}", claim).replace(
    "{{SOURCE}}",
    sourceText || "(no source text provided)"
  );

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseTriageResponse(text);
}

/**
 * Parse and validate a triage JSON response.
 * @param {string} text - raw model output.
 * @returns {{verdict: string, reason: string, confidence: string, path: "on-device"}}
 * @throws {Error} when the JSON is invalid or the verdict is not in the taxonomy.
 */
export function parseTriageResponse(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("On-device model returned text that is not valid JSON: " + text.slice(0, 200));
  }
  if (!VERDICTS.includes(parsed.verdict)) {
    throw new Error("On-device model returned a verdict outside the taxonomy: " + String(parsed.verdict));
  }
  return {
    verdict: parsed.verdict,
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
    confidence: ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "low",
    path: "on-device",
  };
}
