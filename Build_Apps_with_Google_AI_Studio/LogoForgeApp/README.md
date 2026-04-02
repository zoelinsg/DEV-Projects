# LogoForge

A lightweight React + TypeScript app that generates **SVG logo concepts** (Single or 3 Variations) using the **Gemini API**.

## Features
- Generate 1 logo or 3 variations
- Structured JSON output + validation (with one retry on invalid output)
- SVG preview + download as `.svg`
- Copy JSON output

## Tech Stack
- Vite + React + TypeScript
- `@google/generative-ai`
- Lucide icons

## Setup

### 1. Install
```bash
npm install
```
### 2. Add API Key

Create .env.local in the project root:

```bash
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 3. Run
```bash
npm run dev
```

## Notes
- This is a prototype for learning/demo purposes.
- API key is read from env vars; don’t commit .env*.
- Costs depend on your Gemini API plan (Free tier may apply). Check usage/spend in Google AI Studio.