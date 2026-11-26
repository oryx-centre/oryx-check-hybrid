// Firebase web configuration for Oryx Check.
//
// *** PLACEHOLDER — FILL IN BEFORE DEPLOYING ***
//
// This file contains NO real values. The parent fills it in from the
// Firebase console (Project settings > Your apps > Web app) after the
// Firebase project is created. Nothing here was invented — every value
// below is the literal string "FILL-IN" until the real config is pasted.
//
// How to fill it in:
//   1. Create the Firebase project (free Spark plan, no billing) and
//      register a Web app in the Firebase console.
//   2. Copy the firebaseConfig object from the console and paste the
//      values into the fields below, replacing "FILL-IN".
//   3. App Check: AI Logic setup enforces App Check. The hosted demo
//      uses the registered reCAPTCHA Enterprise provider (site key in
//      `appCheckSiteKey` below; registered 26 Nov 2026, free tier).
//      For local development only, set `appCheckDebug` to true below,
//      run the app once, copy the debug token printed in the browser
//      console, and register it in the console under
//      Security > App Check > Apps > Manage debug tokens.
//   4. `appCheckSiteKey` is the reCAPTCHA Enterprise site key for the
//      web app (from the console). If it is still "FILL-IN", App Check
//      is skipped and the app shows a clear "not configured" notice
//      instead of failing silently.
//
// This config is public-by-design client configuration (it is not a
// secret), but it is still protected in production by App Check. Never
// put a service-account key, an API key for a server-side service, or
// any other secret in this repo.

export const firebaseConfig = {
  apiKey: "AIzaSyADUrXU2aptOLDkRqXPWt4ImrkcTH6ohoY",
  authDomain: "oryx-check-hybrid.firebaseapp.com",
  projectId: "oryx-check-hybrid",
  storageBucket: "oryx-check-hybrid.firebasestorage.app",
  messagingSenderId: "974910357289",
  appId: "1:974910357289:web:d99daa344b524642558138",
};

// reCAPTCHA Enterprise site key for App Check — registered 26 Nov 2026
// (Firebase console > App Check; key created in Cloud Console Fraud
// Defense, free tier, domains oryx-check-hybrid.web.app +
// oryx-check-hybrid.firebaseapp.com).
export const appCheckSiteKey = "6LfPvDIuAAAAACjL050CzSX9nXdBl1sJ4tg5v3o6";

// Use the App Check debug provider (local development ONLY).
// The hosted demo uses the registered reCAPTCHA Enterprise provider
// (site key above). Set this to true only on a local checkout: the SDK
// then prints a debug token to the browser console — register that
// token in the Firebase console (App Check > Manage debug tokens).
// Never ship a debug token value in this repo.
export const appCheckDebug = false;

// True when every field above holds a real value.
export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(
    (v) => typeof v === "string" && v !== "" && v !== "FILL-IN"
  );
}
