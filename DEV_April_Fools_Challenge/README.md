# Dark Dish Lab

A tiny April Fools project that generates cursed food or drink recipes based on selected ingredients and flavors.

## Project Structure

- frontend/: React UI
- backend/: Spring Boot API
- Gemini API (optional)

## Requirements

- Node.js 18+
- Java 17+

## Setup

#### Create `backend/.env.local`

```bash
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash-lite
AI_ENABLED=true
```
#### Add this to `.gitignore`
```bash
backend/.env.local
Frontend config
```
#### Create `frontend/.env.local`
```bash
VITE_API_BASE_URL=http://localhost:8080
```
## Run (two terminals)
Backend
```bash
# Windows PowerShell:
cd backend
.\mvnw.cmd spring-boot:run

# macOS/Linux:
cd backend
./mvnw spring-boot:run

# http://localhost:8080
```

Frontend
```bash
cd frontend
npm install
npm run dev

# http://localhost:5173
```

## Customize Ingredients 
`frontend/src/data/ingredients.js`
```js
export const INGREDIENTS = [
  "Durian",
  "Natto",
  "New Ingredient Here"
];
```

## Notes
- Frontend will display new items automatically.
- Backend can accept new ingredient names even if they are not in the backend pool (defaults will be used).
- For accurate scoring/type logic, also update the backend ingredient pool in the backend service.

## API
`POST /api/generate`

Request:
```json
{
  "selectedIngredients": ["Durian", "Natto"],
  "selectedFlavors": ["sweet", "spicy"]
}
```

Response:
```json
{
  "requestId": "...",
  "type": "FOOD",
  "rarity": "Cursed",
  "horrorScore": 100,
  "usedAi": true,
  "text": "..."
}
```

## Demo
[▶ Watch Demo on YouTube](https://youtu.be/UXBVWVfnXJc)

[![Demo Video](https://img.youtube.com/vi/UXBVWVfnXJc/0.jpg)](https://youtu.be/UXBVWVfnXJc)