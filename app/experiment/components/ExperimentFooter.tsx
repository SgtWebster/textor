"use client";

import { useExperiment } from "../ExperimentContext";

export default function ExperimentFooter() {
    const { currentStep, totalSteps, abortExperiment } = useExperiment();

    // Fortschritt in Prozent berechnen
    const progressPercentage = Math.round((currentStep / totalSteps) * 100);

    return (
        <footer className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 z-50">
            {/* Dünner Fortschrittsbalken ganz oben am Footer */}
            <div className="w-full h-1.5 bg-slate-800">
                <div
                    className="h-full bg-teal-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
                <div className="text-slate-400 font-medium">
                    Fortschritt: <span className="text-slate-200">{currentStep}</span> von {totalSteps}
                </div>

                <button
                    onClick={abortExperiment}
                    className="text-slate-500 hover:text-red-400 transition-colors focus:outline-none"
                    aria-label="Experiment abbrechen"
                >
                    Experiment abbrechen
                </button>
            </div>
        </footer>
    );
}