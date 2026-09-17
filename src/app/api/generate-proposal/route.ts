import { NextResponse } from "next/server";
import { z } from "zod";
import { freelancerProfileSchema, jobAnalysisSchema } from "@/types";
import { getAIProvider } from "@/lib/ai";

const requestSchema = z.object({
  profile: freelancerProfileSchema,
  rawJobPost: z.string().min(1),
  analysis: jobAnalysisSchema,
});

/**
 * Server-only boundary for proposal generation (also used for full
 * regeneration — same inputs, a fresh call). Keeps GEMINI_API_KEY out of the
 * browser.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.message },
      { status: 400 }
    );
  }

  try {
    const provider = getAIProvider();
    const proposal = await provider.generateProposal(parsed.data);
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("generate-proposal failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proposal generation failed" },
      { status: 502 }
    );
  }
}
