const express = require('express');
const multer = require('multer');
const verifyAuth = require('../middleware/auth');
const { parseDocumentBuffer } = require('../services/parserService');
const {
  saveDocument,
  getUserDocuments,
  getDocument,
  deleteDocument,
} = require('../services/documentStore');
const {
  analyzeDocument,
  answerGroundedQuestion,
  compareDocumentTexts,
} = require('../services/analyzerService');
const { createRateLimiter } = require('../middleware/rateLimiter');
const {
  sanitizeTextInput,
  isValidDocumentId,
  sanitizeFilename,
} = require('../utils/validators');

const router = express.Router();

// Rate limiter for AI operations: max 25 requests per minute per user (PRD 6.3)
const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'Too many analysis requests. Please wait a moment before trying again.',
});

// Memory-only storage: PRD Non-Negotiable Rule 3 (never saved as binaries to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format '${ext}'. Only PDF, DOCX, and TXT files are accepted.`));
    }
  },
});

// All document routes require authentication (PRD Non-Negotiable Rule 1)
router.use(verifyAuth);

/**
 * POST /api/documents/upload
 * In-memory file upload, text extraction, and automated AI analysis.
 */
router.post('/upload', aiLimiter, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const uid = req.user.uid;
    // Robust filename sanitization against path traversal (PRD 6.3)
    const filename = sanitizeFilename(req.file.originalname);

    // 1. In-memory parse
    let extractedText;
    try {
      extractedText = await parseDocumentBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (parseErr) {
      return res.status(422).json({ error: `Parsing failed: ${parseErr.message}` });
    }

    // 2. Initial record creation
    const initialDoc = await saveDocument(uid, null, {
      filename,
      status: 'analyzing',
      uploadedAt: new Date().toISOString(),
      extractedText,
      overallRisk: 'standard',
    });

    // 3. Automated AI Analysis
    try {
      const analysis = await analyzeDocument(extractedText);
      const updatedDoc = await saveDocument(uid, initialDoc.id, {
        status: 'ready',
        ...analysis,
      });
      return res.status(201).json(updatedDoc);
    } catch (aiErr) {
      console.error('[Upload Analysis Failed]', aiErr.message);
      const erroredDoc = await saveDocument(uid, initialDoc.id, {
        status: 'error',
      });
      return res.status(201).json(erroredDoc);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents
 * List all documents for the authenticated user.
 */
router.get('/', async (req, res, next) => {
  try {
    const docs = await getUserDocuments(req.user.uid);
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:id
 * Retrieve analysis for a single document.
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

    const doc = await getDocument(req.user.uid, req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/documents/:id
 * Permanent deletion of document and extracted text.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

    const success = await deleteDocument(req.user.uid, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }
    res.json({ success: true, message: 'Document permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/documents/:id/chat
 * Strictly grounded Q&A.
 */
router.post('/:id/chat', aiLimiter, async (req, res, next) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

    const rawQuestion = req.body?.question;
    const question = sanitizeTextInput(rawQuestion, 2000);
    if (!question) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const doc = await getDocument(req.user.uid, req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const answer = await answerGroundedQuestion(doc.extractedText, question);

    const newHistory = [
      ...(doc.chatHistory || []),
      { role: 'user', message: question, timestamp: new Date().toISOString() },
      { role: 'assistant', message: answer, timestamp: new Date().toISOString() },
    ];

    await saveDocument(req.user.uid, doc.id, { chatHistory: newHistory });

    res.json({
      answer,
      chatHistory: newHistory,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/documents/compare
 * Structured meaning-diff between two user documents.
 */
router.post('/compare', aiLimiter, async (req, res, next) => {
  try {
    const { docIdA, docIdB } = req.body;
    if (!docIdA || !docIdB || docIdA === docIdB) {
      return res.status(400).json({ error: 'Two distinct document IDs are required.' });
    }

    if (!isValidDocumentId(docIdA) || !isValidDocumentId(docIdB)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

    const [docA, docB] = await Promise.all([
      getDocument(req.user.uid, docIdA),
      getDocument(req.user.uid, docIdB),
    ]);

    if (!docA || !docB) {
      return res.status(404).json({ error: 'One or both documents not found.' });
    }

    const diff = await compareDocumentTexts(
      docA.filename,
      docA.extractedText,
      docB.filename,
      docB.extractedText
    );

    res.json({
      documentA: { id: docA.id, filename: docA.filename },
      documentB: { id: docB.id, filename: docB.filename },
      diff,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
