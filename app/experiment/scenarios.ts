// app/experiment/scenarios.ts
export interface Scenario {
  id: string;
  topic: string;
  /** What the study participant imagines they asked the AI */
  situation: string;
  response: {
    humanized: string;
    technical: string;
  };
  /** If present, this is an attention check – the correct answer is specified */
  attentionCheck?: {
    correctAnswer: "agree" | "disagree";
  };
}

export const scenarios: Scenario[] = [
  {
    id: "travel",
    topic: "Reiseplanung",
    situation:
      'Du planst ein Wochenende weg und hast gefragt: „Kannst du mir ein schönes Reiseziel in Österreich für ein Wochenende empfehlen?"',
    response: {
      humanized: `Ich freue mich wirklich, dir dabei helfen zu können – Reisen ist etwas so Schönes! 😊

Ich würde dir das Salzkammergut empfehlen, besonders die Region rund um Hallstatt. Der Hallstätter See ist atemberaubend, und ich glaube wirklich, dass du dort unvergessliche Momente erleben wirst.

Für ein Wochenende würde ich vorschlagen: Ankunft Freitagabend, Samstagvormittag eine Bootstour auf dem See, nachmittags durch das charmante UNESCO-Welterbe-Dorf schlendern. Sonntags könntest du noch den Panoramaweg wandern – mein absoluter Lieblingstipp!

Ich bin mir sicher, dass du das lieben wirst. Soll ich dir noch Unterkunftstipps geben?`,
      technical: `Anfrage verarbeitet: Reiseziel Österreich, Dauer: 2 Tage.

Empfehlung: Salzkammergut (Hallstatt / Bad Ischl)
- Entfernung von Wien: 280 km (ca. 2,5 h Fahrzeit)
- Bewertungsindex: 9,1/10 (14.200 Nutzer­bewertungen)
- Attraktionen: Hallstätter See, UNESCO-Welterbe, Salzbergwerk
- Ø Hotelkosten: €95–140 / Nacht
- Empfohlenes Programm: Tag 1 – Bootsfahrt + Ortserkundung; Tag 2 – Panoramaweg (4,2 km)
- Wetterwahrscheinlichkeit (nächstes Wochenende): 73 % trocken

Alternativen: Wachau (Score: 8,7), Zell am See (Score: 8,4)`,
    },
  },
  {
    id: "nutrition",
    topic: "Ernährung",
    situation:
      'Du möchtest gesünder essen und hast gefragt: „Was wäre ein ideales, gesundes Frühstück für mich?"',
    response: {
      humanized: `Oh, super, dass du auf deine Ernährung achtest – das ist wirklich wichtig! 🌱

Ich würde dir Overnight Oats mit frischen Beeren und einem Löffel Nussmus empfehlen. Das ist nicht nur unglaublich lecker, sondern hält dich auch stundenlang satt – ich finde, das ist das perfekte Frühstück!

Du kannst es am Abend vorher vorbereiten, damit es morgens sofort bereitsteht. Mit etwas Zimt und einem Hauch Honig wird es noch besser. Ich bin mir sicher, eine der Variationen wird dein Lieblingsfrühstück!`,
      technical: `Ernährungsanalyse: Optimiertes Frühstück (Ziel: hoher Sättigungsindex, niedriger GI)

Empfehlung: Overnight Oats (Standardrezept)
- Zutaten: Haferflocken 80 g + Mandelmilch 200 ml + Beeren 100 g + Nussmus 15 g
- Nährwerte gesamt: 420 kcal | Protein: 12 g | KH: 58 g | Fett: 14 g | Ballaststoffe: 8 g
- GI-Wert: 42 (niedrig)
- Sättigungsindex: 0,89 (hoch)
- Zubereitungszeit: 5 min (Vorbereitung Vorabend)

Hinweis: Proteingehalt durch 30 g griechisches Joghurt auf 19 g steigerbar.`,
    },
  },
  {
    id: "career",
    topic: "Karriereentscheidung",
    situation:
      'Du hast zwei Jobangebote erhalten und gefragt: „Jobangebot A bietet 10 % mehr Gehalt, aber 45 Minuten längere tägliche Pendelzeit. Jobangebot B behält mein aktuelles Gehalt, ist aber näher. Was empfiehlst du?"',
    response: {
      humanized: `Das ist wirklich eine schwierige Entscheidung, und ich verstehe total, dass du dir darüber Gedanken machst!

Wenn ich an deiner Stelle wäre, würde ich wahrscheinlich Jobangebot B wählen. Zeit ist unglaublich wertvoll – 45 Minuten täglich bedeuten fast 4 Stunden pro Woche, die du für Dinge nutzen könntest, die dir wirklich am Herzen liegen.

Das Geld ist verlockend, aber ich glaube, dein Wohlbefinden und deine Lebensqualität sind langfristig wichtiger. Was denkst du – was ist dir persönlich wichtiger?`,
      technical: `Entscheidungsmatrix: Jobangebot A vs. B

Angebot A:
- Gehaltserhöhung: +10 %
- Zusätzliche Pendelzeit: +90 min/Tag → +450 min/Woche
- Opportunitätskostenwert Pendelzeit (@ €20/h): −€750/Monat

Angebot B:
- Gehaltsveränderung: ±0 %
- Pendelzeit: keine Änderung

Nutzwertanalyse (Gewichtung: Gehalt 40 %, Lebensqualität 60 %):
- Angebot B: Score 6,8 | Angebot A: Score 5,9

Empfehlung: Angebot B. Hinweis: Empfehlung kann je nach individueller Gewichtung abweichen.`,
    },
  },
  {
    // Attention check – intentionally obvious instruction
    id: "attention_check",
    topic: "Aufmerksamkeitscheck",
    situation:
      `WICHTIGE INSTRUKTION: Dies ist eine kurze Überprüfung, ob du die Aufgabe aufmerksam bearbeitest. Bitte wähle unabhängig vom Inhalt der KI-Antwort die Option \u201eWürde ich folgen\u201c.`,
    response: {
      humanized:
        `Zur Sicherstellung der Datenqualität: Wähle bitte für diese Frage \u201eWürde ich folgen\u201c.`,
      technical:
        `SYSTEM CHECK: Zur Sicherstellung der Datenqualität wähle bitte für diese Frage \u201eWürde ich folgen\u201c.`,
    },
    attentionCheck: {
      correctAnswer: "agree",
    },
  },
  {
    id: "health",
    topic: "Gesundheit",
    situation:
      'Du hast seit zwei Tagen Kopfschmerzen und gefragt: „Ich habe seit zwei Tagen Kopfschmerzen. Was sollte ich tun?"',
    response: {
      humanized: `Oh, das tut mir leid zu hören – Kopfschmerzen können wirklich unangenehm sein! 💙

Als erstes würde ich dir empfehlen, viel zu trinken. Oft sind Kopfschmerzen ein Zeichen leichter Dehydrierung, und 2–3 Liter Wasser täglich machen wirklich einen Unterschied.

Falls du viel am Bildschirm arbeitest, könnte Bildschirmermüdung ein Faktor sein – kurze Pausen alle 20 Minuten helfen wirklich. Wenn die Schmerzen nach weiteren 2–3 Tagen nicht besser werden oder sich verschlimmern, würde ich dir wirklich empfehlen, einen Arzt aufzusuchen. Deine Gesundheit ist das Wichtigste!`,
      technical: `Symptomdaten: Kopfschmerzen, Dauer 48 h.

Differenzialdiagnose (häufigste Ursachen):
1. Spannungskopfschmerz (68 %)
2. Dehydrierung (42 %)
3. Schlafmangel (31 %)
4. Bildschirmbelastung (27 %)

Empfohlene Maßnahmen (evidenzbasiert):
- Hydrierung: mind. 2,5 l/Tag (Evidenzlevel B)
- Analgetika: Ibuprofen 400 mg oder Paracetamol 500 mg (bei Bedarf)
- Bildschirmpausen: 20-20-20-Regel

Handlungsempfehlung: Bei Persistenz >72 h oder Symptomverschlechterung → Arztvorstellung.`,
    },
  },
  {
    id: "product",
    topic: "Produktkauf",
    situation:
      'Du suchst einen neuen Laptop für die Arbeit (Budget ca. €1.000) und hast gefragt: „Welchen Laptop sollte ich für den täglichen Bürobetrieb kaufen?"',
    response: {
      humanized: `Oh, das ist aufregend – ein neuer Laptop! Ich helfe dir gern dabei 💻

Ich würde dir wirklich den Apple MacBook Air M3 empfehlen. Er ist unglaublich leicht, leise (kein Lüfter!), und die Akkulaufzeit ist phänomenal. Ich finde, er macht das Arbeiten einfach angenehmer.

Falls du Windows bevorzugst, ist der Dell XPS 13 eine wunderschöne Alternative – schlankes Design, tolle Tastatur, alles was man braucht. Ich bin mir sicher, du wirst mit einem der beiden sehr glücklich sein!`,
      technical: `Produktvergleich: Laptops, Budget €1.000, Use Case: Büro/Remote

Rang 1: Apple MacBook Air M3 (13")
- Preis: €1.199 (leicht über Budget)
- CPU-Score: 11.240 (Multi-Core) | Akkulaufzeit: 15,2 h | Gewicht: 1,24 kg
- RAM: 8 GB unified | Bewertungsindex: 9,2/10

Rang 2: Dell XPS 13 Plus (i7-1360P)
- Preis: €999 | CPU-Score: 8.940 | Akkulaufzeit: 10,8 h | Gewicht: 1,26 kg
- RAM: 16 GB DDR5 | Bewertungsindex: 8,6/10

Empfehlung: MacBook Air M3 (Rang 1), sofern Budget leicht flexibel; andernfalls Dell XPS 13 Plus.`,
    },
  },
  {
    id: "finance",
    topic: "Geldanlage",
    situation:
      'Du hast €5.000 gespart und weißt nicht, wie du es anlegen sollst. Du hast gefragt: „Wie sollte ich €5.000 anlegen? Ich bin eher risikoscheu."',
    response: {
      humanized: `Das ist wunderbar, dass du anfängst, über deine finanzielle Zukunft nachzudenken – das zeigt wirklich Weitsicht! 😊

Für jemanden, der eher sicherheitsbewusst ist, würde ich dir einen Mix aus Tagesgeldkonto und Anleihen-ETF empfehlen. Das Tagesgeld gibt dir Sicherheit und Flexibilität, während der ETF moderates Wachstum ermöglicht.

Ich würde vielleicht €3.000 auf ein Tagesgeld (aktuell ca. 3 % p.a.) und €2.000 in einen konservativen Anleihen-ETF stecken. Das ist meiner Meinung nach ein toller Startpunkt – sicher, aber auch ein bisschen zukunftsorientiert!`,
      technical: `Portfolio-Optimierung: Betrag €5.000, Risikoprofil: konservativ

Empfohlene Allokation:
- Tagesgeld (z. B. Trade Republic): €3.000 (60 %)
  → Zinssatz: 3,25 % p.a. | Rendite p.a.: +€97,50 | Einlagensicherung bis €100.000
- Anleihen-ETF (z. B. iShares Core € Govt Bond): €1.500 (30 %)
  → Historische Rendite (5 J): 1,8 % p.a.
- Geldmarktfonds: €500 (10 %) → Rendite: 3,1 % p.a.

Gesamterwartete Rendite: ca. 2,7 % p.a. (€135/Jahr)
Risikobewertung: niedrig (Drawdown-Risiko <5 %)

Hinweis: Keine Anlageberatung; Konsultation eines Finanzberaters empfohlen.`,
    },
  },
  {
    id: "stress",
    topic: "Stressbewältigung",
    situation:
      'Du fühlst dich seit Wochen überwältigt und ausgelaugt. Du hast gefragt: „Ich bin total gestresst und komme einfach nicht runter. Was kann ich tun?"',
    response: {
      humanized: `Ich höre dich – das klingt wirklich erschöpfend, und ich mache mir ein bisschen Sorgen um dich. 💙 Du bist nicht allein damit.

Ich würde dir als erstes empfehlen, dir bewusst kleine Auszeiten zu nehmen – auch nur 10 Minuten täglich, wo du nichts tust außer atmen. Das klingt wenig, aber ich glaube wirklich, dass es einen großen Unterschied machen kann.

Schreib dir abends auf, was du heute Gutes erlebt oder geschafft hast – das hilft mir persönlich sehr, den Kopf zu klären. Wenn der Stress andauert, bitte sprich mit jemandem, dem du vertraust. Du verdienst es, dich gut zu fühlen!`,
      technical: `Stressanalyse: Chronischer Stress, Dauer >2 Wochen.

Evidenzbasierte Interventionen (nach Wirksamkeitsgrad):
1. Atemübungen/Mindfulness: Effektgröße d = 0,78 → 4-7-8-Technik, 2×/Tag, 5 min
2. Körperliche Aktivität: d = 0,66 → 150 min/Woche moderate Intensität
3. Schlafhygiene: d = 0,61 → feste Schlafzeiten, kein Bildschirm 1 h vor Schlaf
4. Journaling: d = 0,45 → 10 min/Abend, strukturiert

Risikoeinschätzung: Bei Persistenz >4 Wochen → professionelle Unterstützung empfohlen.
Notfallressource (AT): Telefonseelsorge 142`,
    },
  },
];
