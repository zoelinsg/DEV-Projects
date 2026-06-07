import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

function getClient() {
  if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }
  return new GoogleGenerativeAI(API_KEY);
}

const SYSTEM_PROMPT = `You are a Senior Brand Identity Designer. Generate professional vector logos in SVG.

DESIGN CONSTRAINTS:
- Canvas: 512x512 units.
- Safe Zone: Keep elements within a 32px inner margin (active area: 32..480).
- Complexity: At most 2 background shapes + 1 central icon-like element.
- Typography: Include brand name using <text>. font-size >= 32. Center with text-anchor="middle" x="50%".
- Colors: Only use colors in colorPalette.

STYLE GUIDELINES:
- minimal: lots of whitespace, thin lines (stroke-width 1-2), geometric simplicity, sans-serif feel.
- retro: badge/container shapes, heavier strokes (4-6), centered, serif feel.
- playful: rounded/bubbly shapes, balanced asymmetry, bright contrast.

OUTPUT RULES:
- Return ONLY valid JSON (no markdown).
- No comments inside SVG.
`;

function buildSchemaHint(count) {
  if (count === 1) {
    return `Return a single JSON object with EXACT fields:
{
  "brandName": "string",
  "tagline": "string (<= 12 words)",
  "brandStory": "string (<= 80 words)",
  "colorPalette": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"],
  "logoConcept": "string (<= 60 words)",
  "svgMarkup": "string (valid inline SVG, width=\\"512\\" height=\\"512\\")"
}`;
  }

  return `Return a JSON array with EXACTLY 3 objects, each following:
{
  "brandName": "string",
  "tagline": "string (<= 12 words)",
  "brandStory": "string (<= 80 words)",
  "colorPalette": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"],
  "logoConcept": "string (<= 60 words)",
  "svgMarkup": "string (valid inline SVG, width=\\"512\\" height=\\"512\\")"
}`;
}

function normalizeToArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return [parsed];
  return null;
}

function validateHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function validateLogoResponse(item) {
  const errors = [];

  if (!item || typeof item !== "object") {
    return { isValid: false, errors: ["Item is not an object"] };
  }

  if (!item.brandName || typeof item.brandName !== "string") {
    errors.push("brandName must be a string");
  }

  if (!item.tagline || typeof item.tagline !== "string") {
    errors.push("tagline must be a string");
  }

  if (!item.brandStory || typeof item.brandStory !== "string") {
    errors.push("brandStory must be a string");
  }

  if (
    !Array.isArray(item.colorPalette) ||
    item.colorPalette.length !== 5 ||
    !item.colorPalette.every((c) => typeof c === "string" && validateHexColor(c))
  ) {
    errors.push("colorPalette must contain exactly 5 valid hex colors");
  }

  if (!item.logoConcept || typeof item.logoConcept !== "string") {
    errors.push("logoConcept must be a string");
  }

  if (
    !item.svgMarkup ||
    typeof item.svgMarkup !== "string" ||
    !item.svgMarkup.includes("<svg") ||
    !item.svgMarkup.includes('width="512"') ||
    !item.svgMarkup.includes('height="512"')
  ) {
    errors.push('svgMarkup must be valid inline SVG with width="512" height="512"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

async function generateOnce(inputs, previousErrors) {
  const genAI = getClient();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const userPrompt = `Generate logo data for:
BRAND: "${inputs.brandName}"
INDUSTRY: "${inputs.industry}"
STYLE: "${inputs.style}"
KEYWORDS: "${inputs.keywords || "none"}"

REQUIREMENTS:
1) colorPalette must be exactly 5 valid hex colors.
2) svgMarkup must be a valid inline SVG with width="512" height="512".
3) svgMarkup must include <text> showing the brand name.
4) Keep within safe zone and follow the selected style.
5) Output must match the requested schema exactly (no extra fields).
`;

  const retryHint =
    previousErrors?.length
      ? `RETRY: Your previous output failed validation with: ${previousErrors.join(" | ")}. Fix ALL issues and output again.`
      : "";

  const schemaHint = buildSchemaHint(inputs.count);

  const finalPrompt = `${SYSTEM_PROMPT}\n${retryHint}\n${schemaHint}\n\n${userPrompt}`.trim();

  const result = await model.generateContent(finalPrompt);
  const raw = result.response.text().trim();
  const parsed = JSON.parse(raw);

  return { parsed, raw };
}

async function generateLogo(inputs, previousErrors) {
  try {
    const { parsed, raw } = await generateOnce(inputs, previousErrors);
    const arr = normalizeToArray(parsed);

    if (!arr) {
      if (!previousErrors) {
        return generateLogo(inputs, ["Output is not a JSON object/array"]);
      }
      return { data: null, raw, error: "AI output is not a JSON object/array." };
    }

    if (inputs.count === 3 && arr.length !== 3) {
      if (!previousErrors) {
        return generateLogo(inputs, [`Expected 3 variations, got ${arr.length}`]);
      }
      return { data: null, raw, error: `Expected 3 variations, got ${arr.length}` };
    }

    const errors = [];
    const validated = [];

    arr.forEach((item, idx) => {
      const v = validateLogoResponse(item);
      if (!v.isValid) {
        errors.push(`Item ${idx + 1}: ${v.errors.join(", ")}`);
      } else {
        validated.push(item);
      }
    });

    if (errors.length === 0) {
      const final = inputs.count === 1 ? [validated[0]] : validated;
      return { data: final, raw };
    }

    if (!previousErrors) {
      return generateLogo(inputs, errors);
    }

    return { data: null, raw, error: `Validation failed: ${errors[0]}` };
  } catch (err) {
    return {
      data: null,
      raw: "",
      error: err?.message || "Unknown error",
    };
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/generate-logo", async (req, res) => {
  try {
    const { inputs, previousErrors } = req.body;

    if (!inputs?.brandName || !inputs?.style || !inputs?.count) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await generateLogo(inputs, previousErrors);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});