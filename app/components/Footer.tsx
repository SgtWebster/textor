// app/components/Footer.tsx

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-slate-900 text-slate-300 py-8 mt-auto border-t border-teal-900">
            <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Copyright / Name */}
                <div className="text-sm font-medium">
                    &copy; {new Date().getFullYear()} Oliver Ulrich Weber
                </div>

                {/* "Geheimer" Bereich & Links */}
                <div className="flex gap-6 text-xs text-slate-500">
                    <Link href="/impressum" className="hover:text-teal-400 transition-colors">Impressum</Link>
                    {/*<Link href="/datenschutz" className="hover:text-teal-400 transition-colors">Datenschutz</Link>*/}

                    {/* Der Proof-of-Concept Link */}
                    <Link href="/admin" className="hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                        Internal
                    </Link>
                </div>

            </div>
        </footer>
    );
}