// Cloud evidence check for Oryx Check — Gemini 2.5 Flash via Firebase AI Logic.
//
// What this does: the full check. The same claim is checked against the
// provided source text by the cloud model, which must quote the EXACT
// source passage that supports or contradicts the claim, then give its
// verdict and a short reasoning chain.
//
// Verified against the live Firebase docs (26 Nov 2026):
//   https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
//   https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output
//   - getGenerativeModel(ai, { model: "gemini-2.5-flash",
//       mode: InferenceMode.ONLY_IN_CLOUD,
//       generationConfig: { responseMimeType: "application/json",
//                           responseSchema: schema } })
//   - Schema helpers: Schema.object(), Schema.enumString(), Schema.string().
//
// The cloud verdict is the MODEL's experimental output. It is labelled
// "Checked in the cloud — evidence shown" in the UI and is never
// presented as Oryx's audit result.

import {
  getGenerativeModel,
  InferenceMode,
  Schema,
} from "firebase/ai";
import { getAIInstance } from "./firebase.js";
import { VERDICTS } from "./corpus.js";

export const CLOUD_MODEL = "gemini-2.5-flash";

// Structured-output schema for the cloud evidence check.
const VERIFY_SCHEMA = Schema.object({
  properties: {
    verdict: Schema.enumString({ enum: VERDICTS }),
    quote: Schema.string(),
    reasoning: Schema.string(),
    confidence: Schema.enumString({ enum: ["high", "medium", "low"] }),
  },
});

const VERIFY_PROMPT = `You are checking whether a cited source supports the claim made, the way a careful fact-checker would. Work claim by claim and show your evidence.

Claim:
"""{{CLAIM}}"""

Source text to check against:
"""{{SOURCE}}"""

Verdict taxonomy — use exactly one of these values:
- Verified: the source text directly supports the claim.
- Broken: the source text contradicts the claim, or the cited source cannot be found / does not exist as cited.
- Unverifiable: the source text is not enough to confirm or deny the claim (for example it is blocked, missing, or does not cover the point).
- Title mismatch: the cited source exists but is a different document from the one cited (for example a different title, topic, or paper at the same link).

Rules:
- Judge ONLY against the source text provided. Do not use outside knowledge.
- QUOTE the exact passage from the source text that supports or contradicts the claim, word for word. Put it in the "quote" field.
- If no passage in the source text supports or contradicts the claim, leave "quote" as an empty string and say so in "reasoning" — never invent a passage.
- "reasoning" is two or three sentences: what the source says, and why it leads to the verdict.
- Confidence is "high" only when the quoted passage clearly settles the claim; otherwise "medium" or "low".

Reply with JSON only, matching the schema: { "verdict": ..., "quote": ..., "reasoning": ..., "confidence": ... }.`;

let cloudModel = null;

/**
 * Build (once) the cloud model instance.
 * @returns {object} the GenerativeModel for ONLY_IN_CLOUD.
 */
function getCloudModel() {
  if (cloudModel) return cloudModel;
  const ai = getAIInstance();
  cloudModel = getGenerativeModel(ai, {
    model: CLOUD_MODEL,
    mode: InferenceMode.ONLY_IN_CLOUD,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: VERIFY_SCHEMA,
    },
  });
  return cloudModel;
}

/**
 * Run the cloud evidence check for one claim.
 *
 * @param {string} claim - the claim to check.
 * @param {string} [sourceText] - source text to check against (may be "").
 * @returns {Promise<{verdict: string, quote: string, reasoning: string,
 *                    confidence: string, path: "cloud"}>}
 * @throws {Error} if the cloud call fails or the response cannot be parsed.
 */
export async function verifyClaim(claim, sourceText = "") {
  const model = getCloudModel();
  const prompt = VERIFY_PROMPT.replace("{{CLAIM}}", claim).replace(
    "{{SOURCE}}",
    sourceText || "(no source text provided)"
  );
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseVerifyResponse(text);
}

/**
 * Parse and validate a cloud JSON response.
 * @param {string} text - raw model output.
 * @returns {{verdict: string, quote: string, reasoning: string,
 *            confidence: string, path: "cloud"}}
 * @throws {Error} when the JSON is invalid or the verdict is not in the taxonomy.
 */
export function parseVerifyResponse(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("Cloud model returned text that is not valid JSON: " + text.slice(0, 200));
  }
  if (!VERDICTS.includes(parsed.verdict)) {
    throw new Error("Cloud model returned a verdict outside the taxonomy: " + String(parsed.verdict));
  }
  return {
    verdict: parsed.verdict,
    quote: typeof parsed.quote === "string" ? parsed.quote : "",
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
    confidence: ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "low",
    path: "cloud",
  };
}
