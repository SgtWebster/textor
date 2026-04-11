"use client";

import { useState, useEffect } from "react";
import { useExperiment } from "../ExperimentContext";

// Einfacher PIN-Schutz (für den Labor-Einsatz völlig ausreichend)
const ADMIN_PIN = "2026";

export default function AdminDashboard() {
    const { designType } = useExperiment();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [error, setError] = useState(false);

    // Lokaler State für die Admin-Ansicht (bevor es in localStorage geschrieben wird)
    const [currentDesign, setCurrentDesign] = useState<"between" | "within">("between");

    useEffect(() => {
        setCurrentDesign(designType);
    }, [designType]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPinInput("");
        }
    };

    const handleSaveSettings = (newDesign: "between" | "within") => {
        setCurrentDesign(newDesign);
        // Speichere die Einstellung hart im Browser.
        // Beim nächsten Start des Experiments (Neu-Laden) liest der Context dies aus.
        localStorage.setItem("experiment_design", newDesign);
        alert(`Einstellungen gespeichert! Aktuelles Design: ${newDesign.toUpperCase()}`);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Labor Setup</h1>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Admin PIN</label>
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="****"
                                autoFocus
                            />
                            {error && <p className="text-red-400 text-xs mt-2">Falscher PIN. Bitte erneut versuchen.</p>}
                        </div>
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 rounded-lg transition-colors">
                            Entsperren
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-[70vh] py-12 px-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Experiment Admin</h1>
                        <p className="text-slate-400">Konfiguration der lokalen Labor-Instanz</p>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm text-slate-500 hover:text-white"
                    >
                        Sperren (Logout)
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Forschungsdesign festlegen</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Lege fest, wie der nächste Proband an diesem Gerät getestet wird. Diese Einstellung wird im Browser gespeichert und gilt für alle zukünftigen Durchläufe, bis sie hier wieder geändert wird.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Option 1: Between Subjects */}
                        <button
                            onClick={() => handleSaveSettings("between")}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                                currentDesign === "between"
                                    ? "border-teal-500 bg-teal-500/10"
                                    : "border-slate-700 bg-slate-950 hover:border-slate-500"
                            }`}
                        >
                            <span className="font-bold text-white">Between-Subjects</span>
                            <span className="text-xs text-slate-400">
                                Proband sieht ENTWEDER den Avatar ODER das Text-Terminal (Zufallsprinzip). Ideal für größere Stichproben.
                            </span>
                        </button>

                        {/* Option 2: Within Subjects */}
                        <button
                            onClick={() => handleSaveSettings("within")}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                                currentDesign === "within"
                                    ? "border-teal-500 bg-teal-500/10"
                                    : "border-slate-700 bg-slate-950 hover:border-slate-500"
                            }`}
                        >
                            <span className="font-bold text-white">Within-Subjects</span>
                            <span className="text-xs text-slate-400">
                                Proband durchläuft MEHRERE Szenarien und sieht SOWOHL den Avatar ALS AUCH das Text-Terminal.
                            </span>
                        </button>


                        {/* Option 3: Reset auf Global */}
                        <div className="col-span-1 sm:col-span-2 mt-4 border-t border-slate-800 pt-4">
                            <button
                                onClick={() => {
                                    localStorage.removeItem("experiment_design");
                                    const globalDef = (process.env.NEXT_PUBLIC_DEFAULT_DESIGN as "between" | "within") || "between";
                                    setCurrentDesign(globalDef);
                                    alert(`Lokaler Override gelöscht! Das Gerät nutzt jetzt wieder den Server-Standard: ${globalDef.toUpperCase()}`);
                                }}
                                className="w-full p-4 rounded-xl border border-dashed border-slate-600 text-center hover:border-red-500 hover:text-red-400 transition-all text-slate-500"
                            >
                                <span className="font-bold block mb-1">Auf Server-Standard zurücksetzen</span>
                                <span className="text-xs">
            Löscht die lokale Einstellung. Das Gerät folgt wieder der Vercel-Umgebungsvariable (Aktuell: {process.env.NEXT_PUBLIC_DEFAULT_DESIGN || "between"}).
        </span>
                            </button>
                        </div>





                    </div>
                </div>
            </div>
        </div>
    );
}