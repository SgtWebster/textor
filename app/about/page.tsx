// app/admin/page.tsx
"use client";

import { useMemo, useState } from "react";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const title = useMemo(
        () => (isAuthenticated ? "Admin Dashboard" : "Sonderbereich"),
        [isAuthenticated]
    );

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password === "Ulrich123") {
            setIsAuthenticated(true);
            setPassword("");
            return;
        }

        setError("Zugriff verweigert. Bitte versuch es erneut.");
        setPassword("");
    };

    if (isAuthenticated) {
        return (
            <div>
                {/* Header */}
                <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                                    Authenticated
                                    <span className="text-slate-300">•</span>
                                    Admin Area
                                </div>

                                <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    {title}
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                                    Platzhalter-Dashboard – später kannst du hier Inhalte und Projekte verwalten.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsAuthenticated(false)}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                Logout
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">Status</h2>

                                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                    Willkommen, Oliver.
                                </div>

                                <p className="mt-3 text-xs text-slate-500">
                                    Hinweis: Aktuell nur client-seitiges UI-Gate (keine echte Auth).
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>

                                <div className="mt-4 grid gap-2">
                                    <button
                                        type="button"
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        onClick={() => alert("Coming soon: Projekte verwalten")}
                                    >
                                        Projekte verwalten
                                        <div className="mt-1 text-xs font-normal text-slate-600">
                                            CRUD für Projektseiten, Tags, Links, Assets
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        onClick={() => alert("Coming soon: Thesis Updates")}
                                    >
                                        Thesis Updates
                                        <div className="mt-1 text-xs font-normal text-slate-600">
                                            Fortschritt, Notizen, Literatur, Ergebnisse
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-900">Placeholder</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Hier kann später ein echtes Dashboard rein (Änderungen, Drafts, Uploads, Fehler, …).
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div>
            <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Restricted
                        <span className="text-slate-300">•</span>
                        Admin Login
                    </div>

                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                        {title}
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Bitte Passwort eingeben, um den Admin-Bereich zu öffnen.
                    </p>

                    <form onSubmit={handleLogin} className="mt-6 grid gap-3">
                        <label className="text-sm font-semibold text-slate-700">Passwort</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            Zugriff anfordern
                        </button>

                        <p className="mt-2 text-xs text-slate-500">
                            Hinweis: Aktuell nur ein UI-Gate (Client-seitig).
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
}
