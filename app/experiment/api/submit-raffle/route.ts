import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();

    // Enthält NUR: uuid (anonym), entscheidungen, zeiten, MDMT-Scores, demographie (Alter, Geschlecht)
    // KEINE Namen oder E-Mails!

    try {
        // Hier in deine wissenschaftliche Datenbank speichern (z.B. Postgres, Supabase)
        // db.insert(experimentData).values(data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
    }
}