# NyayMitra — Product Requirements Document (Final, Locked)

**Tagline**: *Samjho apna document, faisla khud lo.*  
**One-line pitch**: NyayMitra turns confusing legal documents — leases, contracts, NDAs, ToS — into plain language, flags risky clauses, lets you compare two documents, and answers questions grounded strictly in your own document.

---

## 1. Problem Statement
Legal documents are written in language most people cannot confidently parse. This causes two real harms:
1. People sign things they don't understand — obligations, penalties, or waivers they never noticed.
2. People who do sense a problem still cannot act on it — they don't know which clause is risky, how it compares to a "normal" version, or what to even ask a lawyer.

**Goal**: Close the gap between *"I have a document I don't understand"* and *"I now know enough to decide or have a useful lawyer conversation."* NyayMitra does not replace a lawyer.

---

## 2. Goals / Non-Goals

### Goals (v1 — locked)
- Turn dense legal text into plain language, section by section.
- Tag every clause: **Standard** / **Attention** / **High Risk**, with a one-line plain-English reason.
- Let users compare two documents and see a meaning diff, not a text diff.
- Let users ask questions about their own document — answers grounded strictly in that document's text.
- Produce exportable outputs: Summary, Obligations/Deadlines Checklist, "Questions for your lawyer."
- Keep the "not legal advice" boundary visible everywhere — not just a footer.

### Non-Goals (explicitly out of scope for v1)
- No jurisdiction-specific legal accuracy guarantees or legal opinions.
- No e-signature, no contract drafting from scratch, no lawyer marketplace.
- No permanent storage of raw document binaries.
- No prediction of case outcomes or "who wins."

---

## 3. Users / Personas
| Persona | Core Need |
| :--- | :--- |
| **Tenant signing a lease** | *"Is this deposit clause normal? What if I break the lease early?"* |
| **Freelancer reviewing client contract** | *"What am I liable for? Is this NDA one-sided?"* |
| **Small business comparing vendor contracts** | *"Which contract has better termination terms?"* |
| **Anyone before a lawyer meeting** | *"What should I actually ask, so I don't waste billable time?"* |

---

## 4. Core Features (v1 — locked scope)
1. **Document Upload & Simplification**: Upload PDF/DOCX/TXT → plain-language, section-by-section rewrite.
2. **Clause Risk Highlighter**: Every clause tagged Standard/Attention/High Risk + one-line reason.
3. **Document Q&A (grounded chat)**: Chat scoped to one document; answers strictly from text or states *"This is not stated in this document."*
4. **Document Comparison**: Pick two documents → structured meaning-diff (Payment Terms / Termination / Liability / Other).
5. **Actionable Outputs**: Auto-generated Summary, Checklist, "Questions to ask your lawyer" list — all exportable.
6. **User Dashboard**: Every uploaded document, risk badge, last-analyzed date.
7. **Persistent Disclaimer System**: Non-dismissible global banner + inline disclaimers on every AI output.

---

## 5. UI / UX — Locked Decisions

### 5.1 Design Language
- Calm, professional, trustworthy. Deep navy/slate palette — not a gamified consumer-app look.
- No neon colors, no bouncy animations, no cartoon illustrations. `prefers-reduced-motion` respected everywhere.

### 5.2 Design Tokens
| Token | Hex | Use |
| :--- | :--- | :--- |
| `--bg-primary` | `#F8FAFC` | App background |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--navy-900` | `#0F172A` | Primary text, headers, nav |
| `--slate-700` | `#334155` | Secondary text |
| `--slate-400` | `#94A3B8` | Muted text, placeholders |
| `--border` | `#E2E8F0` | Card/table borders |
| `--accent` | `#2563EB` | Primary buttons, links, focus ring |
| `--risk-standard` | `#16A34A` (green) | "Standard" badge |
| `--risk-attention` | `#D97706` (amber) | "Attention" badge |
| `--risk-high` | `#DC2626` (red) | "High Risk" badge |

*Rule*: Risk badges ALWAYS carry a text label ("Standard" / "Attention" / "High Risk"), never color alone.

### Typography
- Headings: `"Lora"`, Georgia, serif
- Body/UI: `"Inter"`, -apple-system, sans-serif (Base 16px, line-height 1.6)

---

## 6. Technical Architecture
- **Frontend**: React + Vite + React Router.
- **Backend**: Node.js + Express.
- **AI**: Google Gemini (`gemini-2.5-flash`), centralized in `server/prompts/prompts.js`.
- **Auth**: Firebase Google Sign-In + Firebase Admin token verification with local dev demo fallback.
- **Data Model**: Firestore schema under `users/{uid}/documents/{docId}`.
- **File Parsing**: In-memory `pdf-parse`, `mammoth`, and UTF-8 text parser.
