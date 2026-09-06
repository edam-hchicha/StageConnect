import React, { useState, useEffect } from 'react';
import { Mail, GraduationCap, Building2, CheckCircle2, AlertCircle, Save, Loader2, FileText, Upload } from 'lucide-react';
import API from '../services/api';

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

const Field = ({ label, children, span }) => (
  <div className={span ? 'md:col-span-2' : ''}>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { border: `1px solid ${theme.border}` };

const Profile = () => {
  const [userData, setUserData] = useState({ email: '', role: '', profile: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile/me');
      setUserData(res.data);
    } catch (err) {
      console.error('Erreur de chargement :', err);
      setFeedback({ type: 'error', message: 'Impossible de charger le profil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
  };

  // 🟢 FONCTION DE TÉLÉVERSEMENT DU CV EN TEMPS RÉEL
  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCv(true);
    setFeedback({ type: '', message: '' });

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await API.post('/profile/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Mise à jour locale de l'URL du CV
      setUserData((prev) => ({
        ...prev,
        profile: { ...prev.profile, cv_url: res.data.cv_url }
      }));

      setFeedback({ type: 'success', message: 'CV mis à jour avec succès !' });
    } catch (err) {
      console.error('Erreur upload CV :', err);
      setFeedback({ type: 'error', message: "Erreur lors de l'envoi du CV (PDF uniquement, max 5 Mo)." });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await API.put('/profile/me', userData.profile);
      setFeedback({ type: 'success', message: res.data.message || 'Profil mis à jour avec succès !' });
    } catch (err) {
      console.error('Erreur de mise à jour :', err);
      setFeedback({ type: 'error', message: 'Erreur lors de la sauvegarde des modifications.' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (userData.role === 'student') {
      const first = userData.profile?.first_name?.[0] || '';
      const last = userData.profile?.last_name?.[0] || '';
      return (first + last).toUpperCase() || 'ST';
    }
    return (userData.profile?.company_name?.[0] || 'EN').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: theme.canvas }}>
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: `2.5px solid ${theme.border}`, borderTopColor: theme.primary }} />
      </div>
    );
  }

  const isStudent = userData.role === 'student';

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sc-display { font-family: 'Sora', sans-serif; }
        .sc-input:focus { outline: none; border-color: ${theme.primary}; box-shadow: 0 0 0 3px ${theme.primaryTint}; }
      `}</style>

      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
          <div className="h-28" style={{ backgroundColor: theme.primaryDark }} />

          <div className="px-6 py-4 flex flex-col sm:flex-row items-center sm:items-end -mt-14 sm:-mt-10 gap-4 pb-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div className="w-24 h-24 rounded-full bg-white p-1.5 flex-shrink-0" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.04)' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center text-xl font-bold tracking-wider" style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}>
                {getInitials()}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>
                {isStudent
                  ? `${userData.profile?.first_name || ''} ${userData.profile?.last_name || ''}`.trim() || 'Étudiant'
                  : userData.profile?.company_name || 'Entreprise'}
              </h1>
              <p className="text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-0.5" style={{ color: theme.muted }}>
                <Mail className="w-3.5 h-3.5" /> {userData.email}
              </p>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={
                isStudent
                  ? { backgroundColor: theme.primaryTint, color: theme.primaryDark }
                  : { backgroundColor: theme.amberTint, color: theme.amber }
              }
            >
              {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {isStudent ? 'Espace étudiant' : 'Espace entreprise'}
            </span>
          </div>

          {feedback.message && (
            <div
              className="mx-6 mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2.5"
              style={
                feedback.type === 'success'
                  ? { backgroundColor: theme.primaryTint, color: theme.primaryDark }
                  : { backgroundColor: theme.dangerTint, color: theme.danger }
              }
            >
              {feedback.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />}
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="pb-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <h2 className="sc-display text-lg font-bold" style={{ color: theme.ink }}>Informations personnelles</h2>
              <p className="text-sm mt-0.5" style={{ color: theme.muted }}>
                Mettez à jour les détails de votre compte pour maximiser vos opportunités.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Adresse e-mail (non modifiable)" span>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl text-sm cursor-not-allowed"
                  style={{ backgroundColor: '#F1F2EF', border: `1px solid ${theme.border}`, color: theme.muted }}
                />
              </Field>

              {isStudent && (
                <>
                  <Field label="Prénom">
                    <input type="text" name="first_name" value={userData.profile?.first_name || ''} onChange={handleChange} placeholder="Ex: Karim"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Nom">
                    <input type="text" name="last_name" value={userData.profile?.last_name || ''} onChange={handleChange} placeholder="Ex: Sassi"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Numéro de téléphone">
                    <input type="text" name="phone" value={userData.profile?.phone || ''} onChange={handleChange} placeholder="Ex: +216 98 123 456"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Université / École">
                    <input type="text" name="university" value={userData.profile?.university || ''} onChange={handleChange} placeholder="Ex: ESPRIT, INSAT, FST..."
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Niveau d'études / Diplôme" span>
                    <input type="text" name="degree" value={userData.profile?.degree || ''} onChange={handleChange} placeholder="Ex: Élève ingénieur en génie logiciel"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Compétences techniques" span>
                    <textarea name="skills" rows="3" value={userData.profile?.skills || ''} onChange={handleChange} placeholder="Ex: React.js, Node.js, Express, MySQL, Tailwind CSS, Git"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition resize-none" style={inputStyle} />
                  </Field>

                  {/* 🟢 BLOC DÉDIÉ AU NIVEAU DU CV ÉTUDIANT */}
                  <Field label="Curriculum Vitae (CV)" span>
                    <div className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ backgroundColor: theme.canvas, border: `1px solid ${theme.border}` }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          {userData.profile?.cv_url ? (
                            <a
                              href={`http://localhost:5000${userData.profile.cv_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold hover:underline flex items-center gap-1"
                              style={{ color: theme.primary }}
                            >
                              Visualiser mon CV actuel ↗
                            </a>
                          ) : (
                            <p className="text-sm font-medium" style={{ color: theme.muted }}>Aucun CV déposé</p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: theme.muted }}>Format PDF uniquement (Max 5 Mo)</p>
                        </div>
                      </div>

                      <label className="px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-2 border shadow-xs" style={{ backgroundColor: '#FFFFFF', borderColor: theme.border, color: theme.inkSoft }}>
                        {uploadingCv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {userData.profile?.cv_url ? 'Remplacer le CV' : 'Ajouter un CV'}
                        <input type="file" accept=".pdf" onChange={handleCvUpload} className="hidden" disabled={uploadingCv} />
                      </label>
                    </div>
                  </Field>
                </>
              )}

              {!isStudent && (
                <>
                  <Field label="Nom de l'entreprise">
                    <input type="text" name="company_name" value={userData.profile?.company_name || ''} onChange={handleChange} placeholder="Ex: Nova Tech"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Secteur d'activité">
                    <input type="text" name="sector" value={userData.profile?.sector || ''} onChange={handleChange} placeholder="Ex: Intelligence artificielle & cloud"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="Site web officiel" span>
                    <input type="url" name="website" value={userData.profile?.website || ''} onChange={handleChange} placeholder="Ex: https://novatech.tn"
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition" style={inputStyle} />
                  </Field>
                  <Field label="À propos de l'entreprise" span>
                    <textarea name="description" rows="4" value={userData.profile?.description || ''} onChange={handleChange} placeholder="Décrivez brièvement les activités, la vision et les valeurs de votre entreprise..."
                      className="sc-input w-full px-4 py-2.5 rounded-xl text-sm transition resize-none" style={inputStyle} />
                  </Field>
                </>
              )}
            </div>

            <div className="pt-4 flex justify-end" style={{ borderTop: `1px solid ${theme.border}` }}>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 font-semibold rounded-xl transition flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
                style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;