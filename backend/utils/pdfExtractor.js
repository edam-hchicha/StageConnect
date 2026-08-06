const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    console.log("🔍 Extraction du texte avec pdf2json à :", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return reject(new Error(`Fichier introuvable sur le disque : ${absolutePath}`));
    }

    // Le paramètre 1 active l'extraction de texte pur
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(new Error("Erreur de lecture PDF : " + (errData.parserError || errData)));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      const extractedText = pdfParser.getRawTextContent();
      if (!extractedText || !extractedText.trim()) {
        return reject(new Error("Aucun texte n'a pu être extrait du PDF."));
      }
      resolve(extractedText);
    });

    pdfParser.loadPDF(absolutePath);
  });
};

module.exports = extractTextFromPDF;