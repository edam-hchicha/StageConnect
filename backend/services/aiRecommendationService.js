const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const recommendJobsForStudent = async (cvText, jobs) => {
  // Simplification des offres pour optimiser la consommation de tokens
  const jobsSummary = jobs.map(j => ({
    jobId: j.id,
    title: j.title,
    company: j.company_name || 'Entreprise',
    description: j.description,
    requirements: j.requirements
  }));

  const prompt = `
Tu es un moteur de recommandation IA pour une plateforme de stages.

CV DE L'ÉTUDIANT :
${cvText}

LISTE DES OFFRES DE STAGE DISPONIBLES :
${JSON.stringify(jobsSummary, null, 2)}

Mission :
1. Analyse le profil de l'étudiant par rapport à TOUTES les offres reçues.
2. Calcule un score de compatibilité (0 à 100%) pour chaque offre.
3. Sélectionne uniquement les meilleures offres (compatibilité >= 50%).
4. Trie les résultats du meilleur au moins bon score.

Réponds UNIQUEMENT au format JSON strict avec cette structure :
{
  "recommendations": [
    {
      "jobId": 1,
      "title": "Développeur Fullstack React/Node",
      "company_name": "Tech Corp",
      "match_score": 87,
      "matching_skills": ["Node.js", "JavaScript", "SQL"],
      "reason": "Le profil possède de solides bases en backend JS avec Node.js correspondant parfaitement au besoin principal."
    }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = recommendJobsForStudent;