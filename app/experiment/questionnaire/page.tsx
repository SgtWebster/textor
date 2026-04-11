"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperiment } from "../ExperimentContext";

// Die MDMT-Adjektive (gekürzt auf die Kern-Dimensionen aus deiner Dispo)
const mdmtItems = [
    { id: "competence", label: "Kompetent", category: "Capacity Trust" },
    { id: "reliability", label: "Verlässlich", category: "Capacity Trust" },
    { id: "integrity", label: "Prinzipientreu (Integer)", category: "Moral Trust" },
    { id: "benevolence", label: "Wohlwollend", category: "Moral Trust" },
];

export default function QuestionnairePage() {
    const router = useRouter();
    const {
        participantId,
        experimentData,
        updateExperimentData,
        setProgress,
        totalSteps
    } = useExperiment();

    const [isClient, setIsClient] = useState(false);

    // Form States
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [age, setAge] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Wir setzen den Fortschrittsbalken auf den letzten Schritt (z.B. 4 von 4)
        setProgress(totalSteps, totalSteps);

        // Redirect, falls jemand ohne ID direkt hier landet
        if (!sessionStorage.getItem("experiment_participant_id")) {
            router.replace("/experiment");
        }
    }, [setProgress, totalSteps, router]);

    const handleRatingChange = (id: string, value: number) => {
        setRatings(prev => ({ ...prev, [id]: value }));
    };

    const isFormValid = () => {
        // Prüfen, ob alle MDMT-Items bewertet wurden und Demographie ausgefüllt ist
        const allRated = mdmtItems.every(item => ratings[item.id] !== undefined);
        return allRated && age !== "" && gender !== "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);

        // 1. Speichere die finalen Daten im Context
        const finalData = {
            ...experimentData,
            mdmtScores: ratings,
            demographics: {
                age: parseInt(age),
                gender
            }
        };
        updateExperimentData(finalData);

        // 2. Hier würdest du später den API Call zu deiner Datenbank machen
        /*
        try {
            await fetch('/api/submit-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantId,
                    data: finalData
                })
            });
        } catch (error) {
            console.error("Fehler beim Speichern", error);
        }
        */

        // 3. Simuliere kurze Ladezeit und gehe zur Finish/Gewinnspiel-Seite
        setTimeout(() => {
            router.push("/experiment/finish");
        }, 800);
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 sm:px-6">
            <div className="w-full max-w-3xl border border-slate-800 bg-slate-900 rounded-2xl p-8 shadow-xl">

                <div className="mb-8 border-b border-slate-800 pb-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Abschließende Einschätzung</h1>
                    <p className="text-slate-400">
                        Bitte bewerten Sie das KI-System (Aida / Terminal), mit dem Sie gerade interagiert haben.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* --- MDMT Block --- */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Ihre Wahrnehmung des Systems</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Geben Sie auf einer Skala von 0 (gar nicht) bis 7 (sehr stark) an, inwieweit die folgenden Eigenschaften auf das System zutreffen.
                        </p>

                        <div className="space-y-6">
                            {mdmtItems.map((item) => (
                                <div key={item.id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-medium text-slate-200">{item.label}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">{item.category}</span>
                                    </div>

                                    {/* 0-7 Skala */}
                                    <div className="flex justify-between items-center gap-1 sm:gap-2">
                                        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                                            <label
                                                key={num}
                                                className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer transition-all border ${
                                                    ratings[item.id] === num
                                                        ? "bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/20"
                                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={item.id}
                                                    value={num}
                                                    className="hidden"
                                                    checked={ratings[item.id] === num}
                                                    onChange={() => handleRatingChange(item.id, num)}
                                                />
                                                <span className="text-sm sm:text-base font-medium">{num}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                                        <span>Gar nicht</span>
                                        <span>Sehr stark</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- Demographie Block --- */}
                    <section className="border-t border-slate-800 pt-8">
                        <h2 className="text-xl font-semibold text-white mb-4">Statistische Angaben</h2>
                        <div className="grid sm:grid-cols-2 gap-6">

                            {/* Alter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Alter</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="99"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="Ihre Eingabe"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            {/* Geschlecht */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Geschlecht</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                                >
                                    <option value="" disabled>Bitte wählen...</option>
                                    <option value="m">Männlich</option>
                                    <option value="f">Weiblich</option>
                                    <option value="d">Divers / Keine Angabe</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* --- Submit Button --- */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={!isFormValid() || isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                isFormValid() && !isSubmitting
                                    ? "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            {isSubmitting ? "Daten werden gespeichert..." : "Experiment abschließen"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}