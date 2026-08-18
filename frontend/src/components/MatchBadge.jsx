import React from 'react';

const MatchBadge = ({ score = 0 }) => {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let label = "Compatibilité";

  if (score >= 80) {
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
    label = "🔥 Profil idéal";
  } else if (score >= 60) {
    badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
    label = "✨ Très bon match";
  } else if (score >= 40) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    label = "💡 Moyen";
  } else {
    badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
    label = "Faible";
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${badgeStyle}`}>
      <span>{label}</span>
      <span className="font-bold text-sm">{score}%</span>
      <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-indigo-600' : score >= 40 ? 'bg-amber-500' : 'bg-slate-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default MatchBadge;