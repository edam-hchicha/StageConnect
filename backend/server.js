const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Connexion BDD
require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Accès public aux fichiers téléversés (CVs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Déclaration des endpoints API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Route de santé
app.get('/', (req, res) => {
  res.send('API StageConnect opérationnelle ! 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});