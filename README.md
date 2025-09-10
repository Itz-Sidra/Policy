# Policy in Plain English

**Track:** Hack the Vote – Hack the System (Devpost)

## Problem
Most government policies are written in complex legal jargon that ordinary citizens, students, and journalists struggle to understand. This creates a gap in democratic participation decisions are made, but people don’t truly understand what’s being decided.

## Our Solution
**Policy in Plain English** is an AI-powered tool that converts any policy or bill into **simple, everyday language**.  
- Paste or upload a policy document (PDF/DOC).  
- Get a **plain-English explanation** in under 30 seconds.  
- See **pros & cons** and **real-world impact**.  

We make governance **accessible to everyone not just lawyers and politicians.**

---

## Features
- **Upload Support** – Works with text, PDF, and DOCX.  
- **AI-Powered** – Uses Google Gemini-1.5-Flash for fast, accurate explanations.  
- **Simplified Output** – Plain English summary + pros/cons + impact.  
- **Web App** – Clean Next.js frontend, accessible on desktop & mobile.  

---

## Tech Stack
- **Frontend:** Next.js 
- **Backend:** TypeScript (API routes)  
- **AI Model:** Gemini 1.5 Flash  
- **Cloud:** Google Cloud (Storage + Service Account)  
- **Hosting:** Vercel  

---

## Demo
**Live Demo:** [Policy-in-Plain-English](https://policy-iota-ten.vercel.app/)  

---

## Installation & Setup
Clone the repo:
```bash
git clone https://github.com/Itz-Sidra/Policy.git
cd Policy
````

Install dependencies:

```bash
npm install
```

Add environment variables in `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GOOGLE_APPLICATION_CREDENTIALS_JSON={...your-service-account-json...}
```

Run locally:

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Impact

* **Empowers Citizens** – Understand policies without legal expertise.
* **Helps Students** – Learn civics with simplified explanations.
* **Supports Journalists** – Faster policy analysis for reporting.
* **Strengthens Democracy** – Informed citizens = stronger civic debate.

---

## Team

* **Sidra Jahangir** – Developer(s)
* Hackathon: **Hack the System – Hack the Vote track**

---
