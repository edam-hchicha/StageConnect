import React, { useEffect, useState } from 'react';
import { getAllJobs, applyToJob, getStudentApplications } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Clock, Sparkles, ClipboardList, Building2,
  CheckCircle2, FileUp, X, Send, Loader2,
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
  border: '#E1E5E0',
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

  const fetchJobsAndApplications = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        getAllJobs(search),
        getStudentApplications().catch(() => ({ data: [] })),
      ]);
      setJobs(jobsRes.data);
      setAppliedJobIds(appsRes.data.map((app) => app.job_id));
    } catch (err) {
      console.error('Erreur de chargement :', err);
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

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      alert('Veuillez joindre votre CV au format PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('job_id', selectedJob.id);
      formData.append('cover_letter', coverLetter);
      formData.append('cv', cvFile);

      await applyToJob(formData);
      alert('Candidature envoyée avec succès.');

      setAppliedJobIds([...appliedJobIds, selectedJob.id]);
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
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>Offres de stage disponibles</h1>
              <p className="text-xs mt-0.5" style={{ color: theme.muted }}>Recherche intelligente parmi les offres publiées par nos entreprises partenaires.</p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2"
            style={{ backgroundColor: theme.primaryDark, color: '#FFFFFF' }}
          >
            <ClipboardList className="w-4 h-4" />
            Mes candidatures
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl" style={{ border: `1px solid ${theme.border}` }}>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
            <input
              type="text"
              placeholder="Recherche par poste (ex: React, Node...)"
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
            <p className="text-sm" style={{ color: theme.muted }}>Recherche en cours…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto" style={{ border: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.muted }}>Aucune offre ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job) => {
              const hasApplied = appliedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="sc-card bg-white rounded-2xl p-6 flex flex-col justify-between"
                  style={{ border: `1px solid ${theme.border}`, borderLeft: `4px solid ${theme.primary}` }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="sc-display text-base font-bold leading-snug" style={{ color: theme.ink }}>{job.title}</h2>
                      {job.duration && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: theme.amberTint, color: theme.amber }}
                        >
                          <Clock className="w-3 h-3" />
                          {job.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: theme.muted }}>
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company_name}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location || 'Non spécifié'}</span>
                    </p>
                  </div>

                  <div className="sc-divider mt-4 pt-4">
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: theme.inkSoft }}>{job.description}</p>
                  </div>

                  <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
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
                        className="px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                      >
                        Postuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                    Importer votre CV (PDF) <span style={{ color: theme.amber }}>*</span>
                  </label>
                  <label
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm cursor-pointer transition"
                    style={{ border: `1.5px dashed ${theme.border}`, backgroundColor: '#FAFBF9', color: theme.muted }}
                  >
                    <FileUp className="w-4 h-4 flex-shrink-0" />
                    {cvFile ? cvFile.name : 'Choisir un fichier PDF'}
                    <input type="file" accept=".pdf" required onChange={(e) => setCvFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>

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
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold transition"
                    style={{ border: `1px solid ${theme.border}`, color: theme.inkSoft }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
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
