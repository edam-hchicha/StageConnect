const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const calculateMatchScore = async (cvText, jobDescription) => {
  try {
    const prompt = `
Tu es un expert en recrutement technique. Compare le CV de l'étudiant avec l'offre de stage.

[CV de l'étudiant]
${cvText}

[Offre de stage]
${jobDescription}

Génère une analyse au format JSON exact suivant :
{
  "score": <nombre entre 0 et 100>,
  "summary": "<court résumé explicatif en français>",
  "matchingSkills": ["<compétence 1>", "<compétence 2>"],
  "missingSkills": ["<compétence manquante 1>", "<compétence manquante 2>"],
  "recommendations": "<conseils d'amélioration pour l'étudiant>"
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Tu es un assistant RH technique. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content);

  } catch (error) {
    console.error("Erreur d'analyse Groq :", error);
    throw new Error("Erreur lors de l'analyse IA : " + error.message);
  }
};

module.exports = calculateMatchScore;