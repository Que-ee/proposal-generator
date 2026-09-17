import { NextResponse } from "next/server";
import { z } from "zod";
import { freelancerProfileSchema } from "@/types";
import { getAIProvider } from "@/lib/ai";

const requestSchema = z.object({
  profile: freelancerProfileSchema,
  rawJobPost: z.string().min(1),
});

/**
 * Server-only boundary for job analysis. Keeps GEMINI_API_KEY out of the
 * browser and gives the product layer a single call to depend on, instead of
 * wiring provider-specific logic into the page.
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
    const analysis = await provider.analyzeJob(parsed.data);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("analyze-job failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job analysis failed" },
      { status: 502 }
    );
  }
}
