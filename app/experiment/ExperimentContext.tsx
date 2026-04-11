"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

// Typisierung der gesammelten Daten
type ExperimentData = {
    scenario1Time?: number;
    scenario1Decision?: string;
    routinePolite?: boolean;
    routineTimeMs?: number;
    // Platz für weitere Daten aus Szenario 2, 3 und dem MDMT-Fragebogen
};

// Der State unseres gesamten Experiments
type ExperimentState = {
    participantId: string | null;
    designType: "between" | "within"; // Globale Einstellung (Server oder Admin)
    conditionSequence: ("avatar" | "text")[]; // Array für den Ablauf der Szenarien
    experimentData: ExperimentData;
    currentStep: number;
    totalSteps: number;

    // Setter-Funktionen
    setParticipantId: (id: string) => void;
    setConditionSequence: (seq: ("avatar" | "text")[]) => void;
    updateExperimentData: (data: Partial<ExperimentData>) => void;
    setProgress: (step: number, total: number) => void;
    abortExperiment: () => void;
};

const ExperimentContext = createContext<ExperimentState | undefined>(undefined);

export function useExperiment() {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error("useExperiment muss innerhalb des ExperimentProviders verwendet werden.");
    }
    return context;
}

export function ExperimentProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    // Lese den Vercel-Standard aus (Fallback ist "between")
    const globalDefaultDesign = (process.env.NEXT_PUBLIC_DEFAULT_DESIGN as "between" | "within") || "between";

    // Globale Zustandsvariablen
    const [designType, setDesignType] = useState<"between" | "within">(globalDefaultDesign);
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [conditionSequence, setConditionSequence] = useState<("avatar" | "text")[]>([]);
    const [experimentData, setExperimentData] = useState<ExperimentData>({});

    // Fortschritt (Startet bei Schritt 1)
    const [currentStep, setCurrentStep] = useState(1);
    const [totalSteps, setTotalSteps] = useState(4); // Code Black, Sz2, Sz3, Fragebogen

    // Lade eventuelle Admin-Überschreibungen aus dem lokalen Browser-Speicher
    useEffect(() => {
        const savedDesign = localStorage.getItem("experiment_design");
        if (savedDesign === "within" || savedDesign === "between") {
            setDesignType(savedDesign);
        }
    }, []);

    // Hilfsfunktion zum Aktualisieren der Studiendaten
    const updateExperimentData = (newData: Partial<ExperimentData>) => {
        setExperimentData(prev => ({ ...prev, ...newData }));
    };

    // Hilfsfunktion für den Fortschrittsbalken
    const setProgress = (step: number, total: number) => {
        setCurrentStep(step);
        setTotalSteps(total);
    };

    // Funktion für den sauberen Abbruch des Experiments
    const abortExperiment = () => {
        const confirmAbort = window.confirm(
            "Willst du das Experiment wirklich abbrechen?\n\nAlle bisherigen Daten gehen verloren und können nicht wiederhergestellt werden."
        );
        if (confirmAbort) {
            // Alle States leeren
            setParticipantId(null);
            setConditionSequence([]);
            setExperimentData({});
            sessionStorage.removeItem("experiment_participant_id");

            // Zurück zur Startseite (außerhalb des Experiments)
            router.push("/");
        }
    };

    return (
        <ExperimentContext.Provider
            value={{
                participantId,
                designType,
                conditionSequence,
                experimentData,
                currentStep,
                totalSteps,
                setParticipantId,
                setConditionSequence,
                updateExperimentData,
                setProgress,
                abortExperiment
            }}
        >
            {children}
        </ExperimentContext.Provider>
    );
}