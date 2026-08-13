import React, { useEffect, useState } from 'react';
import { getAllJobs, applyToJob, getStudentApplications } from '../../services/api';
import { Link } from 'react-router-dom';

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ keyword: '', location: '' });

  // États pour la fenêtre (Modale) de postulation
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger les offres ET les candidatures déjà effectuées
  const fetchJobsAndApplications = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        getAllJobs(search),
        getStudentApplications().catch(() => ({ data: [] })) // Sécurité si non connecté
      ]);
      setJobs(jobsRes.data);
      // Récupérer la liste des ID de jobs déjà postulés ex: [1, 4, 12]
      setAppliedJobIds(appsRes.data.map(app => app.job_id));
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobsAndApplications();
    }, 300);
    return () => clearTimeout(timer);
  }, [search.keyword, search.location]);

  // Envoi de la candidature au backend
  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      alert("Veuillez joindre votre CV au format PDF.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('job_id', selectedJob.id);
      formData.append('cover_letter', coverLetter);
      formData.append('cv', cvFile); // Champ lu par Multer côté backend

      await applyToJob(formData);
      alert("🎉 Candidature envoyée avec succès !");

      // Ajouter l'ID du job à la liste des offres postulées
      setAppliedJobIds([...appliedJobIds, selectedJob.id]);

      // Réinitialiser et fermer la modale
      setSelectedJob(null);
      setCoverLetter('');
      setCvFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* 🚀 EN-TÊTE AVEC BOUTON DE NAVIGATION */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Offres de Stage Disponibles</h1>
        <Link
          to="/student/applications"
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition flex items-center gap-2 shadow-sm"
        >
          📋 Mes Candidatures
        </Link>
      </div>

      {/* Barre de Recherche Dynamique */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <input
          type="text"
          placeholder="🔍 Recherche par poste (ex: React, Node...)"
          value={search.keyword}
          onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
          className="flex-1 p-2.5 border rounded-lg min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="📍 Filtre par ville (ex: Tunis, Sfax...)"
          value={search.location}
          onChange={(e) => setSearch({ ...search, location: e.target.value })}
          className="flex-1 p-2.5 border rounded-lg min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste des Offres */}
      {loading ? (
        <p className="text-center py-8 text-gray-500">Recherche en cours...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Aucune offre ne correspond à votre recherche.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job.id);

            return (
              <div key={job.id} className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-600">{job.title}</h2>
                    <p className="text-sm text-gray-500 font-medium">
                      🏢 {job.company_name} • 📍 {job.location || 'Non spécifié'}
                    </p>
                  </div>
                  {job.duration && (
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">
                      ⏱️ {job.duration}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm my-3">{job.description}</p>
                
                {/* Bouton Dynamique */}
                {hasApplied ? (
                  <button disabled className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded cursor-not-allowed border border-green-300">
                    ✅ Déjà postulé
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                  >
                    Postuler
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE DE POSTULATION SURGISSANTE */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              Postuler : <span className="text-blue-600">{selectedJob.title}</span>
            </h3>
            <p className="text-sm text-gray-500">Entreprise : {selectedJob.company_name}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Joindre le CV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importer votre CV (PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="w-full p-2 border rounded-lg text-sm bg-gray-50"
                />
              </div>

              {/* Lettre de Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lettre de motivation (optionnelle)
                </label>
                <textarea
                  rows="4"
                  placeholder="Bonjour, je suis très intéressé par cette offre..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedJob(null); setCvFile(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Envoi en cours..." : "Envoyer la candidature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;