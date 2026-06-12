export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text } = req.body;
  
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
        max_tokens: 3000,
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
        messages: [{ role: 'user', content: text }]
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
