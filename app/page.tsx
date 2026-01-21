// app/page.tsx
export default function Home() {
    return (
        <div>
            {/* HERO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    ...
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">…</span>
                </div>

                <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Oliver <span className="text-teal-700">Ulrich</span> Weber
                </h1>

                <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                    Digital Business &amp; Software Engineering (BSc) – MCI Innsbruck.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                        href="mailto:oliver-weber@oliver-weber.at"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        Kontakt: oliver-weber@oliver-weber.at
                    </a>

                    <a
                        href="/projekte"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        Projekte
                    </a>
                </div>

                {/* Optional Tags (wenn du sie wieder willst) */}
                {/* <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">Salzburg, Österreich</span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">HTI / HCI</span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">KI • Vertrauen • Fairness</span>
        </div> */}
            </section>

            {/* GRID */}
            <section className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">Coming soon</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">…work in progress…</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
                    <div className="mt-4 grid gap-2 text-sm">
                        <a
                            className="group rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
                            href="/thesis"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">Experiment</span>
                                <span className="text-slate-400 transition group-hover:text-slate-700">→</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                ...
                            </p>
                        </a>

                        <a
                            className="group rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
                            href="/about"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">Über mich</span>
                                <span className="text-slate-400 transition group-hover:text-slate-700">→</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">...</p>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
