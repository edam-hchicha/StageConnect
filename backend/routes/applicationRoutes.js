const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// ROUTES CANDIDATURES (APPLICATIONS)
// ==========================================

// 1. Étudiant : Postuler à une offre (Reçoit uniquement du JSON : { jobId, coverLetter })
router.post('/apply', authMiddleware, applicationController.applyForJob);
router.post('/', authMiddleware, applicationController.applyForJob); // Alias pour compatibilité

// 2. Étudiant : Consulter l'historique de ses candidatures envoyées
router.get('/student', authMiddleware, applicationController.getStudentApplications);

// 3. Entreprise : Consulter les candidatures reçues
router.get('/company', authMiddleware, applicationController.getCompanyApplications);

// 4. Entreprise : Mettre à jour le statut (Accepter / Refuser)
router.put('/:id/status', authMiddleware, applicationController.updateApplicationStatus);
router.put('/:id/respond', authMiddleware, applicationController.respondToApplication);

module.exports = router;