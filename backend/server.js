const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();

// Connexion BDD
require('./config/db');

const app = express();
const server = http.createServer(app);

// Initialisation de Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Ou l'URL exacte de votre frontend React (ex: "http://localhost:5173")
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware pour injecter `io` dans toutes les requêtes Express (permet d'utiliser req.io dans les contrôleurs)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares standards
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Accès public aux fichiers téléversés (CVs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Gestion des connexions temps réel via Socket.io
io.on('connection', (socket) => {
  console.log(`🔌 Client connecté à Socket.io : ${socket.id}`);

  // Permet à une entreprise de rejoindre son salon privé de notifications
  socket.on('join_company_room', (companyUserId) => {
    socket.join(`company_${companyUserId}`);
    console.log(`🏢 Entreprise #${companyUserId} a rejoint son canal de notifications.`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Déconnexion Socket.io : ${socket.id}`);
  });
});

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// 🔍 DIAGNOSTIC TEMPORAIRE : vérifier que chaque route est bien une fonction
// (à retirer une fois le bug corrigé)
console.log('--- Vérification des routes ---');
console.log('authRoutes:', typeof authRoutes);
console.log('userRoutes:', typeof userRoutes);
console.log('jobRoutes:', typeof jobRoutes);
console.log('applicationRoutes:', typeof applicationRoutes);
console.log('profileRoutes:', typeof profileRoutes);
console.log('notificationRoutes:', typeof notificationRoutes);
console.log('messageRoutes:', typeof messageRoutes);
console.log('--------------------------------');

// Déclaration des endpoints API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Route de santé
app.get('/', (req, res) => {
  res.send('API StageConnect opérationnelle ! 🚀');
});

const PORT = process.env.PORT || 5000;

// Utilisation de server.listen (au lieu d'app.listen) pour que Socket.io fonctionne
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Utilisateur ${userId} a rejoint la room user_${userId}`);
  });
});