import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Lightbulb, Award } from 'lucide-react';

const MatchResult = ({ result }) => {
  if (!result) return null;

  const { score, summary, matchingSkills, missingSkills, recommendations } = result;

  const getScoreStyle = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-500' };
    if (score >= 50) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500' };
    return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-500' };
  };

  const style = getScoreStyle(score);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Analyse de Compatibilité IA</h3>
            <p className="text-xs text-slate-500">Générée automatiquement par Llama 3</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${style.bg} ${style.border}`}>
          <Award className={`w-6 h-6 ${style.text}`} />
          <span className={`text-2xl font-black ${style.text}`}>{score}%</span>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-900 text-sm mb-1">Résumé :</p>
        <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700">{summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <h4 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Compétences validées
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchingSkills?.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
          <h4 className="flex items-center gap-2 font-semibold text-rose-800 mb-3 text-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            Compétences manquantes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills?.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-medium rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200">
        <h4 className="flex items-center gap-2 font-semibold text-amber-900 mb-2 text-sm">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          Recommandations
        </h4>
        <p className="text-sm text-amber-800 leading-relaxed">{recommendations}</p>
      </div>
    </div>
  );
};

export default MatchResult;