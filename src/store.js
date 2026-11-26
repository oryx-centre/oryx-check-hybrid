// Check history for Oryx Check.
//
// Primary store: Firestore collection "checks" (anonymous — no user
// accounts, no PII). If Firestore is unavailable or a write fails, the
// record falls back to localStorage so history still works before
// Firestore is set up. Nothing here is a secret and no record contains
// any identifier for the person using the app.
//
// A record is:
//   { claim, sourceText, triage, cloud, auditVerdict, demoClaimId,
//     createdAt, path }
// where `triage` / `cloud` are the model verdict objects (or null when
// that step did not run) and `auditVerdict` is the published audit's
// verdict for a demo claim (or null for a pasted claim).

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "./firebase.js";

const COLLECTION = "checks";
const LOCAL_KEY = "oryx-check-history-v1";
const MAX_LOCAL = 20;
const MAX_SOURCE_CHARS = 4000;

function trimRecord(record) {
  const out = { ...record };
  if (typeof out.sourceText === "string" && out.sourceText.length > MAX_SOURCE_CHARS) {
    out.sourceText = out.sourceText.slice(0, MAX_SOURCE_CHARS) + "…";
  }
  return out;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(items) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items.slice(0, MAX_LOCAL)));
  } catch {
    // Storage full or unavailable — history is a nice-to-have.
  }
}

function saveLocal(record) {
  const items = readLocal();
  items.unshift({ ...trimRecord(record), createdAt: new Date().toISOString(), storedIn: "local" });
  writeLocal(items);
  return { storedIn: "local", id: null };
}

/**
 * Save one check to history.
 * @param {object} record - the check record (see header).
 * @returns {Promise<{storedIn: "firestore"|"local", id: string|null}>}
 */
export async function saveCheck(record) {
  const clean = trimRecord(record);
  const db = getFirestoreInstance();
  if (!db) {
    return saveLocal(clean);
  }
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      ...clean,
      createdAt: serverTimestamp(),
      storedIn: "firestore",
    });
    return { storedIn: "firestore", id: ref.id };
  } catch (err) {
    console.warn("[oryx-check] Firestore save failed, keeping history locally: " + err.message);
    return saveLocal(clean);
  }
}

/**
 * Load the most recent checks, newest first.
 * @param {number} [n=10] - how many to load.
 * @returns {Promise<Array<object>>}
 */
export async function loadRecentChecks(n = 10) {
  const db = getFirestoreInstance();
  if (db) {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy("createdAt", "desc"),
        limit(n)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("[oryx-check] Firestore history read failed, using local history: " + err.message);
    }
  }
  return readLocal().slice(0, n);
}

// Re-exported for tests / debugging only.
export { getFirestore };
