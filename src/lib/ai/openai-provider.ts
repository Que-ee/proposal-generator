import OpenAI, { APIConnectionError, APIError } from "openai";
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

/** Active MVP model. Isolated here so it can change without touching product code. */
const MODEL = "gpt-5.6-luna";

const RETRY_DELAY_MS = 500;

/**
 * JSON schema handed to the Responses API's structured-output mode
 * (`text.format`) so `analyzeJob` comes back as the exact shape
 * `jobAnalysisSchema` expects, rather than free-form text.
 */
const JOB_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    clientNeeds: { type: "array", items: { type: "string" } },
    requiredSkills: { type: "array", items: { type: "string" } },
    painPoints: { type: "array", items: { type: "string" } },
    relevantProfileEvidence: { type: "array", items: { type: "string" } },
    missingExperience: { type: "array", items: { type: "string" } },
    proposalAngle: { type: "string" },
  },
  required: [
    "clientNeeds",
    "requiredSkills",
    "painPoints",
    "relevantProfileEvidence",
    "missingExperience",
    "proposalAngle",
  ],
  additionalProperties: false,
} as const;

/**
 * True only for genuine transient server/network failures: a connection
 * problem reaching OpenAI, or a 5xx from their servers. False for
 * authentication, invalid-request, not-found, and rate-limit errors — none
 * of those are helped by an immediate retry, so they surface right away.
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof APIConnectionError) return true;
  if (error instanceof APIError) {
    return typeof error.status === "number" && error.status >= 500;
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * OpenAI implementation of AIProvider, using the Responses API. Server-only:
 * it reads OPENAI_API_KEY directly and must never be imported from client
 * components.
 *
 * IMPORTANT: this constrains hallucination as much as prompting reasonably
 * can (the model is only given the verified profile as source material, and
 * instructed never to state facts outside it), but it cannot *guarantee*
 * factuality — an LLM can still misfollow instructions. Treat this as risk
 * reduction, not a hard safety guarantee; output review remains the user's
 * responsibility for this MVP.
 *
 * Reliability: a call that fails from a genuine transient error (network
 * connection failure, or a 5xx from OpenAI) is retried once after a short
 * delay. Anything else — auth, invalid request, rate limit, not found —
 * propagates immediately with no retry. There is no cross-model fallback
 * here (unlike the earlier Gemini provider); one restrained retry is enough
 * for this MVP and keeps the retry logic simple.
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = MODEL) {
    if (!apiKey) {
      throw new Error("OpenAIProvider requires an API key");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  private async withRetry<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (!isTransientError(error)) throw error;
      await delay(RETRY_DELAY_MS);
      return await call();
    }
  }

  async analyzeJob({ profile, rawJobPost }: AnalyzeJobInput): Promise<JobAnalysis> {
    const response = await this.withRetry(() =>
      this.client.responses.create({
        model: this.model,
        input: buildAnalyzeJobPrompt(profile, rawJobPost),
        text: {
          format: {
            type: "json_schema",
            name: "job_analysis",
            schema: JOB_ANALYSIS_JSON_SCHEMA,
            strict: true,
          },
        },
      })
    );

    const text = response.output_text;
    if (!text) {
      throw new Error("OpenAI returned an empty analysis response");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      throw new Error("OpenAI returned analysis that was not valid JSON");
    }

    const result = jobAnalysisSchema.safeParse(parsedJson);
    if (!result.success) {
      throw new Error(
        `OpenAI analysis did not match the expected shape: ${result.error.message}`
      );
    }

    return result.data;
  }

  async generateProposal({
    profile,
    rawJobPost,
    analysis,
  }: GenerateProposalInput): Promise<string> {
    const response = await this.withRetry(() =>
      this.client.responses.create({
        model: this.model,
        input: buildGenerateProposalPrompt(profile, rawJobPost, analysis),
      })
    );

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("OpenAI returned an empty proposal");
    }

    return text;
  }

  async rewriteProposal({
    profile,
    analysis,
    currentProposal,
    instructions,
  }: RewriteProposalInput): Promise<string> {
    const response = await this.withRetry(() =>
      this.client.responses.create({
        model: this.model,
        input: buildRewriteProposalPrompt(profile, analysis, currentProposal, instructions),
      })
    );

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("OpenAI returned an empty rewrite");
    }

    return text;
  }
}
