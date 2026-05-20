import React from "react";
import { Habit } from "../types";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HabitTrackerProps {
  language: "tamil" | "english";
  habits: Habit[];
  onToggleHabit: (id: string, completed: boolean, points: number) => void;
}

export default function HabitTracker({ language, habits, onToggleHabit }: HabitTrackerProps) {
  const isTamil = language === "tamil";

  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xs border border-violet-50" id="habit-tracker-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800" id="habit-heading-text">
            {isTamil ? "நல்வாழ்வு பழக்கங்கள்" : "Daily Healthy Habits"}
          </h3>
          <p className="text-[11px] font-semibold text-slate-400">
            {isTamil ? "சிறிய செயல்கள் தரும் பெரிய மாற்றங்கள்" : "Unlock compound transformation"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-violet-600 block">
            {completedCount} / {total}
          </span>
          <span className="text-[10px] text-slate-400">
            {isTamil ? "செயல்கள்" : "Checklists"}
          </span>
        </div>
      </div>

      {/* Progress slider mini indicator */}
      <div className="mb-5 space-y-1" id="habit-progress-line">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
          <span>{isTamil ? "முழுமைத் தன்மை" : "Completion Ratio"}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>

      {/* List layout of habits */}
      <div className="space-y-2.5" id="habits-list-layout">
        {habits.map((h) => {
          return (
            <button
              key={h.id}
              onClick={() => onToggleHabit(h.id, !h.completed, h.points)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                h.completed
                  ? "border-violet-200 bg-violet-50/40 text-slate-500"
                  : "border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-700"
              }`}
              id={`habit-row-${h.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-none">
                  {h.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-violet-600 animate-scale-up" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 hover:text-violet-400" />
                  )}
                </div>
                <span className={`text-xs font-semibold leading-tight ${h.completed ? "line-through text-slate-400" : ""}`}>
                  {isTamil ? h.titleTamil : h.titleEnglish}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-none font-bold text-[9px] bg-white px-2 py-0.5 rounded-md border border-slate-100">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span className={h.completed ? "text-violet-500" : "text-slate-500"}>+{h.points} XP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
