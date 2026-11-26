// Firebase initialisation for Oryx Check.
//
// - Initialises the Firebase app from src/firebase-config.js.
// - Sets up App Check (debug provider) when a real reCAPTCHA site key
//   is configured; otherwise App Check is skipped with a clear warning
//   and the app reports "not configured" instead of failing silently.
// - Exposes the Firebase AI Logic service (`ai`, Gemini Developer API
//   backend) and Firestore (`db`) for the other modules.
//
// Verified against the live Firebase docs (26 Nov 2026):
//   https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
//   - getAI(firebaseApp, { backend: new GoogleAIBackend() })
//   - self.FIREBASE_APPCHECK_DEBUG_TOKEN = true before initializeAppCheck
//   - Firebase AI Logic SDK v12.5.0+ required for on-device inference.

import { initializeApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { getAI, GoogleAIBackend } from "firebase/ai";
import { getFirestore } from "firebase/firestore";
import {
  firebaseConfig,
  appCheckSiteKey,
  appCheckDebug,
  isFirebaseConfigured,
} from "./firebase-config.js";

export const CONFIGURED = isFirebaseConfigured();

let app = null;
let ai = null;
let db = null;
let status = CONFIGURED ? "ready" : "not-configured";
let statusDetail = CONFIGURED
  ? "Firebase configured."
  : "Firebase config is still a placeholder (src/firebase-config.js). " +
    "Fill it in from the Firebase console — model calls are disabled until then.";

/**
 * Initialise Firebase (idempotent). Call once at app start.
 * Never throws for a missing config — the UI surfaces the status.
 * @returns {{ app: object|null, ai: object|null, db: object|null,
 *            configured: boolean, status: string, statusDetail: string }}
 */
export function initFirebase() {
  if (app) return { app, ai, db, configured: CONFIGURED, status, statusDetail };

  if (!CONFIGURED) {
    console.warn("[oryx-check] " + statusDetail);
    return { app, ai, db, configured: false, status, statusDetail };
  }

  try {
    app = initializeApp(firebaseConfig);
  } catch (err) {
    status = "error";
    statusDetail = "Firebase initialisation failed: " + err.message;
    console.error("[oryx-check] " + statusDetail);
    return { app, ai, db, configured: false, status, statusDetail };
  }

  // App Check: required by Firebase AI Logic. Debug provider for local
  // development and the hosted demo. The SDK prints a debug token to the
  // browser console on first run — register it in the Firebase console
  // (Security > App Check > Apps > Manage debug tokens).
  if (appCheckSiteKey && appCheckSiteKey !== "FILL-IN") {
    try {
      if (appCheckDebug) {
        // eslint-disable-next-line no-undef
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn("[oryx-check] App Check setup failed (continuing): " + err.message);
      statusDetail +=
        " App Check could not be initialised (" + err.message + ").";
    }
  } else {
    console.warn(
      "[oryx-check] No App Check site key configured — App Check skipped. " +
        "AI Logic calls may be rejected until App Check is set up."
    );
    statusDetail +=
      " App Check site key not set — register one in the Firebase console.";
  }

  try {
    ai = getAI(app, { backend: new GoogleAIBackend() });
  } catch (err) {
    status = "error";
    statusDetail = "Firebase AI Logic service failed to initialise: " + err.message;
    console.error("[oryx-check] " + statusDetail);
    return { app, ai, db, configured: false, status, statusDetail };
  }

  try {
    db = getFirestore(app);
  } catch (err) {
    console.warn("[oryx-check] Firestore unavailable (history falls back to local storage): " + err.message);
    db = null;
  }

  return { app, ai, db, configured: true, status, statusDetail };
}

export function getAIInstance() {
  if (!ai) throw new Error("Firebase AI Logic is not initialised — check the Firebase configuration.");
  return ai;
}

export function getFirestoreInstance() {
  return db;
}

export function getFirebaseStatus() {
  return { configured: CONFIGURED, status, statusDetail };
}
