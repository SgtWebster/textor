// app/api/experiment/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { appendRecord, updateLastRecord } from "../_storage";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      participantId,
      demographics,
      manipulationCheck,
      attentionPassed,
    } = body;

    if (!participantId) {
      return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
    }

    const completedAt = new Date().toISOString();
    const completionCode = randomUUID().split("-")[0].toUpperCase();

    // Save demographic + study-end data
    await appendRecord("completions.jsonl", {
      participantId,
      demographics: demographics ?? {},
      manipulationCheck: manipulationCheck ?? null,
      attentionPassed: Boolean(attentionPassed),
      completedAt,
      completionCode,
    });

    // Mark participant as completed
    await updateLastRecord(
      "participants.jsonl",
      (r) => r["participantId"] === participantId,
      (r) => ({ ...r, completedAt })
    );

    return NextResponse.json({ success: true, completionCode });
  } catch (err) {
    console.error("[experiment/complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
