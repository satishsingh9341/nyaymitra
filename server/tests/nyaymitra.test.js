const http = require('http');
const assert = require('assert');
const app = require('../index');
const { parseDocumentBuffer } = require('../services/parserService');
const { answerGroundedQuestion, compareDocumentTexts } = require('../services/analyzerService');
const { saveDocument, getDocument, deleteDocument, getUserDocuments } = require('../services/documentStore');
const { sanitizeFilename, isValidDocumentId, sanitizeTextInput } = require('../utils/validators');

let server;
let baseUrl;

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log(' NyayMitra Full Quality & Security Suite (14 Tests)');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log('PASSED ✓');
      passed++;
    } catch (err) {
      console.log('FAILED ✗');
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // Start test server
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // 1. Health Check
    await test('GET /health returns HTTP 200 with service name', async () => {
      const res = await makeRequest('/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.status, 'ok');
      assert.strictEqual(res.json.service, 'NyayMitra Backend');
    });

    // 2. Security Headers (CSP, nosniff, frame-options)
    await test('Security headers are present on all responses', async () => {
      const res = await makeRequest('/health');
      assert.strictEqual(res.headers['x-frame-options'], 'DENY');
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
      assert.ok(res.headers['content-security-policy'], 'Expected Content-Security-Policy header');
    });

    // 3. Auth Security: 401 without Bearer token
    await test('GET /api/documents rejects unauthenticated request with 401', async () => {
      const res = await makeRequest('/api/documents');
      assert.strictEqual(res.status, 401);
      assert.ok(res.json.error, 'Expected error message in response');
    });

    // 4. Input Validation: Invalid document ID rejected
    await test('GET /api/documents/:id rejects malformed ID format with 400', async () => {
      const res = await makeRequest('/api/documents/../../etc/passwd', {
        headers: { Authorization: 'Bearer mock-firebase-token-demo-user-12345' },
      });
      assert.ok([400, 404].includes(res.status), 'Expected 400 or 404 on path traversal attempt');
    });

    // 5. Input Validation: Empty chat question rejected
    await test('POST /api/documents/:id/chat rejects empty or whitespace question with 400', async () => {
      const res = await makeRequest('/api/documents/aa0da0a4-35d6-4df9-a74a-26b2e4201ebb/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-firebase-token-demo-user-12345',
        },
        body: JSON.stringify({ question: '   ' }),
      });
      assert.strictEqual(res.status, 400);
    });

    // 6. Filename Sanitizer: Strips directory traversal tokens
    await test('Filename sanitizer neutralizes path traversal payloads', async () => {
      const dangerous1 = '../../../../etc/passwd.txt';
      const dangerous2 = '..\\..\\windows\\system32\\calc.docx';
      assert.strictEqual(sanitizeFilename(dangerous1), 'etcpasswd.txt');
      assert.strictEqual(sanitizeFilename(dangerous2), 'windowssystem32calc.docx');
    });

    // 7. Text Input Sanitizer: Strips control characters
    await test('Text input sanitizer removes illegal ASCII control codes', async () => {
      const tainted = 'What is the rent?\x00\x08\x1F';
      assert.strictEqual(sanitizeTextInput(tainted), 'What is the rent?');
    });

    // 8. In-memory Parsing: TXT text extraction without disk write
    await test('Parser correctly extracts raw text from buffer without disk writing', async () => {
      const sample = 'RESIDENTIAL LEASE AGREEMENT\nTenant: Ankit Sharma\nRent: INR 35,000';
      const buf = Buffer.from(sample, 'utf-8');
      const text = await parseDocumentBuffer(buf, 'agreement.txt', 'text/plain');
      assert.strictEqual(text, sample);
    });

    // 9. In-memory Parsing: Unsupported file type rejection
    await test('Parser rejects unsupported executable or image files', async () => {
      const buf = Buffer.from('fake binary data', 'utf-8');
      let rejected = false;
      try {
        await parseDocumentBuffer(buf, 'malicious.exe', 'application/x-msdownload');
      } catch (e) {
        rejected = true;
      }
      assert.ok(rejected, 'Expected parser to throw on unsupported file');
    });

    // 10. User Data Isolation & Ownership
    await test('Strict user isolation prevents accessing another user documents', async () => {
      const userA = 'user-alpha-999';
      const userB = 'user-beta-888';

      const docA = await saveDocument(userA, null, {
        filename: 'Alpha_Contract.pdf',
        status: 'ready',
        extractedText: 'Secret Alpha Text',
      });

      const docAsB = await getDocument(userB, docA.id);
      assert.strictEqual(docAsB, null, 'User B must not be able to read User A document');

      const docAsA = await getDocument(userA, docA.id);
      assert.strictEqual(docAsA.id, docA.id);

      await deleteDocument(userA, docA.id);
    });

    // 11. Permanent Delete verification (PRD Rule 4)
    await test('Permanent delete completely purges document and extracted text', async () => {
      const user = 'demo-test-user';
      const doc = await saveDocument(user, null, {
        filename: 'To_Be_Deleted.docx',
        extractedText: 'Sensitive content that must be permanently wiped',
      });

      assert.ok(await getDocument(user, doc.id));
      const deleted = await deleteDocument(user, doc.id);
      assert.strictEqual(deleted, true);

      const postDelete = await getDocument(user, doc.id);
      assert.strictEqual(postDelete, null);
    });

    // 12. Account Deletion Cascade: Purges all documents belonging to user
    await test('Deleting all documents cascades cleanly for account wipe', async () => {
      const user = 'cascade-wipe-user';
      await saveDocument(user, null, { filename: 'Doc1.pdf' });
      await saveDocument(user, null, { filename: 'Doc2.pdf' });

      const docsBefore = await getUserDocuments(user);
      assert.strictEqual(docsBefore.length, 2);

      // Wipe all
      await Promise.all(docsBefore.map((d) => deleteDocument(user, d.id)));

      const docsAfter = await getUserDocuments(user);
      assert.strictEqual(docsAfter.length, 0);
    });

    // 13. Grounded Chat (Strict adherence: refusal when not present)
    await test('Grounded Q&A adheres strictly to document text', async () => {
      const docText = 'This Non-Disclosure Agreement is entered into between Party A and Party B. The term is 2 years.';
      const question = 'What is the penalty if someone is murdered?';

      const answer = await answerGroundedQuestion(docText, question);
      assert.ok(
        answer.toLowerCase().includes('not stated') || answer.toLowerCase().includes('not mentioned') || answer.toLowerCase().includes('does not address'),
        `Expected grounded refusal, got: "${answer}"`
      );
    });

    // 14. Meaning Diff Categorization
    await test('Meaning diff groups contract changes under PRD categories', async () => {
      const docA = 'Rent is INR 30,000 payable by 1st of month. Notice period is 30 days.';
      const docB = 'Rent is INR 35,000 payable by 5th of month. Notice period is 60 days with 2-month penalty.';

      const diff = await compareDocumentTexts('Lease_A.pdf', docA, 'Lease_B.pdf', docB);
      assert.ok(Array.isArray(diff), 'Expected diff to be an array');
      assert.ok(diff.length > 0, 'Expected at least one meaningful difference');
      const validCategories = ['payment terms', 'termination', 'liability', 'other'];
      diff.forEach((d) => {
        assert.ok(validCategories.includes(d.category.toLowerCase()), `Invalid category: ${d.category}`);
      });
    });

  } finally {
    server.close();
  }

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
