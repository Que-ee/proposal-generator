import { GeminiProvider } from "./gemini-provider";
import type { AIProvider } from "./types";

export type { AIProvider } from "./types";
export type {
  AnalyzeJobInput,
  GenerateProposalInput,
  RewriteProposalInput,
} from "./types";

let cachedProvider: AIProvider | null = null;

/**
 * Server-only factory for the active AI provider. Product code (API routes,
 * server actions) should call this instead of instantiating a provider
 * directly, so switching providers later is a one-line change here.
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  cachedProvider = new GeminiProvider(apiKey);
  return cachedProvider;
}
