# 🎓 StageConnect

**StageConnect** est une plateforme web intelligente conçue pour mettre en relation les étudiants et les entreprises grâce à un algorithme de matching IA, un système de messagerie directe et des notifications automatisées par e-mail.

---

## 🚀 Fonctionnalités Principales

* **Authentification & Gestion des Rôles :** Connexion sécurisée (JWT) avec espaces personnalisés pour **Étudiants** et **Entreprises**.
* **🤖 Matching IA & Recommandations :** Algorithme intelligent qui analyse et associe automatiquement les profils étudiants aux offres de stage les plus pertinentes (compétences, domaine, niveau d'études).
* **💬 Messagerie Intégrée :** Chat direct entre étudiants et recruteurs pour échanger facilement après un matching ou une candidature.
* **📩 Notifications Automatiques par E-mail :** Envoi automatique d'un e-mail à l'étudiant lors de **l'acceptation ou du refus** de sa candidature par l'entreprise via Nodemailer.
* **👨‍🎓 Espace Étudiant :**
  * Édition du profil (coordonnées, université, diplôme, compétences).
  * Téléversement, remplacement et visualisation en direct du **CV (format PDF)** via Multer.
* **🏢 Espace Entreprise :**
  * Fiche entreprise (secteur, site web, description).
  * Publication d'offres, suivi des candidatures et recherche des profils recommandés par l'IA.

---

## 🛠️ Technologies Utilisées

* **Frontend :** React, Tailwind CSS, Axios, Lucide React (icônes).
* **Backend :** Node.js, Express.js, Multer (gestion des fichiers/CVs).
* **Intelligence Artificielle :** Algorithme de filtrage et scoring des compétences.
* **Envoi d'E-mails :** Nodemailer (SMTP).
* **Base de données :** MySQL.
* **Sécurité :** JSON Web Token (JWT), Bcrypt.

---

## 📂 Structure du Projet

```text
StageConnect/
├── backend/
│   ├── config/          # Connexion BDD MySQL & Config SMTP
│   ├── controllers/     # Logique métier (profile, matching, chat, application, auth)
│   ├── middleware/      # Auth JWT & Upload Multer
│   ├── routes/          # API Express (profile, matching, messages, applications, auth)
│   ├── services/        # Service d'envoi d'e-mails (Nodemailer)
│   ├── uploads/         # Stockage des fichiers PDF (CVs)
│   └── server.js        # Point d'entrée du serveur Node.js
└── frontend/
    ├── src/
    │   ├── components/  # Composants React (Chat, Navbar, etc.)
    │   ├── pages/       # Pages (Profile, Matching, Chat, Login, Applications)
    │   └── services/    # Configuration Axios (api.js)
    └── App.js
⚙️ Installation et Démarrage
1. Prérequis
Node.js (v18 ou supérieur)

MySQL Server

2. Lancement du Backend
Ouvrez un terminal dans le dossier backend et installez les dépendances :

Bash
cd backend
npm install
Créez un fichier .env dans le dossier backend :

Extrait de code
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=stageconnect_db
JWT_SECRET=votre_cle_secrete_jwt

# Configuration Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
Démarrez le serveur backend :

Bash
npm start
3. Lancement du Frontend
Ouvrez un autre terminal dans le dossier frontend et installez les dépendances :

Bash
cd frontend
npm install
Démarrez l'application React :

Bash
npm start
L'application sera accessible sur http://localhost:3000 et l'API backend sur http://localhost:5000.


---

**Action sur GitHub :**

1. Cliquez sur la ligne 1 dans l'écran blanc de GitHub (`Enter file contents here`).
2. Faites **Ctrl + V** pour tout coller.
3. Cliquez sur le bouton vert **Commit changes...** en haut à droite, puis validez.
