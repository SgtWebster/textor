export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6 font-sans">

            {/* Zentraler Container */}
            <div className="max-w-xl w-full text-center animate-in fade-in duration-700">

                {/* Hauptüberschrift: Groß, Fett, Petrol */}
                <h1 className="text-7xl sm:text-9xl font-black text-teal-800 tracking-tighter mb-4">
                    teXtor
                </h1>

                {/* Untertitel / Kontext */}
                <p className="text-teal-600 font-medium tracking-widest uppercase text-sm mb-16">
                    anthropomorphismus - human technology interaction - ethic
                </p>

                {/* Visuelle Trennung (kleines Detail) */}
                <div className="w-[3px] h-18 bg-slate-200 mx-auto mb-12"></div>

                {/* Personen-Details */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Oliver Ulrich Weber
                    </h2>

                    <p className="text-slate-500 text-sm">
                        Digital Business and Software Engineering - Projekt DiBSE BSc JG 2023 MCI
                    </p>

                    {/* Ort mit kleinem Punkt-Akzent */}
                    <div className="flex items-center justify-center gap-2 pt-4 text-slate-400 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Salzburg, Österreich
                    </div>
                    <div className="text-sm text-slate-600">
                        <strong>@ </strong>
                        <a href="mailto:o.weber@mci4me.at" className="text-teal-600 hover:underline">
                            o.weber@mci4me.at
                        </a>
                    </div>
                </div>

            </div>

        </main>
    );
}