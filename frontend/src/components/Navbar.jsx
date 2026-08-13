import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Assurez-vous de stocker 'role' lors du login ('student' ou 'company')

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        StageConnect
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
        {!token ? (
          <>
            <Link to="/login" className="hover:text-indigo-600">Connexion</Link>
            <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Inscription</Link>
          </>
        ) : (
          <>
            {/* LIENS ÉTUDIANT */}
            {role === 'student' && (
              <>
                <Link to="/student/jobs" className="hover:text-indigo-600">🔍 Offres de Stage</Link>
                <Link to="/student/applications" className="hover:text-indigo-600">📋 Mes Candidatures</Link>
              </>
            )}

            {/* LIENS ENTREPRISE */}
            {role === 'company' && (
              <>
                <Link to="/company/jobs" className="hover:text-indigo-600">📢 Mes Offres Publiées</Link>
                <Link to="/company/applications" className="hover:text-indigo-600">📥 Candidatures Reçues</Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs"
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;