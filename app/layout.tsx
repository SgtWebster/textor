// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Oliver Ulrich Weber",
    description: "Portfolio & Thesis Platform",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="de">
        <body
            className={[
                geistSans.variable,
                geistMono.variable,
                "min-h-screen antialiased",
                "bg-slate-50 text-slate-900",
            ].join(" ")}
        >
        <div className="flex min-h-screen flex-col">
            {/* Header kann ruhig leicht abgesetzt sein (z.B. dunkel oder hell) */}
            <Header />

            <main className="flex-1">
                <div className="mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
                    <div className="py-10 sm:py-14">{children}</div>
                </div>
            </main>

            {/* Footer ebenfalls abgesetzt */}
            <Footer />
        </div>
        </body>
        </html>
    );
}
