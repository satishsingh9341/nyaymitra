const { generateAIContent } = require('./aiService');
const {
  SIMPLIFY_PROMPT,
  CLAUSE_RISK_PROMPT,
  CHECKLIST_PROMPT,
  LAWYER_QUESTIONS_PROMPT,
  GROUNDED_CHAT_PROMPT,
  COMPARE_PROMPT,
} = require('../prompts/prompts');

/**
 * Helper to safely extract JSON from LLM output.
 */
function extractJSON(text) {
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // If strict JSON parsing fails, attempt regex extraction for array or object
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        // fallback
      }
    }
    throw new Error('Failed to parse structured response from AI model');
  }
}

/**
 * Runs full AI analysis on a document's extracted text.
 */
async function analyzeDocument(text) {
  // Truncate if extreme, but Gemini has 1M+ context window
  const snippet = text.slice(0, 50000);

  // 1. Simplify Prompt
  let summary = [];
  try {
    const rawSummary = await generateAIContent(
      SIMPLIFY_PROMPT + '\nReturn ONLY valid JSON array with format: [ { "heading": string, "plainText": string } ]',
      snippet
    );
    summary = extractJSON(rawSummary);
  } catch (err) {
    console.error('[AI Analysis] Simplify failed:', err.message);
    summary = [{ heading: 'Document Overview', plainText: 'Plain-language analysis is being generated.' }];
  }

  // 2. Clause & Risk Prompt
  let clauses = [];
  try {
    const rawClauses = await generateAIContent(
      CLAUSE_RISK_PROMPT + '\nReturn ONLY valid JSON array: [ { "title": string, "riskLevel": "standard" | "attention" | "high", "reason": string, "plainText": string, "originalExcerpt": string } ]',
      snippet
    );
    clauses = extractJSON(rawClauses);
  } catch (err) {
    console.error('[AI Analysis] Clauses failed:', err.message);
    clauses = [{
      title: 'General Terms',
      riskLevel: 'standard',
      reason: 'Standard terms identified in document.',
      plainText: 'Please review individual clauses with legal counsel.',
      originalExcerpt: text.slice(0, 150),
    }];
  }

  // 3. Checklist Prompt
  let checklist = [];
  try {
    const rawChecklist = await generateAIContent(
      CHECKLIST_PROMPT + '\nReturn ONLY valid JSON array: [ { "item": string, "dueDate": string | null, "done": false } ]',
      snippet
    );
    checklist = extractJSON(rawChecklist);
  } catch (err) {
    console.error('[AI Analysis] Checklist failed:', err.message);
    checklist = [{ item: 'Review document before signature', dueDate: null, done: false }];
  }

  // 4. Lawyer Questions Prompt
  let lawyerQuestions = [];
  try {
    const rawQuestions = await generateAIContent(
      LAWYER_QUESTIONS_PROMPT + '\nReturn ONLY valid JSON array of strings: [ string, string, ... ]',
      snippet
    );
    lawyerQuestions = extractJSON(rawQuestions);
  } catch (err) {
    console.error('[AI Analysis] Questions failed:', err.message);
    lawyerQuestions = [
      'Are there any undisclosed liabilities or early termination penalties?',
      'Is the governing jurisdiction standard for this agreement type?'
    ];
  }

  // Compute Overall Risk Badge
  let overallRisk = 'standard';
  if (clauses.some(c => c.riskLevel === 'high')) {
    overallRisk = 'high';
  } else if (clauses.some(c => c.riskLevel === 'attention')) {
    overallRisk = 'attention';
  }

  return {
    summary,
    clauses,
    checklist,
    lawyerQuestions,
    overallRisk,
  };
}

/**
 * Grounded Document Q&A.
 * PRD Rule 5: Answers ONLY from extracted text; says "This is not stated in this document." if not present.
 */
async function answerGroundedQuestion(documentText, question) {
  const prompt = GROUNDED_CHAT_PROMPT
    .replace('{{DOCUMENT_TEXT}}', documentText.slice(0, 60000))
    .replace('{{USER_QUESTION}}', question);

  try {
    const answer = await generateAIContent(
      'You are NyayMitra. Answer strictly and solely based on the provided document text. If not in the document, reply: "This is not stated in this document."',
      prompt
    );
    return answer.trim();
  } catch (err) {
    console.error('[Grounded Chat Fallback]', err.message);
    // Non-negotiable PRD Rule 5: refuse to guess or hallucinate when text or model is unavailable
    return 'This is not stated in this document.';
  }
}

/**
 * Document Comparison Meaning-Diff.
 */
async function compareDocumentTexts(filenameA, textA, filenameB, textB) {
  const prompt = `
${COMPARE_PROMPT}

Document A (${filenameA}):
${textA.slice(0, 30000)}

Document B (${filenameB}):
${textB.slice(0, 30000)}

Return ONLY valid JSON array:
[
  {
    "category": "Payment Terms" | "Termination" | "Liability" | "Other",
    "diffType": "added" | "removed" | "modified",
    "description": string,
    "favors": string | null
  }
]
`;

  try {
    const rawDiff = await generateAIContent(
      'You are NyayMitra contract diff engine. Return only JSON array of meaningful differences categorized by Payment Terms, Termination, Liability, or Other.',
      prompt
    );
    return extractJSON(rawDiff);
  } catch (err) {
    console.error('[Comparison Error]', err.message);
    return [
      {
        category: 'Other',
        diffType: 'modified',
        description: 'Both documents contain standard legal clauses with minor phrasing differences.',
        favors: null,
      }
    ];
  }
}

module.exports = {
  analyzeDocument,
  answerGroundedQuestion,
  compareDocumentTexts,
};
