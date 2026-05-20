import React from "react";
import { Plus, Minus, Droplets, Sparkles, Flame } from "lucide-react";
import { motion } from "motion/react";

interface WaterTrackerProps {
  language: "tamil" | "english";
  waterDrank: number;
  waterTarget: number;
  onUpdate: (newAmount: number, pointsAdded: number) => void;
}

export default function WaterTracker({ language, waterDrank, waterTarget, onUpdate }: WaterTrackerProps) {
  const isTamil = language === "tamil";
  const percentage = Math.min(Math.round((waterDrank / waterTarget) * 100), 100);

  const handleAdd = (amount: number) => {
    // Each 250ml (0.25L) awards 20 points
    const points = Math.round(amount * 80); 
    onUpdate(parseFloat((waterDrank + amount).toFixed(2)), points);
  };

  const handleRemove = () => {
    if (waterDrank <= 0) return;
    const dec = 0.25;
    const newAmount = Math.max(0, parseFloat((waterDrank - dec).toFixed(2)));
    onUpdate(newAmount, 0); // No points for reducing water
  };

  const isCompleted = waterDrank >= waterTarget;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-blue-50 relative overflow-hidden" id="water-tracker-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Droplets className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800" id="water-heading-text">
              {isTamil ? "நீர் அருந்துதல்" : "Hydration Tracker"}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">
              {isTamil ? "காலை முதல் சுறுசுறுப்பு" : "Boost metabolism"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-blue-600 block leading-none">
            {waterDrank} / {waterTarget} L
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {isTamil ? `இலக்கு: ${waterTarget} லிட்டர்` : `Target: ${waterTarget} Liters`}
          </span>
        </div>
      </div>

      {/* Decorative Fluid Display Card */}
      <div className="relative h-24 bg-blue-50/40 rounded-2xl overflow-hidden border border-blue-100 flex items-center justify-center mb-4">
        {/* Animated Water Background */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-blue-400/30"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 40 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-blue-500/20 duration-1000 animate-pulse"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          style={{ transform: "scaleY(1.05)" }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {isCompleted ? (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex items-center gap-1 text-emerald-600 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                <span>{isTamil ? "வாவ்! இலக்கு எட்டப்பட்டது" : "Wow! Hydration Goal Solved"}</span>
              </div>
            </motion.div>
          ) : (
            <div className="text-center font-mono">
              <span className="text-2xl font-black text-slate-700">{percentage}%</span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isTamil ? "இன்றைய தண்ணீர் விழுக்காடு" : "Of daily formula logged"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={waterDrank <= 0}
          className="flex-none p-3.5 border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-slate-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          id="btn-remove-water"
          title={isTamil ? "நீர் அளவைக் குறை" : "Decrease water amount"}
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          onClick={() => handleAdd(0.25)}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-blue-200/40 cursor-pointer active:scale-98"
          id="btn-add-glass"
        >
          <Plus className="h-4 w-4 text-blue-500" />
          <span>{isTamil ? "+250 மி.லி (கோப்பை)" : "+250 mL (Glass)"}</span>
          <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full ml-1">+20 XP</span>
        </button>

        <button
          onClick={() => handleAdd(0.5)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          id="btn-add-bottle"
        >
          <Plus className="h-4 w-4" />
          <span>{isTamil ? "+500 மி.லி (பாட்டில்)" : "+500 mL (Bottle)"}</span>
          <span className="text-[9px] bg-blue-400 text-white px-1.5 py-0.5 rounded-full ml-1">+40 XP</span>
        </button>
      </div>
    </div>
  );
}
