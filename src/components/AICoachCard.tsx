import React, { useState, useEffect } from "react";
import { CoachFeedback, DailyState } from "../types";
import { Sparkles, Brain, Award, CookingPot, Calendar, ArrowRight, HeartPulse, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AICoachCardProps {
  language: "tamil" | "english";
  dailyState: DailyState;
  onFeedbackReceived: (feedback: CoachFeedback) => void;
  savedFeedback: CoachFeedback | null;
  onClearFeedback: () => void;
}

const LoadingQuotesTa = [
  "ஏஐ உங்கள் ஆரோக்கிய சமநிலையை கணக்கிடுகிறது...",
  "உங்கள் நீர் அருந்தும் தரத்தை பகுப்பாய்வு செய்கிறது...",
  "இன்றைய உடற்பயிற்சி ஆற்றலைப் பட்டியலிடுகிறது...",
  "உங்களுக்கு உகந்த பாரம்பரிய சத்துணவு யோசனையைத் தயாரிக்கிறது..."
];

const LoadingQuotesEn = [
  "AI is evaluating your healthy lifestyle balance...",
  "Calculating hydration stats for optimal recovery...",
  "Compiling workouts & muscle stamina quotients...",
  "Formulating customized regional millet recipe suggestions..."
];

export default function AICoachCard({ language, dailyState, onFeedbackReceived, savedFeedback, onClearFeedback }: AICoachCardProps) {
  const isTamil = language === "tamil";
  const [loading, setLoading] = useState(false);
  const [errorInput, setErrorInput] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate loading quotes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        const list = isTamil ? LoadingQuotesTa : LoadingQuotesEn;
        setQuoteIndex((prev) => (prev + 1) % list.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, isTamil]);

  const handleEvaluate = async () => {
    if (!dailyState.profile) return;
    setLoading(true);
    setErrorInput(null);
    setQuoteIndex(0);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dailyState.profile.name,
          language: dailyState.profile.language,
          goal: dailyState.profile.goal,
          weight: dailyState.profile.weight,
          height: dailyState.profile.height,
          waterDrank: dailyState.waterDrank,
          waterTarget: dailyState.profile.waterTarget,
          exercises: dailyState.workouts,
          meals: dailyState.meals,
          habits: dailyState.habits.filter((h) => h.completed),
          points: dailyState.points
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to consult physical coach.");
      }

      const data = await response.json();
      onFeedbackReceived(data as CoachFeedback);
    } catch (e: any) {
      console.error(e);
      setErrorInput(isTamil ? "ஏஐ ஆலோசகரை தொடர்பு கொள்ள முடியவில்லை. மீண்டும் முயலவும்." : "Could not connect to AI Mentor. Please retry shortly.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score >= 60) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-rose-500 bg-rose-50 border-rose-100";
  };

  return (
    <div className="w-full" id="ai-coach-section">
      <AnimatePresence mode="wait">
        {!loading && !savedFeedback ? (
          /* Ready state screen */
          <motion.div
            key="ready-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-radial from-slate-900 to-slate-950 text-white p-7 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
            id="coach-ready-card"
          >
            {/* Ambient background glow elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/30">
                <Brain className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-rose-100">
                  <span>{isTamil ? "ஏஐ நல்வாழ்வு ஆலோசகர்" : "AI Wellness Coach Evaluation"}</span>
                  <span className="text-[9px] uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">GEMINI</span>
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                  {isTamil
                    ? "இன்றைய உங்கள் தண்ணீர், உணவுகள் மற்றும் உடற்பயிற்சிகளை ஆராய்ந்து உங்கள் ஏஐ ஆலோசகர் தனிப்பயனாக்கப்பட்ட மதிப்பீட்டை வழங்குவார்."
                    : "Obtain a personalized feedback evaluation score, wellness advice recommendations, and a regional recipe tailored directly to your tracked metrics."}
                </p>
                {errorInput && (
                  <p className="text-red-300 text-[11px] font-bold mt-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    {errorInput}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              className="w-full md:w-auto bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 font-bold px-6 py-4 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 group transform active:scale-97 text-sm whitespace-nowrap text-white"
              id="btn-evaluate-coach"
            >
              <span>{isTamil ? "ஆலோசனையைக் கணக்கிடு" : "Generate AI Advice"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : loading ? (
          /* Loading overlay screen */
          <motion.div
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 text-white p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center gap-6 min-h-[300px]"
            id="coach-loading-card"
          >
            <div className="relative">
              {/* Spinning Ring */}
              <div className="w-16 h-16 border-4 border-rose-500/20 rounded-full animate-spin border-t-rose-500"></div>
              <Brain className="h-6 w-6 text-rose-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                {isTamil ? "ஏஐ ஆலோசகர் கணக்கிடுகிறார்" : "Consulting Digital Mentor"}
              </h4>
              <p className="text-xs text-rose-300 font-semibold h-5">
                {(isTamil ? LoadingQuotesTa : LoadingQuotesEn)[quoteIndex]}
              </p>
              <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto">
                {isTamil ? "இதற்கு சில நொடிகள் ஆகலாம்..." : "Usually finishes in 3-5 seconds..."}
              </p>
            </div>
          </motion.div>
        ) : (
          /* Results presentation */
          <motion.div
            key="feedback-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="coach-feedback-results"
          >
            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="feedback-summary-grid">
              
              {/* Score card (Circular) */}
              <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {isTamil ? "ஆரோக்கிய மதிப்பீடு" : "Coach Balance Score"}
                </h4>
                
                {/* Score Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#f43f5e" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - (savedFeedback?.coachScore || 0) / 100)}` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{savedFeedback?.coachScore}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
                  </div>
                </div>

                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getScoreColor(savedFeedback?.coachScore || 0)}`}>
                  {savedFeedback && savedFeedback?.coachScore >= 80 
                    ? (isTamil ? "மிகச்சிறந்த ஆரோக்கியம்" : "Excellent Habit Balance")
                    : (isTamil ? "நல்வகை முன்னேற்றம்" : "Good Progress - Keep Up")}
                </span>
              </div>

              {/* Text analysis markdown area */}
              <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-rose-500" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {isTamil ? "ஏஐ நல்வாழ்வு பகுப்பாய்வு" : "Digital Wellness Evaluation"}
                    </h4>
                  </div>
                  <div 
                    className="text-xs text-slate-600 leading-relaxed text-justify space-y-2 prose"
                    dangerouslySetInnerHTML={{ __html: savedFeedback?.analysis || "" }}
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50 mt-4">
                  <button
                    onClick={handleEvaluate}
                    className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    id="btn-re-eval"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>{isTamil ? "மீண்டும் கணக்கிடு" : "Re-evaluate Activity"}</span>
                  </button>
                  
                  <button
                    onClick={onClearFeedback}
                    className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                    id="btn-close-coach"
                  >
                    {isTamil ? "முடிவுகளை மூடு" : "Dismiss Feedback"}
                  </button>
                </div>
              </div>

            </div>

            {/* Recommendations checklist & Recipes suggestion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="feedback-details-grid">
              
              {/* Daily coach tips list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {isTamil ? "பரிந்துரைக்கப்படும் ஆலோசனைகள்" : "Coaching Recommendations"}
                  </h4>
                </div>

                <ul className="space-y-3" id="coach-tips-bullets">
                  {savedFeedback?.tips.map((tip, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed"
                    >
                      <span className="flex-none p-1 bg-indigo-50 rounded-lg text-indigo-500 font-extrabold mt-0.5 select-none">
                        ✓
                      </span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Personalized healthy recipe suggestions recipe block */}
              {savedFeedback?.recipe && (
                <div className="bg-gradient-to-br from-teal-50/40 via-teal-50/10 to-teal-100/15 p-6 rounded-3xl border border-teal-100 flex flex-col gap-4 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CookingPot className="h-16 w-16 text-teal-600" />
                  </div>

                  <div className="flex items-center gap-2">
                    <CookingPot className="h-5 w-5 text-teal-600" />
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none">
                        {isTamil ? "ஏஐ தனிப்பயன் சத்துணவு யோசனை" : "AI Custom Balanced Recipe"}
                      </h4>
                      <span className="text-[10px] text-teal-600 font-medium font-serif mt-0.5 inline-block">
                        {isTamil ? "இன்றைய உடலுக்கு உகந்த பாரம்பரிய சாய்ஸ்" : "Regional nutrient-rich select"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    <h5 className="text-sm font-bold text-slate-800">{savedFeedback.recipe.title}</h5>
                    <p className="text-[11px] text-slate-500 italic font-medium leading-relaxed">
                      {savedFeedback.recipe.benefits}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 pr-1 max-h-56 overflow-y-auto">
                    {/* Ingredients list */}
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                        {isTamil ? "தேவையான மூலப்பொருட்கள்:" : "Ingredients Required:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {savedFeedback.recipe.ingredients.map((ing, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white rounded-lg border border-slate-100 text-[10px] text-slate-600 font-medium">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cook Steps */}
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                        {isTamil ? "செய்முறை விளக்கம்:" : "Preparation Steps:"}
                      </span>
                      <ol className="space-y-1.5 list-decimal pl-4 text-[11px]">
                        {savedFeedback.recipe.steps.map((st, i) => (
                          <li key={i} className="text-slate-600 font-medium leading-snug">
                            {st}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
