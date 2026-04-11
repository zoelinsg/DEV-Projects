import { LogoInputs, LogoResponse } from '../types/logo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function generateLogo(
  inputs: LogoInputs,
  previousErrors?: string[]
): Promise<{ data: LogoResponse[] | null; raw: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, previousErrors }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        raw: '',
        error: result?.error || 'Request failed',
      };
    }

    return result;
  } catch (err: any) {
    return {
      data: null,
      raw: '',
      error: err?.message || 'Unknown error',
    };
  }
}