const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;
let authInstance = null;
let firestoreInstance = null;

function initFirebaseAdmin() {
  if (initialized) {
    return { admin, auth: authInstance, db: firestoreInstance };
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  try {
    if (keyPath && fs.existsSync(keyPath)) {
      const serviceAccount = require(path.resolve(keyPath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
    } else if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      initialized = true;
    } else {
      console.warn(
        '[Firebase Admin] Running in development mode without Firebase service account credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY in server/.env'
      );
    }

    if (initialized) {
      authInstance = admin.auth();
      firestoreInstance = admin.firestore();
    }
  } catch (err) {
    console.error('[Firebase Admin] Initialization failed:', err.message);
  }

  return { admin, auth: authInstance, db: firestoreInstance, isInitialized: () => initialized };
}

module.exports = initFirebaseAdmin();
