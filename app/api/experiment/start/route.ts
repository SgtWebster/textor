// app/api/experiment/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendRecord } from "../_storage";
import { scenarios } from "@/app/experiment/scenarios";
import type { Condition } from "@/app/experiment/types";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.consent) {
      return NextResponse.json(
        { error: "Consent required" },
        { status: 400 }
      );
    }

    // Between-subjects randomization
    const condition: Condition =
      Math.random() < 0.5 ? "humanized" : "technical";

    // Separate attention check from regular scenarios
    const regularScenarios = scenarios.filter((s) => !s.attentionCheck);
    const attentionScenario = scenarios.find((s) => s.attentionCheck);

    // Shuffle regular scenarios and insert attention check roughly in the middle
    const shuffled = shuffleArray(regularScenarios);
    const insertAt = Math.floor(shuffled.length / 2);
    if (attentionScenario) {
      shuffled.splice(insertAt, 0, attentionScenario);
    }

    const orderedScenarioIds = shuffled.map((s) => s.id);
    const participantId = randomUUID();
    const createdAt = new Date().toISOString();

    await appendRecord("participants.jsonl", {
      participantId,
      condition,
      createdAt,
      consent: true,
      completedAt: null,
    });

    return NextResponse.json({
      participantId,
      condition,
      orderedScenarioIds,
    });
  } catch (err) {
    console.error("[experiment/start]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
