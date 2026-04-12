import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { participantId, designType, conditionSequence, data } = body;

        // Extrahiere die MDMT-Scores und Demographie aus dem Rest der Daten
        const { mdmtScores, demographics, ...scenarioData } = data;

        // Speichern in der Datenbank
        await sql`
            INSERT INTO experiment_results (
                id, design_type, condition_sequence, scenario_data, mdmt_scores, age, gender
            ) VALUES (
                ${participantId}, 
                ${designType}, 
                ${JSON.stringify(conditionSequence)}, 
                ${JSON.stringify(scenarioData)}, 
                ${JSON.stringify(mdmtScores)}, 
                ${demographics.age}, 
                ${demographics.gender}
            )
        `;

        return NextResponse.json({ success: true, message: "Forschungsdaten sicher gespeichert." });
    } catch (error) {
        console.error("Datenbankfehler:", error);
        return NextResponse.json({ error: "Fehler beim Speichern der Daten" }, { status: 500 });
    }
}