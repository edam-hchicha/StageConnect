import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'student' ou 'company'

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Fonction pour vérifier si le lien est actif
  const isActive = (path) => location.pathname === path;

  // Style dynamique des liens
  const linkClasses = (path) => `
    flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150
    ${isActive(path) 
      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs' 
      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
    }
  `;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 🟢 LOGO BRANDING */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-900 transition-colors">
              ✦
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Stage<span className="text-emerald-800">Connect</span>
            </span>
          </Link>

          {/* 🟢 NAVIGATION DESKTOP */}
          <nav className="hidden md:flex items-center gap-2">
            {!token ? (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
                >
                  Inscription
                </Link>
              </>
            ) : (
              <>
                {/* LIENS ÉTUDIANT */}
                {role === 'student' && (
                  <>
                    <Link to="/student/jobs" className={linkClasses('/student/jobs')}>
                      <span>🔍</span> Offres de Stage
                    </Link>
                    <Link to="/student/applications" className={linkClasses('/student/applications')}>
                      <span>📋</span> Mes Candidatures
                    </Link>
                  </>
                )}

                {/* LIENS ENTREPRISE */}
                {role === 'company' && (
                  <>
                    <Link to="/company/jobs" className={linkClasses('/company/jobs')}>
                      <span>📢</span> Offres Publiées
                    </Link>
                    <Link to="/company/applications" className={linkClasses('/company/applications')}>
                      <span>📥</span> Candidatures Reçues
                    </Link>
                  </>
                )}

                {/* SÉPARATEUR */}
                <div className="h-5 w-px bg-slate-200 mx-2" />

                {/* PROFIL */}
                <Link to="/profile" className={linkClasses('/profile')}>
                  <span>👤</span> Mon Profil
                </Link>

                {/* DÉCONNEXION */}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🚪</span> Déconnexion
                </button>
              </>
            )}
          </nav>

          {/* 🟢 BOUTON MENU MOBILE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 🟢 MENU MOBILE DÉROULANT */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {!token ? (
            <div className="flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl"
              >
                Connexion
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-emerald-800 rounded-xl"
              >
                Inscription
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {role === 'student' && (
                <>
                  <Link to="/student/jobs" onClick={() => setIsMobileMenuOpen(false)} className={linkClasses('/student/jobs')}>
                    🔍 Offres de Stage
                  </Link>
                  <Link to="/student/applications" onClick={() => setIsMobileMenuOpen(false)} className={linkClasses('/student/applications')}>
                    📋 Mes Candidatures
                  </Link>
                </>
              )}

              {role === 'company' && (
                <>
                  <Link to="/company/jobs" onClick={() => setIsMobileMenuOpen(false)} className={linkClasses('/company/jobs')}>
                    📢 Offres Publiées
                  </Link>
                  <Link to="/company/applications" onClick={() => setIsMobileMenuOpen(false)} className={linkClasses('/company/applications')}>
                    📥 Candidatures Reçues
                  </Link>
                </>
              )}

              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={linkClasses('/profile')}>
                👤 Mon Profil
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full mt-2 py-2.5 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl text-center"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;