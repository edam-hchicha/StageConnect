const express = require('express');
const router = express.Router();

const jobController = require('../controllers/jobController');
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- ROUTE ENTREPRISE (Mes offres) ---
// ⚠️ À placer OBLIGATOIREMENT avant /:id
router.get('/company/me', authMiddleware, jobController.getCompanyJobs);

// --- ROUTES PUBLIQUES ---
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// --- ROUTES ÉTUDIANT (IA & CV) ---
router.post('/upload-cv', authMiddleware, upload.single('cv'), matchController.uploadCv);
router.get('/:jobId/match', authMiddleware, matchController.getMatchWithJob);

// --- ROUTES RECRUTEUR / ADMIN ---
router.post('/', authMiddleware, jobController.createJob);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);
//affichage ds offres pour company
router.get('/company/me', authMiddleware, jobController.getCompanyJobs);
module.exports = router;