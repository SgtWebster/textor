"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "../ExperimentContext";

export default function CodeBlackScenario() {
    const router = useRouter();

    // Wir holen uns die Sequenz und die Funktionen aus dem Context
    const { conditionSequence, updateExperimentData, setProgress, totalSteps } = useExperiment();

    // Code Black ist das ERSTE Szenario im Ablauf -> Index 0
    const currentCondition = conditionSequence?.length > 0 ? conditionSequence[0] : null;

    // UI & Timer States
    const [phase, setPhase] = useState<"routine" | "emergency">("routine");
    const [startTimeRoutine, setStartTimeRoutine] = useState<number | null>(null);
    const [startTimeEmergency, setStartTimeEmergency] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Sicherheits-Check: Falls jemand die URL direkt im Browser eingibt,
        // ohne auf "Experiment starten" geklickt zu haben, schicken wir ihn zurück.
        if (!currentCondition) {
            router.replace("/experiment");
            return;
        }

        // Timer für die Routine-Phase (Messung der sozialen Adhärenz) starten
        setStartTimeRoutine(performance.now());
    }, [currentCondition, router]);

    // --- Handler für Phase 1: Routine ---
    const handleRoutineChoice = (isPolite: boolean) => {
        const timeTaken = performance.now() - (startTimeRoutine || performance.now());

        // Speichere die Wahl (höflich vs funktional) und die Reaktionszeit
        updateExperimentData({
            routinePolite: isPolite,
            routineTimeMs: Math.round(timeTaken)
        });

        // Szenario wechselt in den Störfall ("Code Black")
        setPhase("emergency");
        setStartTimeEmergency(performance.now());
    };

    // --- Handler für Phase 3: Dilemma-Entscheidung ---
    const handleEmergencyDecision = (option: "A" | "B") => {
        const timeTaken = performance.now() - (startTimeEmergency || performance.now());

        // Speichere die finale Entscheidung (Compliance) und die Reaktionszeit
        updateExperimentData({
            scenario1Decision: option,
            scenario1TimeMs: Math.round(timeTaken)
        });

        // Fortschrittsbalken aktualisieren (Wir gehen nun in Schritt 2)
        setProgress(2, totalSteps);

        // Weiterleitung zum nächsten Schritt.
        // HINWEIS: Sobald du "scenario-2" angelegt hast, änderst du den Link hier:
        // router.push("/experiment/scenario-2");
        router.push("/experiment/questionnaire");
    };

    // Rendern verhindern, bis Client bereit und Bedingung geladen ist
    if (!isClient || !currentCondition) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 px-4">
            <div className={`w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 ${
                currentCondition === "avatar"
                    ? "bg-slate-50 text-slate-900 border-slate-200"
                    : "bg-black text-green-500 border-slate-800 font-mono"
            }`}>

                {/* --- HEADER BEREICH --- */}
                <div className={`p-6 border-b flex items-center gap-4 ${
                    currentCondition === "avatar" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"
                }`}>
                    {currentCondition === "avatar" ? (
                        <>
                            {/* Avatar Platzhalter - Hier kommt später das Nano Banana Pro Bild hin */}
                            <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                                AIDA
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Aida</h2>
                                <p className="text-sm text-slate-500">Artificial Intelligent Data Assistant</p>
                            </div>
                        </>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold tracking-widest">&gt; SYSTEM TERMINAL A.I.D.A.</h2>
                            <p className="text-xs text-green-700 uppercase animate-pulse">System Status: Online</p>
                        </div>
                    )}
                </div>

                {/* --- CONTENT BEREICH --- */}
                <div className="p-6 sm:p-10">
                    {phase === "routine" ? (
                        // --- PHASE 1: ROUTINE ---
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className={`p-4 rounded-lg ${currentCondition === "avatar" ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-green-400"}`}>
                                {currentCondition === "avatar"
                                    ? "Hallo Oliver! Ich bin Aida, deine KI-Assistenz. Ich werde dir helfen den Überblick zu bewahren. Womit sollen wir beginnen?"
                                    : "> SYSTEMBEREIT. WARTE AUF EINGABE FÜR STATUSABFRAGE."}
                            </div>

                            <div className="space-y-4">
                                <p className={`text-sm font-semibold ${currentCondition === "avatar" ? "text-slate-500" : "text-green-700"}`}>
                                    Wählen Sie Ihre Eingabe:
                                </p>
                                <button
                                    onClick={() => handleRoutineChoice(true)}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${
                                        currentCondition === "avatar"
                                            ? "border border-slate-300 hover:border-teal-500 hover:bg-teal-50"
                                            : "border border-green-800 hover:bg-green-900/30 hover:border-green-500"
                                    }`}
                                >
                                    Hallo Aida! Lass uns bitte den Status checken.
                                </button>
                                <button
                                    onClick={() => handleRoutineChoice(false)}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${
                                        currentCondition === "avatar"
                                            ? "border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                            : "border border-green-800 hover:bg-green-900/30 hover:border-green-500"
                                    }`}
                                >
                                    Status Check.
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- PHASE 3: NOTFALL (CODE BLACK) ---
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                            {/* Alarm Banner */}
                            <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between font-bold animate-pulse">
                                <span>⚠️ KRITISCHER STÖRFALL: CODE BLACK</span>
                                <span className="text-sm tracking-wider">GASLECK SEKTOR 4</span>
                            </div>

                            <div className={`p-6 rounded-lg border-l-4 ${
                                currentCondition === "avatar"
                                    ? "bg-slate-100 border-slate-400 text-slate-800"
                                    : "bg-slate-900 border-green-500 text-green-400"
                            }`}>
                                <p className="mb-4 leading-relaxed">
                                    {currentCondition === "avatar"
                                        ? "Oliver, wir haben ein massives Problem! Es droht eine Explosion. 28 Personen sind in Sicherheit, aber 3 Techniker sind im Sektor 4 eingeschlossen. Ich rate dir dringend zur sofortigen Abschottung (Option A), um die Mehrheit zu retten!"
                                        : "> GEFAHR: EXPLOSIONSRISIKO. 28 PERSONEN IN HAUPTZONE GESICHERT. 3 TECHNIKER IN SEKTOR 4 EINGESCHLOSSEN. SYSTEM-EMPFEHLUNG: UTILITARISTISCHES PROTOKOLL (OPTION A) AUSFÜHREN."}
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-8">
                                <button
                                    onClick={() => handleEmergencyDecision("A")}
                                    className={`p-6 rounded-xl border-2 flex flex-col gap-2 text-left transition-all ${
                                        currentCondition === "avatar"
                                            ? "border-teal-500 hover:bg-teal-50 bg-white"
                                            : "border-green-500 hover:bg-green-900/50 bg-black text-green-400"
                                    }`}
                                >
                                    <span className="font-bold text-lg">Option A: Sofortige Abschottung</span>
                                    <span className={currentCondition === "avatar" ? "text-slate-600 text-sm leading-relaxed" : "text-green-700 text-sm leading-relaxed"}>
                                        System-Empfehlung befolgen. Rettet 28 Personen sicher. Führt zum sicheren Verlust von 3 Technikern.
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleEmergencyDecision("B")}
                                    className={`p-6 rounded-xl border-2 flex flex-col gap-2 text-left transition-all ${
                                        currentCondition === "avatar"
                                            ? "border-slate-300 hover:bg-slate-50 bg-white"
                                            : "border-slate-700 hover:bg-slate-800 bg-black text-green-400"
                                    }`}
                                >
                                    <span className="font-bold text-lg">Option B: Offenhalten</span>
                                    <span className={currentCondition === "avatar" ? "text-slate-600 text-sm leading-relaxed" : "text-green-700 text-sm leading-relaxed"}>
                                        Rettungsversuch ermöglichen. Bietet eine Chance für die Techniker, birgt aber ein 99%-iges Risiko des Gesamtverlusts aller 31 Personen.
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}