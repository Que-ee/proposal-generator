import { ApiError, GoogleGenAI, Type } from "@google/genai";
import type {
  AIProvider,
  AnalyzeJobInput,
  GenerateProposalInput,
  RewriteProposalInput,
} from "./types";
import { jobAnalysisSchema, type JobAnalysis } from "@/types";
import {
  buildAnalyzeJobPrompt,
  buildGenerateProposalPrompt,
  buildRewriteProposalPrompt,
} from "./prompts";

/**
 * JSON schema handed to Gemini's structured-output mode so `analyzeJob`
 * comes back as the exact shape `jobAnalysisSchema` expects, rather than
 * free-form text we'd have to parse hopefully.
 */
const JOB_ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    clientNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    relevantProfileEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
    proposalAngle: { type: Type.STRING },
  },
  required: [
    "clientNeeds",
    "requiredSkills",
    "painPoints",
    "relevantProfileEvidence",
    "missingExperience",
    "proposalAngle",
  ],
};

/** Primary model, tried first for every request. */
const PRIMARY_MODEL = "gemini-2.5-flash";
/** Used once, only after the primary model fails from transient unavailability. */
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const RETRY_DELAY_MS = 500;

/**
 * True for errors worth retrying/falling back on: the model is temporarily
 * unavailable or overloaded (HTTP 503 / status "UNAVAILABLE"). False for
 * everything else — auth failures, malformed requests, validation errors,
 * quota/billing errors — which should surface immediately instead of being
 * retried.
 */
function isTransientAvailabilityError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status === 503) return true;
  }
  // The SDK's ApiError.message carries the raw API error body as text
  // (e.g. `{"error":{"code":503,"status":"UNAVAILABLE",...}}`); fall back to
  // a text check in case a transient error surfaces without status === 503.
  const message = error instanceof Error ? error.message : String(error);
  return /\bUNAVAILABLE\b/.test(message) || /"code"\s*:\s*503/.test(message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini implementation of AIProvider. Server-only: it reads GEMINI_API_KEY
 * directly and must never be imported from client components.
 *
 * IMPORTANT: this constrains hallucination as much as prompting reasonably
 * can (the model is only given the verified profile as source material, and
 * instructed never to state facts outside it), but it cannot *guarantee*
 * factuality — an LLM can still misfollow instructions. Treat this as risk
 * reduction, not a hard safety guarantee; output review remains the user's
 * responsibility for this MVP.
 *
 * Reliability: gemini-2.5-flash (PRIMARY_MODEL) is tried first. If a call
 * fails specifically from transient unavailability (503/"UNAVAILABLE"), it's
 * retried once after a short delay on the same model; if that retry also
 * fails from unavailability, it falls back once to gemini-2.5-flash-lite
 * (FALLBACK_MODEL). Any other kind of error (auth, malformed request,
 * validation, quota/billing) is thrown immediately with no retry.
 */
export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model = PRIMARY_MODEL) {
    if (!apiKey) {
      throw new Error("GeminiProvider requires an API key");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  /**
   * Runs `call` against a model, retrying/falling back only for transient
   * availability errors: same model once more after a short delay, then
   * FALLBACK_MODEL once. Any non-transient error, or a transient error that
   * persists through the fallback, propagates to the caller unchanged.
   */
  private async withAvailabilityRetry<T>(
    call: (model: string) => Promise<T>
  ): Promise<T> {
    try {
      return await call(this.model);
    } catch (error) {
      if (!isTransientAvailabilityError(error)) throw error;

      await delay(RETRY_DELAY_MS);
      try {
        return await call(this.model);
      } catch (retryError) {
        if (!isTransientAvailabilityError(retryError)) throw retryError;
        if (this.model === FALLBACK_MODEL) throw retryError;

        // Final attempt: same request, fallback model, no further retries.
        return await call(FALLBACK_MODEL);
      }
    }
  }

  async analyzeJob({ profile, rawJobPost }: AnalyzeJobInput): Promise<JobAnalysis> {
    const response = await this.withAvailabilityRetry((model) =>
      this.client.models.generateContent({
        model,
        contents: buildAnalyzeJobPrompt(profile, rawJobPost),
        config: {
          responseMimeType: "application/json",
          responseSchema: JOB_ANALYSIS_RESPONSE_SCHEMA,
          temperature: 0.3,
        },
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty analysis response");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned analysis that was not valid JSON");
    }

    const result = jobAnalysisSchema.safeParse(parsedJson);
    if (!result.success) {
      throw new Error(
        `Gemini analysis did not match the expected shape: ${result.error.message}`
      );
    }

    return result.data;
  }

  async generateProposal({
    profile,
    rawJobPost,
    analysis,
  }: GenerateProposalInput): Promise<string> {
    const response = await this.withAvailabilityRetry((model) =>
      this.client.models.generateContent({
        model,
        contents: buildGenerateProposalPrompt(profile, rawJobPost, analysis),
        config: {
          temperature: 0.6,
        },
      })
    );

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini returned an empty proposal");
    }

    return text;
  }

  async rewriteProposal({
    profile,
    analysis,
    currentProposal,
    instructions,
  }: RewriteProposalInput): Promise<string> {
    const response = await this.withAvailabilityRetry((model) =>
      this.client.models.generateContent({
        model,
        contents: buildRewriteProposalPrompt(profile, analysis, currentProposal, instructions),
        config: {
          temperature: 0.6,
        },
      })
    );

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini returned an empty rewrite");
    }

    return text;
  }
}
