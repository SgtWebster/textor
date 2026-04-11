// app/experiment/components/TrialCard.tsx
"use client";

import { useState } from "react";
import type { Decision, Condition } from "../types";

interface TrialCardProps {
  topic: string;
  situation: string;
  aiResponse: string;
  condition: Condition;
  isAttentionCheck?: boolean;
  onDecision: (decision: Decision, confidence: number) => void;
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Sehr unsicher",
  2: "Eher unsicher",
  3: "Neutral",
  4: "Eher sicher",
  5: "Sehr sicher",
};

export default function TrialCard({
  topic,
  situation,
  aiResponse,
  condition,
  isAttentionCheck,
  onDecision,
}: TrialCardProps) {
  const [selected, setSelected] = useState<Decision | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [submitted, setSubmitted] = useState(false);

  const aiLabel =
    condition === "humanized" ? "Mia (KI-Assistentin)" : "KI-System v2.3";

  function handleSubmit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onDecision(selected, confidence);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Topic badge */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 flex items-center gap-2">
        {isAttentionCheck ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            ⚠ Aufmerksamkeitscheck
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
            {topic}
          </span>
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Situation */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Situation
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{situation}</p>
        </div>

        {/* AI response */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Antwort von{" "}
            <span
              className={
                condition === "humanized"
                  ? "text-teal-600"
                  : "text-slate-700 font-mono"
              }
            >
              {aiLabel}
            </span>
          </p>
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">
            {aiResponse}
          </p>
        </div>

        {/* Decision */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Würdest du dieser Empfehlung folgen?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => !submitted && setSelected("agree")}
              disabled={submitted}
              className={[
                "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition",
                "focus:outline-none focus:ring-2 focus:ring-teal-300",
                selected === "agree"
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50",
                submitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              ✓ Würde ich folgen
            </button>
            <button
              onClick={() => !submitted && setSelected("disagree")}
              disabled={submitted}
              className={[
                "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition",
                "focus:outline-none focus:ring-2 focus:ring-slate-300",
                selected === "disagree"
                  ? "border-slate-700 bg-slate-100 text-slate-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                submitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              ✕ Würde ich nicht folgen
            </button>
          </div>
        </div>

        {/* Confidence */}
        {selected && !submitted && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Wie sicher bist du?{" "}
              <span className="normal-case font-normal text-slate-500">
                — {CONFIDENCE_LABELS[confidence]}
              </span>
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Sehr unsicher</span>
              <span>Sehr sicher</span>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Weiter →
            </button>
          </div>
        )}

        {submitted && (
          <div className="text-center text-sm text-slate-500 py-2">
            Antwort gespeichert …
          </div>
        )}
      </div>
    </div>
  );
}
