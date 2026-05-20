import React, { useState } from "react";
import { HistoryEntry, Workout, Meal, Habit, DEFAULT_HABIT_TEMPLATES } from "../types";
import { 
  Award, Flame, Download, Share2, Clipboard,
  Clock, Zap, CheckCircle2, ChevronRight, Droplets, Target, Utensils, Info, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AchievementsDashboardProps {
  language: "tamil" | "english";
  history: HistoryEntry[];
  todayState: HistoryEntry;
}

interface Badge {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  descTamil: string;
  descEnglish: string;
  icon: string;
  color: string;
  checkUnlocked: (state: any, historyList: HistoryEntry[]) => { isUnlocked: boolean; progressStr: string; progressVal: number };
}

// 8 Gamified progress badges array defining custom criteria
const CUTE_BADGES: Badge[] = [
  {
    id: "badge_hydrate",
    nameTamil: "அமிர்த நீரேற்றி (Dolphin Hydrator)",
    nameEnglish: "Dolphin Hydrator",
    descTamil: "ஒரே நாளில் 2.5 லிட்டருக்கும் அதிகமாகத் தண்ணீர் குடிங்க.",
    descEnglish: "Log more than 2.5 Liters of water hydration in a single day.",
    icon: "🐬💙",
    color: "from-blue-400 to-cyan-500",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      const maxWater = Math.max(...allDays.map((d) => d.waterDrank));
      const reached = maxWater >= 2.5;
      return {
        isUnlocked: reached,
        progressStr: `${maxWater.toFixed(1)} / 2.5 L`,
        progressVal: Math.min((maxWater / 2.5) * 100, 100)
      };
    }
  },
  {
    id: "badge_millet",
    nameTamil: "சிறுதானியத் தோழன் (Millet Pioneer)",
    nameEnglish: "Millet Pioneer",
    descTamil: "ஆரோக்கியமான சிறுதானியம், தினை அல்லது கேழ்வரகு உணவைச் சாப்பிடுங்கள்.",
    descEnglish: "Eat a healthy traditional millet, ragi, or clean fuel meal.",
    icon: "🌾🥣",
    color: "from-amber-400 to-yellow-600",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      let hasMillet = false;
      allDays.forEach((d) => {
        d.meals.forEach((m) => {
          const lower = m.name.toLowerCase();
          if (
            m.isClean && (
              lower.includes("millet") || 
              lower.includes("ragi") || 
              lower.includes("தினை") || 
              lower.includes("கேழ்வரகு") || 
              lower.includes("சுண்டல்") || 
              lower.includes("கஞ்சி")
            )
          ) {
            hasMillet = true;
          }
        });
      });
      return {
        isUnlocked: hasMillet,
        progressStr: hasMillet ? "Unlocked!" : "No millets logged",
        progressVal: hasMillet ? 100 : 0
      };
    }
  },
  {
    id: "badge_double_burn",
    nameTamil: "இருசுடர் வீரன் (Double Burner)",
    nameEnglish: "Double Burner",
    descTamil: "ஒரே நாளில் 2 அல்லது அதற்கு மேற்பட்ட உடற்பயிற்சிகளைப் பதிவு செய்யுங்கள்.",
    descEnglish: "Log 2 or more distinct workout sessions in a single day.",
    icon: "☄️⚡",
    color: "from-rose-400 to-orange-500",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      const maxWorkouts = Math.max(...allDays.map((d) => d.workouts.length));
      const reached = maxWorkouts >= 2;
      return {
        isUnlocked: reached,
        progressStr: `${maxWorkouts} / 2 workouts in 1 day`,
        progressVal: Math.min((maxWorkouts / 2) * 100, 100)
      };
    }
  },
  {
    id: "badge_habit_master",
    nameTamil: "ஒழுக்கச் சிகரம் (Perfect Habit Master)",
    nameEnglish: "Perfect Habit Master",
    descTamil: "தினசரி ஆரோக்கியப் பழக்கவழக்கங்களில் 5-ஐ ஒட்டுமொத்தமாக முடியுங்கள்.",
    descEnglish: "Complete 5 or more daily healthy checklist habits simultaneously.",
    icon: "👑🏆",
    color: "from-violet-500 to-purple-700",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      const maxCompleted = Math.max(...allDays.map((d) => d.habits.filter(h => h.completed).length));
      const reached = maxCompleted >= 5;
      return {
        isUnlocked: reached,
        progressStr: `${maxCompleted} / 5 habits concurrently`,
        progressVal: Math.min((maxCompleted / 5) * 100, 100)
      };
    }
  },
  {
    id: "badge_three_streak",
    nameTamil: "தொடர் நெருப்பு (3-Day Streak Fire)",
    nameEnglish: "3-Day Streak Fire",
    descTamil: "தொடர்ந்து 3 நாட்கள் ஆரோக்கியப் பதிவுகளைப் பராமரியுங்கள்.",
    descEnglish: "Keep active logging streaks alive for 3 or more consecutive days.",
    icon: "🔥✨",
    color: "from-orange-500 to-red-600",
    checkUnlocked: (today, list) => {
      // Analyze unique sorted dates in list to see if 3 sequential days exist
      const allDates = Array.from(new Set([...list.map(d => d.date), today.date])).sort();
      let currentStreak = 0;
      let maxStreak = 0;
      
      if (allDates.length > 0) {
        currentStreak = 1;
        maxStreak = 1;
        for (let i = 1; i < allDates.length; i++) {
          const d1 = new Date(allDates[i - 1]);
          const d2 = new Date(allDates[i]);
          const diffTime = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        }
      }

      const reached = maxStreak >= 3;
      return {
        isUnlocked: reached,
        progressStr: `${maxStreak} / 3 continuous days`,
        progressVal: Math.min((maxStreak / 3) * 100, 100)
      };
    }
  },
  {
    id: "badge_zen_master",
    nameTamil: "மன அமைதி யோகி (Zen Yogi)",
    nameEnglish: "Zen Yogi",
    descTamil: "தியானம் அல்லது யோகப் பயிற்சிகளைப் பதிவு செய்யுங்கள்.",
    descEnglish: "Check off your meditation habit or log any peaceful yoga workout.",
    icon: "🧘‍♀️🌸",
    color: "from-emerald-400 to-teal-500",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      let unlocked = false;
      
      allDays.forEach((d) => {
        // Workout includes yoga
        d.workouts.forEach((w) => {
          if (w.category === "yoga" || w.type.toLowerCase().includes("yoga") || w.type.includes("யோகா")) {
            unlocked = true;
          }
        });
        // Habit includes meditation
        d.habits.forEach((h) => {
          if (h.completed && (h.id.includes("meditate") || h.titleEnglish.toLowerCase().includes("medit") || h.titleTamil.includes("தியானம்"))) {
            unlocked = true;
          }
        });
      });

      return {
        isUnlocked: unlocked,
        progressStr: unlocked ? "Mind Relaxed!" : "Meditate to unlock",
        progressVal: unlocked ? 100 : 0
      };
    }
  },
  {
    id: "badge_clean_warrior",
    nameTamil: "தூய உணவு வீரன் (Pure Fuel Warrior)",
    nameEnglish: "Pure Fuel Warrior",
    descTamil: "ஒரு நாளில் சர்க்கரை அல்லது துரித உணவுகள் இல்லாத சுத்தமான டயட்.",
    descEnglish: "Complete any full day with 100% clean, non-cheated healthy diet tracking.",
    icon: "🍉🥗",
    color: "from-green-400 to-emerald-600",
    checkUnlocked: (today, list) => {
      const allDays = [...list, today];
      let cleanDayFound = false;
      allDays.forEach((d) => {
        if (d.meals.length > 0 && d.meals.every((m) => m.isClean)) {
          cleanDayFound = true;
        }
      });
      return {
        isUnlocked: cleanDayFound,
        progressStr: cleanDayFound ? "Clean Day met!" : "Need a 100% wholesome organic day",
        progressVal: cleanDayFound ? 100 : 0
      };
    }
  },
  {
    id: "badge_score_legend",
    nameTamil: "சிகரப் புள்ளி மாஸ்டர் (1000XP Legend)",
    nameEnglish: "1000XP Legend",
    descTamil: "வரலாற்றுப் புள்ளிகளில் ஒட்டுமொத்தமாக 1000 பாயிண்ட்ஸைக் கடந்து சாதனை படைத்திடுங்க.",
    descEnglish: "Amass a grand cumulative score of 1000 points or above.",
    icon: "🔥🏔️",
    color: "from-indigo-500 to-rose-500",
    checkUnlocked: (today, list) => {
      const totalPoints = list.reduce((acc, d) => acc + d.pointsEarned, 0) + today.pointsEarned;
      const reached = totalPoints >= 1000;
      return {
        isUnlocked: reached,
        progressStr: `${totalPoints} / 1000 Total XP`,
        progressVal: Math.min((totalPoints / 1000) * 100, 100)
      };
    }
  }
];

export default function AchievementsDashboard({ language, history, todayState }: AchievementsDashboardProps) {
  const isTamil = language === "tamil";
  
  // Local state for UI feedback
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // 1. STREAK CALCULATOR
  const calculateStreakStats = () => {
    const allDates = Array.from(new Set([...history.map(d => d.date), todayState.date])).sort();
    let currentStreak = 0;
    let maxStreak = 0;

    if (allDates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < allDates.length; i++) {
        const d1 = new Date(allDates[i - 1]);
        const d2 = new Date(allDates[i]);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      }
    }
    return { currentStreak, maxStreak };
  };

  const { currentStreak, maxStreak } = calculateStreakStats();

  // 2. DETAILED DAILY GOAL PROGRESS CALCULATIONS
  const workoutTarget = 1; // At least 1 workout
  const currentWorkoutsCount = todayState.workouts.length;
  const workoutPct = Math.min((currentWorkoutsCount / workoutTarget) * 100, 100);

  const waterDrank = todayState.waterDrank;
  const waterTarget = todayState.waterTarget;
  const waterPct = Math.min((waterDrank / waterTarget) * 100, 100);

  const habitsCompleted = todayState.habits.filter(h => h.completed).length;
  const totalHabitsCount = todayState.habits.length || 7;
  const habitsPct = Math.min((habitsCompleted / totalHabitsCount) * 100, 100);

  const totalMealsCount = todayState.meals.length;
  const cleanMealsCount = todayState.meals.filter(m => m.isClean).length;
  const nutritionPct = totalMealsCount > 0 ? (cleanMealsCount / totalMealsCount) * 100 : 0;

  // Aggregate daily completeness score
  const dailyCompletenessScore = Math.round((workoutPct + waterPct + habitsPct) / 3);

  // 3. SOCIAL SHARING BUILDER
  const handleCopyShareCard = () => {
    const bfName = localStorage.getItem("transformation_bf_name") || "Karthik";
    const bfPersona = localStorage.getItem("transformation_bf_persona") || "sweet";
    
    // Aesthetic text-based layout formatted for WhatsApp, Twitter or Instagram DM
    const shareText = isTamil
      ? `🏆 *இன்றைய மாற்றப் பயணம் சவால் வென்றேன்!* \n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📈 *மதிப்பீடு*: ${todayState.pointsEarned} XP புள்ளிகள்!\n` +
        `🥤 *குடிநீர்*: ${waterDrank}L / ${waterTarget}L (${Math.round(waterPct)}%)\n` +
        `🏃 *உடற்பயிற்சிகள்*: ${currentWorkoutsCount} logged (${todayState.workouts.map(w => w.type).join(', ') || 'இல்லை'})\n` +
        `🥗 *முயற்சிகள்*: ${habitsCompleted} ஆரோக்கிய பழக்கங்கள் பூர்த்தி!\n` +
        `🔥 *தொடர் சாதனை*: ${currentStreak} நாட்கள்!\n` +
        `❤️ *காதலர் ${bfName} நற்சான்று*: "மெல்ல மெல்ல உங்களை மெருகேற்றிக் கொள்ளும் நல்வீரன்!"\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 எனது மாற்றப் பயணம் ஏஐ மூலம் நீங்களும் முயலுங்கள்!`
      : `🏆 *Transform Quest Goal Complete!* \n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📈 *Score*: +${todayState.pointsEarned} XP Today!\n` +
        `🥤 *Hydration*: ${waterDrank}L / ${waterTarget}L logged (${Math.round(waterPct)}%)\n` +
        `🏃 *Movements*: ${currentWorkoutsCount} logged (${todayState.workouts.map(w => w.type).join(', ') || 'None yet'})\n` +
        `🥗 *Habits Met*: ${habitsCompleted} checklist items cleared!\n` +
        `🔥 *Consecutive Streak*: ${currentStreak} Days Active!\n` +
        `❤️ *Bf ${bfName}'s Endorsement*: "Absolutely stunning dedication, keep moving!"\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 Built with love, health & Gemini Coaching.`;

    navigator.clipboard.writeText(shareText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2200);
  };

  // 4. EXPORT HISTORY (CSV / JSON Generator)
  const handleExportCSV = () => {
    // Collect full history including today
    const currentTodayEntry: HistoryEntry = {
      date: todayState.date,
      waterDrank,
      waterTarget,
      workouts: todayState.workouts,
      meals: todayState.meals,
      habits: todayState.habits,
      pointsEarned: todayState.pointsEarned
    };
    
    const combined = [...history.filter(h => h.date !== todayState.date), currentTodayEntry];
    
    // Formulate clean CSV lines
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,WaterDrank(L),WaterTarget(L),WorkoutsLoggedCount,MealsLoggedCount,HabitCompletedCount,PointsEarned(XP)\n";
    
    combined.forEach((entry) => {
      const workoutCount = entry.workouts.length;
      const mealCount = entry.meals.length;
      const habitCount = entry.habits.filter(h => h.completed).length;
      csvContent += `${entry.date},${entry.waterDrank},${entry.waterTarget},${workoutCount},${mealCount},${habitCount},${entry.pointsEarned}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transformation_Health_Log_${todayState.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const currentTodayEntry: HistoryEntry = {
      date: todayState.date,
      waterDrank,
      waterTarget,
      workouts: todayState.workouts,
      meals: todayState.meals,
      habits: todayState.habits,
      pointsEarned: todayState.pointsEarned
    };
    const combined = [...history.filter(h => h.date !== todayState.date), currentTodayEntry];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(combined, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Transformation_Metric_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-6 space-y-6" id="achievements-dashboard-panel">
      
      {/* Main Header bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-rose-50 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-extrabold pb-1">
            <Award className="h-4 w-4 animate-bounce" />
            <span className="uppercase tracking-widest">{isTamil ? "சாதனைகள் & புள்ளிவிவரங்கள்" : "Achievements & Metrics Portal"}</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight" id="achievements-card-heading">
            {isTamil ? "நல்வாழ்வு இலக்குகள் & பேட்ஜ்கள்" : "My Wellness Badges & Gamified Milestones"}
          </h2>
        </div>

        {/* Export Data Action Pack */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
            {isTamil ? "பதிவேட்டை ஏற்றுமதிக்க" : "Export Log:"}
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs border border-slate-200 cursor-pointer shadow-3xs transition-all"
            id="btn-export-csv"
            title="Download CSV database file"
          >
            <Download className="h-3.5 w-3.5 text-emerald-500" />
            <span>CSV</span>
          </button>
          
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs border border-slate-200 cursor-pointer shadow-3xs transition-all"
            id="btn-export-json"
            title="Download complete raw JSON health report"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="achievements-bento-grid">
        
        {/* Left Column: Streak Flame & Daily Completeness Progress Indicator */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between bg-slate-50/50 p-5 rounded-2xl border border-slate-150/70" id="bento-col-left">
          
          {/* Flame streak widget */}
          <div className="space-y-3 relative overflow-hidden" id="streak-flame-widget">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                🔥 {isTamil ? "பதிவுகள் தொடர்ச்சி" : "Active Tracking Streak"}
              </span>
              <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                {isTamil ? "நாள் சாதனை" : "Consecutive days"}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="relative">
                <span className="text-4xl filter drop-shadow-[0_2px_12px_rgba(239,68,68,0.45)]">🔥</span>
                {currentStreak > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {currentStreak}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 leading-none flex items-baseline gap-1.5">
                  <span>{currentStreak} {isTamil ? "நாட்கள்" : "Days"}</span>
                  <span className="text-xs font-semibold text-slate-400">({isTamil ? "தற்போதைய தொடர்" : "current"})</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {isTamil ? `அதிகபட்ச சாதனை: ${maxStreak} நாட்கள்!` : `All-time longest streak: ${maxStreak} days!`}
                </p>
              </div>
            </div>

            {/* Micro visual streak bubbles representing 7 days */}
            <div className="grid grid-cols-7 gap-2 pt-3" id="visual-streak-bubbles">
              {Array.from({ length: 7 }).map((_, idx) => {
                const dayOffset = 6 - idx;
                const d = new Date();
                d.setDate(d.getDate() - dayOffset);
                const dStr = d.toISOString().split("T")[0];
                const checked = history.some((h) => h.date === dStr) || dStr === todayState.date;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400">
                      {d.toLocaleDateString(isTamil ? "ta-IN" : "en-US", { weekday: "narrow" })}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      checked 
                        ? "bg-rose-500 text-white font-extrabold shadow-sm ring-1 ring-rose-200" 
                        : "bg-slate-200 text-slate-400"
                    }`}>
                      {checked ? "🔥" : d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily gauge percentage target ring */}
          <div className="border-t border-slate-250/55 pt-5 space-y-4" id="daily-completeness-widget">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                🎯 {isTamil ? "இன்றைய இலக்கு முழுமை" : "Today's Target Progress"}
              </span>
              <span className="text-xs font-extrabold text-rose-500">{dailyCompletenessScore}%</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Simple visual bar progression */}
              <div className="flex-1 bg-slate-200/60 h-3 rounded-full overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full transition-all" 
                  style={{ width: `${dailyCompletenessScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[8px] uppercase tracking-wider block text-slate-400 font-bold">{isTamil ? "குடிநீர் அளவு" : "Hydration Level"}</span>
                <span className="text-xs font-black text-blue-500">{waterDrank} / {waterTarget} L ({Math.round(waterPct)}%)</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[8px] uppercase tracking-wider block text-slate-400 font-bold">{isTamil ? "உடற்பயிற்சி" : "Active Workouts"}</span>
                <span className="text-xs font-black text-rose-500">{currentWorkoutsCount} logged ({Math.round(workoutPct)}%)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Gamified Badges unlocked / locked grid board */}
        <div className="lg:col-span-8 space-y-5" id="bento-col-right">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">
              🎖️ {isTamil ? "உங்களது சாதனைப் பேட்ஜ்கள்" : "My Health Badges Shelf"}
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold">
              {isTamil ? "தொட்டு விவரங்களைக் காண்க" : "Click badge to view guidelines"}
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="badges-icons-shelf-grid">
            {CUTE_BADGES.map((b) => {
              const { isUnlocked, progressStr, progressVal } = b.checkUnlocked(todayState, history);
              
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`relative p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-2.5 transition-all cursor-pointer active:scale-97 ${
                    isUnlocked 
                      ? "bg-white border-rose-100 hover:border-rose-300 shadow-md" 
                      : "bg-slate-100/50 border-slate-200 text-slate-400 opacity-60"
                  }`}
                  id={`achieve-badge-icon-${b.id}`}
                >
                  {/* Unlocked sparkles micro effects top corner */}
                  {isUnlocked && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] animate-bounce">
                      ⭐
                    </span>
                  )}

                  {/* Badge Representation */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-tr ${
                    isUnlocked ? b.color + " text-white shadow-md animate-pulse" : "bg-zinc-200 text-zinc-400"
                  }`}>
                    {isUnlocked ? b.icon.substring(0,2) : "🔒"}
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 leading-tight line-clamp-1">
                      {isTamil ? b.nameTamil.split(" (")[0] : b.nameEnglish}
                    </h4>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5 whitespace-nowrap">
                      {isUnlocked ? (isTamil ? "வென்றது" : "Unlocked") : (isTamil ? "பூட்டப்பட்டது" : "Locked")}
                    </span>
                  </div>

                  {/* Criteria Micro progress line */}
                  <div className="w-full space-y-1">
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${progressVal}%` }}></div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 font-extrabold block">
                      {progressStr}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Social Invitation / Share Mockup Card block */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4" id="social-share-strip">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                {isTamil ? "நண்பர்களோடு பகிருங்கள்" : "Share with family"}
              </span>
              <h4 className="text-xs font-black text-slate-100">
                {isTamil ? "உங்கள் தினசரி முன்னேற்றத்தை வாட்ஸ்அப்பில் பகிருங்கள்!" : "Copy beautifully customized status text report directly!"}
              </h4>
              <p className="text-[10px] text-slate-400">
                {isTamil ? "ஒரு கிளிக்கில் உங்களின் நற்பழக்கம் & புள்ளிகள் நகலெடுக்கப்படும்." : "Formatted properly with flame emojis, hearts, and active water statistics."}
              </p>
            </div>

            <button
              onClick={handleCopyShareCard}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-black cursor-pointer transition-all ${
                copiedNotification 
                  ? "bg-emerald-500 text-white shadow-md animate-bounce" 
                  : "bg-white text-slate-900 border border-slate-250 hover:bg-slate-100 shadow-sm"
              }`}
              id="btn-trigger-social-share"
            >
              {copiedNotification ? (
                <span>✓ {isTamil ? "நகலெடுக்கப்பட்டது!" : "Copied status!"}</span>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>{isTamil ? "பதிவைப் பகிரு" : "Copy Shareable Text"}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Accordion view for selected badge parameters guidance */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            id="badge-modal"
          >
            <div className="bg-white max-w-sm w-full rounded-3xl p-6 border border-rose-100 shadow-2xl text-center space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-slate-400 hover:text-slate-800 cursor-pointer font-extrabold text-sm border px-2 py-1.5 rounded-lg"
                  id="btn-close-badge-modal"
                >
                  ✕
                </button>
              </div>

              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl bg-amber-50">
                {selectedBadge.icon}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800">
                  {isTamil ? selectedBadge.nameTamil : selectedBadge.nameEnglish}
                </h3>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                  {isTamil ? "நல்வாழ்வுப் பதக்கம்" : "Honorary Fitness Badge"}
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {isTamil ? selectedBadge.descTamil : selectedBadge.descEnglish}
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl text-left space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">{isTamil ? "அடைவதற்கான வழி" : "Unlocks When:"}</span>
                <p className="text-[10px] text-slate-700 font-semibold leading-relaxed">
                  {selectedBadge.id === "badge_hydrate" && (isTamil ? "ஒரு நாளில் 2.5 லிட்டர் குடிநீர் பதிவிட வேண்டும்." : "Log 2.5 Liters of water in a day.")}
                  {selectedBadge.id === "badge_millet" && (isTamil ? "'தினை' அல்லது 'millet' என்ற வார்த்தை கொண்ட ஆரோக்கிய உணவைச் சேர்க்க வேண்டும்." : "Type 'millet' or 'ragi' in any healthy clean meal logging label.")}
                  {selectedBadge.id === "badge_double_burn" && (isTamil ? "ஒரே நாளில் 2 உடற்பயிற்சிப் பதிவுகளைச் சேர்க்க வேண்டும்." : "Log two workouts inside your middle tracker sheet.")}
                  {selectedBadge.id === "badge_habit_master" && (isTamil ? "5 நல்வாழ்வுப் பழக்கங்களைக் குறிக்கொண்டு முடிக்க வேண்டும்." : "Toggle 5 daily habit checklist templates to checked State.")}
                  {selectedBadge.id === "badge_three_streak" && (isTamil ? "தொடர்ந்து 3 நாட்கள் லாக் செய்ய வேண்டும்." : "Log your routine metrics for 3 consecutive days.")}
                  {selectedBadge.id === "badge_zen_master" && (isTamil ? "காலை யோகா அல்லது தியானம் பழக்கம் முடிக்க வேண்டும்." : "Complete meditation/yoga in exercise or checklist habits.")}
                  {selectedBadge.id === "badge_clean_warrior" && (isTamil ? "அனைத்து உணவுகளையும் சத்துணவாகப் பதிவிட வேண்டும்." : "Make sure all meals logged in a single day are checked clean.")}
                  {selectedBadge.id === "badge_score_legend" && (isTamil ? "உங்கள் மொத்தப் புள்ளிகள் 1000ஐ விட அதிகரிக்க வேண்டும்." : "Amass a total lifetime points score upwards of 1000 XP.")}
                </p>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer active:scale-97 transition-all"
                id="btn-badge-modal-dismiss"
              >
                {isTamil ? "சரி" : "Okay, Got it!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
