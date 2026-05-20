import React, { useState, useEffect } from "react";
import { DailyState, Workout, Meal } from "../types";
import { 
  Heart, MessageCircle, Send, Sparkles, CupSoda, Dumbbell, 
  Lock, Unlock, Pin, CheckCircle2, ChevronRight, Share2, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BoyfriendWatcherProps {
  language: "tamil" | "english";
  dailyState: DailyState;
}

type Persona = "sweet" | "trainer" | "poetic" | "cheerleader";

export default function BoyfriendWatcher({ language, dailyState }: BoyfriendWatcherProps) {
  const isTamil = language === "tamil";
  
  // Backwards compatibility keys & basic states
  const [bfName, setBfName] = useState(() => localStorage.getItem("transformation_bf_name") || (isTamil ? "கார்த்திக்" : "Karthik"));
  const [persona, setPersona] = useState<Persona>(() => (localStorage.getItem("transformation_bf_persona") as Persona) || "sweet");
  const [customText, setCustomText] = useState("");
  const [boyfriendHeartPoints, setBoyfriendHeartPoints] = useState(() => Number(localStorage.getItem("transformation_bf_heart_points")) || 120);
  const [isEditingName, setIsEditingName] = useState(false);

  // Advanced features (Login, messages, notes, nudges, stamps)
  const [activeMode, setActiveMode] = useState<"user" | "boyfriend">(() => (localStorage.getItem("transformation_bf_active_mode") as "user" | "boyfriend") || "user");
  const [isSwitchingModal, setIsSwitchingModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [bfPin, setBfPin] = useState(() => localStorage.getItem("transformation_bf_pin") || "143");
  const [stickyNote, setStickyNote] = useState(() => localStorage.getItem("transformation_bf_sticky_note") || "");
  const [typedSticky, setTypedSticky] = useState(stickyNote);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Real-time synchronization states with server
  const [syncCode, setSyncCode] = useState(() => localStorage.getItem("transformation_sync_code") || "");
  const [isSyncActive, setIsSyncActive] = useState(() => localStorage.getItem("transformation_sync_active") === "true");
  const [syncStatus, setSyncStatus] = useState<"idle" | "connecting" | "synced" | "error">("idle");
  const [syncError, setSyncError] = useState("");
  const [remoteDailyState, setRemoteDailyState] = useState<DailyState | null>(null);

  // Active dataset that overlays fetched stats if in boyfriend spectator mode
  const currentStats = activeMode === "boyfriend" && remoteDailyState ? remoteDailyState : dailyState;

  const [activeNudges, setActiveNudges] = useState<string[]>(() => {
    const saved = localStorage.getItem("transformation_bf_nudges");
    return saved ? JSON.parse(saved) : [];
  });

  const [chatLog, setChatLog] = useState<{ sender: "user" | "bf"; text: string; time: string; isCard?: boolean }[]>(() => {
    const saved = localStorage.getItem("transformation_bf_chat_log");
    return saved ? JSON.parse(saved) : [];
  });

  const [approvedItems, setApprovedItems] = useState<Record<string, { stampType: string; comment: string }>>(() => {
    const saved = localStorage.getItem("transformation_bf_approved_items");
    return saved ? JSON.parse(saved) : {};
  });

  // Sync state to local storage
  useEffect(() => { localStorage.setItem("transformation_bf_name", bfName); }, [bfName]);
  useEffect(() => { localStorage.setItem("transformation_bf_persona", persona); }, [persona]);
  useEffect(() => { localStorage.setItem("transformation_bf_heart_points", String(boyfriendHeartPoints)); }, [boyfriendHeartPoints]);
  useEffect(() => { localStorage.setItem("transformation_bf_chat_log", JSON.stringify(chatLog)); }, [chatLog]);
  useEffect(() => { localStorage.setItem("transformation_bf_sticky_note", stickyNote); }, [stickyNote]);
  useEffect(() => { localStorage.setItem("transformation_bf_nudges", JSON.stringify(activeNudges)); }, [activeNudges]);
  useEffect(() => { localStorage.setItem("transformation_bf_approved_items", JSON.stringify(approvedItems)); }, [approvedItems]);
  useEffect(() => { localStorage.setItem("transformation_bf_active_mode", activeMode); }, [activeMode]);
  useEffect(() => { localStorage.setItem("transformation_bf_pin", bfPin); }, [bfPin]);
  useEffect(() => { localStorage.setItem("transformation_sync_code", syncCode); }, [syncCode]);
  useEffect(() => { localStorage.setItem("transformation_sync_active", String(isSyncActive)); }, [isSyncActive]);

  // Read code from URL for seamless one-click link connection as her Boyfriend Watcher
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("watcherCode") || params.get("progressCode");
    if (codeFromUrl) {
      const cleaned = codeFromUrl.trim().toUpperCase();
      setSyncCode(cleaned);
      setIsSyncActive(true);
      setActiveMode("boyfriend");
      localStorage.setItem("transformation_sync_code", cleaned);
      localStorage.setItem("transformation_sync_active", "true");
      localStorage.setItem("transformation_bf_active_mode", "boyfriend");
      setSyncStatus("connecting");
    }
  }, []);

  // Server Communication Helpers
  const publishStateToServer = async (
    currentCode: string,
    currentDailyState: DailyState,
    currentChatLog: any[],
    currentSticky: string,
    currentNudges: string[],
    currentApproved: Record<string, any>
  ) => {
    const clean = currentCode.trim().toLowerCase();
    if (!clean) return;
    try {
      const res = await fetch("/api/sync/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: clean,
          ownerName: localStorage.getItem("transformation_profile") 
            ? JSON.parse(localStorage.getItem("transformation_profile") || "{}").name 
            : "Partner",
          language: language,
          dailyState: currentDailyState,
          chatLog: currentChatLog,
          stickyNote: currentSticky,
          activeNudges: currentNudges,
          approvedItems: currentApproved
        })
      });
      if (res.ok) {
        setSyncStatus("synced");
        setSyncError("");
      } else {
        setSyncStatus("error");
      }
    } catch (err) {
      console.error("Publish sync error:", err);
      setSyncStatus("error");
    }
  };

  const publishBFUpdateToServer = async (
    currentCode: string,
    currentChatLog?: any[],
    currentSticky?: string,
    currentNudges?: string[],
    currentApproved?: Record<string, any>
  ) => {
    const clean = currentCode.trim().toLowerCase();
    if (!clean) return;
    try {
      const res = await fetch("/api/sync/boyfriend-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: clean,
          chatLog: currentChatLog,
          stickyNote: currentSticky,
          activeNudges: currentNudges,
          approvedItems: currentApproved
        })
      });
      if (res.ok) {
        setSyncStatus("synced");
        setSyncError("");
      } else {
        setSyncStatus("error");
      }
    } catch (err) {
      console.error("BF update error:", err);
      setSyncStatus("error");
    }
  };

  const fetchStateFromServer = async (targetCode: string) => {
    const clean = targetCode.trim().toLowerCase();
    if (!clean) return;
    try {
      const res = await fetch(`/api/sync/fetch?code=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.store) {
          const store = data.store;
          setSyncStatus("synced");
          setSyncError("");
          
          if (activeMode === "boyfriend") {
            if (store.dailyState) setRemoteDailyState(store.dailyState);
          }
          if (store.chatLog) setChatLog(store.chatLog);
          if (store.stickyNote !== undefined) setStickyNote(store.stickyNote);
          if (store.activeNudges) setActiveNudges(store.activeNudges);
          if (store.approvedItems) setApprovedItems(store.approvedItems);
          if (store.ownerName && activeMode === "boyfriend") {
            setBfName(store.ownerName);
          }
        }
      } else {
        if (res.status === 404) {
          setSyncError(isTamil ? "இந்த குறியீட்டில் எந்த அறையும் தொடங்கப்படவில்லை." : "No live sync room active for this code.");
        }
        setSyncStatus("error");
      }
    } catch (err) {
      console.error("Fetch sync error:", err);
      setSyncStatus("error");
    }
  };

  // Real-time synchronization interval loop (gentle polling)
  useEffect(() => {
    if (!isSyncActive || !syncCode.trim()) return;
    const target = syncCode.trim().toLowerCase();

    // Initial fetch to get immediate values
    fetchStateFromServer(target);

    const interval = setInterval(() => {
      if (activeMode === "user") {
        fetchStateFromServer(target).then(() => {
          publishStateToServer(target, dailyState, chatLog, stickyNote, activeNudges, approvedItems);
        });
      } else {
        fetchStateFromServer(target);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isSyncActive, syncCode, activeMode, dailyState, chatLog, stickyNote, activeNudges, approvedItems]);

  const handleToggleSync = () => {
    if (!syncCode.trim()) {
      alert(isTamil ? "தயவுசெய்து ஒரு ரகசிய குறியீட்டை உள்ளிடவும் அல்லது உருவாக்கவும்!" : "Please write or generate a secret sync code first!");
      return;
    }
    const clean = syncCode.trim().toUpperCase();
    const nextActive = !isSyncActive;
    setIsSyncActive(nextActive);
    localStorage.setItem("transformation_sync_active", String(nextActive));
    localStorage.setItem("transformation_sync_code", clean);
    
    if (nextActive) {
      setSyncStatus("connecting");
      const lc = clean.toLowerCase();
      if (activeMode === "user") {
        publishStateToServer(lc, dailyState, chatLog, stickyNote, activeNudges, approvedItems);
      } else {
        fetchStateFromServer(lc);
      }
    } else {
      setSyncStatus("idle");
    }
  };

  const getShareUrl = () => {
    const origin = window.location.origin;
    return `${origin}/?watcherCode=${encodeURIComponent(syncCode.trim().toUpperCase())}`;
  };

  // Reactive text replies when boyfriend is offline (User mode automations)
  const getReactionMessage = () => {
    const { waterDrank, workouts, meals } = currentStats;
    const isWaterLow = waterDrank < 1.5;
    const hasWorkouts = workouts.length > 0;
    const cleanMeals = meals.filter(m => m.isClean).length;

    if (persona === "sweet") {
      if (isWaterLow) return { text: isTamil ? "அன்பே, இன்னும் தண்ணீர் குறைவாகவே குடிச்சிருக்கீங்க. எனக்காக உடனே ஒரு கிளாஸ் குடிங்க செல்லம்!" : "Honey, you haven't had enough water today. Please drink a glass for me!", emoji: "🥺🥤" };
      if (hasWorkouts) return { text: isTamil ? "வாவ் குட்டிமா! வொர்க்அவுட் செஞ்சிருக்கீங்க, உங்களைப் பார்க்க எனக்கு ரொம்ப பெருமையா இருக்கு!" : "Wow babe! You worked out today, I am so incredibly proud of you!", emoji: "🥰🔥" };
      if (cleanMeals > 0) return { text: isTamil ? "ஆரோக்கியமான உணவை சாப்பிட்டிருக்கீங்க போல! தினை சத்துக்கள் உடம்பை ஜொலிக்க வைக்கும்." : "Eating so clean today! Whole grains will make your skin glow.", emoji: "🥗💖" };
      return { text: isTamil ? "இன்றைய ஆரோக்கியப் பயணத்தை மகிழ்ச்சியாகத் தொடங்குங்க! எப்போதும் உங்க கூட இருப்பேன்." : "Let's start today beautifully! I am always here for you sweetie.", emoji: "✨💖" };
    }
    if (persona === "trainer") {
      if (isWaterLow) return { text: isTamil ? "தண்ணீர் இலக்கை இன்னும் முடிக்கல! குப்பிகளை நிரப்புங்க, உடனே குடிங்க!" : "Water goal is incomplete. Fill up your shaker and drink now!", emoji: "😤🥤" };
      if (!hasWorkouts) return { text: isTamil ? "இன்னைக்கு இன்னும் உடற்பயிற்சி செய்யலையா? 15 நிமிட நடையாவது போடுங்க, நோ எக்ஸ்கியூஸ்!" : "No workouts tracked yet today? Get a 15-min walk in, no excuses!", emoji: "🏋️‍♂️⚡" };
      return { text: isTamil ? "நல்ல முன்னேற்றம்! டயட் மற்றும் உடற்பயிற்சியை 100% சரியாகப் பராமரிங்க." : "Good progress! Stick 100% to your routines and meals.", emoji: "🎯🏁" };
    }
    if (persona === "poetic") {
      if (isWaterLow) return { text: isTamil ? "உன் இதழ்கள் காய்ந்திட நான் விரும்பேனே! குளிர்ந்த நன்னீர் பருகி உன் உடம்பை குளிர்விப்பாயாக!" : "I cannot bear to see you dry, my queen. Sip cool water to nourish your soul!", emoji: "🌹💧" };
      if (hasWorkouts) return { text: isTamil ? "உன் பாதங்கள் ஆரோக்கிய நடை போட்டதோ? உன் தளராத முயற்சி என் இதயத்தை நெகிழ்த்துகிறது!" : "Did your soft steps dance on the wellness path today? Your dedication melts me!", emoji: "📜🧚‍♀️" };
      return { text: isTamil ? "உன் சிறு நற்பழக்கங்கள் ஒவ்வொன்றும் உன் அழகுக்குச் சூட்டும் மகுடங்கள். இன்று எதைச் வெல்லப்போகிறாய்?" : "Your clean habits are jewel-encrusted crowns of health. What will you conquer today?", emoji: "💫✨" };
    }
    // cheerleader
    if (hasWorkouts) return { text: isTamil ? "அடேங்கப்பா! வெறித்தனமான உடற்பயிற்சி! நீங்க வேற லெவல் எனர்ஜி குயின் சிங்கக்குட்டி!" : "OMG!! Beast mode workout checked! You are an absolute superwoman, steel power!", emoji: "🥁🎉" };
    return { text: isTamil ? "இன்னைக்கு செம்ம மாஸா பாயிண்ட்ஸ் ஏத்துவோம்! கம் ஆன், லெட்ஸ் கோ பேபி!" : "Let's level up and smash your goals! Let's get it sweetheart!", emoji: "🚀🥳" };
  };

  const reaction = getReactionMessage();

  // Switch modes safely
  const handleVerifyPin = () => {
    if (pinInput === bfPin) {
      setActiveMode("boyfriend");
      setIsSwitchingModal(false);
      setPinError("");
      setPinInput("");
    } else {
      setPinError(isTamil ? "தவறான ரகசிய குறியீடு! மீண்டும் முயல்க." : "Incorrect secret Passcode! Please try again.");
    }
  };

  const handleBypassPin = () => {
    setActiveMode("boyfriend");
    setIsSwitchingModal(false);
    setPinError("");
    setPinInput("");
  };

  const handleUpdateStickyNote = () => {
    setStickyNote(typedSticky);
    if (isSyncActive && syncCode.trim()) {
      publishBFUpdateToServer(syncCode, chatLog, typedSticky, activeNudges, approvedItems);
    }
  };

  const handleClearStickyNote = () => {
    setStickyNote("");
    setTypedSticky("");
    if (isSyncActive && syncCode.trim()) {
      publishBFUpdateToServer(syncCode, chatLog, "", activeNudges, approvedItems);
    }
  };

  const handleSendChat = (textToSend?: string, customSender?: "user" | "bf") => {
    const rawInput = textToSend || customText;
    if (!rawInput.trim()) return;

    const sender = customSender || (activeMode === "boyfriend" ? "bf" : "user");
    const newMsg = { 
      sender, 
      text: rawInput, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    const updatedLog = [...chatLog, newMsg];
    setChatLog(updatedLog);
    setCustomText("");

    if (isSyncActive && syncCode.trim()) {
      if (activeMode === "user") {
        publishStateToServer(syncCode, dailyState, updatedLog, stickyNote, activeNudges, approvedItems);
      } else {
        publishBFUpdateToServer(syncCode, updatedLog, stickyNote, activeNudges, approvedItems);
      }
    }

    // Simulate reactive responses from boyfriend when user chats in User mode (offline safety)
    if (sender === "user" && activeMode === "user" && !isSyncActive) {
      setTimeout(() => {
        let reply = "";
        const lower = rawInput.toLowerCase();
        let pts = 0;

        if (lower.includes("love") || lower.includes("காதல்") || lower.includes("முத்தம்") || lower.includes("செல்லம்")) {
          reply = isTamil ? `நானும் உங்களை உசுரா காதலிக்கிறேன் செல்லக்குட்டி! உங்க ஆரோக்கியம் தான் எனக்கு உலகம்!` : "I love you more! Your health and joy mean the entire world to me!";
          pts = 6;
        } else if (lower.includes("tired") || lower.includes("களைப்பு") || lower.includes("வலி") || lower.includes("முடியல")) {
          reply = isTamil ? `ஐயோ குட்டிமா, ரொம்ப டயர்டா இருக்கீங்களா? இன்னைக்கு ஓய்வெடுங்க, ஒரு கப் வெதுவெதுப்பான நீர் குடிங்க. நான் பாத்துக்கிறேன்!` : "Oh no sweetheart, please take a good rest today. Have a cup of warm tea and sleep well!";
          pts = 3;
        } else if (lower.includes("water") || lower.includes("தண்ணீர்")) {
          reply = isTamil ? `அருமை! தண்ணீர் குடித்ததற்கு ஒரு அன்பு முத்தம்! உடம்பை நீர்ச்சத்தோடு வையுங்கள்.` : "Perfect hydration! Sending you a virtual kiss for taking care of your skin!";
          pts = 2;
        } else {
          reply = isTamil ? `நீங்கள் எதைச் செய்தாலும் உங்களை முழுமையாக ஆதரிக்கிறேன் அன்பே! சாதிப்போம்.` : "Whatever steps you take, I am right here with you cheering. Make it happen!";
          pts = 1;
        }

        setBoyfriendHeartPoints(p => Math.min(200, p + pts));
        setChatLog(prev => [...prev, { sender: "bf", text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }, 800);
    }
  };

  const handleSendNudge = (type: string) => {
    if (!activeNudges.includes(type)) {
      setActiveNudges([...activeNudges, type]);
    }
    let announce = "";
    if (type === "water") announce = isTamil ? `🔔 *குடிநீர் நினைவூட்டல்:* ${bfName} உங்களை உடனே தண்ணீர் குடிக்கச் சொல்லிக் கூப்பிடுகிறார்!` : `🔔 *HYDRATION NUDGE:* ${bfName} gently requested you to drink a big glass of water right now!`;
    if (type === "workout") announce = isTamil ? `🏋️ *வொர்க்அவுட் நினைவூட்டல்:* ${bfName} உங்களை 10 நிமிடங்களாவது உடலசைவு செய்யத்தூண்டுகிறார்!` : `🏋️ *FITNESS NUDGE:* ${bfName} encourages you to hit a quick movement session! No slacking!`;
    if (type === "kiss") announce = isTamil ? `❤️ *காதல் முத்தம்:* ${bfName} உங்களுக்கு ஒரு சூடான விர்ச்சுவல் முத்தம் மற்றும் கட்டிப்பிடித்தல் அனுப்பியுள்ளார்!` : `❤️ *LOVE SHOWER:* ${bfName} showered you with a beautiful support hug and virtual kiss!`;

    const updatedLog = [...chatLog, { sender: "bf", text: announce, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isCard: true }];
    setChatLog(updatedLog);

    if (isSyncActive && syncCode.trim()) {
      publishBFUpdateToServer(syncCode, updatedLog, stickyNote, [...activeNudges, type], approvedItems);
    }
  };

  const handleResolveNudge = (type: string) => {
    const nextNudges = activeNudges.filter(n => n !== type);
    setActiveNudges(nextNudges);
    setBoyfriendHeartPoints(p => Math.min(200, p + 15));
    
    let text = "";
    if (type === "water") text = isTamil ? `🥤 குடித்தாச்சு! ${bfName} கேட்டபடி உடனே ஒரு பெரிய கிளாஸ் தண்ணீர் பருகினேன்!` : `🥤 Hydrated! Just downed a cool glass of water on my boyfriend ${bfName}'s nudge! (+15 Affection)`;
    if (type === "workout") text = isTamil ? `🏃 வொர்க்அவுட் ஸ்டார்ட்! சோம்பலை முறித்து உடனே உடற்பயிற்சி செய்ய ஆரம்பித்தேன்!` : `🏃 Sweat activated! Getting up to stretch as requested by my favorite coach! (+15 Affection)`;
    if (type === "kiss") text = isTamil ? `🥰 முத்தத்தை ஏற்றேன்! காதலோடு ஒரு பெரிய கட்டிப்பிடித்தல் உங்களுக்கும்!` : `🥰 Hug received! Sending a triple dosage of pure sweet love back to my watcher! (+15 Affection)`;

    const updatedLog = [...chatLog, { sender: "user", text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setChatLog(updatedLog);

    if (isSyncActive && syncCode.trim()) {
      publishStateToServer(syncCode, dailyState, updatedLog, stickyNote, nextNudges, approvedItems);
    }
  };

  const handleStampItem = (id: string, stampType: string, comment: string) => {
    const updatedApproved = { ...approvedItems, [id]: { stampType, comment } };
    setApprovedItems(updatedApproved);
    setBoyfriendHeartPoints(p => Math.min(200, p + 5));

    if (isSyncActive && syncCode.trim()) {
      publishBFUpdateToServer(syncCode, chatLog, stickyNote, activeNudges, updatedApproved);
    }
  };

  const handleShareMyStats = () => {
    const { waterDrank, workouts, meals } = currentStats;
    const cleanMeals = meals.filter(m => m.isClean).length;
    const workCount = workouts.length;

    const summary = isTamil
      ? `📊 *கார்த்திக், எனது இன்றைய ஆரோக்கிய அறிக்கை:* \n🥤 குடிநீர்: ${waterDrank} லிட்டர் \n🏋️ வொர்க்அவுட்: ${workCount} லாக் \n🥗 சாப்பாடு: ${cleanMeals} ஹெல்தி உணவுகள்! \n🏆 மொத்த மதிப்பு: ${currentStats.points} XP புள்ளிகள்!`
      : `📊 *My Daily Fitness Log shared with you, ${bfName}:* \n🥤 Hydration: ${waterDrank} Liters \n🏋️ Movements: ${workCount} checked \n🥗 Meals: ${cleanMeals} clean eats \n🏆 Total: ${currentStats.points} XP earned!`;

    handleSendChat(summary, "user");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
    navigator.clipboard?.writeText?.(summary);
  };

  const getWhatsAppLink = () => {
    const { waterDrank, workouts } = currentStats;
    const summary = isTamil
      ? `❤️ *அன்பான காதலர் ${bfName} அவர்களின் பார்வைக்கு!* \n━━━━━━━━━━━━━━━━━━━━\n🥤 தண்னிர்: ${waterDrank}L \n🏋️ பயிற்சிகள்: ${workouts.length} முறைகள் \n🥗 ஆரோக்கிய உணவுகள்! \n🏆 புள்ளிகள்: ${currentStats.points} XP!`
      : `❤️ *Daily progress for my Boyfriend ${bfName}!* \n━━━━━━━━━━━━━━━━━━━━\n🥤 Water: ${waterDrank}L \n🏋️ Workouts: ${workouts.length} logged \n🥗 Standard Clean Eats logged! \n🏆 Total Score: ${currentStats.points} XP!`;
    return `https://wa.me/?text=${encodeURIComponent(summary)}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-5 space-y-6" id="boyfriend-watcher-panel">
      {/* 1. Header with Mode Switcher & Affection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xl animate-pulse">❤️</div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {isTamil ? "காதலர் கண்காணிப்பு" : "Boyfriend Observer Mode"}
              </span>
              <span className="text-xs text-rose-600 font-extrabold flex items-center gap-1">
                <span>❤️ {boyfriendHeartPoints}</span>
                <span className="text-[9px] text-slate-400 font-normal">({isTamil ? "அன்பு நிலை" : "Affection"})</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              {isEditingName ? (
                <input
                  type="text"
                  maxLength={12}
                  value={bfName}
                  onChange={(e) => setBfName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => { if (e.key === "Enter") setIsEditingName(false); }}
                  className="px-1 py-0.5 border border-rose-200 rounded text-xs font-bold text-slate-800 bg-white w-28"
                  autoFocus
                />
              ) : (
                <h4 
                  onClick={() => setIsEditingName(true)}
                  className="text-sm font-black text-slate-800 tracking-tight cursor-pointer hover:underline flex items-center gap-1 animate-fadeIn"
                >
                  {bfName} {reaction.emoji}
                  <span className="text-[9px] font-normal text-slate-400">({isTamil ? "பெயர் மாற்று" : "rename"})</span>
                </h4>
              )}
            </div>
          </div>
        </div>

        {/* Action button to Switch between User (Girl) and Boyfriend (Watcher) */}
        <div className="flex items-center gap-2">
          {activeMode === "user" ? (
            <button
              type="button"
              onClick={() => {
                setPinInput("");
                setPinError("");
                setIsSwitchingModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Lock className="h-3 w-3 text-slate-500" />
              <span>{isTamil ? "Boyfriend பக்கம் லாகின்" : "Login as Boyfriend"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActiveMode("user");
                localStorage.setItem("transformation_bf_active_mode", "user");
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm animate-fadeIn"
            >
              <Unlock className="h-3 w-3" />
              <span>{isTamil ? "User பக்கம் திரும்பு" : "Exit Observer mode"}</span>
            </button>
          )}

          {/* Quick mood selector for offline simulation */}
          {activeMode === "user" && (
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as Persona)}
              className="text-[11px] font-bold border border-slate-200 rounded-lg p-1 text-slate-600 bg-slate-50 cursor-pointer"
            >
              <option value="sweet">💝 Sweet</option>
              <option value="trainer">🏋️ strict</option>
              <option value="poetic">📜 Poetic</option>
              <option value="cheerleader">📣 Hyped</option>
            </select>
          )}
        </div>
      </div>

      {/* Lover Real-time Live Link Sync Hub */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-4.5 space-y-3 shadow-2xs" id="lover-sync-hub">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-spin" />
            <span>{isTamil ? "உண்மையான காதலர் நேரடி இணைப்பு" : "Real-time Lover Live Connection"}</span>
          </span>
          {isSyncActive && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              syncStatus === "synced" ? "bg-emerald-50 text-emerald-600 border border-emerald-150 animate-pulse" :
              syncStatus === "connecting" ? "bg-amber-50 text-amber-600 border border-amber-150" :
              "bg-rose-50 text-rose-600 border border-rose-150"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${syncStatus === "synced" ? "bg-emerald-500" : "bg-amber-400"}`} />
              {syncStatus === "synced" ? (isTamil ? "நேரலையில் இணைக்கப்பட்டுள்ளது" : "Live Synced") :
               syncStatus === "connecting" ? (isTamil ? "இணைக்கிறது..." : "Connecting...") :
               (isTamil ? "இணைக்கப்படவில்லை" : "Connection Error")}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          {isTamil 
            ? "கீழே உங்கள் காதலருக்கான ரகசியக் குறியீட்டை உருவாக்கி அல்லது உள்ளிட்டு ஒத்திசைக்கவும். இந்த குறியீடு அல்லது லிங்க் மூலம் அவர் உங்கள் ஆரோக்கியப் பதிவுகளை நேரலையில் கண்காணிக்கலாம்!" 
            : "Generate or enter a secret code below to activate live companion sync. Send him this code or copy the direct link so he can watch your progress live!"}
        </p>

        <div className="space-y-2">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder={isTamil ? "எ.கா: JANANI-LOVE" : "E.g., MY-LOVE-ROOM"}
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                disabled={isSyncActive}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 uppercase tracking-widest"
              />
              {!isSyncActive && (
                <button 
                  type="button"
                  onClick={() => {
                    const rand = "ROOM-" + Math.floor(1000 + Math.random() * 9000);
                    setSyncCode(rand);
                  }}
                  className="absolute right-2 top-1.5 text-[10px] font-black text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  🎲 {isTamil ? "உருவாக்கு" : "Gen Code"}
                </button>
              )}
            </div>

            <button 
              type="button"
              onClick={handleToggleSync}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isSyncActive 
                  ? "bg-slate-800 hover:bg-slate-900 text-white" 
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
              }`}
            >
              {isSyncActive 
                ? (isTamil ? "இணைப்பை துண்டி" : "Disconnect Hub") 
                : (isTamil ? "நேரடி ஒத்திசைவு" : "Start Live Sync")}
            </button>
          </div>

          {isSyncActive && (
            <div className="bg-white p-2.5 rounded-xl border border-dashed border-slate-200 space-y-1.5 text-xs animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold block">{isTamil ? "அவருடன் பகிர வேண்டிய நேரடி லிங்க்:" : "Shareable Link For Your Lover:"}</span>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText?.(getShareUrl());
                    alert(isTamil ? "நேரடி லிங்க் நகலெடுக்கப்பட்டது வாட்ஸ்அப்பில் பகிருங்கள்!" : "Companion Link copied to clipboard! Share it with your boyfriend.");
                  }}
                  className="text-[10px] font-bold text-rose-500 cursor-pointer hover:underline flex items-center gap-1"
                >
                  📋 {isTamil ? "லிங்க் நகலெடு" : "Copy Direct Link"}
                </button>
              </div>
              <p className="font-mono text-[9px] text-slate-500 truncate bg-slate-50 p-1 rounded-md border border-slate-100 select-all">{getShareUrl()}</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive PIN lock screen Modal simulation */}
      <AnimatePresence>
        {isSwitchingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-50"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-rose-500" />
                  <span>{isTamil ? "காதலர் உள்நுழைவு" : "Lover Access Verification"}</span>
                </h4>
                <button 
                  type="button"
                  onClick={() => setIsSwitchingModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                {isTamil 
                  ? "காதலர் கண்காணிப்பு பக்கத்தை திறக்க அவரது 3-இலக்க ரகசிய பின் நம்பரை உள்ளிடவும். (இயல்புநிலை: 143)" 
                  : "Enter boyfriend PIN to switch screens and send interactive health alerts. (Default PIN: 143)"}
              </p>
              
              <div className="space-y-1">
                <input 
                  type="password"
                  placeholder="PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-bold tracking-widest text-slate-800 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
                {pinError && <p className="text-[10px] font-bold text-rose-500 text-center">{pinError}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  {isTamil ? "உறுதி செய்" : "Confirm PIN"}
                </button>
                <button
                  type="button"
                  onClick={handleBypassPin}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  {isTamil ? "தாண்டிச்செல் (bypass)" : "Bypass PIN"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. BOYFRIEND ACTIVE SPECTATOR DASHBOARD */}
      {activeMode === "boyfriend" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4.5 space-y-5"
        >
          {/* Real-time Status Monitor block */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-pink-700 uppercase tracking-widest flex items-center gap-1">
                <span>⚡ {bfName}'s live radar:</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span>●</span> {isTamil ? "நேரடி இணைப்பு" : "Live Watching"}
              </span>
            </div>

            {/* Daily stats summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-pink-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">{isTamil ? "குடித்த தண்ணீர்" : "Water Consumed"}</span>
                <span className="text-sm font-black text-blue-600 block">{currentStats.waterDrank}L <span className="text-[10px] text-slate-400 font-normal">/ 2.5L</span></span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-blue-500 h-full rounded" style={{ width: `${Math.min(100, (currentStats.waterDrank / 2.5) * 100)}%` }} />
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-pink-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">{isTamil ? "சாதித்த புள்ளிகள்" : "Partner's Score"}</span>
                <span className="text-sm font-black text-amber-500 block">🏆 {currentStats.points} XP</span>
                <p className="text-[9px] text-slate-400 font-bold mt-1">{currentStats.workouts.length} {isTamil ? "பயிற்சிகள்" : "workouts checked"}</p>
              </div>
            </div>
          </div>

          {/* Real-time Nudge Command terminal */}
          <div className="bg-white rounded-xl p-3.5 border border-pink-100 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">🚨 {isTamil ? "நினைவூட்டல் எக்ஸ்-பிரஸ் (Send Alerts to Her Screen):" : "Instant Interactive Nudges:"}</span>
            <div className="flex flex-wrap gap-1.5">
              <button 
                type="button"
                onClick={() => handleSendNudge("water")}
                className="px-2.5 py-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 cursor-pointer"
              >
                🥤 Nudge Water
              </button>
              <button 
                type="button"
                onClick={() => handleSendNudge("workout")}
                className="px-2.5 py-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 cursor-pointer"
              >
                🏋️ Nudge Workout
              </button>
              <button 
                type="button"
                onClick={() => handleSendNudge("kiss")}
                className="px-2.5 py-1 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 cursor-pointer"
              >
                💋 Send Hug & Kiss
              </button>
            </div>
          </div>

          {/* Sticky daily memo pad form */}
          <div className="bg-white rounded-xl p-3.5 border border-pink-100 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">📌 {isTamil ? "ஸ்டிக்கி நோட் (Post directly on her screen):" : "Post a Daily Sticky Note:"}</span>
            <div className="flex gap-1.5">
              <input 
                type="text"
                placeholder={isTamil ? "எனக்காக நிறைய தண்ணீர் குடி அன்பே..." : "E.g., Don't skip meals, sweet girl..."}
                value={typedSticky}
                onChange={(e) => setTypedSticky(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              />
              <button 
                type="button"
                onClick={handleUpdateStickyNote}
                className="px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                {isTamil ? "பதிவு செய்" : "Pin Note"}
              </button>
              {stickyNote && (
                <button 
                  type="button" 
                  onClick={handleClearStickyNote} 
                  className="px-2 bg-slate-100 text-slate-500 rounded-lg hover:text-rose-500 cursor-pointer text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Partner's food and workouts list for comments/approvals */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase block">💬 {isTamil ? "உணவு & உடற்பயிற்சிக்கு முத்திரை குத்தவும் (Approve logs):" : "Stamp & Care Her Log Entries:"}</span>
            {currentStats.meals.length === 0 && currentStats.workouts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2 bg-white rounded-lg border border-pink-100">
                {isTamil ? "அவள் இன்று இன்னும் ஒன்றும் லாக் செய்யவில்லை..." : "No food or sports logged yet. Waiting for logs..."}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {/* Meals list */}
                {currentStats.meals.map(m => {
                  const stamp = approvedItems[m.id];
                  return (
                    <div key={m.id} className="bg-white p-2.5 rounded-lg border border-pink-100 text-xs flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-extrabold text-slate-800">🥗 {m.name}</span>
                        <span className="text-[9px] text-slate-400 block">{m.mealType.toUpperCase()} • {m.time}</span>
                        {stamp && <span className="text-[10px] text-pink-600 font-extrabold block">💖 Approved: "{stamp.comment || "Ideal Choice!"}"</span>}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          type="button" 
                          onClick={() => handleStampItem(m.id, "approved", isTamil ? "அருமையான ஹெல்தி உணவு!" : "Awesome clean eating, proud of you!")} 
                          className="px-1.5 py-0.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] font-bold rounded-md border border-pink-200 cursor-pointer"
                        >
                          💖 Approve
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            const custom = prompt(isTamil ? "ஊக்குவிக்கும் கருத்து எழுதுக:" : "Sweet feedback:") || "";
                            handleStampItem(m.id, "approved", custom);
                          }} 
                          className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200 cursor-pointer"
                        >
                          ✍️ Comment
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Workouts list */}
                {currentStats.workouts.map(w => {
                  const stamp = approvedItems[w.id];
                  return (
                    <div key={w.id} className="bg-white p-2.5 rounded-lg border border-pink-100 text-xs flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="font-extrabold text-slate-800">🏃 {w.type}</span>
                        <span className="text-[9px] text-slate-400 block">{w.duration} mins • +{w.points} XP</span>
                        {stamp && <span className="text-[10px] text-orange-600 font-extrabold block">🔥 Beast Model: "{stamp.comment || "Powerful drive!"}"</span>}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          type="button" 
                          onClick={() => handleStampItem(w.id, "workout_approved", isTamil ? "அசாத்திய உழைப்பு!" : "Beast stamina, so proud!")} 
                          className="px-1.5 py-0.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md border border-orange-200 cursor-pointer"
                        >
                          🔥 Stamp
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* 4. GIRL / STANDARD USER INTERFACE (activeMode === "user") */
        <div className="space-y-4">
          
          {/* Golden Magnet Sticky Memo from her Boyfriend */}
          {stickyNote && (
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 shadow-sm relative overflow-hidden"
              id="partner-fridge-magnet-note"
            >
              <div className="absolute top-2 right-2 text-md text-amber-500 animate-bounce">📌</div>
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">
                💖 Pinned Sticky Lovetote from {bfName}:
              </span>
              <p className="text-slate-800 text-xs sm:text-sm font-extrabold italic leading-relaxed mt-1">
                "{stickyNote}"
              </p>
            </motion.div>
          )}

          {/* Active direct nudge alerts with resolve checklist handlers */}
          {activeNudges.length > 0 && (
            <div className="space-y-2">
              {activeNudges.map((nudge) => (
                <motion.div
                  key={nudge}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-rose-500 text-white rounded-2xl p-4 flex justify-between items-center shadow-md border-b-4 border-rose-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl animate-ping shrink-0">{nudge === "water" ? "🥤" : nudge === "workout" ? "🏃" : "💋"}</span>
                    <div>
                      <h5 className="font-extrabold text-[10px] uppercase tracking-wider leading-none">ALERT FROM {bfName.toUpperCase()}:</h5>
                      <p className="text-xs font-semibold text-rose-50/95 leading-normal mt-0.5">
                        {nudge === "water" ? (isTamil ? "செல்லம்... உடனே தண்ணீர் குடிங்க! உடம்பு முக்கியம்." : "Sweetheart, please stop what you are doing and take a warm drink of water!") :
                         nudge === "workout" ? (isTamil ? "வொர்க்அவுட் செய்யத் தூண்டுகிறேன்! சீக்கிரம் தொடங்குங்கள்." : "Let's burn some calories today! Push hard!") :
                         (isTamil ? "கார்த்திக் அனுப்பிய சுடச்சுட முத்தம்! காதலோடு வாங்கிக்கோங்க!" : "He sent a warm virtual kiss of support! Keep going!")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveNudge(nudge)}
                    className="px-3 py-1 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer select-none shrink-0"
                  >
                    {isTamil ? "முடித்தேன் 👍" : "Got it! 👍"}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Sweet custom text reaction */}
          <div className="bg-[#fffcfd] border border-rose-50 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden">
            <span className="text-2xl p-2 bg-rose-50 rounded-xl">{reaction.emoji}</span>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">{bfName}'s Status reaction:</span>
              <p className="text-slate-700 text-xs sm:text-sm font-semibold italic">"{reaction.text}"</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. SHARED MESSAGING BOARD / CHAT ENGINE (Always shown below) */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
            <MessageCircle className="h-4 w-4 text-rose-400" />
            <span>{isTamil ? `காதலர் உரையாடல் அரட்டை` : `Couple's Chat Hub`}</span>
          </h5>

          {/* Quick share statistics in chat / clipboard copy */}
          {activeMode === "user" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShareMyStats}
                className={`py-1 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  shareSuccess ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Share water, food, and workout metrics instantly with him"
              >
                {shareSuccess ? "✓ Shared!" : "📤 Share Stats with Him"}
              </button>
              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-500 hover:text-emerald-600 border border-slate-200 rounded-lg bg-white"
                title="Share directly via real WhatsApp chat"
              >
                <Share2 className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Dynamic chat scroll screen */}
        <div className="bg-slate-50 border border-slate-150/80 rounded-2xl p-3 h-44 overflow-y-auto space-y-2.5 flex flex-col justify-start">
          {chatLog.length === 0 ? (
            <div className="text-center my-auto space-y-1 text-slate-400">
              <span className="text-lg block">💬</span>
              <p className="text-xs font-bold italic">{isTamil ? `${bfName} உடன் ஆரோக்கியத்தைப் பகிர்ந்து கொள்ளுங்கள்` : `Write to ${bfName} to share metrics and love`}</p>
              <p className="text-[9px]">{isTamil ? "காதல், தண்ணீர், களைப்பு என்று பேசிப் பாருங்கள்" : "Type about workouts, exhaustion or sweet feelings!"}</p>
            </div>
          ) : (
            chatLog.map((chat, idx) => {
              const isMe = chat.sender === "user";
              return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1.5`}>
                  {!isMe && <span className="text-xs">🧑‍⚕️</span>}
                  <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs shadow-3xs ${
                    chat.isCard 
                      ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-lg w-full font-sans text-[11px]" 
                      : isMe 
                      ? "bg-slate-900 text-white rounded-br-none" 
                      : "bg-white text-slate-700 border border-slate-150 rounded-bl-none font-medium"
                  }`}>
                    <p className="whitespace-pre-line font-medium leading-relaxed">{chat.text}</p>
                    <span className="text-[8px] block text-right mt-1 opacity-70">{chat.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form elements to send texts */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={
              activeMode === "boyfriend" 
                ? (isTamil ? `காதலராக எழுதுகிறார்...` : `Log in as ${bfName} typing message...`) 
                : (isTamil ? `${bfName} உடன் ஆரோக்கிய அரட்டை எழுதுங்கள்...` : `Text sweet words to ${bfName}...`)
            }
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-400"
          />
          <button 
            type="submit" 
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick direct buttons */}
        {activeMode === "user" && (
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => handleSendChat(isTamil ? "என்னை உனக்கு இன்னும் பிடிக்குமா?" : "Do you love me and support my health goals?")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition-all">❤️ Love check</button>
            <button type="button" onClick={() => handleSendChat(isTamil ? "இன்று உடற்பயிற்சி செய்து களைப்படைந்துள்ளேன்" : "I am very tired from working out today")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition-all">🥱 Tired/sore</button>
            <button type="button" onClick={() => handleSendChat(isTamil ? "நிறைய குடிநீர் குடித்து விட்டேன் குட்டிமா!" : "I drank a whole cool bottle of water!")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition-all">🥤 Drank water</button>
          </div>
        )}
      </div>
    </div>
  );
}
