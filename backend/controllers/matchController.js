const db = require('../config/db');
const path = require('path');
const extractTextFromPDF = require('../utils/pdfExtractor');
const calculateMatchScore = require('../services/aiMatcher');

// 1. Enregistrer le CV d'un étudiant
exports.uploadCv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Veuillez fournir un fichier PDF." });
    }

    // req.file.path contient le chemin réel généré par Multer sur le disque
    const relativePath = req.file.path.replace(/\\/g, '/');

    await db.query('UPDATE student_profiles SET cv_url = ? WHERE user_id = ?', [relativePath, req.user.id]);

    res.status(200).json({ 
      message: "CV téléversé avec succès.", 
      cv_url: relativePath 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Calculer la compatibilité avec une offre
exports.getMatchWithJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Récupérer le CV depuis la colonne cv_url
    const [students] = await db.query('SELECT cv_url FROM student_profiles WHERE user_id = ?', [userId]);

    if (students.length === 0 || !students[0].cv_url) {
      return res.status(400).json({ message: "Veuillez d'abord télécharger un CV dans votre profil." });
    }

    // Récupérer l'offre de stage
    const [jobs] = await db.query('SELECT title, description, requirements FROM jobs WHERE id = ?', [jobId]);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Offre de stage introuvable." });
    }

    const job = jobs[0];
    const jobDescription = `Titre: ${job.title}\nDescription: ${job.description}\nExigences: ${job.requirements}`;

    // Nettoyage du chemin stocké et résolution absolue du fichier PDF
    const cleanRelativePath = students[0].cv_url.replace(/\\/g, '/');
    const fullCvPath = path.resolve(__dirname, '..', cleanRelativePath);

    // Extraction du texte et calcul de la compatibilité
    const cvText = await extractTextFromPDF(fullCvPath);
    const matchAnalysis = await calculateMatchScore(cvText, jobDescription);

    res.status(200).json({
      jobId: Number(jobId),
      ...matchAnalysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};