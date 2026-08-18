/**
 * Calcule le pourcentage de compatibilité entre un étudiant et un poste (0 - 100%)
 */
function calculateMatchScore(student, job) {
  if (!student || !job) return 0;

  let score = 0;

  // 🌟 On récupère le texte du CV lu en mémoire par Node.js
  const cvText = (student.cv_text || '').toLowerCase();

  const studentSkills = Array.isArray(student.skills) 
    ? student.skills.map(s => String(s).toLowerCase().trim()) 
    : [];
  const jobSkills = Array.isArray(job.skills) 
    ? job.skills.map(s => String(s).toLowerCase().trim()) 
    : [];

  // 1. MATCHING DES COMPÉTENCES (50 points max)
  if (jobSkills.length > 0) {
    let matchedCount = 0;

    jobSkills.forEach(jSkill => {
      const inSkillsArray = studentSkills.some(sSkill => sSkill.includes(jSkill) || jSkill.includes(sSkill));
      const inCvText = cvText.length > 0 && cvText.includes(jSkill);

      if (inSkillsArray || inCvText) matchedCount++;
    });

    const skillRatio = matchedCount / jobSkills.length;
    score += Math.min(skillRatio * 50, 50);
  }

  // 2. CORRESPONDANCE TEXTUELLE DES DESCRIPTIFS / DIPLÔME / CV (25 points max)
  const studentText = `${cvText} ${student.degree || ''} ${student.domain || ''} ${studentSkills.join(' ')}`.toLowerCase();
  const jobText = `${job.title || ''} ${job.description || ''}`.toLowerCase();

  const stopWords = new Set([
    'dans', 'avec', 'pour', 'nous', 'vous', 'votre', 'notre', 'plus', 'cette', 
    'stage', 'pfe', 'recherchons', 'travail', 'expérience', 'projet', 'missions'
  ]);

  const getKeywords = (text) => {
    const matches = text.match(/\b[a-z0-9+#.-]{2,}\b/gi) || [];
    return matches.filter(word => !stopWords.has(word));
  };

  const jobKeywords = [...new Set(getKeywords(jobText))];
  const studentKeywords = new Set(getKeywords(studentText));

  if (jobKeywords.length > 0) {
    let commonKeywordsCount = 0;
    jobKeywords.forEach(word => {
      if (studentKeywords.has(word)) commonKeywordsCount++;
    });

    const relevantSample = Math.min(jobKeywords.length, 10);
    const textRatio = Math.min(commonKeywordsCount / relevantSample, 1);
    score += textRatio * 25;
  }

  // 3. VILLE / LOCALISATION (15 points max)
  const studentLoc = (student.location || '').toLowerCase().trim();
  const jobLoc = (job.location || '').toLowerCase().trim();

  if (jobLoc && studentLoc) {
    if (
      jobLoc.includes(studentLoc) ||
      studentLoc.includes(jobLoc) ||
      jobLoc.includes('remote') ||
      jobLoc.includes('télétravail') ||
      jobLoc.includes('hybride')
    ) {
      score += 15;
    }
  } else if (jobLoc.includes('remote') || jobLoc.includes('télétravail')) {
    score += 15;
  }

  // 4. DOMAINE D'ÉTUDE OU DE SPÉCIALITÉ (10 points max)
  const domain = (student.domain || '').toLowerCase().trim();
  const title = (job.title || '').toLowerCase().trim();

  if (domain && title) {
    if (title.includes(domain) || domain.includes(title)) {
      score += 10;
    }
  }

  return Math.round(Math.min(score, 100));
}

module.exports = { calculateMatchScore };