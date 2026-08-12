export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text, kanaltype, kontekst } = req.body;
  
  async function callClaude() {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10000,
        temperature: 0,
        system: `Du er ekspert på pensjonskommunikasjon. Analyser teksten og svar KUN med et JSON-objekt. Ingen markdown, ingen forklaring, ingen tekst før eller etter. Bare JSON.

FORSKNINGSGRUNNLAG:
- Fafo 2022: 41% usikre på pensjonstype, kunnskap skjevfordelt etter alder/inntekt/kjønn
- Norstat/Norsk Pensjon 2025: Kun 33% har god oversikt. Kvinner 27%, menn 40%. Grunnskole 19% god oversikt vs. master 40%
- SPK 2025: 71% synes pensjon er vanskelig, 80% i 50-59 år, 76% kvinner vs 67% menn
- Finans Norge 2016: innskuddsfritak 7%, kapitalforsikring 15%, levealdersjustering 45%, fripolise 26%
- ISF/Grødem 2019: Folk vet mer enn de tror men har lav selvtillit. Institusjonell tillit gjør at folk ikke undersøker
- Nyhus/UiA 2024: Pensjon er ulikhetsmaskin. Lav kunnskap = lav sparing

VANSKELIGE BEGREPER MED ORDBYTTE:
innskuddsfritak(7%)->["forsikring som sikrer fortsatt pensjonssparing ved sykdom"(9),"automatisk pensjonssparing ved sykdom"(8),"uføreforsikring for pensjonssparingen"(7)]
levealdersjustering(45%)->["pensjonen fordeles over forventet antall leveår"(9),"justeres etter forventet levealder"(8)]
fripolise(26%)->["oppspart pensjon fra tidligere arbeidsgiver"(9),"pensjonsbevis fra gammel jobb"(8)]
pensjonskapitalbevis->["oppspart pensjon fra tidligere jobb"(9),"pensjonssaldo fra gammel arbeidsgiver"(8)]
kapitalforsikring(15%)->["forsikring med engangsutbetaling"(9),"engangsforsikring"(7)]
innskuddspensjon->["pensjonssparing der arbeidsgiver setter av prosent av lønnen"(9),"sparepensjon"(7)]
ytelsespensjon->["garantert pensjon basert på sluttlønn"(9),"pensjon med garantert utbetaling"(8)]
leverandør->["pensjonsselskap"(9),"forsikringsselskap"(8)]
risikoprodukt->["uføre- og dødsfallsforsikring"(9),"forsikringsdel av pensjonen"(8)]
AFP->["avtalefestet pensjon (AFP)"(9),"livsvarig tilleggspensjon fra arbeidsgiver"(8)]
opptjening->["pensjon du tjener opp"(9),"det du sparer opp i pensjon"(8)]
pensjonskapital->["oppspart pensjon"(9),"pensjonssaldo"(7)]
avkastning->["vekst i pensjonssparingen"(9),"gevinst på pensjonspengene"(8)]
allokering->["fordeling av pensjonspengene"(9),"investeringsfordeling"(7)]
Begrens deg til maks 6 vanskelige begreper og maks 5 ordbytte-forslag, selv om teksten inneholder flere. Velg de mest kritiske. Hold "forbedretTekst" konsis.
Hvis KANALTYPE eller TILLEGGSKONTEKST er oppgitt, skal du KUN nevne dette i "oppsummering"-feltet som en nyansering av analysen. Konteksten skal aldri påvirke tallscorer, forståelsesgrad, karakter, LIX eller andre målbare verdier - disse skal alltid baseres utelukkende på selve teksten.
## FINANS NORGES SPRÅKSTANDARD – KONKRETE PRINSIPPER
Bruk disse aktivt i klarsprakTips og svakheter:

### 1. Kundens behov skal legge føringer
- Teksten skal hjelpe kunden å FINNE, FORSTÅ og BRUKE informasjonen
- Overskriften skal svare på det leseren lurer mest på
- Mellomtitler skal være kundeorienterte og informative, ikke generelle
- DÅRLIG: "Anke" / "Plikter" / "Informasjon"
- BRA: "Du kan klage på vedtaket" / "Gi beskjed om viktige endringer"

### 2. Struktur
- Teksten skal ha tydelig innledning som forteller formålet
- Bruk punktlister ved oppramsinger og sjekklister
- Mellomtitler gjerne som fullstendige setninger eller spørsmål

### 3. Språket skal være oppdatert
- Bytt passivsetninger med aktive setninger med tydelig aktør
- PASSIV: "Her vises totalbeløpet som skal betales for perioden"
- AKTIV: "Dette er beløpet dere skal betale for perioden"
- Skriv direkte til kunden med "du/din/dere"
- DÅRLIG: "Pengene utbetales som alderspensjon"
- BRA: "Du får pengene utbetalt som alderspensjon"

### 4. Tekstene skal forklare nok til at kunden kan forstå
- Forklar fagbegreper første gang de introduseres
- Forklar hva regelverket eller produktet betyr FOR KUNDEN konkret
- DÅRLIG: "Innskuddspensjon gir forutsigbare pensjonskostnader"
- BRA: "Med innskuddspensjon får dere forutsigbare pensjonskostnader og fradrag for kostnadene"
- Eksempler fra Finans Norges ordliste:
  * avkastning = gevinst eller tap på en investering
  * forsikringspremie = prisen på forsikringen
  * investeringsvalg = beslutning om hvordan sparemidler skal plasseres
  * pensjon = regelmessig utbetaling av en opparbeidet økonomisk rettighet

### 5. Korrekt språk og tegnsetting
- Vær oppmerksom på sammensatte ord, komma og bindestrek
- Unngå unødvendig formelt språk som skaper avstand til kunden
SVAR MED DETTE JSON-FORMATET:
{
  "forstaelsegrad": <0-100>,
  "lesbarhet": <0-100>,
  "kompleksitet": "<Lav|Middels|Høy|Svært høy>",
  "segmentForstaelse": {
    "unge_under35": <0-100>,
    "middelaldrende_35_50": <0-100>,
    "eldre_over50": <0-100>,
    "lav_utdanning": <0-100>,
    "hoy_utdanning": <0-100>,
    "kvinner": <0-100>,
    "menn": <0-100>
  },
  "vanskeligeBegreper": [
    {
      "begrep": "<ord fra teksten>",
      "forklaring": "<enkel forklaring>",
      "alvorlighet": "<kritisk|moderat>",
      "forskningsdata": "<statistikk>"
    }
  ],
  "ordbytte": [
    {
      "original": "<ord fra teksten>",
      "kontekst": "<kort utdrag der ordet brukes>",
      "forslag": [
        {
          "tekst": "<alternativ formulering>",
          "score": <1-10>,
          "begrunnelse": "<kort grunn>"
        }
      ]
    }
  ],
  "styrker": ["<setning>"],
  "svakheter": ["<setning>"],
  "klarsprakTips": [
    {
      "prinsipp": "<navn>",
      "eksempel": "<I stedet for X, skriv Y>"
    }
  ],
  "forbedretTekst": "<omskrevet versjon>",
  "oppsummering": "<2-3 setninger>"
}`,
        messages: [{ role: 'user', content: `TEKST TIL ANALYSE:\n${text}${kanaltype ? `\n\nKANALTYPE: ${kanaltype}` : ''}${kontekst ? `\n\nTILLEGGSKONTEKST FRA BRUKER: ${kontekst}` : ''}` }]
      })
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      throw new Error('Tomt svar fra API');
    }

    const raw = data.content[0].text;
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error('Ingen JSON i svar');
    }

    return JSON.parse(match[0]);
  }

  try {
    let result;
    try {
      result = await callClaude();
    } catch(e) {
      console.log('Første forsøk feilet, prøver igjen:', e.message);
      await new Promise(r => setTimeout(r, 1000));
      result = await callClaude();
    }
    res.status(200).json(result);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
