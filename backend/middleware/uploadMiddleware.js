const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assure l'existence du dossier de destination uploads/cvs
const uploadDir = path.join(__dirname, '../uploads/cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

// Filtre de sécurité : Vérification du type MIME et de l'extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === 'application/pdf' && ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers au format PDF sont autorisés !'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite fixée à 5 Mo
});

module.exports = upload;