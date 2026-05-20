import React, { useState } from "react";
import { HistoryEntry, Workout, Meal, Habit, DEFAULT_HABIT_TEMPLATES } from "../types";
import { 
  Calendar, CheckCircle, Trash2, Plus, Search, ArrowUpDown, Filter, 
  Settings, Award, Flame, Salad, Droplets, Activity, ChevronLeft, ChevronRight, MessageSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryLogProps {
  language: "tamil" | "english";
  history: HistoryEntry[];
  onAddHistoryItem: (date: string, itemType: "workout" | "meal" | "water" | "habit", data: any) => void;
  onRemoveHistoryItem: (date: string, itemType: "workout" | "meal" | "water" | "habit", id: string) => void;
}

export default function HistoryLog({ language, history, onAddHistoryItem, onRemoveHistoryItem }: HistoryLogProps) {
  const isTamil = language === "tamil";

  // State Management
  const [activeTab, setActiveTab] = useState<"calendar" | "table">("calendar");
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-19");
  
  // Table search & filter states
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "workout" | "meal" | "habit">("all");
  const [sortField, setSortField] = useState<"date" | "points" | "name">("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Manual Log Expansion & Form State
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [formType, setFormType] = useState<"workout" | "meal" | "water" | "habit">("workout");
  const [formDate, setFormDate] = useState("2026-05-19");
  
  // Specific Form states
  const [workoutInput, setWorkoutInput] = useState({ type: "", category: "walking" as Workout["category"], duration: 30 });
  const [mealInput, setMealInput] = useState({ name: "", mealType: "lunch" as Meal["mealType"], isClean: true });
  const [waterInput, setWaterInput] = useState({ amount: 0.5 });
  const [selectedHabitId, setSelectedHabitId] = useState(DEFAULT_HABIT_TEMPLATES[0].id);

  // Month navigation (Fixed for May 2026 context)
  const currentMonthYear = isTamil ? "மே 2026 (May 2026)" : "May 2026";
  const daysInMay = 31;
  const mayStartWeekday = 5; // May 1st 2026 is a Friday (5 in JavaScript 0-index Sunday, or offset accordingly for grid slot)

  // Construct items for flat sortable list
  const getFlatHistoricItems = () => {
    let list: {
      id: string;
      date: string;
      itemType: "workout" | "meal" | "habit" | "water";
      categoryLabel: string;
      name: string;
      details: string;
      points: number;
    }[] = [];

    history.forEach((entry) => {
      // Add workouts
      entry.workouts.forEach((w) => {
        list.push({
          id: w.id,
          date: entry.date,
          itemType: "workout",
          categoryLabel: w.category,
          name: w.type,
          details: `${w.duration} ${isTamil ? "நிமிடங்கள்" : "mins"}`,
          points: w.points,
        });
      });

      // Add meals
      entry.meals.forEach((m) => {
        list.push({
          id: m.id,
          date: entry.date,
          itemType: "meal",
          categoryLabel: m.mealType,
          name: m.name,
          details: m.isClean 
            ? (isTamil ? "ஆரோக்கிய உணவு" : "Clean Healthy Fuel") 
            : (isTamil ? "சாதாரண உணவு" : "Regular Diet Log"),
          points: m.points,
        });
      });

      // Add completed habits
      entry.habits.forEach((h) => {
        if (h.completed) {
          list.push({
            id: h.id + "_" + entry.date,
            date: entry.date,
            itemType: "habit",
            categoryLabel: "habit",
            name: isTamil ? h.titleTamil : h.titleEnglish,
            details: isTamil ? "பழக்கவழக்கம்" : "Habit Checked",
            points: h.points,
          });
        }
      });

      // Add hydration if positive
      if (entry.waterDrank > 0) {
        list.push({
          id: "water_" + entry.date,
          date: entry.date,
          itemType: "water",
          categoryLabel: "hydration",
          name: isTamil ? "குடிநீர் அருந்துதல்" : "Hydration Fluid Intake",
          details: `${entry.waterDrank} / ${entry.waterTarget} L`,
          points: Math.round(entry.waterDrank * 80),
        });
      }
    });

    return list;
  };

  const toggleSort = (field: "date" | "points" | "name") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === "workout") {
      const typeLabel = workoutInput.type.trim() || (isTamil ? "உடற்பயிற்சி" : "Workout exercise");
      const points = workoutInput.duration * 5;
      const workoutObj: Workout = {
        id: "w_hist_" + Date.now(),
        type: typeLabel,
        category: workoutInput.category,
        duration: workoutInput.duration,
        points,
        timestamp: "12:00 PM"
      };
      onAddHistoryItem(formDate, "workout", workoutObj);
      setWorkoutInput({ type: "", category: "walking", duration: 30 });
    } else if (formType === "meal") {
      if (!mealInput.name.trim()) return;
      const points = mealInput.isClean ? 50 : 15;
      const mealObj: Meal = {
        id: "m_hist_" + Date.now(),
        name: mealInput.name.trim(),
        mealType: mealInput.mealType,
        time: "01:30 PM",
        isClean: mealInput.isClean,
        points
      };
      onAddHistoryItem(formDate, "meal", mealObj);
      setMealInput({ name: "", mealType: "lunch", isClean: true });
    } else if (formType === "water") {
      if (waterInput.amount <= 0) return;
      onAddHistoryItem(formDate, "water", waterInput.amount);
    } else if (formType === "habit") {
      const foundHabit = DEFAULT_HABIT_TEMPLATES.find((h) => h.id === selectedHabitId);
      if (foundHabit) {
        onAddHistoryItem(formDate, "habit", foundHabit);
      }
    }
    // Automatically switch view to show results on the target date
    setSelectedDate(formDate);
    setIsLogFormOpen(false);
  };

  // Process flat items for filtering & sort
  const flatItems = getFlatHistoricItems();
  const filteredItems = flatItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.details.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.itemType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    if (sortField === "date") {
      comparison = a.date.localeCompare(b.date);
    } else if (sortField === "points") {
      comparison = a.points - b.points;
    } else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    }
    return sortAsc ? comparison : -comparison;
  });

  // Fetch feedback specs for specific clicked date in Inspector
  const selectedDayEntry = history.find((h) => h.date === selectedDate) || {
    date: selectedDate,
    waterDrank: 0,
    waterTarget: 2.5,
    workouts: [],
    meals: [],
    habits: [],
    pointsEarned: 0
  };

  // Quick statistics
  const totalEarnedHistoricalXP = history.reduce((acc, h) => acc + h.pointsEarned, 0);
  const totalExercisesLoggedCount = history.reduce((acc, h) => acc + h.workouts.length, 0);
  const totalCompletedHabitsCount = history.reduce((acc, h) => acc + h.habits.filter(ha => ha.completed).length, 0);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-6 space-y-6" id="history-log-panel">
      
      {/* Header and top tab selectors */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 border border-rose-150 rounded-2xl text-rose-500">
            <Calendar className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800" id="hist-heading-headline">
              {isTamil ? "ஆரோக்கிய வரலாற்றுப் பதிவேடு" : "My Health Transformation Log"}
            </h2>
            <p className="text-[11px] font-semibold text-slate-400">
              {isTamil ? "உங்கள் முந்தைய செயல்பாடுகள், தண்ணீர் அளவு மற்றும் உணவுப் பழக்கங்கள்." : "Review metric habits, track progress streaks & sort custom achievements."}
            </p>
          </div>
        </div>

        {/* View Toggle and Quick Backfill Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "calendar" 
                  ? "bg-white text-rose-600 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="btn-hist-calendar-tab"
            >
              📊 {isTamil ? "காலண்டர்" : "Calendar Streak"}
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "table" 
                  ? "bg-white text-rose-600 shadow-xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="btn-hist-table-tab"
            >
              🔍 {isTamil ? "சரியான பட்டியல்" : "Sortable Table"}
            </button>
          </div>

          <button
            onClick={() => setIsLogFormOpen(!isLogFormOpen)}
            className="flex items-center justify-center gap-1 bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-2.5 rounded-xl text-xs cursor-pointer active:scale-98 shadow-xs whitespace-nowrap"
            id="btn-trigger-manual-backfill"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{isTamil ? "கடந்த நாள் பதிவு" : "Backdate Event"}</span>
          </button>
        </div>
      </div>

      {/* Accordion form for manually logging historical details */}
      <AnimatePresence>
        {isLogFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-5 overflow-hidden"
            id="backdate-form-box"
          >
            <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
              🎯 {isTamil ? "கடந்த தேதியில் ஒரு செயல்பாட்டைச் சேருங்கள்" : "Manually Post Historical Action Step"}
            </h3>

            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Type Category Picker */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">{isTamil ? "வகை" : "Log Type"}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["workout", "meal", "water", "habit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`p-2 rounded-lg text-[10px] font-black capitalize text-center ${
                        formType === t 
                          ? "bg-amber-500 text-white" 
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id={`form-type-btn-${t}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Input */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">{isTamil ? "தேதி" : "Pick Date"}</label>
                <input
                  type="date"
                  required
                  min="2026-05-01"
                  max="2026-05-31"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                  id="form-input-date"
                />
              </div>

              {/* Form details based on selection */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">{isTamil ? "விவரங்கள்" : "Details Input"}</label>
                
                {formType === "workout" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isTamil ? "நடைப்பயிற்சி..." : "Activity e.g. Ragi run"}
                      value={workoutInput.type}
                      onChange={(e) => setWorkoutInput({ ...workoutInput, type: e.target.value })}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      id="form-workout-title"
                    />
                    <input
                      type="number"
                      required
                      min="5"
                      max="120"
                      value={workoutInput.duration}
                      onChange={(e) => setWorkoutInput({ ...workoutInput, duration: Number(e.target.value) || 30 })}
                      className="w-20 p-2 border border-slate-200 rounded-lg text-xs text-center bg-white"
                      id="form-workout-min"
                      title={isTamil ? "நிமிடங்கள்" : "Minutes"}
                    />
                  </div>
                )}

                {formType === "meal" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={isTamil ? "உதாரணம்: தினை கஞ்சி..." : "e.g. Millet broth..."}
                      value={mealInput.name}
                      onChange={(e) => setMealInput({ ...mealInput, name: e.target.value })}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      id="form-meal-title"
                    />
                    <select
                      value={mealInput.isClean ? "clean" : "regular"}
                      onChange={(e) => setMealInput({ ...mealInput, isClean: e.target.value === "clean" })}
                      className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      id="form-meal-health-opt"
                    >
                      <option value="clean">🥗 {isTamil ? "சத்துணவு (+50XP)" : "Healthy (+50XP)"}</option>
                      <option value="regular">🍕 {isTamil ? "சாதாரண (+15XP)" : "Regular (+15XP)"}</option>
                    </select>
                  </div>
                )}

                {formType === "water" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="8"
                      value={waterInput.amount}
                      onChange={(e) => setWaterInput({ amount: Number(e.target.value) || 0.5 })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-center"
                      id="form-water-amount"
                    />
                    <span className="text-xs font-bold text-slate-500">Liters</span>
                  </div>
                )}

                {formType === "habit" && (
                  <select
                    value={selectedHabitId}
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                    id="form-habit-select"
                  >
                    {DEFAULT_HABIT_TEMPLATES.map((h) => (
                      <option key={h.id} value={h.id}>
                        {isTamil ? h.titleTamil : h.titleEnglish} (+{h.points}XP)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Submit Manual Log Entry */}
              <div className="md:col-span-2 flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer active:scale-97 transition-all mt-2 md:mt-0 shadow-sm"
                  id="btn-form-manual-save"
                >
                  ✓ {isTamil ? "பதிவிடு" : "Save Entry"}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Summary Dashboard Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="history-stats-dashboard">
        <div className="bg-[#fcf8f2] border border-[#f0e4d0]/60 p-4 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
            {isTamil ? "இருப்பு புள்ளிகள்" : "Cumulative Health XP"}
          </span>
          <span className="text-xl font-black text-rose-500 block mt-1">{totalEarnedHistoricalXP} XP</span>
        </div>
        <div className="bg-blue-50/30 border border-blue-100/40 p-4 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
            {isTamil ? "செயல்பாடுகள்" : "Logged Movements"}
          </span>
          <span className="text-xl font-black text-blue-600 block mt-1">{totalExercisesLoggedCount} records</span>
        </div>
        <div className="bg-emerald-50/30 border border-emerald-100/40 p-4 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
            {isTamil ? "முடிந்த பழக்கங்கள்" : "Compound Habits Met"}
          </span>
          <span className="text-xl font-black text-emerald-600 block mt-1">{totalCompletedHabitsCount} cleared</span>
        </div>
        <div className="bg-violet-50/30 border border-violet-100/40 p-4 rounded-2xl text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
            {isTamil ? "அதிகபட்ச நாள்" : "Deepest Habit Log"}
          </span>
          <span className="text-xl font-black text-violet-600 block mt-1">May {history.length > 0 ? history.length : '0'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "calendar" ? (
          /* CALENDAR DISPLAY GROUP WITH DETAILED INSPECTOR PANEL */
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            id="calendar-layout-bento"
          >
            {/* May 2026 Calendar Grid board */}
            <div className="lg:col-span-7 bg-slate-50/50 p-5 rounded-2xl border border-slate-100" id="calendar-grid-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  📂 {currentMonthYear}
                </h3>
                <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                  {isTamil ? "31 நாட்கள் தொடர் சாதனை" : "31 Days of Progress Matrix"}
                </span>
              </div>

              {/* Weekdays Labels Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>{isTamil ? "ஞா" : "Su"}</span>
                <span>{isTamil ? "தி" : "Mo"}</span>
                <span>{isTamil ? "செ" : "Tu"}</span>
                <span>{isTamil ? "பு" : "We"}</span>
                <span>{isTamil ? "வி" : "Th"}</span>
                <span>{isTamil ? "வெ" : "Fr"}</span>
                <span>{isTamil ? "ச" : "Sa"}</span>
              </div>

              {/* Day numbers iteration */}
              <div className="grid grid-cols-7 gap-1.5" id="calendar-days-grids">
                {/* Pad previous month days blank */}
                {Array.from({ length: mayStartWeekday }).map((_, idx) => (
                  <div key={`pad-${idx}`} className="h-10 sm:h-12 bg-transparent"></div>
                ))}

                {/* Iterate May days */}
                {Array.from({ length: daysInMay }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayStr = `2026-05-${String(dayNum).padStart(2, "0")}`;
                  const isSelected = selectedDate === dayStr;
                  
                  // Check if record exists for this date
                  const targetEntry = history.find((h) => h.date === dayStr);
                  const score = targetEntry ? targetEntry.pointsEarned : 0;

                  let dotColor = "bg-transparent";
                  let bgBtnColor = "bg-white border-slate-100 text-slate-600 hover:border-slate-300";
                  
                  if (targetEntry) {
                    if (score >= 200) {
                      dotColor = "bg-emerald-500";
                      bgBtnColor = "bg-emerald-50 text-emerald-800 border-emerald-250";
                    } else if (score >= 100) {
                      dotColor = "bg-amber-400";
                      bgBtnColor = "bg-amber-50 text-amber-800 border-amber-250";
                    } else {
                      dotColor = "bg-rose-400";
                      bgBtnColor = "bg-rose-50 text-rose-800 border-rose-250";
                    }
                  }

                  if (isSelected) {
                    bgBtnColor = "bg-slate-900 text-white border-slate-900 ring-2 ring-rose-400/55 shadow-md";
                  }

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDate(dayStr)}
                      className={`h-11 sm:h-13 rounded-xl border flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${bgBtnColor}`}
                      id={`calendar-tile-${dayNum}`}
                    >
                      <span className="text-xs font-black leading-none">{dayNum}</span>
                      
                      {/* Interactive score point ticker */}
                      <div className="flex items-center gap-1">
                        {score > 0 && (
                          <span className="text-[8px] font-black leading-none uppercase">
                            {score}
                          </span>
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Detail Inspector Column */}
            <div className="lg:col-span-5 bg-slate-50/30 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between" id="calendar-inspector-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block leading-none">
                      {isTamil ? "தினசரி ஆய்வாளர்" : "Historical Inspector"}
                    </span>
                    <h3 className="text-xs font-black text-slate-800 tracking-tight mt-1">
                      {new Date(selectedDate).toLocaleDateString(isTamil ? "ta-IN" : "en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                      +{selectedDayEntry.pointsEarned || 0} XP
                    </span>
                  </div>
                </div>

                {/* Hydration details inside the inspector */}
                <div className="space-y-3" id="inspector-items-container">
                  {/* Water */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{isTamil ? "நீரேற்றம் (Liters)" : "Hydration Level"}</span>
                    </div>
                    <span className="font-black text-slate-800">
                      {selectedDayEntry.waterDrank || 0} / {selectedDayEntry.waterTarget || 2.5} L
                    </span>
                  </div>

                  {/* Workouts */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTamil ? "Logged உடற்பயிற்சிகள்" : "Logged Workouts"}
                    </span>
                    {!selectedDayEntry.workouts || selectedDayEntry.workouts.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic pl-1">{isTamil ? "பயிற்சி எதுவும் இல்லை." : "No workouts recorded."}</p>
                    ) : (
                      selectedDayEntry.workouts.map((w) => (
                        <div key={w.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span>🏃</span>
                            <span className="font-bold text-slate-700">{w.type}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({w.duration} min)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-600 font-bold">+{w.points} XP</span>
                            <button
                              onClick={() => onRemoveHistoryItem(selectedDate, "workout", w.id)}
                              className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
                              id={`del-hist-workout-${w.id}`}
                              title={isTamil ? "நீக்கு" : "Delete historical entry"}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Meals */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTamil ? "Logged உணவுகள்" : "Logged Meals & Nutrition"}
                    </span>
                    {!selectedDayEntry.meals || selectedDayEntry.meals.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic pl-1">{isTamil ? "உணவுப் பதிவுகள் இல்லை." : "No nutrition recorded."}</p>
                    ) : (
                      selectedDayEntry.meals.map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span>🍱</span>
                            <span className="font-bold text-slate-700 truncate max-w-[120px]">{m.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${m.isClean ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                              {m.mealType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-600 font-bold">+{m.points} XP</span>
                            <button
                              onClick={() => onRemoveHistoryItem(selectedDate, "meal", m.id)}
                              className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
                              id={`del-hist-meal-${m.id}`}
                              title={isTamil ? "நீக்கு" : "Delete historical entry"}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Habits completed */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isTamil ? "நிறைவேற்றிய நற்பழக்கங்கள்" : "Accomplished Habits"}
                    </span>
                    {!selectedDayEntry.habits || selectedDayEntry.habits.filter(h => h.completed).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic pl-1">{isTamil ? "உயர்தரப் பழக்கங்கள் எதுவும் செய்யப்படவில்லை." : "No daily habits selected."}</p>
                    ) : (
                      selectedDayEntry.habits.filter(h => h.completed).map((h) => {
                        const uniqueId = h.id;
                        return (
                          <div key={uniqueId} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3.5 w-3.5 text-violet-500" />
                              <span className="font-medium text-slate-600 truncate max-w-[180px]">
                                {isTamil ? h.titleTamil : h.titleEnglish}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-violet-600 font-bold">+{h.points} XP</span>
                              <button
                                onClick={() => onRemoveHistoryItem(selectedDate, "habit", h.id)}
                                className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
                                id={`del-hist-habit-${h.id}`}
                                title={isTamil ? "நீக்கு" : "Delete historical entry"}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </div>

              {/* Tips context helper */}
              <div className="bg-slate-900 text-slate-300 p-3.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed mt-4 flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-rose-400 shrink-0" />
                <p>
                  {isTamil 
                    ? "குறிப்பு: நீங்கள் இந்த தேதியில் எப்போது வேண்டுமானாலும் முந்தைய செயல்பாடுகளைப் பதிவிடலாம். அது உடனடியாக உங்கள் மொத்த புள்ளிகளையும் ஆரோக்கிய தரத்தையும் உயர்த்தும்!"
                    : "Tip: Click helper days above to drill down to specific dates. Backdate workouts or healthy millets logged instantly with the Backdate button."}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* TABLE DISPLAY GROUP WITH SEARCH AND SORT */
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            id="table-layout-card"
          >
            {/* Filter and search utilities shelf */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              
              {/* Search text input */}
              <div className="relative w-full sm:flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder={isTamil ? "உணவு, பயிற்சி, அல்லது பழக்கத்தைத் தேடு..." : "Search idli, treadmill walking, water logs..."}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                  id="table-search-input"
                />
              </div>

              {/* Categoric select picker */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
                  <Filter className="h-3.5 w-3.5 inline mr-1" />
                  {isTamil ? "வடி" : "Filter"}
                </span>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 flex-1 sm:flex-none"
                  id="table-category-select"
                >
                  <option value="all">{isTamil ? "அனைத்து வகைகள்" : "All Categories"}</option>
                  <option value="workout">🏃 {isTamil ? "உடற்பயிற்சிகள்" : "Workouts"}</option>
                  <option value="meal">🥗 {isTamil ? "உணவுப் பதிவுகள்" : "Nutrition Logs"}</option>
                  <option value="habit">✓ {isTamil ? "நல்வாழ்வு பழக்கங்கள்" : "Checklist Habits"}</option>
                </select>
              </div>

            </div>

            {/* Clean, sortable presentation table */}
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-100" id="hist-sortable-table-box">
              <table className="w-full border-collapse text-left text-xs bg-white">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  <tr>
                    <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort("date")}>
                      <span className="flex items-center gap-1">
                        {isTamil ? "தேதி" : "Date"}
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </span>
                    </th>
                    <th className="py-3 px-4">{isTamil ? "வகை" : "Type"}</th>
                    <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => toggleSort("name")}>
                      <span className="flex items-center gap-1">
                        {isTamil ? "செயல்பாட்டின் பெயர்" : "Activity Name"}
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </span>
                    </th>
                    <th className="py-3 px-4">{isTamil ? "குறிப்புகள்/விவரங்கள்" : "Specs / Metrics"}</th>
                    <th className="py-3 px-4 cursor-pointer hover:text-slate-800 text-right" onClick={() => toggleSort("points")}>
                      <span className="flex items-center justify-end gap-1">
                        {isTamil ? "பெற்ற புள்ளிகள்" : "XP Points"}
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center">{isTamil ? "செயல்முறை" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center italic text-slate-400 bg-slate-50/20">
                        {isTamil ? "தேடலுக்குரிய பதிவுகள் எதுவும் இல்லை." : "No records match search parameters."}
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-slate-500">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.itemType === "workout" && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                              Workout
                            </span>
                          )}
                          {item.itemType === "meal" && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold">
                              Nutrition
                            </span>
                          )}
                          {item.itemType === "habit" && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold">
                              Habit
                            </span>
                          )}
                          {item.itemType === "water" && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                              Water L
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 truncate max-w-[180px]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {item.details}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                          +{item.points} XP
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onRemoveHistoryItem(item.date, item.itemType, item.id)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer p-1.5 rounded-md hover:bg-red-50 transition-all inline-block"
                            title={isTamil ? "பதிவை நீக்கு" : "Remove metric log record"}
                            id={`delete-flat-item-${item.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
