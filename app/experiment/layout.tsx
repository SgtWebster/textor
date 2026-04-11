// experiment\layout.tsx

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ExperimentProvider } from "./ExperimentContext";
import ExperimentFooter from "./components/ExperimentFooter";


// --- 1. Typisierung unseres Experiment-Zustands ---
type ExperimentData = {
    scenario1Time?: number;
    scenario1Decision?: string;
    // Platz für weitere Szenarien und MDMT Scores
};

type ExperimentState = {
    participantId: string | null;
    condition: "avatar" | "text" | null;
    experimentData: ExperimentData;
    setParticipantId: (id: string) => void;
    setCondition: (cond: "avatar" | "text") => void;
    updateExperimentData: (data: Partial<ExperimentData>) => void;
};

// --- 2. Erstellung des Contexts ---
const ExperimentContext = createContext<ExperimentState | undefined>(undefined);

// Hilfs-Hook, um in den anderen Seiten einfach auf den State zuzugreifen
export function useExperiment() {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error("useExperiment muss innerhalb des ExperimentLayouts verwendet werden.");
    }
    return context;
}

export default function ExperimentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ExperimentProvider>
            <div className="min-h-screen bg-slate-950 text-slate-50 relative z-50 pb-16 flex flex-col">
                <main className="flex-1">
                    {children}
                </main>
                <ExperimentFooter />
            </div>
        </ExperimentProvider>
    );
}