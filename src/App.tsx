import React, { useState, useEffect } from "react";
import { UserProfile, Workout, Meal, Habit, CoachFeedback, DailyState, HistoryEntry, DEFAULT_HABIT_TEMPLATES, TRANSFORMATION_MOTIVATIONS } from "./types";
import Onboarding from "./components/Onboarding";
import WaterTracker from "./components/WaterTracker";
import WorkoutTracker from "./components/WorkoutTracker";
import MealTracker from "./components/MealTracker";
import HabitTracker from "./components/HabitTracker";
import AICoachCard from "./components/AICoachCard";
import HistoryLog from "./components/HistoryLog";
import BoyfriendWatcher from "./components/BoyfriendWatcher";
import AchievementsDashboard from "./components/AchievementsDashboard";
import { Sparkles, Trophy, Settings, RefreshCw, LogOut, Heart, HelpCircle, Flame, Moon, Compass, Globe, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const IMAGE_BANNER_PATH = "/src/assets/images/transformation_banner_1779267266600.png";

const generateInitialHistorySeed = (): HistoryEntry[] => {
  return [
    {
      date: "2026-05-19",
      waterDrank: 2.5,
      waterTarget: 2.5,
      workouts: [
        {
          id: "seed_w_19_1",
          type: "காலை யோகா (Morning Sun Salutations)",
          category: "yoga",
          duration: 30,
          points: 150,
          timestamp: "07:00 AM"
        }
      ],
      meals: [
        {
          id: "seed_m_19_1",
          name: "தினை இட்லி மற்றும் சாம்பார் (Millet Idli & Sambhar)",
          mealType: "breakfast",
          time: "08:30 AM",
          isClean: true,
          points: 50
        },
        {
          id: "seed_m_19_2",
          name: "கொண்டைக்கடலை சுண்டல் (Chickpea Salad)",
          mealType: "snack",
          time: "04:30 PM",
          isClean: true,
          points: 50
        }
      ],
      habits: DEFAULT_HABIT_TEMPLATES.map((h) => ({
        ...h,
        completed: h.id === "habit_sleep" || h.id === "habit_hydrate"
      })),
      pointsEarned: 450
    },
    {
      date: "2026-05-18",
      waterDrank: 3.0,
      waterTarget: 2.5,
      workouts: [
        {
          id: "seed_w_18_1",
          type: "மாலை நடைப்பயிற்சி (Evening Park Stroll)",
          category: "walking",
          duration: 40,
          points: 200,
          timestamp: "06:00 PM"
        }
      ],
      meals: [
        {
          id: "seed_m_18_1",
          name: "கோதுமை ரவை உப்மா (Broken Wheat Upma)",
          mealType: "dinner",
          time: "07:30 PM",
          isClean: true,
          points: 50
        }
      ],
      habits: DEFAULT_HABIT_TEMPLATES.map((h) => ({
        ...h,
        completed: h.id === "habit_sleep" || h.id === "habit_green"
      })),
      pointsEarned: 520
    },
    {
      date: "2026-05-17",
      waterDrank: 1.5,
      waterTarget: 2.5,
      workouts: [],
      meals: [
        {
          id: "seed_m_17_1",
          name: "கேழ்வரகு கூழ் (Healthy Ragi Porridge)",
          mealType: "lunch",
          time: "01:00 PM",
          isClean: true,
          points: 50
        }
      ],
      habits: DEFAULT_HABIT_TEMPLATES.map((h) => ({
        ...h,
        completed: h.id === "habit_hydrate"
      })),
      pointsEarned: 190
    }
  ];
};

export default function App() {
  const [language, setLanguage] = useState<"tamil" | "english">("tamil");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [waterDrank, setWaterDrank] = useState<number>(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [sparkleTrigger, setSparkleTrigger] = useState(false);

  const isTamil = language === "tamil";

  // Load and recover initial state from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("transformation_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        if (parsed.language) setLanguage(parsed.language);
      }

      const savedWater = localStorage.getItem("transformation_water");
      if (savedWater) setWaterDrank(Number(savedWater));

      const savedWorkouts = localStorage.getItem("transformation_workouts");
      if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));

      const savedMeals = localStorage.getItem("transformation_meals");
      if (savedMeals) setMeals(JSON.parse(savedMeals));

      const savedFeedback = localStorage.getItem("transformation_feedback");
      if (savedFeedback) setCoachFeedback(JSON.parse(savedFeedback));

      // Habits initialization
      const savedHabits = localStorage.getItem("transformation_habits");
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      } else {
        const initialHabits = DEFAULT_HABIT_TEMPLATES.map((h) => ({
          ...h,
          completed: false
        }));
        setHabits(initialHabits);
      }

      // History initialization
      const savedHistory = localStorage.getItem("transformation_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        const initialHistory = generateInitialHistorySeed();
        setHistory(initialHistory);
        localStorage.setItem("transformation_history", JSON.stringify(initialHistory));
      }
    } catch (e) {
      console.error("Local storage recovery failed", e);
    }
  }, []);

  // Recalculate total XP points dynamically based on logged activities
  useEffect(() => {
    // Water: 80 XP per L (+20 per 250ml)
    const waterXP = Math.round(waterDrank * 80);
    // Workouts: points precalculated on logged
    const workoutXP = workouts.reduce((acc, w) => acc + w.points, 0);
    // Meals: points precalculated on logged
    const mealsXP = meals.reduce((acc, m) => acc + m.points, 0);
    // Habits: points precalculated on completed
    const habitsXP = habits.reduce((acc, h) => acc + (h.completed ? h.points : 0), 0);

    const totalXP = waterXP + workoutXP + mealsXP + habitsXP;
    setPoints(totalXP);

    // Trigger cute sparkle animations on increment
    if (totalXP > 0) {
      setSparkleTrigger(true);
      const t = setTimeout(() => setSparkleTrigger(false), 800);
      return () => clearTimeout(t);
    }
  }, [waterDrank, workouts, meals, habits]);

  // Rotate motivational quote index every day/refresh
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * TRANSFORMATION_MOTIVATIONS.length);
    setQuoteIndex(randomIdx);
  }, [profile]);

  // Sync state helpers
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setLanguage(newProfile.language);
    localStorage.setItem("transformation_profile", JSON.stringify(newProfile));

    // Reset board variables if starting pristine
    const initialHabits = DEFAULT_HABIT_TEMPLATES.map((h) => ({
      ...h,
      completed: false
    }));
    setHabits(initialHabits);
    setWaterDrank(0);
    setWorkouts([]);
    setMeals([]);
    setCoachFeedback(null);

    localStorage.setItem("transformation_habits", JSON.stringify(initialHabits));
    localStorage.setItem("transformation_water", "0");
    localStorage.setItem("transformation_workouts", "[]");
    localStorage.setItem("transformation_meals", "[]");
    localStorage.removeItem("transformation_feedback");
  };

  const handleWaterUpdate = (newAmount: number) => {
    setWaterDrank(newAmount);
    localStorage.setItem("transformation_water", String(newAmount));
  };

  const handleAddWorkout = (work: Workout) => {
    const updated = [work, ...workouts];
    setWorkouts(updated);
    localStorage.setItem("transformation_workouts", JSON.stringify(updated));
  };

  const handleRemoveWorkout = (id: string) => {
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    localStorage.setItem("transformation_workouts", JSON.stringify(updated));
  };

  const handleAddMeal = (meal: Meal) => {
    const updated = [meal, ...meals];
    setMeals(updated);
    localStorage.setItem("transformation_meals", JSON.stringify(updated));
  };

  const handleRemoveMeal = (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    localStorage.setItem("transformation_meals", JSON.stringify(updated));
  };

  const handleToggleHabit = (id: string, completed: boolean) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, completed } : h));
    setHabits(updated);
    localStorage.setItem("transformation_habits", JSON.stringify(updated));
  };

  const handleFeedbackReceived = (feedback: CoachFeedback) => {
    setCoachFeedback(feedback);
    localStorage.setItem("transformation_feedback", JSON.stringify(feedback));
  };

  const handleClearFeedback = () => {
    setCoachFeedback(null);
    localStorage.removeItem("transformation_feedback");
  };

  const handleResetBoard = () => {
    if (window.confirm(isTamil ? "இன்றைய ஆரோக்கியப் பதிவுகள் அனைத்தையும் அழிக்க வேண்டுமா?" : "Are you sure you want to clear all of today's tracked metrics?")) {
      setWaterDrank(0);
      setWorkouts([]);
      setMeals([]);
      setCoachFeedback(null);
      const resetHabits = habits.map((h) => ({ ...h, completed: false }));
      setHabits(resetHabits);

      localStorage.setItem("transformation_water", "0");
      localStorage.setItem("transformation_workouts", "[]");
      localStorage.setItem("transformation_meals", "[]");
      localStorage.setItem("transformation_habits", JSON.stringify(resetHabits));
      localStorage.removeItem("transformation_feedback");
    }
  };

  const handleLogOut = () => {
    if (window.confirm(isTamil ? "உங்கள் சுயவிவரத்தை முழுமையாக நீக்கி வெளியேற வேண்டுமா?" : "Do you want to delete your profile and log out entirely?")) {
      localStorage.clear();
      setProfile(null);
      setWaterDrank(0);
      setWorkouts([]);
      setMeals([]);
      setCoachFeedback(null);
      setHabits([]);
      setHistory([]);
    }
  };

  const handleAddHistoryItem = (date: string, itemType: "workout" | "meal" | "water" | "habit", data: any) => {
    const todayDateStr = "2026-05-20";
    
    if (date === todayDateStr) {
      if (itemType === "workout") {
        handleAddWorkout(data);
      } else if (itemType === "meal") {
        handleAddMeal(data);
      } else if (itemType === "water") {
        handleWaterUpdate(waterDrank + data);
      } else if (itemType === "habit") {
        handleToggleHabit(data.id, true);
      }
    } else {
      const updatedHistory = [...history];
      let entryIdx = updatedHistory.findIndex((h) => h.date === date);
      
      if (entryIdx === -1) {
        const newEntry: HistoryEntry = {
          date,
          waterDrank: 0,
          waterTarget: profile ? profile.waterTarget : 2.5,
          workouts: [],
          meals: [],
          habits: DEFAULT_HABIT_TEMPLATES.map((h) => ({ ...h, completed: false })),
          pointsEarned: 0
        };
        updatedHistory.push(newEntry);
        entryIdx = updatedHistory.length - 1;
      }
      
      const entry = { ...updatedHistory[entryIdx] };
      
      if (itemType === "workout") {
        entry.workouts = [data, ...entry.workouts];
      } else if (itemType === "meal") {
        entry.meals = [data, ...entry.meals];
      } else if (itemType === "water") {
        entry.waterDrank = Math.max(0, entry.waterDrank + data);
      } else if (itemType === "habit") {
        entry.habits = entry.habits.map((h) => h.id === data.id ? { ...h, completed: true } : h);
      }
      
      const waterXP = Math.round(entry.waterDrank * 80);
      const workoutXP = entry.workouts.reduce((acc, w) => acc + w.points, 0);
      const mealsXP = entry.meals.reduce((acc, m) => acc + m.points, 0);
      const habitsXP = entry.habits.reduce((acc, h) => acc + (h.completed ? h.points : 0), 0);
      entry.pointsEarned = waterXP + workoutXP + mealsXP + habitsXP;
      
      updatedHistory[entryIdx] = entry;
      setHistory(updatedHistory);
      localStorage.setItem("transformation_history", JSON.stringify(updatedHistory));
    }
  };

  const handleRemoveHistoryItem = (date: string, itemType: "workout" | "meal" | "water" | "habit", id: string) => {
    const todayDateStr = "2026-05-20";
    
    if (date === todayDateStr) {
      if (itemType === "workout") {
        handleRemoveWorkout(id);
      } else if (itemType === "meal") {
        handleRemoveMeal(id);
      } else if (itemType === "water") {
        handleWaterUpdate(0);
      } else if (itemType === "habit") {
        handleToggleHabit(id, false);
      }
    } else {
      const updatedHistory = [...history];
      const entryIdx = updatedHistory.findIndex((h) => h.date === date);
      
      if (entryIdx !== -1) {
        const entry = { ...updatedHistory[entryIdx] };
        
        if (itemType === "workout") {
          entry.workouts = entry.workouts.filter((w) => w.id !== id);
        } else if (itemType === "meal") {
          entry.meals = entry.meals.filter((m) => m.id !== id);
        } else if (itemType === "water") {
          entry.waterDrank = 0;
        } else if (itemType === "habit") {
          entry.habits = entry.habits.map((h) => h.id === id ? { ...h, completed: false } : h);
        }
        
        const waterXP = Math.round(entry.waterDrank * 80);
        const workoutXP = entry.workouts.reduce((acc, w) => acc + w.points, 0);
        const mealsXP = entry.meals.reduce((acc, m) => acc + m.points, 0);
        const habitsXP = entry.habits.reduce((acc, h) => acc + (h.completed ? h.points : 0), 0);
        entry.pointsEarned = waterXP + workoutXP + mealsXP + habitsXP;
        
        updatedHistory[entryIdx] = entry;
        setHistory(updatedHistory);
        localStorage.setItem("transformation_history", JSON.stringify(updatedHistory));
      }
    }
  };

  // Level algorithms translation
  const getLevelInfo = (xp: number) => {
    if (xp <= 200) {
      return {
        level: 1,
        title: isTamil ? "தொடக்க நிலை சாதனையாளர்" : "Apprentice Tracker",
        nextXP: 200,
        emoji: "🌱"
      };
    }
    if (xp <= 500) {
      return {
        level: 2,
        title: isTamil ? "சுறுசுறுப்பான வழிகாட்டி" : "Active Adventurer",
        nextXP: 500,
        emoji: "🍃"
      };
    }
    if (xp <= 1000) {
      return {
        level: 3,
        title: isTamil ? "வலிமை வாய்ந்த பயணி" : "Stamina Climber",
        nextXP: 1000,
        emoji: "🔥"
      };
    }
    if (xp <= 2000) {
      return {
        level: 4,
        title: isTamil ? "நல்வாழ்வு நிபுணர்" : "Transformation Hero",
        nextXP: 2000,
        emoji: "🌟"
      };
    }
    return {
      level: 5,
      title: isTamil ? "ஆரோக்கிய மாஸ்டர்" : "Supreme Wellness Guru",
      nextXP: 5000,
      emoji: "👑"
    };
  };

  const todayDateStr = "2026-05-20";
  const todayEntry: HistoryEntry = {
    date: todayDateStr,
    waterDrank,
    waterTarget: profile ? profile.waterTarget : 2.5,
    workouts,
    meals,
    habits,
    pointsEarned: points
  };

  const displayedHistory = [
    ...history.filter((h) => h.date !== todayDateStr),
    todayEntry
  ];

  const totalCumulativePoints = history
    .filter((h) => h.date !== todayDateStr)
    .reduce((acc, h) => acc + h.pointsEarned, 0) + points;

  const levelInfo = getLevelInfo(totalCumulativePoints);
  const activeMotivation = TRANSFORMATION_MOTIVATIONS[quoteIndex] || TRANSFORMATION_MOTIVATIONS[0];

  const dailyState: DailyState = {
    profile,
    waterDrank,
    workouts,
    meals,
    habits,
    points: totalCumulativePoints
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 font-sans selection:bg-rose-100 antialiased" id="transformation-app">
      {/* Top Universal Elegant Header */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-rose-100/50 z-40 px-4 py-3 shadow-xs" id="navigation-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>🏵️</span>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none" id="app-nav-title">
                {isTamil ? "எனது மாற்றப் பயணம்" : "My Transform Quest"}
              </h1>
              <span className="text-[10px] text-rose-500 font-semibold tracking-wider uppercase">
                {isTamil ? "ஆரோக்கியம் மற்றும் ஏஐ வழிகாட்டி" : "Health, Hydration & Gemini Coach"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {profile && (
              <>
                {/* Boyfriend Watcher Navigation */}
                <button
                  onClick={() => {
                    const element = document.getElementById("boyfriend-watcher-panel");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 cursor-pointer text-xs font-semibold text-pink-700 transition-all shadow-2xs"
                  id="header-bf-btn"
                  title={isTamil ? "காதலர் கண்காணிப்பைக் காண்க" : "View boyfriend observer mode"}
                >
                  <span className="text-pink-500">❤️</span>
                  <span>{isTamil ? "காதலர்" : "Partner"}</span>
                </button>

                {/* Badges Dashboard Navigation */}
                <button
                  onClick={() => {
                    const element = document.getElementById("achievements-dashboard-panel");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 cursor-pointer text-xs font-semibold text-amber-700 transition-all shadow-2xs"
                  id="header-badges-btn"
                  title={isTamil ? "சாதனைகள் மற்றும் பேட்ஜ்கள்" : "View achievements and badges"}
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isTamil ? "பேட்ஜ்கள்" : "Badges"}</span>
                </button>

                <button
                  onClick={() => {
                    const element = document.getElementById("history-log-panel");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer text-xs font-semibold text-rose-700 transition-all shadow-2xs"
                  id="header-history-btn"
                  title={isTamil ? "வரலாற்றுப் பதிவுகளைக் காண்க" : "View historical logs"}
                >
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  <span>{isTamil ? "வரலாறு" : "History"}</span>
                </button>
              </>
            )}

            {/* Bilingual Translation Toggle */}
            <button
              onClick={() => {
                const nLang = language === "tamil" ? "english" : "tamil";
                setLanguage(nLang);
                if (profile) {
                  const updated = { ...profile, language: nLang };
                  setProfile(updated);
                  localStorage.setItem("transformation_profile", JSON.stringify(updated));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              id="lang-toggle-btn"
              title={isTamil ? "ஆங்கிலத்திற்கு மாற்று" : "Switch to Tamil"}
            >
              <Globe className="h-3.5 w-3.5 text-rose-500" />
              <span>{isTamil ? "English" : "தமிழ்"}</span>
            </button>

            {profile && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/60 pl-3 pr-2 py-1.5 rounded-full">
                <span className="font-semibold text-slate-600">
                  {isTamil ? `வணக்கம், ${profile.name}` : `Hello, ${profile.name}`}
                </span>
                <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-2 py-0.5 uppercase tracking-wide">
                  {profile.goal}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]" id="main-content-area">
        <AnimatePresence mode="wait">
          {!profile ? (
            /* Onboarding State */
            <div className="w-full flex items-center justify-center py-6" id="setup-state-view">
              <Onboarding 
                language={language} 
                onComplete={handleOnboardingComplete} 
                bannerUrl={IMAGE_BANNER_PATH}
              />
            </div>
          ) : (
            /* Dashboard State */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6"
              id="dashboard-container"
            >
              
              {/* Premium Header Hero banner section with vector illustration */}
              <div className="relative rounded-3xl bg-slate-900 overflow-hidden min-h-[160px] md:min-h-[200px] flex items-center p-6 md:p-10 border border-slate-800 shadow-lg" id="dashboard-banner-hero">
                <img 
                  src={IMAGE_BANNER_PATH} 
                  alt="Transformation Illustration" 
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-30 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual gradient filter */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent"></div>

                <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] bg-rose-500/90 text-white font-extrabold tracking-widest px-2.5 py-1 rounded-md uppercase">
                      {isTamil ? "முன்னேற்றப் பாதை" : "Active Daily Quest"}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black text-white italic leading-tight">
                      {isTamil ? `${profile.name}-ன் ஆரோக்கிய சவால்` : `${profile.name}'s Transformation Stage`}
                    </h2>
                    
                    {/* Compact stats overview badge */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">Goal: {profile.goal}</span>
                      <span>•</span>
                      <span>Weight: {profile.weight} kg</span>
                      <span>•</span>
                      <span>Height: {profile.height} cm</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">BMI: {((profile.weight / (profile.height/100 * profile.height/100))).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Level up Badge Widget */}
                  <motion.div 
                    scale={sparkleTrigger ? 1.05 : 1}
                    className="flex-none bg-white/9w bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-md max-w-sm"
                    id="level-badge"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-bold shadow-xs">
                        {levelInfo.emoji}
                      </div>
                    </div>
                    <div className="space-y-0.5 min-w-[140px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Points Rank</span>
                        <span className="text-[11px] text-amber-400 font-black">Level {levelInfo.level}</span>
                      </div>
                      <div className="font-extrabold text-white text-xs whitespace-nowrap">{levelInfo.title}</div>
                      
                      {/* Interactive score count */}
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-emerald-400 font-bold">{totalCumulativePoints} XP</span>
                        <span className="text-slate-500">Next Rank: {levelInfo.nextXP} XP</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min((totalCumulativePoints / levelInfo.nextXP) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Rotating quotes motivation box */}
              <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-xs md:text-sm text-slate-700 font-medium relative overflow-hidden" id="dashboard-quotes-card">
                <span className="text-xl">💡</span>
                <p className="leading-relaxed italic flex-1 text-slate-600">
                  {isTamil ? activeMotivation.tamil : activeMotivation.english}
                </p>
                <button 
                  onClick={() => setQuoteIndex((prev) => (prev + 1) % TRANSFORMATION_MOTIVATIONS.length)}
                  className="text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer flex-none"
                  id="btn-next-quote"
                >
                  {isTamil ? "அடுத்த கருத்து" : "Next Quote"}
                </button>
              </div>

              {/* Primary Bento Three-Module Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-grid-panel">
                
                {/* Left side: Hydration Tracker + Daily Checklists */}
                <div className="lg:col-span-4 space-y-6 flex flex-col justify-between" id="grid-col-left">
                  <WaterTracker 
                    language={language}
                    waterDrank={waterDrank}
                    waterTarget={profile.waterTarget}
                    onUpdate={handleWaterUpdate}
                  />

                  <HabitTracker 
                    language={language}
                    habits={habits}
                    onToggleHabit={handleToggleHabit}
                  />
                </div>

                {/* Middle side: Active Workouts logging and Nutrition Logging */}
                <div className="lg:col-span-8 space-y-6" id="grid-col-middle">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WorkoutTracker 
                      language={language}
                      workouts={workouts}
                      onAddWorkout={handleAddWorkout}
                      onRemoveWorkout={handleRemoveWorkout}
                    />

                    <MealTracker 
                      language={language}
                      meals={meals}
                      onAddMeal={handleAddMeal}
                      onRemoveMeal={handleRemoveMeal}
                    />
                  </div>
                </div>

              </div>

              {/* Boyfriend Observer Reaction Mode */}
              <div className="w-full" id="grid-row-boyfriend">
                <BoyfriendWatcher 
                  language={language}
                  dailyState={dailyState}
                />
              </div>

              {/* Universal AI Evaluation Card container panel */}
              <div className="w-full" id="grid-row-coach">
                <AICoachCard 
                  language={language}
                  dailyState={dailyState}
                  onFeedbackReceived={handleFeedbackReceived}
                  savedFeedback={coachFeedback}
                  onClearFeedback={handleClearFeedback}
                />
              </div>

              {/* Gamified Achievements, Badges, and Streaks visual dashboard */}
              <div className="w-full animate-fade-in" id="grid-row-achievements">
                <AchievementsDashboard 
                  language={language}
                  history={history}
                  todayState={todayEntry}
                />
              </div>

              {/* Interactive Multi-Format Sortable & Calendar History Board */}
              <div className="w-full animate-fade-in" id="grid-row-history">
                <HistoryLog
                  language={language}
                  history={displayedHistory}
                  onAddHistoryItem={handleAddHistoryItem}
                  onRemoveHistoryItem={handleRemoveHistoryItem}
                />
              </div>

              {/* Reset daily metrics panel & log out utility bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3xs" id="dashboard-footer-bar">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>🏵️ {isTamil ? "மாற்றப் பயணியினர்" : "Questor Badge ID"}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString(isTamil ? "ta-IN" : "en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetBoard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200/40 hover:bg-slate-100 cursor-pointer transition-all"
                    id="btn-reset-board"
                    title={isTamil ? "இன்றைய பதிவுகளை அழிக்க" : "Reset metrics list"}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isTamil ? "புதிதாகத் தொடங்கு" : "Reset Today's Logs"}</span>
                  </button>

                  <button
                    onClick={handleLogOut}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-50 cursor-pointer border border-red-100/30 transition-all"
                    id="btn-logout"
                    title={isTamil ? "வெளியேற" : "Log out"}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{isTamil ? "வெளியேறு" : "Logout / Reset"}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
