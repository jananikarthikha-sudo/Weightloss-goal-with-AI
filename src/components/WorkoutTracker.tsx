import React, { useState } from "react";
import { Workout } from "../types";
import { Dumbbell, Plus, Trash2, Zap, Trophy, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkoutTrackerProps {
  language: "tamil" | "english";
  workouts: Workout[];
  onAddWorkout: (workout: Workout) => void;
  onRemoveWorkout: (id: string, refundPoints: number) => void;
}

export default function WorkoutTracker({ language, workouts, onAddWorkout, onRemoveWorkout }: WorkoutTrackerProps) {
  const isTamil = language === "tamil";
  const [customType, setCustomType] = useState("");
  const [category, setCategory] = useState<Workout["category"]>("walking");
  const [duration, setDuration] = useState<number>(30);

  const categories = [
    { id: "walking", labelTamil: "நடைபயிற்சி (Walk)", labelEnglish: "Walking", caloriePerMin: 4 },
    { id: "running", labelTamil: "ஓட்டம் (Run)", labelEnglish: "Running", caloriePerMin: 10 },
    { id: "yoga", labelTamil: "யோகா (Yoga)", labelEnglish: "Yoga/Stretching", caloriePerMin: 3 },
    { id: "strength", labelTamil: "வலிமை பயிற்சி (Gym)", labelEnglish: "Strength Training", caloriePerMin: 6 },
    { id: "other", labelTamil: "இதர பயிற்சி", labelEnglish: "Active Play/Other", caloriePerMin: 5 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTemplate = categories.find((c) => c.id === category);
    const typeLabel = customType.trim() 
      || (selectedTemplate ? (isTamil ? selectedTemplate.labelTamil.split(" (")[0] : selectedTemplate.labelEnglish) : "Exercise");

    const points = duration * 5; // 5 XP per active minute

    const newWorkout: Workout = {
      id: "workout_" + Date.now(),
      type: typeLabel,
      category,
      duration,
      points,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddWorkout(newWorkout);
    setCustomType("");
  };

  // Calories estimation
  const currentRate = categories.find((c) => c.id === category)?.caloriePerMin || 5;
  const estimatedCalories = duration * currentRate;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-rose-50" id="workout-tracker-card">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800" id="workout-heading-text">
            {isTamil ? "உடற்பயிற்சிப் பதிவேடு" : "Active Workouts"}
          </h3>
          <p className="text-[11px] font-semibold text-slate-400">
            {isTamil ? "திறன் மற்றும் வலிமை அதிகரிக்கும் பதிவுகள்" : "Log movement & burn cal"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="workout-form">
        {/* Category Icons Selector */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2" id="workout-categories-grid">
          {categories.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as Workout["category"])}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  active 
                    ? "border-rose-400 bg-rose-50 text-rose-700 font-semibold" 
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-500"
                }`}
                id={`workout-cat-${c.id}`}
              >
                <span className="text-lg">
                  {c.id === "walking" && "🚶"}
                  {c.id === "running" && "🏃"}
                  {c.id === "yoga" && "🧘"}
                  {c.id === "strength" && "💪"}
                  {c.id === "other" && "⚽"}
                </span>
                <span className="text-[9px] font-medium leading-tight">
                  {isTamil ? c.labelTamil.split(" (")[0] : c.labelEnglish}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom description and duration slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="workout-inputs-grid">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
              {isTamil ? "குறிப்பிட்ட பெயர் (அல்லது குறிப்பு)" : "Custom Details (Optional)"}
            </label>
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder={isTamil ? "மாலை நேர நடை, எடையற்ற உடற்பயிற்சி..." : "Evening walk, weights..."}
              className="py-2.5 px-3 w-full border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-xs text-slate-700"
              id="input-workout-detail"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                {isTamil ? "கால அவகாசம்" : "Active Duration"}
              </label>
              <span className="text-xs font-bold text-rose-500">{duration} Min</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              id="input-workout-slider"
            />
          </div>
        </div>

        {/* Instant calculation summary */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50/50 to-teal-50/50 rounded-xl border border-rose-100 text-xs" id="workout-calculation-summary">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-slate-600 font-medium">
              {isTamil ? `சுமார் ${estimatedCalories} கலோரி எரிக்கப்படும்` : `Burn approx: ${estimatedCalories} kcal`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-white px-2.5 py-1 rounded-lg shadow-2xs">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>+{duration * 5} XP</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-200/50 active:scale-98"
          id="btn-add-workout"
        >
          <Plus className="h-4 w-4" />
          <span>{isTamil ? "உடற்பயிற்சியை பதிவிடு" : "Log Work Activity"}</span>
        </button>
      </form>

      {/* List of Today's logged exercises */}
      <div className="mt-5 pt-4 border-t border-slate-50" id="workout-list-section">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {isTamil ? "இன்றைய உடல் உழைப்பு பட்டியல்" : "Logged Workouts Today"}
        </h4>
        {workouts.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-100">
            {isTamil ? "இன்று உடற்பயிற்சி எதுவும் பதியப்படவில்லை." : "No workouts recorded yet today."}
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="workouts-list-container">
            <AnimatePresence>
              {workouts.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 text-xs transition-all"
                  id={`workout-item-${w.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-white rounded-lg border border-slate-100">
                      {w.category === "walking" && "🚶"}
                      {w.category === "running" && "🏃"}
                      {w.category === "yoga" && "🧘"}
                      {w.category === "strength" && "💪"}
                      {w.category === "other" && "⚽"}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 italic">{w.type}</span>
                      <div className="text-[9px] text-slate-400 flex items-center gap-1">
                        <span>{w.duration} {isTamil ? "நிமிடங்கள்" : "mins"}</span>
                        <span>•</span>
                        <span>{w.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{w.points} XP
                    </span>
                    <button
                      onClick={() => onRemoveWorkout(w.id, w.points)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded-sm hover:bg-red-50 transition-all"
                      id={`delete-workout-${w.id}`}
                      title={isTamil ? "நீக்கு" : "Delete workout"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
