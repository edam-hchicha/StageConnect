import React, { useState } from 'react';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Sparkles, Target, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';

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
    <div
      className="absolute -right-24 -top-24 w-72 h-72 rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
    />
    <div
      className="absolute -left-16 bottom-10 w-56 h-56 rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    />

    <div className="relative">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: theme.amber }}
        >
          <Sparkles className="w-4.5 h-4.5" style={{ color: theme.primaryDark }} />
        </div>
        <span className="sc-display text-white text-lg font-bold tracking-tight">StageConnect</span>
      </div>
    </div>

    <div className="relative space-y-8">
      <h2 className="sc-display text-3xl font-bold text-white leading-tight">
        La plateforme intelligente qui relie talents et entreprises
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
        Nos algorithmes analysent les profils et les offres pour vous proposer des
        correspondances plus pertinentes, plus rapidement.
      </p>

      <div className="space-y-4 pt-2">
        {[
          { icon: Target, text: 'Mise en relation guidée par l\u2019IA' },
          { icon: ShieldCheck, text: 'Candidatures et offres vérifiées' },
        ].map(({ icon: I, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <I className="w-4 h-4" style={{ color: theme.amber }} />
            </div>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>

    <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
      © {new Date().getFullYear()} StageConnect
    </p>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(formData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      const userRole = response.data.role || response.data.user?.role;
      if (userRole) {
        localStorage.setItem('role', userRole);
      }

      if (userRole === 'company') {
        navigate('/company/jobs');
      } else {
        navigate('/student/jobs');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Impossible de se connecter. Vérifiez vos identifiants ou le serveur.'
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
          <div>
            <h2 className="sc-display text-2xl font-bold" style={{ color: theme.ink }}>Connexion</h2>
            <p className="text-sm mt-1" style={{ color: theme.muted }}>Accédez à votre espace StageConnect</p>
          </div>

          {error && (
            <div
              className="p-3.5 rounded-xl text-sm flex items-center gap-2.5"
              style={{ backgroundColor: theme.dangerTint, color: theme.danger }}
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full py-2.5 px-4 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: theme.muted }}>
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold" style={{ color: theme.primary }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
