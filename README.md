# NyayMitra (न्यायमित्र)

> **Tagline**: *Samjho apna document, faisla khud lo.*  
> **One-line pitch**: NyayMitra turns confusing legal documents — leases, contracts, NDAs, ToS — into plain language, flags risky clauses, lets you compare two documents, and answers questions grounded strictly in your own document.

---

## 🌟 Key Capabilities
1. **Document Simplification**: Section-by-section plain English translations.
2. **Clause Risk Highlighter**: Automatic 3-tier risk tagging (`Standard`, `Attention`, `High Risk`) with one-line plain explanations.
3. **Grounded Q&A**: Strict in-document chat that refuses external speculation when unaddressed in the text.
4. **Meaning-Diff Comparison**: Substantive contract comparisons across Payment Terms, Termination, Liability, and Other.
5. **Actionable Checklist**: Personal tracking of obligations, conditions, and deadlines.
6. **Questions for Your Lawyer**: Strategic legal questions generated to maximize billable hour efficiency.

---

## 🛡️ Security & Privacy Architecture
- **In-Memory Parsing**: Raw `.pdf`, `.docx`, and `.txt` files are parsed in-memory using `pdf-parse` and `mammoth`. Raw binary files are **never** stored on disk or in the cloud.
- **Strict User Isolation**: All reads, writes, and deletions verify ownership (`doc.uid === req.user.uid`).
- **Sliding-Window Rate Limiting**: AI endpoints are rate-limited per user to control abuse.
- **HTTP Security Headers**: Complete `CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy` headers.
- **Permanent Full Deletion**: Deleting a document or account wipes all associated records and extracted text.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment
Copy `.env.example` in both `client/` and `server/`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Add your `GEMINI_API_KEY` in `server/.env`.

### 3. Run Development Servers
```bash
npm start
```
- **Frontend**: `http://localhost:5173/`
- **Backend**: `http://localhost:5000/`

### 4. Run Automated Tests
```bash
npm --prefix server test
```

---

## 📄 License & Disclaimer
NyayMitra provides informational legal document analysis and does not constitute legal advice or formal representation.
