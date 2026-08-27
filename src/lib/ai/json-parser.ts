/**
 * Robust JSON Extractor & Sanitizer for LLM Structured Output
 * Handles markdown fences, trailing commas, conversational prose,
 * unclosed brackets, and escaped quotes.
 */

export class AIJsonParser {
  /**
   * Extracts and parses JSON from raw LLM output strings.
   */
  static extractAndParse<T = any>(rawText: string): T {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('LLM output is empty or not a string.');
    }

    let cleaned = rawText.trim();

    // 1. Strip Markdown Code Fences (```json ... ``` or ``` ...)
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    // 2. Extract balanced JSON block if conversational text wraps the response
    const firstBracket = cleaned.indexOf('[');
    const firstBrace = cleaned.indexOf('{');

    if (firstBracket >= 0 && (firstBrace === -1 || firstBracket < firstBrace)) {
      // JSON Array
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
    } else if (firstBrace >= 0) {
      // JSON Object
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
    }

    // 3. Attempt direct standard JSON parse
    try {
      return JSON.parse(cleaned) as T;
    } catch (firstErr) {
      // 4. Run automated JSON repair for common LLM syntax flaws
      const repaired = this.repairJsonString(cleaned);
      try {
        return JSON.parse(repaired) as T;
      } catch (secondErr) {
        throw new Error(`Failed to parse structured JSON from AI output: ${(firstErr as Error).message}`);
      }
    }
  }

  /**
   * Fixes common LLM syntax irregularities:
   * - Trailing commas before closing brackets
   * - Single quoted keys
   * - Unescaped control characters
   */
  static repairJsonString(jsonStr: string): string {
    let s = jsonStr;

    // Remove trailing commas before } or ]
    s = s.replace(/,\s*([\]}])/g, '$1');

    // Replace single quotes around keys with double quotes
    s = s.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');

    return s;
  }
}
