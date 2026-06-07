import { LogoResponse } from "../types/logo";

export const isHexColor = (color: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(color);

export const validateLogoResponse = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== "object") return { isValid: false, errors: ["Not an object"] };

  // Required fields
  const fields: (keyof LogoResponse)[] = ["brandName", "tagline", "brandStory", "colorPalette", "logoConcept", "svgMarkup"];
  for (const f of fields) {
    if (data[f] === undefined || data[f] === null || data[f] === "") errors.push(`Missing field: ${String(f)}`);
  }

  // Palette validation
  if (Array.isArray(data.colorPalette) && data.colorPalette.length === 5) {
    data.colorPalette.forEach((c: string) => {
      if (!isHexColor(c)) errors.push(`Invalid color: ${c}`);
    });
  } else {
    errors.push("colorPalette must be exactly 5 hex codes");
  }

  // SVG validation
  if (typeof data.svgMarkup !== "string" || data.svgMarkup.trim().length === 0) {
    errors.push("svgMarkup must be a non-empty string");
  } else {
    const svg = data.svgMarkup.trim();

    if (!svg.startsWith("<svg")) errors.push("Markup must start with <svg");

    // Accept width/height 512 (single/double quotes) OR viewBox="0 0 512 512"
    const has512wh =
      /width\s*=\s*["']512["']/.test(svg) && /height\s*=\s*["']512["']/.test(svg);
    const has512ViewBox = /viewBox\s*=\s*["']0\s+0\s+512\s+512["']/.test(svg);

    if (!has512wh && !has512ViewBox) {
      errors.push('SVG must be 512x512 via width/height="512" or viewBox="0 0 512 512"');
    }

    if (!svg.includes("<text")) errors.push("SVG must include a <text> element for the brand name");

    // Require font-size and >= 32 (support attribute or inline style)
    const fontSizeAttr = svg.match(/font-size\s*=\s*["'](\d+)["']/i);
    const fontSizeStyle = svg.match(/font-size\s*:\s*(\d+)px/i);
    const fontSize = fontSizeAttr ? parseInt(fontSizeAttr[1], 10) : fontSizeStyle ? parseInt(fontSizeStyle[1], 10) : null;

    if (fontSize === null) {
      errors.push('SVG <text> must specify font-size (attribute or style) and be at least 32');
    } else if (fontSize < 32) {
      errors.push("Font size must be at least 32px");
    }
  }

  return { isValid: errors.length === 0, errors };
};