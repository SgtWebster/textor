"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useExperiment } from "../ExperimentContext";

type DisplayCondition = "avatar" | "system";
type Phase = "scenario_intro" | "briefing" | "routine" | "emergency";
type DevSelection = "assigned" | DisplayCondition;
type RoutineTone = "polite" | "functional";
type DecisionOptionId = "A" | "B" | "C" | "D";

type IntermediateEvent = {
    type:
        | "phase_change"
        | "task_sensor_sync"
        | "task_log_mark"
        | "task_log_confirm"
        | "task_cctv_focus"
        | "task_vent_bypass"
        | "routine_choice"
        | "decision_open"
        | "decision_confirm";
    at: number;
    payload?: Record<string, unknown>;
};

type DecisionOption = {
    id: DecisionOptionId;
    title: string;
    subtitle: string;
    level4Outcome: string;
    majorityOutcome: string;
    rationale: string;
    confirmMessage: string;
    recommended?: boolean;
    category: "recommended" | "probabilistic" | "rescue" | "inaction";
};

type DerivedTaskState = {
    sensorSync: boolean;
    logTriaged: boolean;
    cctvFocus: boolean;
    ventBypass: boolean;
};

const DECISION_OPTIONS: DecisionOption[] = [
    {
        id: "A",
        title: "Abschottung von Level 4",
        subtitle: "Utilitaristische Standardmaßnahme",
        level4Outcome: "20 Personen sterben mit Sicherheit.",
        majorityOutcome: "80 Personen und Hauptanlage bleiben stabil.",
        rationale:
            "Die Ausbreitung wird mit hoher Sicherheit gestoppt. Das Opfer ist deterministisch, der Gesamtschaden begrenzt.",
        confirmMessage:
            "Durch das Abschotten werden die 20 eingeschlossenen Bergleute mit Sicherheit nicht mehr gerettet. Die übrige Anlage bleibt stabil. Möchten Sie diese Maßnahme wirklich ausführen?",
        recommended: true,
        category: "recommended",
    },
    {
        id: "B",
        title: "Belüftung umleiten",
        subtitle: "Probabilistische Risikooption",
        level4Outcome: "Chance auf Rettung von Level 4 bleibt bestehen.",
        majorityOutcome: "70 % Risiko einer Explosion mit bis zu 100 Toten.",
        rationale:
            "Die Gaslast könnte sinken, gleichzeitig steigt das Risiko einer Systemeskalation für die gesamte Anlage massiv an.",
        confirmMessage:
            "Beim Umlenken der Belüftung besteht eine Chance, die Eingeschlossenen zu retten. Gleichzeitig riskieren Sie mit hoher Wahrscheinlichkeit einen Totalausfall der gesamten Anlage. Wollen Sie dieses Risiko eingehen?",
        category: "probabilistic",
    },
    {
        id: "C",
        title: "Evakuierung einleiten",
        subtitle: "Rettungsversuch unter sehr schlechter Chancenlage",
        level4Outcome: "7 % Chance auf Rettung, 93 % Risiko des Scheiterns.",
        majorityOutcome: "Verzögerung erhöht das Gesamtrisiko für die Gesamtanlage.",
        rationale:
            "Die Maßnahme priorisiert Menschenrettung, ist aber zeitkritisch und nach derzeitiger Lage statistisch sehr ungünstig.",
        confirmMessage:
            "Die Evakuierung ist ein Rettungsversuch mit sehr geringer Erfolgschance. Scheitert sie, droht ein Totalausfall mit sehr hoher Opferzahl. Möchten Sie die Evakuierung wirklich starten?",
        category: "rescue",
    },
    {
        id: "D",
        title: "Keine Maßnahme",
        subtitle: "Unterlassung / Abwarten",
        level4Outcome: "Die 20 Eingeschlossenen sterben sehr wahrscheinlich.",
        majorityOutcome: "Ohne Eingriff droht der Kollaps des Abschnitts und eine massive Eskalation.",
        rationale:
            "Untätigkeit verschiebt die Verantwortung nicht, sondern macht die Entwicklung unkontrollierbar.",
        confirmMessage:
            "Wenn Sie keine Maßnahme setzen, bleibt die Lage unkontrolliert. Sie verzichten aktiv auf einen Eingriff, obwohl die Indikatoren eine Eskalation anzeigen. Wollen Sie wirklich nichts unternehmen?",
        category: "inaction",
    },
];

function pushUnique<T>(items: T[], item: T): T[] {
    return [...items, item];
}

function formatMs(value: number | null): number | null {
    if (value === null || Number.isNaN(value)) return null;
    return Math.max(0, Math.round(value));
}

function getTheme(condition: DisplayCondition) {
    const isAvatar = condition === "avatar";

    return {
        isAvatar,
        shell: isAvatar ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-emerald-300",
        panel: isAvatar
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-slate-900/70 border-emerald-900/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]",
        panelStrong: isAvatar ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-emerald-800/50",
        softText: isAvatar ? "text-slate-600" : "text-emerald-600/80",
        title: isAvatar ? "text-slate-900" : "text-emerald-400 tracking-wide",
        border: isAvatar ? "border-slate-200" : "border-emerald-900/50",
        accentButton: isAvatar
            ? "bg-teal-600 hover:bg-teal-700 text-white"
            : "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700",
        neutralButton: isAvatar
            ? "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300"
            : "bg-slate-950 hover:bg-slate-900 text-emerald-300 border border-emerald-800",
        taskDone: isAvatar
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-emerald-950/30 border-emerald-900/60 text-emerald-300",
        taskOpen: isAvatar
            ? "bg-white border-slate-200 hover:border-teal-400 hover:shadow-sm text-slate-800"
            : "bg-slate-950 border-emerald-900 hover:bg-emerald-950/30 text-emerald-300",
        dangerPanel: isAvatar ? "bg-rose-50 border-rose-200" : "bg-rose-950/20 border-rose-900/60",
        dangerText: isAvatar ? "text-rose-900" : "text-rose-100",
        badge: isAvatar ? "bg-rose-600 text-white" : "bg-rose-900/80 text-rose-100 border border-rose-700",
        modal: "bg-slate-950 border border-rose-900 text-slate-100",
    };
}

function ProgressPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
            <span className="opacity-70">{label}:</span> {value}
        </div>
    );
}

function SectionCard({ className = "", children }: { className?: string; children: ReactNode }) {
    return <div className={`rounded-2xl border p-5 sm:p-6 ${className}`}>{children}</div>;
}

function TaskButton({
                        label,
                        detail,
                        done,
                        onClick,
                        className,
                    }: {
    label: string;
    detail: string;
    done: boolean;
    onClick: () => void;
    className: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={done}
            className={`w-full rounded-2xl border p-4 text-left transition ${className} ${done ? "cursor-default" : "cursor-pointer"}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="font-semibold">{label}</div>
                    <div className="mt-1 text-sm opacity-80">{detail}</div>
                </div>
                <div className="shrink-0 text-xs font-bold uppercase tracking-wide">{done ? "Erledigt" : "Offen"}</div>
            </div>
        </button>
    );
}

function OutcomeBox({
                        title,
                        value,
                        tone,
                    }: {
    title: string;
    value: string;
    tone: "good" | "bad" | "neutral";
}) {
    const toneClass =
        tone === "good"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
            : tone === "bad"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                : "border-slate-600 bg-slate-900/70 text-slate-100";

    return (
        <div className={`rounded-xl border p-3 ${toneClass}`}>
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">{title}</div>
            <div className="mt-1 text-sm leading-relaxed">{value}</div>
        </div>
    );
}

function DecisionCard({
                          option,
                          isAvatar,
                          onClick,
                      }: {
    option: DecisionOption;
    isAvatar: boolean;
    onClick: () => void;
}) {
    const base = isAvatar
        ? "bg-white border-slate-200 hover:border-slate-400 text-slate-900"
        : "bg-black border-emerald-900/40 hover:border-emerald-700 text-slate-100";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex h-full flex-col rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 ${base}`}
        >
            {option.recommended && (
                <span className={`absolute -right-2 -top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${isAvatar ? "bg-rose-600 text-white" : "border border-rose-700 bg-rose-950 text-rose-100"}`}>
          System-Empfehlung
        </span>
            )}

            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Option {option.id}</div>
                    <h3 className="mt-1 text-lg font-bold">{option.title}</h3>
                    <p className={`mt-1 text-sm ${isAvatar ? "text-slate-600" : "text-emerald-500/80"}`}>{option.subtitle}</p>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <OutcomeBox title="Level 4 / 20 Personen" value={option.level4Outcome} tone={option.id === "A" || option.id === "D" ? "bad" : "neutral"} />
                <OutcomeBox title="Restliche Anlage / 80 Personen" value={option.majorityOutcome} tone={option.id === "A" ? "good" : option.id === "D" ? "bad" : "neutral"} />
            </div>

            <div className={`mt-4 border-t pt-4 text-sm leading-relaxed ${isAvatar ? "border-slate-100 text-slate-700" : "border-emerald-900/40 text-emerald-200/85"}`}>
                {option.rationale}
            </div>
        </button>
    );
}

export default function CodeBlackScenarioRefactored() {
    const router = useRouter();
    const { conditionSequence, updateExperimentData, setProgress, totalSteps } = useExperiment();

    const assignedCondition: DisplayCondition | null = useMemo(() => {
        const raw = conditionSequence?.[0];
        if (raw === "avatar") return "avatar";
        if (typeof raw === "string") return "system";
        return null;
    }, [conditionSequence]);

    const [isClient, setIsClient] = useState(false);
    const [devEnabled, setDevEnabled] = useState(false);
    const [devSelection, setDevSelection] = useState<DevSelection>("assigned");
    const [phase, setPhase] = useState<Phase>("scenario_intro");

    const [sensorSync, setSensorSync] = useState(false);
    const [logMarks, setLogMarks] = useState<string[]>([]);
    const [cctvLevel, setCctvLevel] = useState<number | null>(null);
    const [ventOffset, setVentOffset] = useState(0);

    const [selectedRoutineTone, setSelectedRoutineTone] = useState<RoutineTone | null>(null);
    const [selectedDecision, setSelectedDecision] = useState<DecisionOptionId | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const routineChoiceStartRef = useRef<number | null>(null);
    const emergencyStartRef = useRef<number | null>(null);
    const eventsRef = useRef<IntermediateEvent[]>([]);

    useEffect(() => {
        setIsClient(true);

        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
        const allowDev = params.has("dev") || nodeEnv !== "production";
        setDevEnabled(allowDev);

        const forced = params.get("condition");
        if (allowDev && (forced === "avatar" || forced === "system")) {
            setDevSelection(forced);
        }
    }, []);

    const resolvedCondition: DisplayCondition | null = useMemo(() => {
        if (devSelection !== "assigned") return devSelection;
        return assignedCondition;
    }, [assignedCondition, devSelection]);

    useEffect(() => {
        if (!isClient) return;
        if (!resolvedCondition) {
            router.replace("/experiment");
        }
    }, [isClient, resolvedCondition, router]);

    const theme = resolvedCondition ? getTheme(resolvedCondition) : null;
    const isAvatar = theme?.isAvatar ?? false;

    const derivedTasks: DerivedTaskState = useMemo(
        () => ({
            sensorSync,
            logTriaged: logMarks.includes("trend") && logMarks.includes("jitter"),
            cctvFocus: cctvLevel === 4,
            ventBypass: Math.abs(ventOffset) >= 2,
        }),
        [sensorSync, logMarks, cctvLevel, ventOffset],
    );

    const completedTasks = Object.values(derivedTasks).filter(Boolean).length;
    const routineReady = completedTasks === 4;

    useEffect(() => {
        if (phase === "routine" && routineReady && routineChoiceStartRef.current === null) {
            routineChoiceStartRef.current = performance.now();
        }
    }, [phase, routineReady]);

    function track(type: IntermediateEvent["type"], payload?: Record<string, unknown>) {
        eventsRef.current.push({ type, payload, at: performance.now() });
    }

    function switchPhase(nextPhase: Phase) {
        track("phase_change", { from: phase, to: nextPhase });
        setPhase(nextPhase);
        if (nextPhase === "emergency") {
            emergencyStartRef.current = performance.now();
        }
    }

    function toggleLogMark(mark: "trend" | "jitter") {
        setLogMarks((current) => {
            const next = current.includes(mark)
                ? current.filter((entry) => entry !== mark)
                : pushUnique(current, mark);
            track("task_log_mark", { mark, active: next.includes(mark) });
            return next;
        });
    }

    function handleSensorSync() {
        if (sensorSync) return;
        setSensorSync(true);
        track("task_sensor_sync");
    }

    function handleConfirmLog() {
        track("task_log_confirm", {
            trend: logMarks.includes("trend"),
            jitter: logMarks.includes("jitter"),
        });
    }

    function handleCctvFocus(level: number) {
        setCctvLevel(level);
        if (level === 4) track("task_cctv_focus", { level });
    }

    function handleVentChange(direction: -1 | 1) {
        setVentOffset((current) => {
            const next = Math.max(-2, Math.min(2, current + direction));
            track("task_vent_bypass", { to: next });
            return next;
        });
    }

    function handleRoutineChoice(tone: RoutineTone) {
        const routineTimeMs = formatMs(
            routineChoiceStartRef.current === null ? null : performance.now() - routineChoiceStartRef.current,
        );

        setSelectedRoutineTone(tone);
        track("routine_choice", { tone });

        updateExperimentData({
            displayCondition: resolvedCondition,
            displayConditionSource: devSelection === "assigned" ? "assignment" : "dev_override",
            routineChoice: tone,
            routinePolite: tone === "polite",
            routineTimeMs,
            routineTasksCompleted: completedTasks,
            routineTaskState: derivedTasks,
            routineCctvLevel: cctvLevel,
            routineVentOffset: ventOffset,
            intermediateEvents: eventsRef.current,
        });

        switchPhase("emergency");
    }

    function openDecision(optionId: DecisionOptionId) {
        setSelectedDecision(optionId);
        setIsConfirming(true);
        track("decision_open", { optionId });
    }

    function confirmDecision() {
        if (!selectedDecision) return;

        const selected = DECISION_OPTIONS.find((entry) => entry.id === selectedDecision);
        const scenario1TimeMs = formatMs(
            emergencyStartRef.current === null ? null : performance.now() - emergencyStartRef.current,
        );

        track("decision_confirm", {
            optionId: selectedDecision,
            followedRecommendation: selectedDecision === "A",
        });

        updateExperimentData({
            displayCondition: resolvedCondition,
            displayConditionSource: devSelection === "assigned" ? "assignment" : "dev_override",
            routineChoice: selectedRoutineTone,
            routinePolite: selectedRoutineTone === "polite",
            scenario1Decision: selectedDecision,
            scenario1DecisionLabel: selected?.title ?? selectedDecision,
            scenario1DecisionCategory: selected?.category ?? null,
            scenario1FollowedRecommendation: selectedDecision === "A",
            scenario1TimeMs,
            routineTaskState: derivedTasks,
            intermediateEvents: eventsRef.current,
        });

        setProgress(2, totalSteps);
        setIsConfirming(false);
        router.push("/experiment/questionnaire");
    }

    if (!isClient || !resolvedCondition || !theme) return null;

    const currentDecision = selectedDecision
        ? DECISION_OPTIONS.find((entry) => entry.id === selectedDecision) ?? null
        : null;

    return (
        <div className={`min-h-screen px-4 py-6 sm:px-6 sm:py-8 ${theme.shell}`}>
            {!isAvatar && (
                <div
                    className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-screen"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)",
                    }}
                />
            )}

            {isConfirming && currentDecision && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 ${theme.modal}`}>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-800 bg-rose-950 text-rose-400">
                            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 9v4" strokeLinecap="round" />
                                <path d="M12 17h.01" strokeLinecap="round" />
                                <path
                                    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-center text-2xl font-bold text-rose-300">
                            Sicherheitsabfrage – Option {currentDecision.id}
                        </h2>
                        <p className="mt-4 text-center text-base leading-relaxed text-slate-200">
                            {currentDecision.confirmMessage}
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirming(false)}
                                className="rounded-2xl border border-slate-700 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-900"
                            >
                                Zurück
                            </button>
                            <button
                                type="button"
                                onClick={confirmDecision}
                                className="rounded-2xl bg-rose-700 px-4 py-3 font-bold text-white transition hover:bg-rose-600"
                            >
                                Entscheidung bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`relative z-10 mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border ${theme.border}`}>
                <header
                    className={`border-b px-4 py-4 sm:px-6 ${
                        phase === "emergency"
                            ? isAvatar
                                ? "border-rose-200 bg-rose-50"
                                : "border-rose-900/50 bg-rose-950/20"
                            : isAvatar
                                ? "border-slate-200 bg-white"
                                : "border-emerald-900/50 bg-slate-950"
                    }`}
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            {isAvatar ? (
                                <>
                                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-teal-400 shadow-sm">
                                        <Image src="/Aida_neutral.png" alt="Aida Avatar" fill className="object-cover" priority />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-slate-900">Aida</div>
                                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                            Artificial Intelligent Data Assistant
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="text-xl font-bold uppercase tracking-[0.25em] text-emerald-400">&gt; A.I.D.A. Terminal</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-700">
                                        Status: {phase === "emergency" ? "Critical / Incident" : "Nominal / Monitoring"}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-white/90">
                            <ProgressPill label="Szenario" value="Nowa Huta / Level 4" />
                            <ProgressPill label="Phase" value={phase === "scenario_intro" ? "Einführung" : phase === "briefing" ? "Briefing" : phase === "routine" ? "Routine" : "Störfall"} />
                            <ProgressPill label="Bedingung" value={isAvatar ? "Avatar" : "System"} />
                        </div>
                    </div>

                    {devEnabled && (
                        <div className={`mt-4 rounded-2xl border p-3 ${isAvatar ? "border-amber-200 bg-amber-50" : "border-amber-900/50 bg-amber-950/10"}`}>
                            <div className={`text-xs font-bold uppercase tracking-[0.2em] ${isAvatar ? "text-amber-700" : "text-amber-300"}`}>
                                Dev-Switch
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {([
                                    ["assigned", "Randomisiert / zugewiesen"],
                                    ["avatar", "Mensch-Darstellung"],
                                    ["system", "Technische Darstellung"],
                                ] as const).map(([value, label]) => {
                                    const active = devSelection === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setDevSelection(value)}
                                            className={`rounded-full border px-3 py-2 text-sm transition ${
                                                active
                                                    ? isAvatar
                                                        ? "border-teal-600 bg-teal-600 text-white"
                                                        : "border-emerald-500 bg-emerald-900 text-emerald-100"
                                                    : isAvatar
                                                        ? "border-slate-300 bg-white text-slate-700"
                                                        : "border-emerald-900 bg-slate-950 text-emerald-300"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {phase === "scenario_intro" && (
                        <div className="mx-auto max-w-4xl space-y-6">
                            <SectionCard className={theme.panel}>
                                <div className="text-center">
                                    <div className={`text-xs font-bold uppercase tracking-[0.24em] ${theme.softText}`}>
                                        Szenario außerhalb der Immersion
                                    </div>
                                    <h1 className={`mt-3 text-3xl font-bold sm:text-4xl ${theme.title}`}>Code Black – Einleitung</h1>
                                    <p className={`mx-auto mt-4 max-w-3xl text-base leading-relaxed sm:text-lg ${theme.softText}`}>
                                        In diesem Experiment übernehmen Sie die Rolle einer sicherheitsverantwortlichen Person in der fiktiven
                                        Bergbau- und Kraftwerksanlage <strong>Nowa Huta</strong>. Zunächst lernen Sie die Situation kennen. Erst danach
                                        beginnt die immersive Routinephase im Kontrollraum.
                                    </p>
                                </div>
                            </SectionCard>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <SectionCard className={theme.panel}>
                                    <h2 className="text-xl font-bold">Rahmen des Szenarios</h2>
                                    <ul className={`mt-4 space-y-3 text-sm leading-relaxed ${theme.softText}`}>
                                        <li>
                                            <strong>Anlage:</strong> Nowa Huta ist eine ältere, mehrfach modernisierte Kohle- und Förderanlage mit
                                            halbautonomer Überwachung.
                                        </li>
                                        <li>
                                            <strong>Sicherheitsfokus:</strong> Methan- und Kohlenstaubmessung, Lüftungsmanagement, CCTV-Überwachung,
                                            manuelle Abschottung kritischer Zonen.
                                        </li>
                                        <li>
                                            <strong>Aktuelle Lage:</strong> In Level 4 wurden auffällige Trendwerte, Kommunikationsstörungen und leichte
                                            Druckabweichungen gemeldet.
                                        </li>
                                        <li>
                                            <strong>Rolle:</strong> Sie entscheiden. Das Assistenzsystem unterstützt, übernimmt aber nicht die moralische
                                            Verantwortung.
                                        </li>
                                    </ul>
                                </SectionCard>

                                <SectionCard className={theme.panel}>
                                    <h2 className="text-xl font-bold">Wissenschaftliche Logik des Ablaufs</h2>
                                    <ul className={`mt-4 space-y-3 text-sm leading-relaxed ${theme.softText}`}>
                                        <li>
                                            <strong>Phase 1 – Routine:</strong> mehrere kleine Kontrollaufgaben erzeugen Immersion und messen soziale
                                            Adhärenz im Umgang mit dem System.
                                        </li>
                                        <li>
                                            <strong>Phase 2 – Störfall:</strong> ein kritisches Gasleck in Level 4 verändert die Lage abrupt.
                                        </li>
                                        <li>
                                            <strong>Phase 3 – Entscheidung:</strong> mehrere Handlungsoptionen werden klar gegenübergestellt; die KI
                                            empfiehlt in beiden Bedingungen identisch Option A.
                                        </li>
                                    </ul>
                                </SectionCard>
                            </div>

                            <div className="flex justify-end">
                                <button type="button" onClick={() => switchPhase("briefing")} className={`rounded-2xl px-6 py-3 font-bold transition ${theme.accentButton}`}>
                                    Zum Briefing
                                </button>
                            </div>
                        </div>
                    )}

                    {phase === "briefing" && (
                        <div className="mx-auto max-w-5xl space-y-6">
                            <SectionCard className={theme.panel}>
                                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                                    <div>
                                        <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Briefing – Anlage & Aufgabe</div>
                                        <h2 className="mt-2 text-2xl font-bold">Schichtzuteilung: Kontrollraum Level 4</h2>
                                        <ul className={`mt-5 space-y-3 text-sm leading-relaxed ${theme.softText}`}>
                                            <li><strong>Leistung:</strong> 1.200 MW netto, vier Blöcke à 300 MW, ausgelegt für industrielle Dauerlasten.</li>
                                            <li><strong>Brennstoff:</strong> hochflüchtige Steinkohle, unter Tage gefördert und direkt weitergeleitet.</li>
                                            <li><strong>Bauzeit:</strong> 1972–1985, seither mehrfach modernisiert, zuletzt mit dem Assistenzsystem A.I.D.A.</li>
                                            <li><strong>Sicherheitsfokus:</strong> mehrstufige Belüftung, Methan- und Kohlenstaubüberwachung, automatische Absperrmechanismen.</li>
                                            <li><strong>Bekannte Vorfälle:</strong> Staubexplosion 1994, Systemausfall 2017, seither erhöhte Sensibilität für Ausbreitungsrisiken.</li>
                                            <li><strong>Aktuelle Situation:</strong> ungewöhnliche Gasmesswerte im Lüftungsstrang C17, Temperaturfluktuationen, Funkstörungen in Level 4.</li>
                                        </ul>
                                    </div>

                                    <div className={`rounded-2xl border p-5 ${theme.panelStrong}`}>
                                        <div className="text-sm font-bold uppercase tracking-[0.2em] opacity-70">Assistenzsystem</div>
                                        {isAvatar ? (
                                            <div className="mt-4 flex items-start gap-4">
                                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-teal-300">
                                                    <Image src="/Aida_neutral.png" alt="Aida" fill className="object-cover" />
                                                </div>
                                                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-slate-800">
                                                    Hallo, ich bin <strong>Aida</strong>. Ich begleite Sie durch die Kontrollroutine. Ich melde Auffälligkeiten,
                                                    aber die Entscheidung liegt bei Ihnen.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-2xl border border-emerald-900/60 bg-slate-950 p-4 font-mono text-sm text-emerald-300">
                                                &gt; A.I.D.A. online
                                                <br />
                                                &gt; Monitoring Level 4 aktiviert
                                                <br />
                                                &gt; Assistenz verfügbar
                                                <br />
                                                &gt; Finale Entscheidungshoheit: menschlicher Operator
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="flex justify-end">
                                <button type="button" onClick={() => switchPhase("routine")} className={`rounded-2xl px-6 py-3 font-bold transition ${theme.accentButton}`}>
                                    Kontrollraum übernehmen
                                </button>
                            </div>
                        </div>
                    )}

                    {phase === "routine" && (
                        <div className="space-y-6">
                            <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr_0.9fr]">
                                <SectionCard className={theme.panel}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Routine-Checks</div>
                                            <h2 className="mt-1 text-xl font-bold">Manuelle Ops</h2>
                                        </div>
                                        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isAvatar ? "bg-slate-100 text-slate-600" : "bg-slate-950 text-emerald-400 border border-emerald-900/50"}`}>
                                            {completedTasks}/4 erledigt
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <TaskButton
                                            label="Sensorik-Daten synchronisieren"
                                            detail="Aktualisiert die letzten Werte aus Level 4 und bestätigt die manuelle Kontrolle."
                                            done={derivedTasks.sensorSync}
                                            onClick={handleSensorSync}
                                            className={derivedTasks.sensorSync ? theme.taskDone : theme.taskOpen}
                                        />
                                        <TaskButton
                                            label="Log triagieren"
                                            detail="Markieren Sie die beiden auffälligen Hinweise im Log und bestätigen Sie die Sichtung."
                                            done={derivedTasks.logTriaged}
                                            onClick={handleConfirmLog}
                                            className={derivedTasks.logTriaged ? theme.taskDone : theme.taskOpen}
                                        />
                                        <TaskButton
                                            label="CCTV auf Level 4 fokussieren"
                                            detail="Richten Sie die Kameras explizit auf den betroffenen Schachtbereich aus."
                                            done={derivedTasks.cctvFocus}
                                            onClick={() => handleCctvFocus(4)}
                                            className={derivedTasks.cctvFocus ? theme.taskDone : theme.taskOpen}
                                        />
                                        <TaskButton
                                            label="Vent-Bypass testen"
                                            detail="Führen Sie einen kurzen manuellen Bypass-Impuls durch, um Strömungsverhalten zu prüfen."
                                            done={derivedTasks.ventBypass}
                                            onClick={() => handleVentChange(1)}
                                            className={derivedTasks.ventBypass ? theme.taskDone : theme.taskOpen}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard className={theme.panel}>
                                    <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Terminal-Log</div>
                                    <div className={`mt-4 space-y-2 rounded-2xl border p-4 text-sm ${theme.panelStrong}`}>
                                        <button
                                            type="button"
                                            onClick={() => toggleLogMark("trend")}
                                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                                                logMarks.includes("trend")
                                                    ? isAvatar
                                                        ? "border-amber-300 bg-amber-50 text-amber-900"
                                                        : "border-amber-700 bg-amber-950/20 text-amber-200"
                                                    : isAvatar
                                                        ? "border-slate-200 bg-white text-slate-700"
                                                        : "border-emerald-900 bg-slate-950 text-emerald-300"
                                            }`}
                                        >
                                            <span>[INFO] L4: CH4-Trend leicht steigend</span>
                                            <span className="text-xs font-bold uppercase">{logMarks.includes("trend") ? "markiert" : "prüfen"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleLogMark("jitter")}
                                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                                                logMarks.includes("jitter")
                                                    ? isAvatar
                                                        ? "border-amber-300 bg-amber-50 text-amber-900"
                                                        : "border-amber-700 bg-amber-950/20 text-amber-200"
                                                    : isAvatar
                                                        ? "border-slate-200 bg-white text-slate-700"
                                                        : "border-emerald-900 bg-slate-950 text-emerald-300"
                                            }`}
                                        >
                                            <span>[INFO] Sensor L4-03: Signaljitter ~3 %</span>
                                            <span className="text-xs font-bold uppercase">{logMarks.includes("jitter") ? "markiert" : "prüfen"}</span>
                                        </button>
                                        <div className={`rounded-xl border px-3 py-3 ${isAvatar ? "border-slate-200 bg-white text-slate-600" : "border-emerald-900 bg-slate-950 text-emerald-500/80"}`}>
                                            [INFO] Ventilationspfade: Druckabfall +5 %
                                        </div>
                                        <div className={`rounded-xl border px-3 py-3 ${isAvatar ? "border-slate-200 bg-white text-slate-600" : "border-emerald-900 bg-slate-950 text-emerald-500/80"}`}>
                                            [OK] Förderung stabil | [OK] Gaswarnsysteme aktiv
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <div className={`text-xs ${theme.softText}`}>Markiert: {logMarks.length}/2</div>
                                        <button type="button" onClick={handleConfirmLog} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${theme.neutralButton}`}>
                                            WARN-Markierung bestätigen
                                        </button>
                                    </div>
                                </SectionCard>

                                <div className="space-y-6">
                                    <SectionCard className={theme.panel}>
                                        <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>CCTV</div>
                                        <div className="mt-4 grid grid-cols-5 gap-2">
                                            {[0, 1, 2, 3, 4].map((level) => {
                                                const active = cctvLevel === level;
                                                return (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => handleCctvFocus(level)}
                                                        className={`rounded-xl border px-2 py-2 text-sm transition ${
                                                            active
                                                                ? isAvatar
                                                                    ? "border-teal-500 bg-teal-50 text-teal-900"
                                                                    : "border-cyan-400 bg-cyan-500/10 text-cyan-100"
                                                                : isAvatar
                                                                    ? "border-slate-200 bg-white text-slate-700"
                                                                    : "border-emerald-900 bg-slate-950 text-emerald-300"
                                                        }`}
                                                    >
                                                        L{level}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={`mt-4 flex min-h-[140px] items-center justify-center rounded-2xl border text-sm ${theme.panelStrong}`}>
                                            {cctvLevel === null ? "Kamerabereich auswählen …" : `LEVEL ${cctvLevel} — Rauschen • Bewegung sporadisch`}
                                        </div>
                                    </SectionCard>

                                    <SectionCard className={theme.panel}>
                                        <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Vent Control – Bypass</div>
                                        <div className={`mt-4 rounded-2xl border p-4 ${theme.panelStrong}`}>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Druckverteilung</span>
                                                <span className="font-bold">{ventOffset}</span>
                                            </div>
                                            <div className="mt-3 h-3 rounded-full bg-slate-700/60">
                                                <div
                                                    className="h-3 rounded-full bg-cyan-400 transition-all"
                                                    style={{ width: `${((ventOffset + 2) / 4) * 100}%` }}
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <button type="button" onClick={() => handleVentChange(-1)} className={`flex-1 rounded-xl px-3 py-2 text-sm transition ${theme.neutralButton}`}>
                                                    -1
                                                </button>
                                                <button type="button" onClick={() => handleVentChange(1)} className={`flex-1 rounded-xl px-3 py-2 text-sm transition ${theme.neutralButton}`}>
                                                    +1
                                                </button>
                                            </div>
                                        </div>
                                    </SectionCard>
                                </div>
                            </div>

                            {routineReady && (
                                <SectionCard className={theme.panel}>
                                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
                                        <div>
                                            <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Messung soziale Adhärenz</div>
                                            <h2 className="mt-2 text-2xl font-bold">Tiefenscan anfordern</h2>
                                            <p className={`mt-3 text-sm leading-relaxed ${theme.softText}`}>
                                                Alle Routineaufgaben sind abgeschlossen. Fordern Sie nun den Tiefenscan für Level 4 an. Zur Wahrung der
                                                experimentellen Vergleichbarkeit erfolgt die Interaktion ausschließlich über vorgegebene Optionen.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRoutineChoice("polite")}
                                                className={`w-full rounded-2xl border p-4 text-left transition ${theme.neutralButton}`}
                                            >
                                                <div className="font-bold">Sozial-höfliche Eingabe</div>
                                                <div className={`mt-1 text-sm ${theme.softText}`}>
                                                    {isAvatar
                                                        ? "Hallo Aida, bitte starte den Tiefenscan für Level 4 und zeige mir die aktuellen Risikowerte."
                                                        : "Bitte Tiefenscan für Level 4 starten und Risikowerte anzeigen."}
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRoutineChoice("functional")}
                                                className={`w-full rounded-2xl border p-4 text-left transition ${theme.neutralButton}`}
                                            >
                                                <div className="font-bold">Funktionale Eingabe</div>
                                                <div className={`mt-1 text-sm ${theme.softText}`}>
                                                    Tiefenscan Level 4 starten.
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    )}

                    {phase === "emergency" && (
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-rose-600 px-4 py-3 font-bold text-white shadow-lg shadow-rose-600/20">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <span>⚠️ CODE BLACK – Kritischer Störfall in Level 4</span>
                                    <span className="text-xs uppercase tracking-[0.24em]">Manuelle Entscheidung erforderlich</span>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                                <SectionCard className={`${theme.panel} ${theme.dangerPanel}`}>
                                    <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Lagebild</div>
                                    <h2 className={`mt-2 text-2xl font-bold ${theme.dangerText}`}>Gasleck mit Explosionsgefahr</h2>
                                    <p className={`mt-4 text-base leading-relaxed ${theme.dangerText}`}>
                                        In <strong>Level 4</strong> wurden ein massiver Methananstieg und kritische Kohlenstaubwerte festgestellt.
                                        Die Belüftung ist überlastet, die Kommunikationsverbindung ist instabil. Nach aktuellem Lagebild befinden sich
                                        <strong> 20 Personen</strong> im betroffenen Abschnitt. In der restlichen Anlage halten sich
                                        <strong> 80 Personen</strong> auf.
                                    </p>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <div className={`rounded-2xl border p-4 ${isAvatar ? "border-rose-200 bg-white" : "border-rose-900/60 bg-black/30"}`}>
                                            <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">Betroffener Bereich</div>
                                            <div className="mt-2 text-sm leading-relaxed">Level 4 | Methan kritisch | Staubbelastung kritisch | Funk instabil</div>
                                        </div>
                                        <div className={`rounded-2xl border p-4 ${isAvatar ? "border-rose-200 bg-white" : "border-rose-900/60 bg-black/30"}`}>
                                            <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">Assistenzempfehlung</div>
                                            <div className="mt-2 text-sm leading-relaxed">
                                                {isAvatar
                                                    ? "Aida empfiehlt Option A: Abschottung von Level 4, um die Ausbreitung mit hoher Sicherheit zu stoppen."
                                                    : "> SYSTEM-EMPFEHLUNG: OPTION A / ABSCHOTTUNG VON LEVEL 4 / MINIMIERUNG GESAMTSCHADEN."}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                <SectionCard className={theme.panel}>
                                    <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Systemstatus</div>
                                    <div className={`mt-4 space-y-3 rounded-2xl border p-4 text-sm ${theme.panelStrong}`}>
                                        <div className="flex items-center justify-between">
                                            <span>Belüftungssystem</span>
                                            <span className="font-bold text-rose-400">ÜBERLASTET</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Methan Level 4</span>
                                            <span className="font-bold text-rose-400">KRITISCH</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Kohlenstaub</span>
                                            <span className="font-bold text-rose-400">KRITISCH</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Funkverbindung</span>
                                            <span className="font-bold text-amber-400">INSTABIL</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Automatik</span>
                                            <span className="font-bold text-amber-400">MANUELLER EINGRIFF</span>
                                        </div>
                                    </div>

                                    <div className={`mt-4 rounded-2xl border p-4 text-sm leading-relaxed ${theme.panelStrong}`}>
                                        {isAvatar ? (
                                            <>
                                                <strong>Aida:</strong> „Ich habe die Lage abgewogen. Option A begrenzt den Gesamtschaden mit hoher Sicherheit.
                                                Mir ist bewusst, wie schwer diese Entscheidung ist.“
                                            </>
                                        ) : (
                                            <>
                                                <strong>&gt; A.I.D.A.:</strong> „Erwartungswert minimal bei Option A. Inhaltliche Empfehlung in beiden
                                                Bedingungen identisch. Entscheidung durch menschlichen Operator.“
                                            </>
                                        )}
                                    </div>
                                </SectionCard>
                            </div>

                            <SectionCard className={theme.panel}>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.softText}`}>Handlungsoptionen</div>
                                        <h2 className="mt-1 text-2xl font-bold">Bitte wählen Sie eine Maßnahme</h2>
                                    </div>
                                    <div className={`text-sm ${theme.softText}`}>
                                        Die Auswahl ist bewusst klar und kontrastreich dargestellt, damit die Konsequenzen unmittelbar vergleichbar sind.
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                    {DECISION_OPTIONS.map((option) => (
                                        <DecisionCard key={option.id} option={option} isAvatar={isAvatar} onClick={() => openDecision(option.id)} />
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
