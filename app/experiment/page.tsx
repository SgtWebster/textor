// app/experiment/page.tsx – Welcome + Informed Consent
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExperimentSession } from "./types";

export default function ExperimentLandingPage() {
  const router = useRouter();
  const [consentStudy, setConsentStudy] = useState(false);
  const [consentAge, setConsentAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!consentStudy || !consentAge) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/experiment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      });
      if (!res.ok) throw new Error("Fehler beim Starten der Studie.");
      const data = await res.json();

      const session: ExperimentSession = {
        participantId: data.participantId,
        condition: data.condition,
        orderedScenarioIds: data.orderedScenarioIds,
        currentIndex: 0,
        responses: [],
      };
      localStorage.setItem("experiment_session", JSON.stringify(session));
      router.push("/experiment/run");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          Bachelorarbeit – MCI Innsbruck
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Studie: KI-Vertrauen im Alltag
        </h1>
        <p className="mt-3 text-slate-600 text-base leading-relaxed">
          Wie beeinflussen KI-Empfehlungen unsere Entscheidungen?
        </p>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">

        {/* What to expect */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Was dich erwartet</h2>
          <ol className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">1</span>
              <span>Du liest <strong>8 kurze Szenarien</strong>, in denen eine KI eine Empfehlung gibt.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">2</span>
              <span>Du entscheidest jeweils, ob du der KI-Empfehlung folgen würdest, und gibst deine Sicherheit an.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">3</span>
              <span>Am Ende beantwortest du eine kurze Umfrage und kannst optional an einem <strong>Gewinnspiel</strong> teilnehmen.</span>
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>⏱ ca. 8–10 Minuten</span>
            <span>🔒 Anonym & freiwillig</span>
            <span>↩ Jederzeit abbrechbar</span>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="px-6 py-5 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Datenschutz</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Es werden ausschließlich anonymisierte Verhaltensdaten (Entscheidungen, Reaktionszeiten) gespeichert. Es werden keine persönlichen Identifikationsdaten erhoben. Eine freiwillige Teilnahme am Gewinnspiel erfolgt mit separaten Kontaktdaten, die strikt von den Studiendaten getrennt gespeichert werden und nicht mit deinen Antworten verknüpft werden.
          </p>
        </div>

        {/* Consent checkboxes */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Einwilligung</h2>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentStudy}
              onChange={(e) => setConsentStudy(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-teal-600"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              Ich habe die Informationen zur Studie gelesen und erkläre mich mit der Teilnahme und der anonymen Verarbeitung meiner Daten einverstanden.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentAge}
              onChange={(e) => setConsentAge(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-teal-600"
            />
            <span className="text-sm text-slate-700">
              Ich bin mindestens <strong>18 Jahre alt</strong>.
            </span>
          </label>
        </div>

        {/* CTA */}
        <div className="px-6 py-5">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleStart}
            disabled={!consentStudy || !consentAge || loading}
            className={[
              "w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition",
              "focus:outline-none focus:ring-2 focus:ring-teal-300",
              consentStudy && consentAge && !loading
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Starte Studie …" : "Studie starten →"}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Bitte beide Checkboxen ankreuzen, um fortzufahren.
          </p>
        </div>
      </div>
    </div>
  );
}
