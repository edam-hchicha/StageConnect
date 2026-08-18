const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const extractTextFromPDF = require('../utils/pdfExtractor');
const calculateMatchScore = require('../services/aiMatcher');

// Liste des compétences clés à détecter automatiquement dans le PDF du CV
const KNOWN_SKILLS = [
  'React', 'React.js', 'Node.js', 'Node', 'Express', 'JavaScript', 'JS', 'TypeScript',
  'Python', 'Java', 'C++', 'C#', 'PHP', 'Laravel', 'Symfony', 'HTML', 'CSS', 'Tailwind',
  'Bootstrap', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'Git',
  'GitHub', 'Figma', 'Agile', 'Scrum', 'DevOps', 'AWS', 'Azure', 'Angular', 'Vue',
  'Flutter', 'React Native', 'Génie Civil', 'AutoCAD', 'Machine Learning', 'IA'
];

// Helper interne pour extraire la liste de skills à partir du texte
const parseSkillsFromCvText = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();

  return KNOWN_SKILLS.filter(skill => {
    const escapedSkill = skill.toLowerCase().replace('.', '\\.');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    return regex.test(lowerText);
  });
};

// 1. Enregistrer le CV d'un étudiant + Extraire les compétences pour l'IA
exports.uploadCv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Veuillez fournir un fichier PDF." });
    }

    const userId = req.user?.profile_id || req.user?.id || req.user?.user_id;

    // Normalisation du chemin d'accès au fichier
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fullCvPath = path.resolve(req.file.path);

    // 🌟 1. EXTRACTION DU TEXTE DU CV ET DES COMPÉTENCES
    let extractedSkills = [];
    try {
      const cvText = await extractTextFromPDF(fullCvPath);
         // 🔍 VÉRIFICATION EN CONSOLE backend
console.log("----------------------------------------");
console.log("📄 Longueur du texte extrait :", cvText ? cvText.length : 0, "caractères");
console.log("📝 Aperçu du texte :", cvText.substring(0, 150) + "...");
console.log("🎯 Compétences détectées :", extractedSkills);
console.log("----------------------------------------");
      extractedSkills = parseSkillsFromCvText(cvText);
    } catch (parseErr) {
      console.warn("Avertissement : Erreur lors de l'extraction textuelle du PDF :", parseErr.message);
    }

    const skillsJson = JSON.stringify([...new Set(extractedSkills)]);

    // 🌟 2. MISE À JOUR DE cv_url ET DE skills DANS LA BDD
    await db.query(
      'UPDATE student_profiles SET cv_url = ?, skills = ? WHERE user_id = ? OR id = ?', 
      [relativePath, skillsJson, userId, userId]
    );

    res.status(200).json({ 
      message: "CV téléversé et analysé avec succès !", 
      cv_url: relativePath,
      skillsDetected: extractedSkills
    });

  } catch (error) {
    console.error("Erreur uploadCv :", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Calculer la compatibilité détaillée avec une offre spécifique
exports.getMatchWithJob = async (req, res) => {
  try {
    const userId = req.user?.profile_id || req.user?.id || req.user?.user_id;
    const { jobId } = req.params;

    // Récupérer le CV depuis la colonne cv_url
    const [students] = await db.query(
      'SELECT cv_url FROM student_profiles WHERE user_id = ? OR id = ?', 
      [userId, userId]
    );

    if (students.length === 0 || !students[0].cv_url) {
      return res.status(400).json({ message: "Veuillez d'abord télécharger un CV dans votre profil." });
    }

    // Récupérer l'offre de stage
    const [jobs] = await db.query(
      'SELECT title, description, skills FROM jobs WHERE id = ?', 
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Offre de stage introuvable." });
    }

    const job = jobs[0];
    const jobDescription = `Titre: ${job.title}\nDescription: ${job.description}\nCompétences: ${job.skills || ''}`;

    // Résolution du chemin absolu du fichier PDF
    const cleanRelativePath = students[0].cv_url.replace(/\\/g, '/');
    const fullCvPath = path.resolve(cleanRelativePath);

    // Vérifier si le fichier existe physiquement
    if (!fs.existsSync(fullCvPath)) {
      return res.status(400).json({ message: "Fichier CV introuvable sur le serveur. Veuillez ré-uploader votre CV." });
    }

    // Extraction du texte et calcul de la compatibilité via le service AI
    const cvText = await extractTextFromPDF(fullCvPath);
    const matchAnalysis = await calculateMatchScore(cvText, jobDescription);

    res.status(200).json({
      jobId: Number(jobId),
      ...matchAnalysis
    });

  } catch (error) {
    console.error("Erreur getMatchWithJob :", error);
    res.status(500).json({ error: error.message });
  }
};