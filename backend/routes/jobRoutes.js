const express = require('express');
const router = express.Router();

const jobController = require('../controllers/jobController');
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- ROUTES PUBLIQUES ---
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// --- ROUTES ÉTUDIANT (IA & CV) ---
// Upload du CV en PDF
router.post('/upload-cv', authMiddleware, upload.single('cv'), matchController.uploadCv);

// Calcul de compatibilité IA pour une offre spécifique
router.get('/:jobId/match', authMiddleware, matchController.getMatchWithJob);

// --- ROUTES RECRUTEUR / ADMIN ---
router.post('/', authMiddleware, jobController.createJob);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;