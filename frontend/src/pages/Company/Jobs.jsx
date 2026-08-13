import React, { useEffect, useState } from 'react';
// 1. Remplacement de getAllJobs par getCompanyJobs
import { getCompanyJobs, createJob, updateJob, deleteJob } from '../../services/api';
import { Link } from 'react-router-dom';

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Formulaire pour Créer / Modifier une offre
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: ''
  });

  // 2. Récupération uniquement des offres appartenant à l'entreprise
  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const res = await getCompanyJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des offres :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  // Ouvrir la modale pour Ajouter une offre
  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setFormData({ title: '', description: '', location: '', duration: '' });
    setShowModal(true);
  };

  // Ouvrir la modale pour Modifier une offre
  const handleOpenEditModal = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      duration: job.duration || ''
    });
    setShowModal(true);
  };

  // Soumission du formulaire (Création ou Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        await updateJob(editingJobId, formData);
        alert("🎉 Offre modifiée avec succès !");
      } else {
        await createJob(formData);
        alert("🎉 Offre publiée avec succès !");
      }
      setShowModal(false);
      fetchCompanyJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Une erreur est survenue.");
    }
  };

  // Supprimer une offre
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await deleteJob(id);
        setJobs(jobs.filter(job => job.id !== id));
        alert("Offre supprimée.");
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête avec Actions Entreprise */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion de mes Offres de Stage</h1>
          <p className="text-sm text-gray-500">Créez et gérez vos annonces pour recruter des stagiaires.</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/company/applications"
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold rounded-lg border border-indigo-200 transition"
          >
            📥 Voir les Candidatures Reçues
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Publier une Offre
          </button>
        </div>
      </div>

      {/* Liste des Offres Publiées par l'Entreprise */}
      {loading ? (
        <p className="text-center py-8 text-gray-500">Chargement de vos offres...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center border shadow-sm">
          <p className="text-gray-500 mb-4">Vous n'avez encore publié aucune offre de stage.</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Publier votre première offre
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-800">{job.title}</h2>
                  {job.duration && (
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                      ⏱️ {job.duration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mb-2">📍 Ville : {job.location || 'Non renseignée'}</p>
                <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>
              </div>

              {/* Actions réservées à l'Entreprise */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => handleOpenEditModal(job)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 transition"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100 transition"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE DE CRÉATION / MODIFICATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              {editingJobId ? "✏️ Modifier l'Offre" : "➕ Publier une Nouvelle Offre"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Développeur Fullstack React / Node"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville / Lieu *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Tunis, Sfax..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 3 mois, 6 mois"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description du poste *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Missions, technologies utilisées, profil recherché..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  {editingJobId ? "Mettre à jour" : "Publier l'offre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyJobs;