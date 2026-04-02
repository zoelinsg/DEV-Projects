import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogoInputs, LogoResponse } from '../types/logo';
import { validateLogoResponse } from '../utils/validators';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

function getClient() {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please set it in .env/.env.local and restart dev server.');
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

function buildSchemaHint(count: 1 | 3) {
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

function normalizeToArray(parsed: any): any[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return [parsed];
  return null;
}

async function generateOnce(inputs: LogoInputs, previousErrors?: string[]): Promise<{ parsed: any; raw: string }> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // This makes the model much more likely to return strict JSON
    generationConfig: { responseMimeType: 'application/json' },
  });

  const userPrompt = `Generate logo data for:
BRAND: "${inputs.brandName}"
INDUSTRY: "${inputs.industry}"
STYLE: "${inputs.style}"
KEYWORDS: "${inputs.keywords || 'none'}"

REQUIREMENTS:
1) colorPalette must be exactly 5 valid hex colors.
2) svgMarkup must be a valid inline SVG with width="512" height="512".
3) svgMarkup must include <text> showing the brand name.
4) Keep within safe zone and follow the selected style.
5) Output must match the requested schema exactly (no extra fields).
`;

  const retryHint = previousErrors?.length
    ? `RETRY: Your previous output failed validation with: ${previousErrors.join(' | ')}. Fix ALL issues and output again.`
    : '';

  const schemaHint = buildSchemaHint(inputs.count);

  const finalPrompt = `${SYSTEM_PROMPT}\n${retryHint}\n${schemaHint}\n\n${userPrompt}`.trim();

  const result = await model.generateContent(finalPrompt);
  const raw = result.response.text().trim();

  // responseMimeType is JSON, but still guard just in case
  const parsed = JSON.parse(raw);
  return { parsed, raw };
}

export async function generateLogo(
  inputs: LogoInputs,
  previousErrors?: string[]
): Promise<{ data: LogoResponse[] | null; raw: string; error?: string }> {
  try {
    const { parsed, raw } = await generateOnce(inputs, previousErrors);
    const arr = normalizeToArray(parsed);

    if (!arr) {
      // retry once
      if (!previousErrors) return generateLogo(inputs, ['Output is not a JSON object/array']);
      return { data: null, raw, error: 'AI output is not a JSON object/array.' };
    }

    // If user asked 3, enforce length 3 (retry once)
    if (inputs.count === 3 && arr.length !== 3) {
      if (!previousErrors) return generateLogo(inputs, [`Expected 3 variations, got ${arr.length}`]);
      return { data: null, raw, error: `Expected 3 variations, got ${arr.length}` };
    }

    // validate each item
    const errors: string[] = [];
    const validated: LogoResponse[] = [];

    arr.forEach((item, idx) => {
      const v = validateLogoResponse(item);
      if (!v.isValid) {
        errors.push(`Item ${idx + 1}: ${v.errors.join(', ')}`);
      } else {
        validated.push(item as LogoResponse);
      }
    });

    if (errors.length === 0) {
      // count=1 but model returned multiple: keep first
      const final = inputs.count === 1 ? [validated[0]] : validated;
      return { data: final, raw };
    }

    // retry once with aggregated errors
    if (!previousErrors) return generateLogo(inputs, errors);
    return { data: null, raw, error: `Validation failed: ${errors[0]}` };
  } catch (err: any) {
    return { data: null, raw: '', error: err?.message || 'Unknown error' };
  }
}