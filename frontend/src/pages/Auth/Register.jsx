import React, { useState } from 'react';
import { Mail, Lock, User, UserCheck, Briefcase, UserPlus, Loader2, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyEmail } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  
  // Étape du formulaire : 1 = Inscription, 2 = Validation Email
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Soumission du formulaire d'inscription (Étape 1)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(formData);
      setSuccessMessage(`Un code de vérification a été envoyé à ${formData.email}`);
      setStep(2); // Passage à l'étape de saisie du code
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Erreur lors de l'inscription. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Soumission du code de vérification (Étape 2)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyEmail({
        email: formData.email,
        code: verificationCode
      });
      
      // Redirection vers la connexion après confirmation
      navigate('/login', { 
        state: { message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter." } 
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Code invalide ou expiré."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-6">
        
        {/* En-tête */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 1 ? "Créer un compte" : "Vérification de l'email"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 
              ? "Rejoignez la communauté StageConnect" 
              : `Entrez le code envoyé à ${formData.email}`
            }
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Message d'information / succès */}
        {successMessage && step === 2 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMULAIRE ÉTAPE 1 : INSCRIPTION */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vous êtes :</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                    formData.role === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Étudiant
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'company' })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                    formData.role === 'company'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Recruteur
                </button>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.role === 'company' ? "Nom de l'entreprise" : "Nom complet"}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.role === 'company' ? "Nom de la société" : "Prénom Nom"}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemple@domaine.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  S'inscrire
                </>
              )}
            </button>
          </form>
        )}

        {/* FORMULAIRE ÉTAPE 2 : VÉRIFICATION PAR CODE */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code de confirmation</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-center tracking-widest font-mono text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Valider le compte
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-500 hover:text-indigo-600 text-center block pt-2"
            >
              ← Modifier l'adresse email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;