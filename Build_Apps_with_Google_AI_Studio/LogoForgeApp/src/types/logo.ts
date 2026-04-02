export interface LogoResponse {
  brandName: string;
  tagline: string;
  brandStory: string;
  colorPalette: string[]; // expected 5 hex colors
  logoConcept: string;
  svgMarkup: string;
}

export interface LogoInputs {
  brandName: string;
  industry: string;
  style: 'minimal' | 'retro' | 'playful';
  keywords: string;
  count: 1 | 3;
}

export interface HistoryItem extends LogoResponse {
  id: string;
  timestamp: number;
}