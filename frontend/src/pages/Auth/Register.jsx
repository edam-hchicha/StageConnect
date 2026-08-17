import React, { useState } from 'react';
import {
  Mail, Lock, User, UserCheck, Briefcase, UserPlus, Loader2,
  AlertCircle, KeyRound, CheckCircle2, Sparkles, Target, ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, verifyEmail } from '../../services/api';

const theme = {
  canvas: '#F5F6F3',
  ink: '#122621',
  inkSoft: '#3E4F49',
  muted: '#657A73',
  primary: '#1E6F58',
  primaryDark: '#122F27',
  primaryTint: '#E6F1EC',
  amber: '#D9A15C',
  border: '#E1E5E0',
  danger: '#9C4238',
  dangerTint: '#F8ECEA',
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .sc-display { font-family: 'Sora', sans-serif; }
    .sc-input:focus { outline: none; border-color: ${theme.primary}; box-shadow: 0 0 0 3px ${theme.primaryTint}; }
  `}</style>
);

const BrandPanel = () => (
  <div
    className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
    style={{ backgroundColor: theme.primaryDark }}
  >
    <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
    <div className="absolute -left-16 bottom-10 w-56 h-56 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />

    <div className="relative flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.amber }}>
        <Sparkles className="w-4.5 h-4.5" style={{ color: theme.primaryDark }} />
      </div>
      <span className="sc-display text-white text-lg font-bold tracking-tight">StageConnect</span>
    </div>

    <div className="relative space-y-8">
      <h2 className="sc-display text-3xl font-bold text-white leading-tight">
        Rejoignez la plateforme qui optimise la recherche de stage
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
        Étudiants comme entreprises : profitez d'une mise en relation assistée par
        l'IA, pensée pour vous faire gagner du temps.
      </p>

      <div className="space-y-4 pt-2">
        {[
          { icon: Target, text: 'Recommandations d\u2019offres pertinentes' },
          { icon: ShieldCheck, text: 'Comptes vérifiés par e-mail' },
        ].map(({ icon: I, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <I className="w-4 h-4" style={{ color: theme.amber }} />
            </div>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>

    <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} StageConnect</p>
  </div>
);

const StepDots = ({ step }) => (
  <div className="flex items-center gap-2">
    {[1, 2].map((n) => (
      <div
        key={n}
        className="h-1.5 rounded-full transition-all"
        style={{
          width: n === step ? '28px' : '14px',
          backgroundColor: n <= step ? theme.primary : theme.border,
        }}
      />
    ))}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(formData);
      setSuccessMessage(`Un code de vérification a été envoyé à ${formData.email}`);
      setStep(2);
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

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyEmail({ email: formData.email, code: verificationCode });
      navigate('/login', { state: { message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Code invalide ou expiré.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex" style={{ backgroundColor: theme.canvas, fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>
                {step === 1 ? 'Créer un compte' : "Vérification de l'e-mail"}
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.muted }}>
                {step === 1 ? 'Rejoignez la communauté StageConnect' : `Entrez le code envoyé à ${formData.email}`}
              </p>
            </div>
            <StepDots step={step} />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-sm flex items-center gap-2.5" style={{ backgroundColor: theme.dangerTint, color: theme.danger }}>
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && step === 2 && (
            <div className="p-3.5 rounded-xl text-sm flex items-center gap-2.5" style={{ backgroundColor: theme.primaryTint, color: theme.primary }}>
              <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: theme.inkSoft }}>Vous êtes :</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer"
                    style={
                      formData.role === 'student'
                        ? { border: `1.5px solid ${theme.primary}`, backgroundColor: theme.primaryTint, color: theme.primaryDark }
                        : { border: `1.5px solid ${theme.border}`, color: theme.muted }
                    }
                  >
                    <UserCheck className="w-4 h-4" />
                    Étudiant
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'company' })}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition cursor-pointer"
                    style={
                      formData.role === 'company'
                        ? { border: `1.5px solid ${theme.primary}`, backgroundColor: theme.primaryTint, color: theme.primaryDark }
                        : { border: `1.5px solid ${theme.border}`, color: theme.muted }
                    }
                  >
                    <Briefcase className="w-4 h-4" />
                    Recruteur
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>
                  {formData.role === 'company' ? "Nom de l'entreprise" : 'Nom complet'}
                </label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formData.role === 'company' ? 'Nom de la société' : 'Prénom Nom'}
                    className="sc-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-white transition"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>Adresse e-mail</label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemple@domaine.com"
                    className="sc-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-white transition"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>Mot de passe</label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="sc-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-white transition"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2 cursor-pointer"
                style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création du compte…
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

          {step === 2 && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: theme.inkSoft }}>Code de confirmation</label>
                <div className="relative">
                  <KeyRound className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="sc-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-white transition text-center tracking-[0.4em] font-mono text-lg"
                    style={{ border: `1px solid ${theme.border}` }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification…
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
                className="w-full text-xs text-center block pt-1 cursor-pointer"
                style={{ color: theme.muted }}
              >
                ← Modifier l'adresse e-mail
              </button>
            </form>
          )}

          <p className="text-center text-sm" style={{ color: theme.muted }}>
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold" style={{ color: theme.primary }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
