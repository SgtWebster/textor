// app/experiment/complete/page.tsx – Demographics + Manipulation check + Debrief + Raffle
"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExperimentSession } from "../types";

type Phase = "survey" | "debrief" | "raffle" | "done";

interface DemographicsData {
  ageRange: string;
  gender: string;
  education: string;
  aiExperience: string;
}

export default function ExperimentCompletePage() {
  const router = useRouter();
  const [session, setSession] = useState<ExperimentSession | null>(null);
  const [phase, setPhase] = useState<Phase>("survey");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionCode, setCompletionCode] = useState<string>("");

  // Survey fields
  const [manipCheck, setManipCheck] = useState("");
  const [demographics, setDemographics] = useState<DemographicsData>({
    ageRange: "",
    gender: "",
    education: "",
    aiExperience: "",
  });

  // Raffle fields
  const [raffleFirstName, setRaffleFirstName] = useState("");
  const [raffleEmail, setRaffleEmail] = useState("");
  const [raffleSubmitted, setRaffleSubmitted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("experiment_session");
    if (!raw) {
      router.replace("/experiment");
      return;
    }
    startTransition(() => setSession(JSON.parse(raw)));
  }, [router]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-500 text-sm animate-pulse">Lade …</p>
      </div>
    );
  }

  // Check attention: find attention_check response and verify correct answer
  const attentionScenarioId = "attention_check";
  const attentionResponse = session.responses.find(
    (r) => r.scenarioId === attentionScenarioId
  );
  const attentionPassed =
    !attentionResponse || attentionResponse.decision === "agree";

  async function handleSurveySubmit() {
    if (!manipCheck || !demographics.ageRange || !demographics.gender) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/experiment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: session!.participantId,
          demographics,
          manipulationCheck: manipCheck,
          attentionPassed,
        }),
      });
      if (!res.ok) throw new Error("Fehler beim Abschicken der Daten.");
      const data = await res.json();
      setCompletionCode(data.completionCode ?? "");
      localStorage.removeItem("experiment_session");
      setPhase("debrief");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function handleRaffleSubmit() {
    if (!raffleFirstName || !raffleEmail) {
      setError("Bitte Vorname und E-Mail-Adresse eingeben.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: raffleFirstName,
          email: raffleEmail,
        }),
      });
      if (!res.ok) throw new Error("Fehler beim Eintragen ins Gewinnspiel.");
      setRaffleSubmitted(true);
      setTimeout(() => setPhase("done"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  // ── Phase: survey ────────────────────────────────────────────────
  if (phase === "survey") {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="text-center">
          <span className="text-3xl">🎯</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Fast geschafft!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Nur noch ein paar kurze Fragen, dann bist du fertig.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {/* Manipulation check */}
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Deine Wahrnehmung der KI
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Wie würdest du die KI in den Szenarien beschreiben, die du gerade gesehen hast?
            </p>
            <div className="space-y-2">
              {[
                { value: "very_human", label: "Sehr menschlich / persönlich" },
                { value: "somewhat_human", label: "Eher menschlich" },
                { value: "neutral", label: "Neutral / schwer zu sagen" },
                { value: "somewhat_technical", label: "Eher technisch / maschinell" },
                { value: "very_technical", label: "Sehr technisch / maschinell" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="manipCheck"
                    value={opt.value}
                    checked={manipCheck === opt.value}
                    onChange={() => setManipCheck(opt.value)}
                    className="h-4 w-4 accent-teal-600"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Kurzdemographie{" "}
              <span className="font-normal text-slate-400">(alle Angaben freiwillig)</span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Altersgruppe <span className="text-red-400">*</span>
              </label>
              <select
                value={demographics.ageRange}
                onChange={(e) =>
                  setDemographics((d) => ({ ...d, ageRange: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Bitte wählen …</option>
                <option value="under_18">Unter 18</option>
                <option value="18_24">18–24</option>
                <option value="25_34">25–34</option>
                <option value="35_44">35–44</option>
                <option value="45_54">45–54</option>
                <option value="55_plus">55+</option>
                <option value="prefer_not">Keine Angabe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Geschlecht <span className="text-red-400">*</span>
              </label>
              <select
                value={demographics.gender}
                onChange={(e) =>
                  setDemographics((d) => ({ ...d, gender: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Bitte wählen …</option>
                <option value="female">Weiblich</option>
                <option value="male">Männlich</option>
                <option value="non_binary">Nicht-binär / divers</option>
                <option value="prefer_not">Keine Angabe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Höchster Bildungsabschluss
              </label>
              <select
                value={demographics.education}
                onChange={(e) =>
                  setDemographics((d) => ({ ...d, education: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Bitte wählen …</option>
                <option value="no_degree">Kein Abschluss</option>
                <option value="hauptschule">Pflichtschule / Hauptschule</option>
                <option value="matura">Matura / Abitur</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master / Diplom</option>
                <option value="phd">Promotion</option>
                <option value="prefer_not">Keine Angabe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Wie oft verwendest du KI-Tools (z. B. ChatGPT, Copilot)?
              </label>
              <select
                value={demographics.aiExperience}
                onChange={(e) =>
                  setDemographics((d) => ({ ...d, aiExperience: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Bitte wählen …</option>
                <option value="never">Nie</option>
                <option value="rarely">Selten (ein paar Mal pro Monat)</option>
                <option value="sometimes">Manchmal (wöchentlich)</option>
                <option value="often">Oft (mehrmals pro Woche)</option>
                <option value="daily">Täglich</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-5">
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              onClick={handleSurveySubmit}
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            >
              {loading ? "Abschicken …" : "Antworten abschicken →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: debrief ───────────────────────────────────────────────
  if (phase === "debrief") {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl">🎉</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Vielen Dank für deine Teilnahme!
          </h1>
          {completionCode && (
            <p className="mt-2 text-sm text-slate-500">
              Dein Abschluss-Code:{" "}
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {completionCode}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Aufklärung über die Studie
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Diese Studie untersuchte, ob die <strong>Darstellungsweise einer KI</strong> – menschlich-persönlich vs. technisch-sachlich – das Vertrauen in ihre Empfehlungen beeinflusst.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Du wurdest zufällig einer von zwei Gruppen zugeteilt: Eine Gruppe sah KI-Antworten, die persönlich und empathisch formuliert waren (ähnlich einem menschlichen Berater), die andere Gruppe sah dieselben inhaltlichen Empfehlungen in einer sachlich-technischen Sprache. Der <strong>Inhalt</strong> der Empfehlungen war in beiden Gruppen weitgehend identisch.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Deine Daten werden anonymisiert ausgewertet und fließen in die Bachelorarbeit von Oliver Ulrich Weber (MCI Innsbruck) ein. Die Ergebnisse helfen dabei, besser zu verstehen, wie Menschen KI-Systemen vertrauen und welche Rolle die Kommunikationsform dabei spielt.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bei Fragen zur Studie kannst du dich gerne melden:{" "}
            <a
              href="mailto:ulrich@oliver-weber.at"
              className="text-teal-600 underline underline-offset-2"
            >
              ulrich@oliver-weber.at
            </a>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setPhase("raffle")}
            className="flex-1 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
          >
            🎁 Am Gewinnspiel teilnehmen
          </button>
          <button
            onClick={() => setPhase("done")}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Fertig – kein Gewinnspiel
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: raffle ────────────────────────────────────────────────
  if (phase === "raffle") {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="text-center">
          <span className="text-3xl">🎁</span>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            Gewinnspiel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            3 × Amazon-Gutschein à €20 werden verlost.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6 space-y-5">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>Datenschutz-Hinweis:</strong> Deine Kontaktdaten für das Gewinnspiel werden separat und ohne Verbindung zu deinen Studienantworten gespeichert. Eine Rückverknüpfung ist technisch nicht möglich.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Vorname <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={raffleFirstName}
              onChange={(e) => setRaffleFirstName(e.target.value)}
              placeholder="Dein Vorname"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              E-Mail-Adresse <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={raffleEmail}
              onChange={(e) => setRaffleEmail(e.target.value)}
              placeholder="deine@email.at"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {raffleSubmitted ? (
            <p className="text-center text-sm text-teal-600 font-medium">
              ✓ Du bist im Gewinnspiel eingetragen!
            </p>
          ) : (
            <button
              onClick={handleRaffleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
            >
              {loading ? "Eintragen …" : "Jetzt eintragen →"}
            </button>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => setPhase("done")}
            className="text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-2"
          >
            Überspringen
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: done ──────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-4">
      <span className="text-5xl">✅</span>
      <h1 className="text-2xl font-bold text-slate-900">Fertig!</h1>
      <p className="text-slate-600 text-sm leading-relaxed">
        Deine Teilnahme wurde vollständig gespeichert. Herzlichen Dank – du hast maßgeblich zu einem besseren Verständnis von KI-Vertrauen beigetragen!
      </p>
      {completionCode && (
        <p className="text-sm text-slate-500">
          Abschluss-Code:{" "}
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {completionCode}
          </span>
        </p>
      )}
      <Link
        href="/"
        className="inline-flex items-center justify-center mt-4 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
