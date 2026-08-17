import React, { useEffect, useState } from 'react';
import { getStudentApplications } from '../../services/api';
import { Building2, MapPin, CalendarDays, CheckCircle2, XCircle, Hourglass, ClipboardList } from 'lucide-react';

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

const statusMap = {
  accepted: { label: 'Candidature acceptée', icon: CheckCircle2, bg: theme.primaryTint, fg: theme.primaryDark, bar: theme.primary },
  rejected: { label: 'Candidature refusée', icon: XCircle, bg: theme.dangerTint, fg: theme.danger, bar: theme.danger },
  default: { label: 'En attente de réponse', icon: Hourglass, bg: theme.amberTint, fg: theme.amber, bar: theme.amber },
};

const StatusBadge = ({ status }) => {
  const s = statusMap[status] || statusMap.default;
  const I = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <I className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
};

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getStudentApplications();
        setApplications(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des candidatures :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sc-display { font-family: 'Sora', sans-serif; }
      `}</style>

      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>Suivi de mes candidatures</h1>
            <p className="text-xs mt-0.5" style={{ color: theme.muted }}>L'état de vos candidatures se met à jour en temps réel.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
            <p className="text-sm" style={{ color: theme.muted }}>Chargement de vos candidatures…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto" style={{ border: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.muted }}>Vous n'avez pas encore postulé à des offres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const s = statusMap[app.status] || statusMap.default;
              return (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4"
                  style={{ border: `1px solid ${theme.border}`, borderLeft: `4px solid ${s.bar}` }}
                >
                  <div className="space-y-1.5">
                    <h2 className="sc-display text-base font-bold" style={{ color: theme.ink }}>{app.title}</h2>
                    <p className="text-xs font-medium flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: theme.muted }}>
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{app.company_name}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.location || 'Non spécifié'}</span>
                    </p>
                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: theme.muted }}>
                      <CalendarDays className="w-3 h-3" />
                      Postulé le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <StatusBadge status={app.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApplications;
