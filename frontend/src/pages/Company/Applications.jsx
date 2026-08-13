import React, { useEffect, useState } from 'react';
import { getCompanyApplications, updateApplicationStatus } from '../../services/api';

const CompanyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await getCompanyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des candidatures :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Action pour Accepter ou Refuser une candidature
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      // Mettre à jour l'état localement sans recharger toute la page
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Candidatures Reçues</h1>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Chargement des candidatures...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center border shadow-sm">
          <p className="text-gray-500">Aucune candidature reçue pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    👤 {app.first_name} {app.last_name}
                  </h2>
                  <p className="text-sm text-blue-600 font-medium">Offre : {app.job_title}</p>
                  <p className="text-xs text-gray-500">📧 {app.email}</p>
                </div>

                <span className="text-xs text-gray-400">
                  Reçu le : {new Date(app.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Lettre de motivation si existante */}
              {app.cover_letter && (
                <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 italic">
                  "{app.cover_letter}"
                </div>
              )}

              {/* Téléchargement/Consultation du CV & Actions */}
              <div className="flex flex-wrap justify-between items-center pt-2 border-t gap-3">
                {app.cv_url ? (
                  <a
                    href={`http://localhost:5000${app.cv_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    📄 Consulter / Télécharger le CV (PDF)
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Aucun CV joint</span>
                )}

                {/* Boutons d'acceptation / refus */}
                <div className="flex items-center gap-2">
                  {app.status === 'accepted' ? (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
                      ✅ Candidature Acceptée
                    </span>
                  ) : app.status === 'rejected' ? (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded">
                      ❌ Candidature Refusée
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusChange(app.id, 'accepted')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition"
                      >
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
  );
};

export default CompanyApplications;