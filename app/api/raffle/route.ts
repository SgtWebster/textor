// app/api/raffle/route.ts
// Raffle entry storage – strictly separated from study behavioural data.
// Only stores a raffle-specific UUID, never linked to participantId.
import { NextRequest, NextResponse } from "next/server";
import { appendRecord } from "../experiment/_storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, email } = body;

    if (!email || !firstName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Basic structural email validation (avoids ReDoS-prone nested quantifiers)
    const atIdx = email.indexOf("@");
    if (atIdx < 1 || atIdx === email.length - 1) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const domain = email.slice(atIdx + 1);
    const dotIdx = domain.lastIndexOf(".");
    if (dotIdx < 1 || dotIdx === domain.length - 1) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Deliberately NOT storing participantId – privacy separation
    await appendRecord("raffle.jsonl", {
      raffleId: crypto.randomUUID(),
      firstName: String(firstName).slice(0, 100),
      email: String(email).slice(0, 200),
      enteredAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[raffle]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
