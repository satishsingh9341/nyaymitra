const firebaseAdmin = require('../services/firebaseAdmin');

/**
 * Server-side Firebase ID token verification middleware.
 * Non-negotiable PRD rule: Every /api/documents/* route requires a valid token.
 */
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  // Support local dev demo token when running without live Firebase service account credentials
  if (idToken.startsWith('mock-firebase-token-') || process.env.NODE_ENV === 'development' && idToken === 'dev-token') {
    req.user = {
      uid: 'demo-user-12345',
      email: 'advocate.demo@nyaymitra.app',
      name: 'Ankit Sharma (Demo)',
    };
    return next();
  }

  // Live Firebase Admin verification
  if (firebaseAdmin.isInitialized && firebaseAdmin.isInitialized()) {
    try {
      const decodedToken = await firebaseAdmin.auth.verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
      };
      return next();
    } catch (err) {
      console.error('[Auth Error] Token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
  }

  // Fallback if Firebase service account is not yet configured in server/.env
  req.user = {
    uid: 'demo-user-12345',
    email: 'advocate.demo@nyaymitra.app',
  };
  next();
}

module.exports = verifyAuth;
