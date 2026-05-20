import React, { useState } from "react";
import { UserProfile, Language } from "../types";
import { Activity, Dumbbell, Sparkles, User, Award } from "lucide-react";
import { motion } from "motion/react";

interface OnboardingProps {
  language: Language;
  onComplete: (profile: UserProfile) => void;
  bannerUrl: string;
}

export default function Onboarding({ language, onComplete, bannerUrl }: OnboardingProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Weight Loss");
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [waterTarget, setWaterTarget] = useState<number>(2.5);

  const isTamil = language === "tamil";

  // Real-time BMI calculation
  const heightInMeters = height / 100;
  const bmiValue = height > 0 ? parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;
  
  let bmiCategory = "";
  let bmiColor = "";
  if (bmiValue < 18.5) {
    bmiCategory = isTamil ? "குறைந்த எடை (Underweight)" : "Underweight";
    bmiColor = "text-yellow-600 bg-yellow-50";
  } else if (bmiValue < 25) {
    bmiCategory = isTamil ? "சரியான எடை (Healthy / Normal)" : "Normal / Healthy Weight";
    bmiColor = "text-green-600 bg-green-50";
  } else if (bmiValue < 30) {
    bmiCategory = isTamil ? "அதிக எடை (Overweight)" : "Overweight";
    bmiColor = "text-amber-600 bg-amber-50";
  } else {
    bmiCategory = isTamil ? "உடல் பருமன் (Obese)" : "Obesity";
    bmiColor = "text-red-600 bg-red-50";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      language,
      goal,
      weight,
      height,
      waterTarget
    });
  };

  const goalsList = [
    { value: "Weight Loss", labelEn: "Weight Loss", labelTa: "எடை குறைப்பு" },
    { value: "Muscle Gain", labelEn: "Gain Strength", labelTa: "வலிமை / தசை அதிகரிப்பு" },
    { value: "Stay Fit", labelEn: "Stay Active & Fit", labelTa: "சுறுசுறுப்புடன் இருத்தல்" },
    { value: "Mindfulness", labelEn: "Mindfulness & Peace", labelTa: "மன அமைதி / யோகா" },
    { value: "Clean Eating", labelEn: "Healthy Clean Diet", labelTa: "சத்தான இயற்கை உணவு" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-xl border border-rose-100"
      id="onboarding-container"
    >
      {/* Banner Area */}
      <div className="relative h-48 bg-gradient-to-r from-rose-100 via-rose-50 to-teal-50 flex items-center justify-center overflow-hidden">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt="Transformation illustration" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent h-16"></div>
        <div className="relative text-center px-4 z-10">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex bg-white/90 backdrop-blur-xs p-2 rounded-2xl shadow-sm mb-2"
          >
            <Sparkles className="h-6 w-6 text-rose-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight" id="onboarding-title-text">
            {isTamil ? "எனது மாற்றப் பயணம்" : "My Transformation Journey"}
          </h2>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mt-1">
            {isTamil ? "ஆரோக்கியமும் சுறுசுறுப்பும் நோக்கிய புதிய அத்தியாயம்" : "Your personalized health & wellness quest"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6" id="onboarding-form">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700" id="label-name">
            {isTamil ? "உங்கள் பெயர் என்ன?" : "What is your Name?"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isTamil ? "அன்பு அல்லது கார்த்திக்..." : "Enter your name..."}
              className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all outline-hidden text-slate-800"
              id="input-name"
            />
          </div>
        </div>

        {/* Goal Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700" id="label-goal">
            {isTamil ? "உங்கள் தற்போதைய நல்வாழ்வு இலக்கு?" : "What is your primary wellness goal?"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="goals-grid">
            {goalsList.map((g) => {
              const active = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    active 
                      ? "border-rose-400 bg-rose-50/50 text-rose-700 font-semibold shadow-xs" 
                      : "border-slate-100 hover:border-slate-300 bg-slate-50/50 text-slate-600"
                  }`}
                  id={`goal-btn-${g.value}`}
                >
                  <div className={`p-2 rounded-xl ${active ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{isTamil ? g.labelTa : g.labelEn}</div>
                    <div className="text-[10px] text-slate-400">{g.value}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="metrics-grid">
          {/* Weight */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600" id="label-weight">
              {isTamil ? "தற்போதைய எடை (kg)" : "Current Weight (kg)"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-hidden text-center text-slate-700 font-semibold"
                id="input-weight"
              />
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600" id="label-height">
              {isTamil ? "உயரம் (cm)" : "Height (cm)"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-hidden text-center text-slate-700 font-semibold"
                id="input-height"
              />
            </div>
          </div>

          {/* Water Target */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600" id="label-water">
              {isTamil ? "தண்ணீர் இலக்கு (லிட்டர்)" : "Water Target (Liters)"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-hidden text-center text-slate-700 font-semibold"
                id="input-water"
              />
            </div>
          </div>
        </div>

        {/* BMI Indicator Widget */}
        {weight > 0 && height > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${bmiColor}`}
            id="bmi-widget"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-rose-500">
                <Dumbbell className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isTamil ? "தற்போதைய உடல் குறியீட்டெண் (BMI)" : "Your Current BMI Factor"}
                </h4>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{bmiCategory}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl shadow-xs">
              <span className="text-2xl font-black text-rose-500">{bmiValue}</span>
              <span className="text-[10px] text-slate-400">kg/m²</span>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <button
          type="submit"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 group transform active:scale-98"
          id="btn-onboarding-start"
        >
          <Award className="h-5 w-5 text-rose-100 group-hover:rotate-12 transition-transform" />
          <span>{isTamil ? "எனது பயணத்தை தொடங்கு!" : "Begin My Journey!"}</span>
        </button>
      </form>
    </motion.div>
  );
}
