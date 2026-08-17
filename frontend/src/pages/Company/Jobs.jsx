import React, { useEffect, useMemo, useState } from 'react';
import { getCompanyJobs, createJob, updateJob, deleteJob } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Briefcase, Plus, Inbox, MapPin, Clock, Pencil, Trash2, X, MapPinned, PackageOpen,
} from 'lucide-react';

const theme = {
  canvas: '#F5F6F3',
  ink: '#122621',
  inkSoft: '#3E4F49',
  muted: '#657A73',
  primary: '#1E6F58',
  primaryDark: '#154C3D',
  primaryTint: '#E6F1EC',
  amber: '#B9752B',
  amberTint: '#FBF0E1',
  danger: '#9C4238',
  dangerTint: '#F8ECEA',
  border: '#E1E5E0',
};

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
  });

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const res = await getCompanyJobs();
      setJobs(res.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des offres :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const stats = useMemo(() => {
    const uniqueLocations = new Set(
      jobs.map((j) => (j.location || '').trim().toLowerCase()).filter(Boolean)
    );
    return { total: jobs.length, locations: uniqueLocations.size };
  }, [jobs]);

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setFormData({ title: '', description: '', location: '', duration: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      duration: job.duration || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        await updateJob(editingJobId, formData);
        alert('Offre modifiée avec succès.');
      } else {
        await createJob(formData);
        alert('Offre publiée avec succès.');
      }
      setShowModal(false);
      fetchCompanyJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await deleteJob(id);
        setJobs(jobs.filter((job) => job.id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
        <div className="h-9 w-9 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
        <p className="text-sm font-medium" style={{ color: theme.muted }}>Chargement de vos offres…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sc-display { font-family: 'Sora', sans-serif; }
        .sc-card { position: relative; overflow: hidden; }
        .sc-divider { position: relative; border-top: 1.5px dashed ${theme.border}; margin: 0 -1.5rem; }
        .sc-divider::before, .sc-divider::after {
          content: ''; position: absolute; top: -8px; width: 16px; height: 16px;
          border-radius: 999px; background: ${theme.canvas};
        }
        .sc-divider::before { left: -8px; }
        .sc-divider::after { right: -8px; }
        .sc-input:focus { outline: none; border-color: ${theme.primary}; box-shadow: 0 0 0 3px ${theme.primaryTint}; }
        .sc-fade-in { animation: scFadeIn .16s ease-out; }
        @keyframes scFadeIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-2xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-5" style={{ backgroundColor: theme.primaryDark }}>
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Briefcase className="w-6 h-6" style={{ color: '#F2E9D8' }} />
            </div>
            <div>
              <h1 className="sc-display text-2xl font-bold text-white tracking-tight">Gestion de mes offres de stage</h1>
              <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Publiez, modifiez et suivez vos annonces pour recruter vos futurs stagiaires.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/company/applications"
              className="px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
            >
              <Inbox className="w-4 h-4" />
              <span>Candidatures reçues</span>
            </Link>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: theme.amber, color: '#2A1B08' }}
            >
              <Plus className="w-4 h-4" />
              <span>Publier une offre</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl flex items-center gap-4" style={{ border: `1px solid ${theme.border}` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Offres publiées</p>
              <p className="sc-display text-xl font-bold" style={{ color: theme.ink }}>{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl flex items-center gap-4" style={{ border: `1px solid ${theme.border}` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.amberTint, color: theme.amber }}>
              <MapPinned className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Villes couvertes</p>
              <p className="sc-display text-xl font-bold" style={{ color: theme.ink }}>{stats.locations}</p>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto" style={{ border: `1px solid ${theme.border}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="sc-display text-lg font-bold mb-1.5" style={{ color: theme.ink }}>Aucune offre publiée</h3>
            <p className="text-sm mb-6" style={{ color: theme.muted }}>
              Vous n'avez pas encore créé d'offre de stage. Votre première annonce n'attend qu'à être publiée.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer"
              style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
            >
              Publier votre première offre
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="sc-card bg-white rounded-2xl p-6 flex flex-col justify-between"
                style={{ border: `1px solid ${theme.border}`, borderLeft: `4px solid ${theme.primary}` }}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="sc-display text-base font-bold leading-snug line-clamp-2" style={{ color: theme.ink }}>{job.title}</h2>
                    {job.duration && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: theme.amberTint, color: theme.amber }}>
                        <Clock className="w-3 h-3" />
                        {job.duration}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: theme.muted }}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {job.location || 'Localisation non renseignée'}
                  </p>
                </div>

                <div className="sc-divider mt-4 pt-4">
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: theme.inkSoft }}>{job.description}</p>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <button
                    onClick={() => handleOpenEditModal(job)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: theme.primaryTint, color: theme.primaryDark }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: theme.dangerTint, color: theme.danger }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center p-4 z-50" style={{ backgroundColor: 'rgba(18, 38, 33, 0.55)' }}>
            <div className="sc-fade-in bg-white rounded-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center" style={{ backgroundColor: theme.primaryDark }}>
                <h3 className="sc-display text-base font-bold text-white flex items-center gap-2.5">
                  {editingJobId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingJobId ? "Modifier l'offre" : 'Publier une nouvelle offre'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                    Titre du poste <span style={{ color: theme.danger }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Développeur Fullstack React / Node"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="sc-input w-full px-3.5 py-2.5 rounded-xl text-sm transition"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                      Ville / Lieu <span style={{ color: theme.danger }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Tunis, Sfax…"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="sc-input w-full px-3.5 py-2.5 rounded-xl text-sm transition"
                      style={{ border: `1px solid ${theme.border}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                      Durée <span style={{ color: theme.danger }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: 3 mois, 6 mois"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="sc-input w-full px-3.5 py-2.5 rounded-xl text-sm transition"
                      style={{ border: `1px solid ${theme.border}` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                    Description du poste <span style={{ color: theme.danger }}>*</span>
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Missions, technologies utilisées, profil recherché…"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="sc-input w-full px-3.5 py-2.5 rounded-xl text-sm transition resize-none"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold transition"
                    style={{ border: `1px solid ${theme.border}`, color: theme.inkSoft }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl transition"
                    style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                  >
                    {editingJobId ? 'Mettre à jour' : "Publier l'offre"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobs;
