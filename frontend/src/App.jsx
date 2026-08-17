import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';


// Pages Étudiant
import StudentJobs from './pages/Student/Jobs';
import StudentApplications from './pages/Student/Applications';

// Pages Entreprise
import CompanyJobs from './pages/Company/Jobs';
import CompanyApplications from './pages/Company/Applications'; // 👈 1. Import de la page candidatures Entreprise
 //page profile 
 import Profile from './pages/Profile';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            {/* Page d'accueil */}
            <Route 
              path="/" 
              element={
                <div className="max-w-4xl mx-auto mt-20 text-center px-4">
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                    Trouvez votre stage idéal sur <span className="text-indigo-600">StageConnect</span>
                  </h1>
                  <p className="text-lg text-slate-600">
                    La plateforme qui rassemble étudiants et entreprises.
                  </p>
                </div>
              } 
            />

            {/* Routes Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Espace Étudiant */}
            <Route path="/jobs" element={<StudentJobs />} />
            <Route path="/student/jobs" element={<StudentJobs />} />
            <Route path="/student/applications" element={<StudentApplications />} />

            {/* Espace Entreprise */}
            <Route path="/company/jobs" element={<CompanyJobs />} />
            <Route path="/company/applications" element={<CompanyApplications />} /> {/* 👈 2. Nouvelle route Entreprise */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;