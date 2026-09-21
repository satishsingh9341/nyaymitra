const crypto = require('crypto');
const firebaseAdmin = require('./firebaseAdmin');

// In-memory persistent map for development/demo mode when Firestore is unconfigured
const memoryDocStore = new Map();

/**
 * Creates or updates a document record.
 */
async function saveDocument(uid, docId, data) {
  if (!uid) throw new Error('User ID is required');
  const id = docId || crypto.randomUUID();

  const existing = memoryDocStore.get(uid)?.get(id) || {};

  const record = {
    id,
    uid,
    filename: data.filename || existing.filename || 'Untitled Document',
    uploadedAt: data.uploadedAt || existing.uploadedAt || new Date().toISOString(),
    status: data.status || existing.status || 'parsing',
    overallRisk: data.overallRisk || existing.overallRisk || 'standard',
    extractedText: data.extractedText !== undefined ? data.extractedText : (existing.extractedText || ''),
    summary: data.summary || existing.summary || [],
    clauses: data.clauses || existing.clauses || [],
    checklist: data.checklist || existing.checklist || [],
    lawyerQuestions: data.lawyerQuestions || existing.lawyerQuestions || [],
    chatHistory: data.chatHistory || existing.chatHistory || [],
    ...existing,
    ...data,
  };

  if (firebaseAdmin.isInitialized && firebaseAdmin.isInitialized()) {
    try {
      const docRef = firebaseAdmin.db.collection('users').doc(uid).collection('documents').doc(id);
      await docRef.set(record, { merge: true });
      return record;
    } catch (err) {
      console.warn('[Firestore] Falling back to local store:', err.message);
    }
  }

  // Memory store fallback
  if (!memoryDocStore.has(uid)) {
    memoryDocStore.set(uid, new Map());
  }
  memoryDocStore.get(uid).set(id, record);
  return record;
}

/**
 * Retrieves all documents for a specific user.
 */
async function getUserDocuments(uid) {
  if (!uid) return [];

  if (firebaseAdmin.isInitialized && firebaseAdmin.isInitialized()) {
    try {
      const snapshot = await firebaseAdmin.db.collection('users').doc(uid).collection('documents').orderBy('uploadedAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('[Firestore] Fetch fallback to local store:', err.message);
    }
  }

  const userDocs = memoryDocStore.get(uid);
  if (!userDocs) return [];
  return Array.from(userDocs.values()).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

/**
 * Retrieves a single document with user ownership check.
 */
async function getDocument(uid, docId) {
  if (!uid || !docId) return null;

  if (firebaseAdmin.isInitialized && firebaseAdmin.isInitialized()) {
    try {
      const docRef = firebaseAdmin.db.collection('users').doc(uid).collection('documents').doc(docId);
      const snapshot = await docRef.get();
      if (!snapshot.exists) return null;
      const data = snapshot.data();
      if (data.uid !== uid) return null; // PRD Non-Negotiable Rule 2
      return { id: snapshot.id, ...data };
    } catch (err) {
      console.warn('[Firestore] Single doc fallback to local store:', err.message);
    }
  }

  const userDocs = memoryDocStore.get(uid);
  if (!userDocs || !userDocs.has(docId)) return null;
  const doc = userDocs.get(docId);
  if (doc.uid !== uid) return null; // PRD Non-Negotiable Rule 2
  return doc;
}

/**
 * Permanently deletes a document.
 * PRD Non-Negotiable Rule 4: Full permanent delete of the document doc and all its fields.
 */
async function deleteDocument(uid, docId) {
  if (!uid || !docId) return false;

  if (firebaseAdmin.isInitialized && firebaseAdmin.isInitialized()) {
    try {
      const docRef = firebaseAdmin.db.collection('users').doc(uid).collection('documents').doc(docId);
      const snapshot = await docRef.get();
      if (snapshot.exists && snapshot.data().uid === uid) {
        await docRef.delete();
        return true;
      }
    } catch (err) {
      console.warn('[Firestore] Delete fallback to local store:', err.message);
    }
  }

  const userDocs = memoryDocStore.get(uid);
  if (userDocs && userDocs.has(docId)) {
    const doc = userDocs.get(docId);
    if (doc.uid === uid) {
      userDocs.delete(docId);
      return true;
    }
  }
  return false;
}

module.exports = {
  saveDocument,
  getUserDocuments,
  getDocument,
  deleteDocument,
};
