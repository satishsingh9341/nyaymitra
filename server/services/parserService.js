const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * In-memory document parser.
 * PRD Non-Negotiable Rule 3: Raw uploaded files are parsed in-memory and never written to disk/storage.
 */
async function parseDocumentBuffer(fileBuffer, originalname, mimetype) {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf' || mimetype === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    if (!data.text || !data.text.trim()) {
      throw new Error('PDF file appears to be empty or contains scanned images without text.');
    }
    return data.text.trim();
  }

  if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    if (!result.value || !result.value.trim()) {
      throw new Error('DOCX file appears to be empty or has no readable text.');
    }
    return result.value.trim();
  }

  if (ext === '.txt' || mimetype === 'text/plain') {
    const text = fileBuffer.toString('utf-8').trim();
    if (!text) {
      throw new Error('Text file is empty.');
    }
    return text;
  }

  throw new Error(`Unsupported file type '${ext}'. Please upload a PDF, DOCX, or TXT file.`);
}

module.exports = {
  parseDocumentBuffer,
};
