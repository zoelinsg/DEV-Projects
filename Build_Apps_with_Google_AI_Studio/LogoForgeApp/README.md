# LogoForge

LogoForge is a lightweight React + TypeScript app that generates **SVG logo concepts** (Single or 3 Variations) with the **Gemini API** through a secure **backend proxy**.

## Features

- Generate 1 logo or 3 variations
- Structured JSON output with validation
- Automatic retry on temporary AI response/format issues
- SVG preview + download as `.svg`
- Copy JSON output
- Backend proxy to keep API keys off the client

## Tech Stack

### Frontend
- Vite
- React
- TypeScript
- Lucide Icons

### Backend
- Node.js
- Express
- `@google/generative-ai`

## Project Structure

```text
LogoForgeApp/
├─ src/         # React frontend
├─ server/      # Express backend proxy for Gemini API
├─ index.html
├─ package.json
├─ vite.config.ts
└─ README.md
```
## How It Works
* The frontend collects logo inputs from the user
* The frontend sends the request to /api/generate-logo
* The backend securely calls the Gemini API
* The backend validates the response and returns structured logo data
* The frontend renders the SVG preview and related brand content

## Local Setup
1. Install frontend dependencies
```bash
npm install
```
2. Install backend dependencies
```bash
cd server
npm install
cd ..
```
3. Add environment variables

Create a .env file inside the server/ folder:
```bash
GEMINI_API_KEY=YOUR_API_KEY_HERE
```
You can also keep a template in:
```bash
server/.env.example
```
4. Start the backend server
```bash
cd server
npm start
```
The backend runs on:
```bash
http://localhost:8080
```
5. Start the frontend

Open another terminal in the project root:
```bash
npm run dev
```
The frontend runs on:
```bash
http://localhost:5173
```

## Security Notes
* API keys are stored on the backend only
* Do not commit .env files
* The frontend no longer exposes the Gemini API key
* Use .env.example for documentation only

## Notes
* This project is built for learning, portfolio, and demo purposes
* Gemini responses may occasionally fail due to temporary high demand
* Response validation and retry logic help improve reliability
* Costs depend on your Gemini API plan and usage

## Future Improvements
* Deploy frontend and backend to Google Cloud
* Add rate limiting for public demo usage
* Add Imagen-based visual preview generation
* Improve error handling and fallback models