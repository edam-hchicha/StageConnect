import React, { useEffect, useState } from 'react';
import { getStudentApplications } from '../../services/api';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getStudentApplications();
        setApplications(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Fonction pour afficher le badge de statut coloré
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-300">
            🎉 Candidature Acceptée
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-300">
            ❌ Candidature Refusée
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-300">
            ⏳ En attente de réponse
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Suivi de mes Candidatures</h1>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Chargement de vos candidatures...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center border shadow-sm">
          <p className="text-gray-500">Vous n'avez pas encore postulé à des offres.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-lg border shadow-sm flex flex-wrap justify-between items-center gap-4 hover:shadow-md transition"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-blue-600">{app.title}</h2>
                <p className="text-sm text-gray-600 font-medium">
                  🏢 {app.company_name} • 📍 {app.location || 'Non spécifié'}
                </p>
                <p className="text-xs text-gray-400">
                  Postulé le : {new Date(app.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div>{renderStatusBadge(app.status)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;