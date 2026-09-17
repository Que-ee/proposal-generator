import { OpenAIProvider } from "./openai-provider";
import type { AIProvider } from "./types";

// GeminiProvider remains in the codebase (./gemini-provider.ts) as an
// inactive provider — Gemini proved unreliable (repeated model
// availability/503 issues), so OpenAI is now the active provider below.
// Switching back, or to another provider, is a one-line change here.

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  cachedProvider = new OpenAIProvider(apiKey);
  return cachedProvider;
}
