# PlainSight

**Claude-powered contract scanner that tells you what you're really signing.**

Drop any PDF contract — lease, job offer, NDA, freelancer agreement, or terms of service — and get an instant plain-English breakdown with risk scoring, missing clause detection, and AI-drafted negotiation language. No law degree required.

---

## What it does

Most people sign contracts they don't understand. PlainSight fixes that.

Upload a PDF and within seconds you get:

- **Grade + risk score** — A through F letter grade and a 0–100 risk meter calibrated to the signer's perspective
- **Plain-English clause breakdown** — every clause translated out of legalese, color-coded red / yellow / green by risk level
- **Benchmark comparisons** — flags when terms fall outside normal ranges (non-competes over 1 year, security deposits over 2 months rent, etc.)
- **Ghost clause detection** — surfaces protections that are standard for this contract type but are absent from yours
- **Negotiation ammo** — polite, copy-paste pushback messages for each problematic clause
- **Contract timeline** — extracts key dates (start, end, payment, renewal deadlines) with one-click calendar export (.ics)
- **Shareable report** — a public summary page with Open Graph metadata for social sharing
- **AI-drafted negotiation email** — select the issues you want to push back on and get a full draft email in one click

Supported contract types: Apartment Lease · Job Offer · NDA · Freelancer Contract · Terms of Service

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| AI | Claude Sonnet via `@anthropic-ai/sdk` |
| PDF parsing | `pdf-parse` |
| Runtime | Node.js / Vercel Edge |

**Architecture highlights:**

- `POST /api/scan` — accepts a PDF upload, extracts text with `pdf-parse`, sends to Claude with a structured prompt, validates and stores the result
- `POST /api/email` — accepts selected clause/ghost-clause data, calls Claude to draft a negotiation email
- Server-side scan storage with an in-memory store (resets on restart — designed for MVP/demo)
- Claude prompt engineered to return a strict JSON schema: contract type, party role, jurisdiction, grade, risk score, clauses, ghost clauses, and timeline events
- 3-attempt retry loop with exponential backoff on the Claude API call
- Shareable `/scan/[id]/share` route with full Open Graph + Twitter card metadata

---

## Running locally

**Prerequisites:** Node.js 18+, an Anthropic API key

```bash
# 1. Clone and install
git clone https://github.com/upneja/plainsight.git
cd plainsight
npm install

# 2. Set your API key
Create `.env.local` and set `ANTHROPIC_API_KEY` to your local Anthropic API key. Do not commit the file.

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drop in any contract PDF.

To try the app without a PDF, visit [http://localhost:3000/scan/demo](http://localhost:3000/scan/demo) — it loads a pre-analyzed NYC apartment lease showing all features.

---

## Project structure

```
app/
  page.tsx                   # Landing page + file dropzone
  pricing/page.tsx           # Pricing tiers (Free / Pro / Per Scan)
  scan/[id]/
    page.tsx                 # Server component — fetches scan by ID
    ScanPageClient.tsx       # Full results UI (clauses, ghosts, timeline)
    share/page.tsx           # Public shareable summary page
    tabs/TimelineTab.tsx     # Contract timeline with .ics export
  api/
    scan/route.ts            # PDF upload → Claude analysis endpoint
    email/route.ts           # Negotiation email generation endpoint

components/
  FileDropzone.tsx           # Drag-and-drop PDF uploader
  EmailModal.tsx             # AI negotiation email modal
  GradeBadge.tsx             # A–F letter grade display
  RiskMeter.tsx              # 0–100 risk score bar
  RiskBadge.tsx              # Red/yellow/green risk indicator
  CopyButton.tsx             # One-click copy to clipboard
  LegalDisclaimer.tsx        # Footer legal disclaimer

lib/
  analyze-contract.ts        # Claude API call + retry logic
  extract-text.ts            # PDF text extraction via pdf-parse
  prompts.ts                 # Claude system prompt (full schema spec)
  scan-store.ts              # In-memory scan storage
  demo-data.ts               # Pre-built demo scan (NYC lease)
  types.ts                   # Shared TypeScript types
```

---

## Legal disclaimer

PlainSight provides general legal information for educational purposes only. It is not a law firm and does not provide legal advice. Always consult a licensed attorney for advice specific to your situation.
