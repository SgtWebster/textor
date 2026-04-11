// app/experiment/run/page.tsx – Trial flow
"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "../components/ProgressBar";
import TrialCard from "../components/TrialCard";
import { scenarios } from "../scenarios";
import type { ExperimentSession, TrialResponse, Decision } from "../types";

export default function ExperimentRunPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExperimentSession | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Timestamp for reaction-time measurement – reset per trial
  const t0Ref = useRef<number>(0);

  // Load session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("experiment_session");
    if (!raw) {
      router.replace("/experiment");
      return;
    }
    const s: ExperimentSession = JSON.parse(raw);
    if (s.currentIndex >= s.orderedScenarioIds.length) {
      router.replace("/experiment/complete");
      return;
    }
    startTransition(() => setSession(s));
  }, [router]);

  // Reset timer whenever the current trial changes
  useEffect(() => {
    t0Ref.current = performance.now();
  }, [session?.currentIndex]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-500 text-sm animate-pulse">Lade …</p>
      </div>
    );
  }

  const total = session.orderedScenarioIds.length;
  const current = session.currentIndex; // 0-based
  const scenarioId = session.orderedScenarioIds[current];
  const scenario = scenarios.find((s) => s.id === scenarioId);

  if (!scenario) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-red-600 text-sm">Szenario nicht gefunden: {scenarioId}</p>
      </div>
    );
  }

  async function handleDecision(decision: Decision, confidence: number) {
    if (!session || transitioning) return;

    const rt_ms = Math.round(performance.now() - t0Ref.current);
    const trialResponse: TrialResponse = {
      scenarioId,
      trialIndex: current,
      decision,
      confidence,
      rt_ms,
    };

    // Save trial via API (fire and don't block UI)
    fetch("/api/experiment/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: session.participantId,
        ...trialResponse,
      }),
    }).catch((e) => console.error("Trial save error:", e));

    // Update local session
    const updatedResponses = [...session.responses, trialResponse];
    const nextIndex = current + 1;
    const updatedSession: ExperimentSession = {
      ...session,
      currentIndex: nextIndex,
      responses: updatedResponses,
    };
    localStorage.setItem("experiment_session", JSON.stringify(updatedSession));

    setTransitioning(true);

    if (nextIndex >= total) {
      // All trials done
      setTimeout(() => router.push("/experiment/complete"), 600);
    } else {
      setTimeout(() => {
        setSession(updatedSession);
        setTransitioning(false);
      }, 500);
    }
  }

  const aiResponse = scenario.response[session.condition];

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Mission bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Deine Mission
          </p>
          <p className="text-sm text-slate-700 font-medium">
            Würdest du der KI-Empfehlung folgen?
          </p>
        </div>
        <div className="text-right text-xs text-slate-400 shrink-0">
          Szenario {current + 1}/{total}
        </div>
      </div>

      <ProgressBar current={current + 1} total={total} />

      {/* Trial card with fade transition */}
      <div
        className={[
          "transition-opacity duration-300",
          transitioning ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <TrialCard
          key={scenarioId}
          topic={scenario.topic}
          situation={scenario.situation}
          aiResponse={aiResponse}
          condition={session.condition}
          isAttentionCheck={Boolean(scenario.attentionCheck)}
          onDecision={handleDecision}
        />
      </div>

      {/* Subtle abort link */}
      <div className="text-center">
        <button
          onClick={() => {
            localStorage.removeItem("experiment_session");
            router.push("/experiment");
          }}
          className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
        >
          Studie abbrechen
        </button>
      </div>
    </div>
  );
}
