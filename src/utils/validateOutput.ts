import type { ValidationResult } from "../types.ts"

export function validateOutput(response: string, hallucinationSignals: string[]): ValidationResult {

  const errors: string[] = [];

  if (hallucinationSignals.some(signal => response.includes(signal))) {
    errors.push("Output contains hallucination signal.");
  }

  return {
    isValid: errors.length === 0,
    errors
  }

}
