import React, { useEffect, useState } from 'react';
import { getStudentJobs, applyToJob, getStudentApplications } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Clock, Sparkles, ClipboardList, Building2,
  CheckCircle2, FileUp, X, Send, Loader2, Tag, Percent
} from 'lucide-react';
import api, { applyToJob as applyToJobAPI } from '../../services/api';
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
  border: '#E1E5E0',
};

// Helper pour parser les compétences (Tableau JS ou chaîne JSON/virgules)
const parseSkills = (skillsData) => {
  if (!skillsData) return [];
  if (Array.isArray(skillsData)) return skillsData;
  try {
    const parsed = JSON.parse(skillsData);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Si ce n'est pas du JSON, on découpe par virgule
  }
  return String(skillsData).split(',').map((s) => s.trim()).filter(Boolean);
};

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ keyword: '', location: '' });

  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger les offres personnalisées par l'IA et les candidatures existantes
  const fetchJobsAndApplications = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        getStudentJobs(), // Utilise la route IA avec calcul de matchScore et tri
        getStudentApplications().catch(() => ({ data: [] })),
      ]);
      setJobs(jobsRes.data || []);
      setAppliedJobIds((appsRes.data || []).map((app) => app.job_id));
    } catch (err) {
      console.error('Erreur de chargement :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  // Filtrage local dynamique réactif
  const filteredJobs = jobs.filter((job) => {
    const matchesKeyword =
      !search.keyword.trim() ||
      job.title?.toLowerCase().includes(search.keyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.keyword.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(search.keyword.toLowerCase());

    const matchesLocation =
      !search.location.trim() ||
      job.location?.toLowerCase().includes(search.location.toLowerCase());

    return matchesKeyword && matchesLocation;
  });

const handleApplySubmit = async (e) => {
  e.preventDefault();
  
  // 1. Extraction sécurisée de l'ID de l'offre (gère id, _id et job_id)
  const targetJobId = selectedJob?.id || selectedJob?._id || selectedJob?.job_id;

  if (!targetJobId) {
    alert("Impossible de récupérer l'identifiant de cette offre.");
    return;
  }

  setSubmitting(true);

  try {
    // 2. Envoi de la postulation
    await applyToJobAPI({
      jobId: targetJobId,
      coverLetter: coverLetter
    });

    alert("Votre candidature a été envoyée avec succès !");
    setSelectedJob(null); // Ferme la modale
    setCoverLetter('');   // Réinitialise le champ
  } catch (error) {
    console.error("Erreur lors de la postulation :", error);
    alert(error.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sc-display { font-family: 'Sora', sans-serif; }
        .sc-input:focus { outline: none; border-color: ${theme.primary}; box-shadow: 0 0 0 3px ${theme.primaryTint}; }
        .sc-card { position: relative; overflow: hidden; }
        .sc-divider { position: relative; border-top: 1.5px dashed ${theme.border}; margin: 0 -1.5rem; }
        .sc-divider::before, .sc-divider::after {
          content: ''; position: absolute; top: -8px; width: 16px; height: 16px;
          border-radius: 999px; background: ${theme.canvas};
        }
        .sc-divider::before { left: -8px; }
        .sc-divider::after { right: -8px; }
        .sc-fade-in { animation: scFadeIn .16s ease-out; }
        @keyframes scFadeIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-7">
        {/* En-tête */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>Offres recommandées par IA</h1>
              <p className="text-xs mt-0.5" style={{ color: theme.muted }}>Offres triées selon la compatibilité avec votre profil et vos compétences.</p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: theme.primaryDark, color: '#FFFFFF' }}
          >
            <ClipboardList className="w-4 h-4" />
            Mes candidatures
          </Link>
        </div>

        {/* Barre de recherche et de filtres */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl" style={{ border: `1px solid ${theme.border}` }}>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
            <input
              type="text"
              placeholder="Recherche par poste ou compétence (ex: React, Node...)"
              value={search.keyword}
              onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
              className="sc-input w-full pl-11 pr-3 py-2.5 rounded-xl text-sm transition"
              style={{ border: `1px solid ${theme.border}` }}
            />
          </div>
          <div className="relative flex-1 min-w-[220px]">
            <MapPin className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
            <input
              type="text"
              placeholder="Filtre par ville (ex: Tunis, Sfax...)"
              value={search.location}
              onChange={(e) => setSearch({ ...search, location: e.target.value })}
              className="sc-input w-full pl-11 pr-3 py-2.5 rounded-xl text-sm transition"
              style={{ border: `1px solid ${theme.border}` }}
            />
          </div>
        </div>

        {/* Liste des offres */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
            <p className="text-sm" style={{ color: theme.muted }}>Calcul du matching IA des offres en cours…</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto" style={{ border: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.muted }}>Aucune offre ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.includes(job.id);
              const skillsList = parseSkills(job.skills);
              const matchScore = job.matchScore !== undefined ? job.matchScore : 0;

              return (
                <div
                  key={job.id}
                  className="sc-card bg-white rounded-2xl p-6 flex flex-col justify-between space-y-4"
                  style={{ border: `1px solid ${theme.border}`, borderLeft: `4px solid ${theme.primary}` }}
                >
                  <div className="space-y-3">
                    {/* Badge Matching IA & Durée */}
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      {matchScore > 0 && (
                        <span
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: matchScore >= 70 ? theme.primaryTint : theme.amberTint,
                            color: matchScore >= 70 ? theme.primaryDark : theme.amber,
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {matchScore}% de pertinence IA
                        </span>
                      )}

                      {job.duration && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ml-auto"
                          style={{ backgroundColor: '#F3F4F6', color: theme.muted }}
                        >
                          <Clock className="w-3 h-3" />
                          {job.duration}
                        </span>
                      )}
                    </div>

                    {/* Titre et Entreprise */}
                    <div>
                      <h2 className="sc-display text-base font-bold leading-snug" style={{ color: theme.ink }}>{job.title}</h2>
                      <p className="text-xs font-medium flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5" style={{ color: theme.muted }}>
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company_name}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location || 'Non spécifié'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Badges de Compétences Requises */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                          style={{ backgroundColor: '#F0F2F1', color: theme.inkSoft }}
                        >
                          <Tag className="w-2.5 h-2.5 opacity-60" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="sc-divider pt-4">
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: theme.inkSoft }}>{job.description}</p>
                  </div>

                  {/* Bouton d'action */}
                  <div className="pt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
                    {hasApplied ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl"
                        style={{ backgroundColor: theme.primaryTint, color: theme.primaryDark }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Déjà postulé
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                      >
                        Postuler à l'offre
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal pour Postuler */}
        {selectedJob && (
          <div className="fixed inset-0 flex justify-center items-center p-4 z-50" style={{ backgroundColor: 'rgba(18, 38, 33, 0.55)' }}>
            <div className="sc-fade-in bg-white rounded-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center" style={{ backgroundColor: theme.primaryDark }}>
                <div>
                  <h3 className="sc-display text-base font-bold text-white">Postuler à cette offre</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedJob.title} — {selectedJob.company_name}</p>
                </div>
                <button
                  onClick={() => { setSelectedJob(null); setCvFile(null); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              
               <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>Lettre de motivation (optionnelle)</label>
                  <textarea
                    rows="4"
                    placeholder="Bonjour, je suis très intéressé par cette offre..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="sc-input w-full px-3.5 py-2.5 rounded-xl text-sm transition resize-none"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedJob(null); setCvFile(null); }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                    style={{ border: `1px solid ${theme.border}`, color: theme.inkSoft }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Envoyer la candidature
                      </>
                    )}
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

export default StudentJobs;