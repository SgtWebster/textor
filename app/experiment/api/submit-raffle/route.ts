// import { NextResponse } from 'next/server';
// import { sql } from '@vercel/postgres';
//
// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//         const { name, email } = body;
//
//         if (!name || !email) {
//             return NextResponse.json({ error: "Name und E-Mail sind erforderlich" }, { status: 400 });
//         }
//
//         // Speichern in der isolierten Tabelle
//         await sql`
//             INSERT INTO raffle_participants (name, email)
//             VALUES (${name}, ${email})
//         `;
//
//         return NextResponse.json({ success: true, message: "Erfolgreich ins Gewinnspiel eingetragen." });
//     } catch (error) {
//         console.error("Gewinnspiel DB Fehler:", error);
//         // Falls die E-Mail schon existiert (UNIQUE Constraint), werfen wir einen Fehler
//         return NextResponse.json({ error: "Fehler beim Eintragen (E-Mail eventuell schon vorhanden?)" }, { status: 500 });
//     }
// }