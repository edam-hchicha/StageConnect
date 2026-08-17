import React, { useEffect, useState } from 'react';
import { getCompanyApplications, updateApplicationStatus } from '../../services/api';
import { Mail, FileText, CalendarDays, Check, X, CheckCircle2, XCircle, Inbox } from 'lucide-react';

const theme = {
  canvas: '#F5F6F3',
  ink: '#122621',
  inkSoft: '#3E4F49',
  muted: '#657A73',
  primary: '#1E6F58',
  primaryDark: '#154C3D',
  primaryTint: '#E6F1EC',
  danger: '#9C4238',
  dangerTint: '#F8ECEA',
  border: '#E1E5E0',
};

const initials = (first, last) => `${(first || '?')[0]}${(last || '')[0] || ''}`.toUpperCase();

const CompanyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await getCompanyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des candidatures :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setApplications(applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app)));
    } catch (err) {
      alert('Erreur lors de la modification du statut.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sc-display { font-family: 'Sora', sans-serif; }
      `}</style>

      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>Candidatures reçues</h1>
            <p className="text-xs mt-0.5" style={{ color: theme.muted }}>Examinez les profils et donnez suite à chaque candidature.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
            <p className="text-sm" style={{ color: theme.muted }}>Chargement des candidatures…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto" style={{ border: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.muted }}>Aucune candidature reçue pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl space-y-4" style={{ border: `1px solid ${theme.border}` }}>
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: theme.primaryTint, color: theme.primaryDark }}
                    >
                      {initials(app.first_name, app.last_name)}
                    </div>
                    <div>
                      <h2 className="sc-display text-base font-bold" style={{ color: theme.ink }}>
                        {app.first_name} {app.last_name}
                      </h2>
                      <p className="text-xs font-semibold" style={{ color: theme.primary }}>Offre : {app.job_title}</p>
                      <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: theme.muted }}>
                        <Mail className="w-3 h-3" /> {app.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] flex items-center gap-1.5" style={{ color: theme.muted }}>
                    <CalendarDays className="w-3 h-3" />
                    Reçu le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {app.cover_letter && (
                  <div className="p-3.5 rounded-xl text-sm leading-relaxed" style={{ backgroundColor: '#FAFBF9', border: `1px solid ${theme.border}`, color: theme.inkSoft }}>
                    {app.cover_letter}
                  </div>
                )}

                <div className="flex flex-wrap justify-between items-center pt-3 gap-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                  {app.cv_url ? (
                    <a
                      href={`http://localhost:5000${app.cv_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition"
                      style={{ backgroundColor: theme.primaryTint, color: theme.primaryDark }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Consulter le CV (PDF)
                    </a>
                  ) : (
                    <span className="text-xs" style={{ color: theme.muted }}>Aucun CV joint</span>
                  )}

                  <div className="flex items-center gap-2">
                    {app.status === 'accepted' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.primaryTint, color: theme.primaryDark }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Candidature acceptée
                      </span>
                    ) : app.status === 'rejected' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.dangerTint, color: theme.danger }}>
                        <XCircle className="w-3.5 h-3.5" /> Candidature refusée
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'accepted')}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                          style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                          style={{ backgroundColor: theme.dangerTint, color: theme.danger }}
                        >
                          <X className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyApplications;
