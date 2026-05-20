import React, { useState } from "react";
import { Meal } from "../types";
import { Salad, Plus, Trash2, Leaf, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MealTrackerProps {
  language: "tamil" | "english";
  meals: Meal[];
  onAddMeal: (meal: Meal) => void;
  onRemoveMeal: (id: string, refundPoints: number) => void;
}

export default function MealTracker({ language, meals, onAddMeal, onRemoveMeal }: MealTrackerProps) {
  const isTamil = language === "tamil";
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<Meal["mealType"]>("breakfast");
  const [isClean, setIsClean] = useState(true);

  const mealTypes = [
    { value: "breakfast", labelTa: "காலை உணவு (Breakfast)", labelEn: "Breakfast" },
    { value: "lunch", labelTa: "மதிய உணவு (Lunch)", labelEn: "Lunch" },
    { value: "dinner", labelTa: "இரவு உணவு (Dinner)", labelEn: "Dinner" },
    { value: "snack", labelTa: "சிற்றுண்டி (Snack)", labelEn: "Snacks" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    // Clean diet grants 50 XP, organic/standard log grants 15 XP
    const points = isClean ? 50 : 15;

    const newMeal: Meal = {
      id: "meal_" + Date.now(),
      name: mealName.trim(),
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isClean,
      points
    };

    onAddMeal(newMeal);
    setMealName("");
    setIsClean(true); // reset clean log
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-teal-50" id="meal-tracker-card">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Salad className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800" id="meal-heading-text">
            {isTamil ? "உணவுப் பதிவேடு" : "Healthy Nutrition Log"}
          </h3>
          <p className="text-[11px] font-semibold text-slate-400">
            {isTamil ? "உண்ட உணவுகளைப் பதிந்து சமநிலைப்படுத்துங்கள்" : "Track fuel, eat clean"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="meal-form">
        {/* Meal Type Select Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="meal-type-select-grid">
          {mealTypes.map((type) => {
            const active = mealType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setMealType(type.value as Meal["mealType"])}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  active 
                    ? "border-teal-400 bg-teal-50/50 text-teal-700 font-semibold" 
                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-500"
                }`}
                id={`meal-type-btn-${type.value}`}
              >
                <span className="text-xs">
                  {isTamil ? type.labelTa.split(" (")[0] : type.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Food Description */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            {isTamil ? "என்ன உணவு உண்டீர்கள்?" : "What did you eat?"}
          </label>
          <input
            type="text"
            required
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder={isTamil ? "முருங்கைக்கீரை சாம்பார், இட்லி, பழங்கள், தினை உப்மா..." : "Idli, Millet dosa, organic salads, brown rice..."}
            className="py-2.5 px-3 w-full border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-400 text-xs text-slate-700 font-medium"
            id="input-meal-name"
          />
        </div>

        {/* Option: Clean food checkbox card */}
        <button
          type="button"
          onClick={() => setIsClean(!isClean)}
          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
            isClean 
              ? "border-emerald-300 bg-emerald-50/30 text-emerald-800" 
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-500"
          }`}
          id="toggle-clean-meal"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isClean ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">{isTamil ? "இது சத்தான சத்துணவா?" : "Is this a Clean/Healthy meal?"}</span>
              <span className="text-[10px] text-slate-400">
                {isTamil ? "சிறுதானியங்கள், காய்கறிகள், இயற்கை மூலப்பொருள்..." : "Whole grains, veggies, organic, zero sugars..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-xs bg-white px-2.5 py-1 rounded-lg border shadow-3xs">
            {isClean ? (
              <span className="text-emerald-600 font-extrabold">+50 XP</span>
            ) : (
              <span className="text-slate-500">+15 XP</span>
            )}
          </div>
        </button>

        <button
          type="submit"
          className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-2.5 px-4 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-center gap-1.5 border border-teal-200/50 active:scale-98"
          id="btn-add-meal"
        >
          <Plus className="h-4 w-4" />
          <span>{isTamil ? "உணவை கணக்கில் சேர்" : "Log Nutrition Entry"}</span>
        </button>
      </form>

      {/* List of Today's logged meals */}
      <div className="mt-5 pt-4 border-t border-slate-50" id="meals-list-section">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {isTamil ? "இன்றைய உணவுப் பட்டியல்" : "Logged Food Intake Today"}
        </h4>
        {meals.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-100">
            {isTamil ? "இன்று உணவு எதுவும் பதிவிடப்படவில்லை." : "No nutrition registered standardly today."}
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1" id="meals-list-container">
            <AnimatePresence>
              {meals.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 text-xs transition-all"
                  id={`meal-item-${m.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {m.mealType === "breakfast" ? "🥞" : m.mealType === "lunch" ? "🍱" : m.mealType === "dinner" ? "🥗" : "🍎"}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1 italic">
                        {m.name}
                        {m.isClean && (
                          <Leaf className="h-3.5 w-3.5 text-emerald-500 inline-block" title={isTamil ? "சத்துணவு" : "Clean Health"} />
                        )}
                      </span>
                      <div className="text-[9px] text-slate-400 flex items-center gap-1">
                        <span className="capitalize">{m.mealType}</span>
                        <span>•</span>
                        <span>{m.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${m.isClean ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                      +{m.points} XP
                    </span>
                    <button
                      onClick={() => onRemoveMeal(m.id, m.points)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded-sm hover:bg-red-50 transition-all"
                      id={`delete-meal-${m.id}`}
                      title={isTamil ? "நீக்கு" : "Delete nutrition log"}
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
