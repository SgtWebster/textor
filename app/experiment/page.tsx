"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "./ExperimentContext"; // Korrigierter Import!

export default function ExperimentIntroPage() {
    const [hasConsented, setHasConsented] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    // Wir holen uns die benötigten States und Setter aus dem Context
    const { designType, setParticipantId, setConditionSequence, setProgress } = useExperiment();

    // Verhindert Hydration-Mismatches in Next.js
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleStartExperiment = () => {
        if (!hasConsented) return;

        // 1. Generiere eine eindeutige ID für diesen Durchlauf
        const newParticipantId = crypto.randomUUID();
        setParticipantId(newParticipantId);
        sessionStorage.setItem("experiment_participant_id", newParticipantId);

        // 2. Errechne die Sequenz basierend auf dem globalen Design (between/within)
        let sequence: ("avatar" | "text")[] = [];
        const startsWithAvatar = Math.random() > 0.5; // 50/50 Chance für die erste Bedingung

        if (designType === "between") {
            // Between-Subjects: 3x exakt dieselbe Bedingung
            const assignedCondition = startsWithAvatar ? "avatar" : "text";
            sequence = [assignedCondition, assignedCondition, assignedCondition];
        } else {
            // Within-Subjects: Darstellung wechselt ab
            if (startsWithAvatar) {
                sequence = ["avatar", "text", "avatar"];
            } else {
                sequence = ["text", "avatar", "text"];
            }
        }

        // 3. Sequenz im globalen State speichern
        setConditionSequence(sequence);

        // 4. Fortschritt initialisieren (Wir starten bei Szenario 1 von 4 Schritten)
        setProgress(1, 4);

        // 5. Los geht's: Navigation zum ersten Szenario
        router.push("/experiment/code-black");
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6">
            <div className="w-full max-w-3xl border border-slate-700 bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-xl">

                {/* Header Bereich */}
                <div className="mb-8 border-b border-slate-700 pb-6">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl mb-3">
                        Willkommen zum <span className="text-teal-300">Entscheidungsexperiment</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Vielen Dank für Ihr Interesse an der Teilnahme. Diese Studie findet im Rahmen einer Bachelorarbeit im Studiengang "Digital Business & Software Engineering" am MCI Innsbruck statt.
                    </p>
                </div>

                {/* Info & Ablauf */}
                <div className="space-y-6 text-slate-300 mb-10">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">Worum geht es?</h2>
                        <p className="leading-relaxed">
                            In diesem Experiment übernehmen Sie die Rolle einer Sicherheitsfachkraft in einer komplexen Industrieanlage. Sie werden mit simulierten Routineaufgaben und kritischen Entscheidungssituationen konfrontiert. Dabei steht Ihnen ein KI-Assistenzsystem zur Seite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">Ablauf & Dauer</h2>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                            <li>Bearbeitung von interaktiven Szenarien (inkl. Zeitmessung)</li>
                            <li>Ausfüllen eines kurzen Fragebogens im Anschluss</li>
                            <li>Gesamtdauer: ca. 5-8 Minuten</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">Datenschutz & Freiwilligkeit</h2>
                        <p className="leading-relaxed">
                            Ihre Teilnahme ist komplett freiwillig und kann jederzeit ohne Angabe von Gründen abgebrochen werden.
                            <strong> Sämtliche erhobenen Daten (Entscheidungen, Reaktionszeiten, Fragebogendaten) werden vollständig anonymisiert gespeichert</strong> und lassen keinerlei Rückschlüsse auf Ihre Person zu.
                            Am Ende des Experiments haben Sie die Möglichkeit, <em>freiwillig</em> an einem Gewinnspiel teilzunehmen. Diese Kontaktdaten werden strikt von den wissenschaftlichen Daten getrennt gespeichert.
                        </p>
                    </section>
                </div>

                {/* Einverständniserklärung (Consent) */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-600 mb-8">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="flex-shrink-0 mt-1">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-500 bg-slate-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800 transition-colors cursor-pointer"
                                checked={hasConsented}
                                onChange={(e) => setHasConsented(e.target.checked)}
                            />
                        </div>
                        <div className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                            <strong>Einverständniserklärung:</strong> Ich bin über 18 Jahre alt. Ich habe die obigen Informationen gelesen und verstanden. Ich erkläre mich freiwillig bereit, an dieser Studie teilzunehmen und stimme der anonymen Verarbeitung meiner Daten für wissenschaftliche Zwecke zu.
                        </div>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        Zurück
                    </button>
                    <button
                        onClick={handleStartExperiment}
                        disabled={!hasConsented}
                        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            hasConsented
                                ? "bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        Experiment starten
                    </button>
                </div>

            </div>
        </div>
    );
}