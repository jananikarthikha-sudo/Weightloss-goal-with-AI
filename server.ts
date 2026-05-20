import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded GenAI logic
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// POST /api/coach
app.post("/api/coach", async (req, res) => {
  try {
    const { name, language, goal, weight, height, waterDrank, waterTarget, exercises, meals, habits, points } = req.body;

    const userLang = language === "tamil" ? "Tamil" : "English";

    // Calculate BMI safely
    let bmiValue = 0;
    let bmiCategory = "Unknown";
    if (weight && height) {
      const heightInMeters = height / 100;
      bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      if (bmiValue < 18.5) bmiCategory = language === "tamil" ? "குறைந்த எடை (Underweight)" : "Underweight";
      else if (bmiValue < 25) bmiCategory = language === "tamil" ? "சரியான எடை (Normal weight)" : "Normal weight";
      else if (bmiValue < 30) bmiCategory = language === "tamil" ? "அதிக எடை (Overweight)" : "Overweight";
      else bmiCategory = language === "tamil" ? "உடல் பருமன் (Obese)" : "Obese";
    }

    const systemPrompt = `You are a professional, highly encouraging Tamil and English Health Coach & Transformation Mentor named "ஏஐ நல்வாழ்வு ஆலோசகர்" (AI Wellness Coach).
Your style is extremely warm, motivating, culturally respectful, particularly appreciating traditional South Indian/Tamil health wisdom if appropriate (like organic grains, millets/சிறுதானியங்கள், herbal ingredients like moringa, turmeric), and highly actionable.

You MUST output your entire response format inside a structured JSON matching this schema:
{
  "coachScore": number (health rating for today out of 100),
  "analysis": "string in HTML or Markdown formatting",
  "tips": ["string tips"],
  "recipe": {
    "title": "string",
    "benefits": "string",
    "ingredients": ["string"],
    "steps": ["string"]
  }
}

Important Rules:
- Do NOT wrap your JSON in triple backticks or any markdown formatting. Output raw JSON string only.
- If the requested language is "tamil", output all string values in beautiful, clear, polite Tamil (தமிழ்) with English terms in brackets where helpful.
- If the requested language is "english", output them in beautiful English.
- Address the user by their name: ${name}.
- Factor in their health stats: BMI is ${bmiValue} (${bmiCategory}), Goal is "${goal}", Points earned is ${points}XP, Hydration is ${waterDrank}/${waterTarget} Liters, Workouts: ${JSON.stringify(exercises)}, Meals logged: ${JSON.stringify(meals)}, Habits accomplished: ${JSON.stringify(habits)}.
- Analyze their workouts and meals constructively. Offer high-quality wellness tips. Suggested recipe is a traditional/regional highly healthy dish suitable for their diet.`;

    const userPrompt = `Name: ${name}
Language requested: ${userLang}
Goal: ${goal}
Current Weight: ${weight} kg, Height: ${height} cm, BMI: ${bmiValue} (${bmiCategory})
Water Drank: ${waterDrank} L out of Target ${waterTarget} L
Points Gained Today: ${points} XP
Logged Workouts: ${JSON.stringify(exercises)}
Logged Meals: ${JSON.stringify(meals)}
Daily Habits accomplished: ${JSON.stringify(habits)}`;

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "MOCK_KEY" || key.trim() === "") {
      // Return a beautiful mocked bilingual advice so the system continues gracefully even without a key on very first launch in preview
      const isTamil = language === "tamil";
      const mockResult = {
        coachScore: 85,
        analysis: isTamil 
          ? `வணக்கம் <b>${name}</b>! இன்றைய உங்கள் நல்வாழ்வுப் பயணம் சிறப்பாக இருக்கிறது. நீங்கள் <b>${points} XP</b> புள்ளிகளைப் பெற்று சாதனை படைத்துள்ளீர்கள். <br/><br/>உங்கள் பி.எம்.ஐ (BMI) அளவு <b>${bmiValue}</b> (${bmiCategory}) ஆகும். உங்கள் இலக்கான <b>"${goal}"</b> திசையை நோக்கி வீரியமாக முன்னேறி வருகிறீர்கள். நீங்கள் இன்று அருந்திய தண்ணீர் அளவு: <b>${waterDrank} லிட்டர்</b> (இலக்கு: ${waterDrank >= waterTarget ? 'வெற்றிகரமாக எட்டப்பட்டது' : `${waterTarget} லிட்டர்`}). <br/><br/><i>குறிப்பு: இது ஒரு மாதிரி நல்வாழ்வு ஆலோசனையாகும் (உங்கள் ஏஐ கீ சேவைகளுடன் இன்னும் இணைக்கப்படவில்லை).</i>`
          : `Hello <b>${name}</b>! Your healthy lifestyle journey is progressing beautifully today. You have earned a fantastic <b>${points} XP</b> points! <br/><br/>Your BMI is <b>${bmiValue}</b> (${bmiCategory}). You are working diligently towards your goal of <b>"${goal}"</b>. Your logged hydration level is <b>${waterDrank} Liters</b> (target: ${waterTarget} L). <br/><br/><i>Note: This is a simulated custom wellness analysis (your Gemini API key is not yet set up in the Secrets panel).</i>`,
        tips: isTamil 
          ? [
              "நாள் முழுவதும் உடலை நீரேற்றத்துடன் வைத்திருக்க தொடர்ந்து போதிய தண்ணீர் குடிக்கவும்.",
              "உணவில் தினை, கம்பு, வரகு போன்ற சிறுதானியங்களையும் காய்கறிகளையும் அதிகம் சேர்த்துக்கொள்ளுங்கள்.",
              "உடற்பயிற்சிக்குப் பின் 5-10 நிமிடங்கள் மூச்சுப்பயிற்சி அல்லது தியானம் செய்து மனதை அமைதிப்படுத்துங்கள்."
            ]
          : [
              "Maintain consistent hydration levels throughout the day by taking small sips of water.",
              "Include more whole grains like Millets (Ragi, Kambu) and fresh vegetables in your diet.",
              "Dedicate 5-10 minutes to deep breathing or mindfulness after your workout."
            ],
        recipe: {
          title: isTamil ? "முருங்கைக்கீரை மற்றும் கம்பு கஞ்சி (Milit Porridge with Moringa)" : "Moringa & Pearl Millet Savory Porridge",
          benefits: isTamil 
            ? "இரும்புச்சத்து மற்றும் கால்சியம் நிறைந்தது. உடல் சோர்வை நீக்கி, நீண்ட நேரம் நீடித்த ஆற்றலைத் தரும்." 
            : "Rich in iron and calcium, balances blood sugar levels, and provides sustained physical stamina.",
          ingredients: isTamil
            ? ["கம்பு குருணை - 1/2 கப்", "முருங்கைக்கீரை - 1 கைப்பிடி", "சின்ன வெங்காயம் - 5", "பூண்டு - 2 பற்கள்", "சீரகம் - 1/2 டீஸ்பூன்"]
            : ["Pearl Millet (Kambu) - 1/2 cup", "Fresh Moringa Leaves - 1 cup", "Small onions (Shallots) - 5 diced", "Garlic - 2 cloves", "Cumin seeds - 1/2 tsp"],
          steps: isTamil
            ? [
                "கம்பு குருணையை நன்கு கழுவி 3 கப் தண்ணீர் சேர்த்து வேக வைக்கவும்.",
                "பாதி வெந்ததும் சீரகம், தட்டிய பூண்டு மற்றும் நறுக்கிய சின்ன வெங்காயம் சேர்க்கவும்.",
                "அடுத்ததாக முருங்கைக்கீரை சேர்த்து மிதமான தீயில் வெந்து நீர் வற்றி கஞ்சியாகும் வரை கிளறவும்.",
                "தேவையான அளவு உப்பு சேர்த்து, சூடாக அருந்தவும்."
              ]
            : [
                "Wash pearl millet and pressure cook or boil it in 3 cups of water.",
                "Halfway through, add chopped cumin, garlic cloves, and chopped shallots.",
                "Add the fresh moringa leaves and simmer gently on low heat until fully cooked and creamy.",
                "Season with a pinch of salt and serve warm."
              ]
        }
      };
      return res.json(mockResult);
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const responseObject = response.text || "{}";
    try {
      const parsedJson = JSON.parse(responseObject.trim());
      res.json(parsedJson);
    } catch (parseError) {
      console.warn("Failed to parse Gemini output as JSON, fallback to manual parse or mock:", responseObject);
      // Attempt to clean JSON in case of backticks
      let cleaned = responseObject.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }
      try {
        res.json(JSON.parse(cleaned));
      } catch (e) {
        res.status(500).json({ error: "Failed to parse AI recommendations." });
      }
    }

  } catch (error: any) {
    console.error("Coach API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// In-Memory Database for Lover Sync Hub rooms
interface SyncRoom {
  ownerName: string;
  language: string;
  dailyState: any;
  history: any[];
  chatLog: any[];
  stickyNote: string;
  activeNudges: string[];
  approvedItems: Record<string, any>;
  lastUpdated: number;
}
const syncStores: Record<string, SyncRoom> = {};

// GET /api/sync/fetch?code=XYZ
app.get("/api/sync/fetch", (req, res) => {
  const code = String(req.query.code || "").trim().toLowerCase();
  if (!code) {
    return res.status(400).json({ error: "Missing sync code parameter." });
  }
  const store = syncStores[code];
  if (!store) {
    return res.status(404).json({ error: "No companion sync room found for this code." });
  }
  res.json({ success: true, store });
});

// POST /api/sync/publish
app.post("/api/sync/publish", (req, res) => {
  const { code, ownerName, language, dailyState, history, chatLog, stickyNote, activeNudges, approvedItems } = req.body;
  const cleanCode = String(code || "").trim().toLowerCase();
  if (!cleanCode) {
    return res.status(400).json({ error: "Missing sync code." });
  }

  // Find or create sync store
  const existing: SyncRoom = syncStores[cleanCode] || {
    ownerName: ownerName || "Partner",
    language: language || "tamil",
    dailyState: null,
    history: [],
    chatLog: [],
    stickyNote: "",
    activeNudges: [],
    approvedItems: {},
    lastUpdated: Date.now()
  };

  // Merge payload details
  existing.ownerName = ownerName || existing.ownerName;
  existing.language = language || existing.language;
  if (dailyState !== undefined) existing.dailyState = dailyState;
  if (history !== undefined) existing.history = history;
  if (chatLog !== undefined) existing.chatLog = chatLog;
  if (stickyNote !== undefined) existing.stickyNote = stickyNote;
  if (activeNudges !== undefined) existing.activeNudges = activeNudges;
  if (approvedItems !== undefined) existing.approvedItems = approvedItems;
  
  existing.lastUpdated = Date.now();
  syncStores[cleanCode] = existing;

  res.json({ success: true, store: existing });
});

// POST /api/sync/boyfriend-update
app.post("/api/sync/boyfriend-update", (req, res) => {
  const { code, chatLog, stickyNote, activeNudges, approvedItems } = req.body;
  const cleanCode = String(code || "").trim().toLowerCase();
  if (!cleanCode) {
    return res.status(400).json({ error: "Missing sync code." });
  }

  const existing = syncStores[cleanCode];
  if (!existing) {
    return res.status(404).json({ error: "Sync room not active." });
  }

  // Boyfriend updates specific widgets
  if (chatLog !== undefined) existing.chatLog = chatLog;
  if (stickyNote !== undefined) existing.stickyNote = stickyNote;
  if (activeNudges !== undefined) existing.activeNudges = activeNudges;
  if (approvedItems !== undefined) existing.approvedItems = approvedItems;

  existing.lastUpdated = Date.now();
  syncStores[cleanCode] = existing;

  res.json({ success: true, store: existing });
});

// Configure Vite or Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
