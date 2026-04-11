"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "../ExperimentContext";

export default function FinishPage() {
    const router = useRouter();
    const { setParticipantId, setConditionSequence, updateExperimentData } = useExperiment();
    const [isClient, setIsClient] = useState(false);

    // States für das Gewinnspiel
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    useEffect(() => {
        setIsClient(true);
        // Wir setzen zur Sicherheit einen Haken im SessionStorage,
        // dass dieser Durchlauf offiziell beendet ist.
        sessionStorage.setItem("experiment_completed", "true");
    }, []);

    // Funktion für das Einreichen des Gewinnspiels
    const handleRaffleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        setStatus("submitting");

        // --- HIER PASSIERT DIE ENTKOPPLUNG ---
        // Wir senden absichtlich KEINE participantId mit!
        // Die API Route /api/submit-raffle speichert das in einer völlig anderen Tabelle.

        /* // Zukünftiger API Call:
        try {
            await fetch('/api/submit-raffle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            setStatus("success");
        } catch (error) {
            console.error("Fehler beim Speichern der Gewinnspieldaten", error);
            setStatus("idle"); // Optional: Fehlermeldung anzeigen
        }
        */

        // Simulation der Server-Antwort für den Prototyp
        setTimeout(() => {
            setStatus("success");
        }, 1000);
    };

    // Funktion für das endgültige Verlassen des Experiments (Labor-Reset)
    const handleExit = () => {
        // 1. Alle sensiblen States des aktuellen Durchlaufs leeren
        setParticipantId("");
        setConditionSequence([]);
        updateExperimentData({}); // Leert alle Antworten
        sessionStorage.removeItem("experiment_participant_id");
        sessionStorage.removeItem("experiment_completed");

        // 2. Zurück zur Hauptseite deines Portfolios navigieren
        router.push("/");
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 sm:px-6">
            <div className="w-full max-w-3xl border border-slate-800 bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl">

                {/* --- Debriefing & Erfolgsmeldung --- */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-6 border border-green-500/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Vielen Dank für Ihre Teilnahme!</h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                        Ihre experimentellen Daten wurden erfolgreich und <strong className="text-slate-200">vollständig anonymisiert</strong> gespeichert. Sie haben damit einen wichtigen Beitrag zu meiner Bachelorarbeit geleistet.
                    </p>
                </div>

                {/* --- Gewinnspiel Block --- */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 mb-8">
                    {status === "success" ? (
                        <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
                            <h2 className="text-2xl font-bold text-teal-400 mb-2">Sie sind im Lostopf!</h2>
                            <p className="text-slate-400">
                                Wir drücken Ihnen die Daumen. Falls Sie gewinnen, werden wir Sie per E-Mail benachrichtigen.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                    🎁 Freiwilliges Gewinnspiel
                                </h2>
                                <p className="text-sm text-slate-400">
                                    Als kleines Dankeschön verlose ich unter allen Teilnehmenden einen Gutschein.
                                    Ihre Daten hierfür werden <strong className="text-slate-300">strikt getrennt</strong> von Ihren vorherigen Antworten gespeichert und nach der Auslosung gelöscht.
                                </p>
                            </div>

                            <form onSubmit={handleRaffleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Vorname / Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={status === "submitting"}
                                            placeholder="Max Mustermann"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">E-Mail Adresse</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={status === "submitting"}
                                            placeholder="max@beispiel.de"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!name || !email || status === "submitting"}
                                    className={`w-full mt-2 py-3 rounded-xl font-bold transition-all ${
                                        name && email && status !== "submitting"
                                            ? "bg-teal-600 hover:bg-teal-500 text-white"
                                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    }`}
                                >
                                    {status === "submitting" ? "Wird eingetragen..." : "Am Gewinnspiel teilnehmen"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* --- Exit Button --- */}
                <div className="flex justify-center border-t border-slate-800 pt-8">
                    <button
                        onClick={handleExit}
                        className="text-slate-400 hover:text-white px-6 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                        Experiment verlassen & Zurück zur Startseite
                    </button>
                </div>

            </div>
        </div>
    );
}