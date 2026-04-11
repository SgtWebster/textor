// app/api/experiment/trial/route.ts
import { NextRequest, NextResponse } from "next/server";
import { appendRecord } from "../_storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantId, scenarioId, trialIndex, decision, confidence, rt_ms } =
      body;

    if (!participantId || !scenarioId || decision === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validDecisions = ["agree", "disagree"];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    await appendRecord("trials.jsonl", {
      participantId,
      scenarioId,
      trialIndex,
      decision,
      confidence: Number(confidence) || 3,
      rt_ms: Number(rt_ms) || 0,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[experiment/trial]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
