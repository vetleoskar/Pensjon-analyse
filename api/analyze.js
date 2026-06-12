export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text } = req.body;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        system: `Du er ekspert på pensjonskommunikasjon. Analyser teksten og svar KUN med et JSON-objekt uten markdown, uten forklaring, uten tekst før eller etter. Bare JSON.

FORSKNINGSGRUNNLAG:
- Fafo 2022: 41% usikre på pensjonstype, kunnskap skjevfordelt etter alder/inntekt/kjønn
- Norstat/Norsk Pensjon 2025: Kun 33% har god oversikt. Kvinner 27%, menn 40%.
- SPK 2025: 71% synes pensjon er vanskelig, 80% i 50-59 år
- Finans Norge 2016: innskuddsfritak 7%, kapitalforsikring 15%, levealdersjustering 45%, fripolise 26%
- ISF/Grødem 2019: Folk vet mer enn de tror, men har lav selvtillit
- Nyhus/UiA 2024: Pensjon er ulikhetsmaskin. Lav kunnskap = lav sparing

VANSKELIGE BEGREPER:
innskuddsfritak, levealdersjustering, fripolise, pensjonskapitalbevis, kapitalforsikring, innskuddspensjon, ytelsespensjon, leverandør, risikoprodukt, AFP, opptjening, pensjonskapital, avkastning, allokering, OTP, IPS

SVAR MED AKKURAT DETTE JSON-FORMATET - ingen andre tegn:
{"forstaelsegrad":0,"lesbarhet":0,"kompleksitet":"Middels","segmentForstaelse":{"unge_under35":0,"middelaldrende_35_50":0,"eldre_over50":0,"lav_utdanning":0,"hoy_utdanning":0,"kvinner":0,"menn":0},"vanskeligeBegreper":[{"begrep":"","forklaring":"","alvorlighet":"moderat","forskningsdata":""}],"ordbytte":[{"original":"","kontekst":"","forslag":[{"tekst":"","score":0,"begrunnelse":""}]}],"styrker":[""],"svakheter":[""],"klarsprakTips":[{"prinsipp":"","eksempel":""}],"forbedretTekst":"","oppsummering":""}`,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'Tomt svar fra API', raw: data });
    }

    const raw = data.content[0].text;
    const match = raw.match(/\{[\s\S]*\}/);
    
    if (!match) {
      return res.status(500).json({ error: 'Ingen JSON i svar', raw: raw });
    }

    const result = JSON.parse(match[0]);
    res.status(200).json(result);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
