import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function buildCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY env var is not set. See server/utils/firebaseAdmin.js for setup notes.'
    );
  }

  let jsonStr = raw.trim();

  // Preferred: base64-encoded JSON (avoids .env issues with multi-line /
  // quoted values, especially on Windows). If the value doesn't already
  // look like raw JSON, try treating it as base64 first.
  if (!jsonStr.startsWith('{')) {
    try {
      jsonStr = Buffer.from(jsonStr, 'base64').toString('utf8');
    } catch (e) {
      // fall through - JSON.parse below will produce a clearer error
    }
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON (or valid base64-encoded JSON). ' +
      'Recommended: base64-encode your downloaded service account key file and use ' +
      'that as the value - see setup notes in this file. Original error: ' + e.message
    );
  }

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  return cert(serviceAccount);
}

let _adminDb = null;

// Lazily initialized so a bad/missing key fails only when a route actually
// tries to use Firestore, not at server boot - a crash at import time takes
// down the whole Nitro bundle before any request can be handled.
export function getAdminDb() {
  if (!_adminDb) {
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: buildCredential() });
    _adminDb = getFirestore(app);
  }
  return _adminDb;
}

/*
SETUP - two ways to provide FIREBASE_SERVICE_ACCOUNT_KEY in .env:

1) RECOMMENDED (base64) - avoids all .env quoting/newline issues:
   Windows PowerShell:
     [Convert]::ToBase64String([IO.File]::ReadAllBytes(""C:\Users\Gurujee Feb\Downloads\status-tracker-map-c-firebase-adminsdk-fbsvc-b1d70a1c84.json"")) | Set-Clipboard
   Mac/Linux:
     base64 -i /path/to/key.json | pbcopy   (mac)
     base64 -w0 /path/to/key.json           (linux, then copy output)
   Then in .env:
     FIREBASE_SERVICE_ACCOUNT_KEY=<paste the base64 string here>

2) Raw JSON on one line (more error-prone - only use if base64 isn't an option):
     FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...entire JSON, no line breaks...}
*/
