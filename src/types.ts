export type Language = "tamil" | "english";

export interface UserProfile {
  name: string;
  language: Language;
  goal: string;
  weight: number; // in kg
  height: number; // in cm
  waterTarget: number; // in Liters
}

export interface Workout {
  id: string;
  type: string;
  category: "walking" | "running" | "yoga" | "strength" | "other";
  duration: number; // minutes
  points: number;
  timestamp: string;
}

export interface Meal {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
  isClean: boolean;
  points: number;
}

export interface Habit {
  id: string;
  titleTamil: string;
  titleEnglish: string;
  completed: boolean;
  points: number;
}

export interface CoachRecipe {
  title: string;
  benefits: string;
  ingredients: string[];
  steps: string[];
}

export interface CoachFeedback {
  coachScore: number;
  analysis: string;
  tips: string[];
  recipe: CoachRecipe;
}

export interface DailyState {
  profile: UserProfile | null;
  waterDrank: number; // Liters
  workouts: Workout[];
  meals: Meal[];
  habits: Habit[];
  points: number;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  waterDrank: number;
  waterTarget: number;
  workouts: Workout[];
  meals: Meal[];
  habits: Habit[];
  pointsEarned: number;
}

// Pre-defined daily habits for healthy lifestyle
export const DEFAULT_HABIT_TEMPLATES: Omit<Habit, "completed">[] = [
  {
    id: "habit_sleep",
    titleTamil: "7-8 மணிநேர உறக்கம் (7-8 Hrs Sleep)",
    titleEnglish: "7-8 Hours of Peaceful Sleep",
    points: 30
  },
  {
    id: "habit_hydrate",
    titleTamil: "காலை வெதுவெதுப்பான நீர் அருந்துதல் (Warm Water)",
    titleEnglish: "Drink morning warm water",
    points: 20
  },
  {
    id: "habit_meditate",
    titleTamil: "5 நிமிட தியானம் / ஆழ்ந்த மூச்சு (5-Min Meditation)",
    titleEnglish: "5-Minutes Meditation/Deep breathing",
    points: 40
  },
  {
    id: "habit_green",
    titleTamil: "உணவில் காய்கறிகள்/கீரைகள் சேர்த்தல் (Greens/Salad)",
    titleEnglish: "Eat a serving of green salad/vegetables",
    points: 30
  },
  {
    id: "habit_no_sugar",
    titleTamil: "சுத்திகரிக்கப்பட்ட வெள்ளைச் சர்க்கரை தவிர்ப்பு (No White Sugar)",
    titleEnglish: "Avoid refined white sugar today",
    points: 50
  },
  {
    id: "habit_walk",
    titleTamil: "உணவுக்குப் பின் 15 நிமிட நடை (15-Min Walk after meals)",
    titleEnglish: "Take a 15-minute walk after meals",
    points: 30
  },
  {
    id: "habit_screen",
    titleTamil: "உறங்குவதற்கு முன் அலைபேசி தவிர்ப்பு (No Screen before bed)",
    titleEnglish: "No phone screens 30 mins before sleep",
    points: 40
  }
];

export const TRANSFORMATION_MOTIVATIONS = [
  {
    tamil: "மாற்றம் என்பது ஒரு நாளில் வராது, ஆனால் ஒவ்வொரு நாளும் மாறும்!",
    english: "Transformation doesn't happen in a day, but it changes every single day!"
  },
  {
    tamil: "உடல் நலம் என்பது உங்கள் சிறந்த செல்வம். இன்று ஒரு சிறியபடி முன்னேறுங்கள்.",
    english: "Your wellness is your greatest wealth. Take one small step forward today."
  },
  {
    tamil: "நிறைய தண்ணீர் குடியுங்கள், சுறுசுறுப்புடன் இருங்கள், ஆரோக்கியமாக உண்ணுங்கள்!",
    english: "Drink abundant water, move with energy, and nourish yourself cleanly!"
  },
  {
    tamil: "சிறு தானியங்கள் நமது உடலுக்கு வலிமையைத் தரும் சிறந்த உணவாகும.",
    english: "Traditional grains are magnificent nutrition engines that elevate physical stamina."
  },
  {
    tamil: "உடற்பயிற்சி என்பது உடலின் கொண்டாட்டம், தண்டனை அல்ல!",
    english: "Exercise is a celebration of your capabilities, not a chore!"
  }
];
