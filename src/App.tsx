import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Download, 
  Volume2, 
  VolumeX, 
  Settings, 
  Sparkles, 
  AlignLeft, 
  AlignJustify, 
  Type as FontIcon, 
  ZoomIn, 
  BookOpen, 
  Image as ImageIcon,
  Check,
  RefreshCw,
  Info,
  Music,
  User
} from "lucide-react";
import html2canvas from "html2canvas";
import { PoetryData, CardCustomization, PoetryMood, PoetryTheme } from "./types";
import AestheticBackground from "./components/AestheticBackground";
import PoetryCard from "./components/PoetryCard";
import { ZenAudioEngine } from "./utils/zenAudio";
import { sanitizeStylesForExport } from "./utils/exportSanitizer";

// Exquisite preset poem to start with so the page looks incredibly premium right away
const defaultPoetry: PoetryData = {
  title: "水调歌头·明月几时有",
  author: "苏轼",
  dynasty: "宋",
  content: [
    "明月几时有？把酒问青天。",
    "不知天上宫阙，今夕是何年。",
    "我欲乘风归去，又恐琼楼玉宇，高处不胜寒。",
    "起舞弄清影，何似在人间。",
    "转朱阁，低绮户，照无眠。",
    "不应有恨，何事长向别时圆？",
    "人有悲欢离合，月有阴晴圆缺，此事古难全。",
    "但愿人长久，千里共婵娟。"
  ],
  translation: [
    "明月从什么时候开始才有的呢？我拿着酒杯遥问苍天。",
    "不知道天上的宫殿里，今天晚上是哪一年。",
    "我想凭借着风力回到天上去，又恐怕那美玉砌成的楼宇太高，让人无法承受那里的清寒。",
    "在月光下翩翩起舞，玩赏着自己清朗的影子，哪里比得上在温暖的人间呢？",
    "月儿转过朱红色的楼阁，低低地挂在雕花的窗户上，照着没有睡意的人。",
    "明月不应该对人们有什么怨恨吧，为什么偏偏在人们离别的时候才圆呢？",
    "人有悲欢离合的变迁，月有阴晴圆缺的转换，这种事自古以来难以周全。",
    "只希望人人年年平安，虽然相隔千里，也能共享这美好的月光。"
  ],
  appreciation: "这首词是苏轼中秋望月怀人之作。全词以明月为主线，融写景、抒情、议论于一炉，通过对天上琼楼玉宇与人世温暖的对比，展现了作者在出世与入世之间的心灵挣扎，最终以旷达乐观的情怀，表达了对亲人的深切思念和对人生美好的祝愿。词风清雄旷达，意境唯美深邃，是中秋词中的千古绝唱。",
  authorBackground: "苏轼（1037年—1101年），字子瞻，号东坡居士，北宋著名文学家、书画家，豪放派词人代表。其诗词波澜壮阔、旷达高妙，代表作有《念奴娇·赤壁怀古》《江城子·密州出猎》等，与其父苏洵、弟苏辙合称“三苏”，在文学史上享有极高声誉。",
  mood: "romantic",
  theme: {
    name: "杏花春雨",
    primaryColor: "#78350f",
    secondaryColor: "#fdfbf7",
    accentColor: "#dc2626",
    textColor: "#1c1917",
    bgStyle: "linear-gradient(135deg, #fdfbf7 0%, #f4ede1 100%)"
  },
  illustrationPrompt: "minimalist watercolor painting of a solitary figure holding a cup under a large glowing full moon and soft clouds, dark blue tones"
};

const PRESET_POEMS = [
  { name: "水调歌头·明月几时有", query: "水调歌头 苏轼" },
  { name: "静夜思", query: "静夜思" },
  { name: "将进酒", query: "将进酒 李白" },
  { name: "雨霖铃·寒蝉凄切", query: "雨霖铃 柳永" },
  { name: "登高", query: "登高 杜甫" },
  { name: "江南春", query: "江南春 杜牧" },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [poetry, setPoetry] = useState<PoetryData>(defaultPoetry);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Card customization state
  const [customization, setCustomization] = useState<CardCustomization>({
    layout: "centered",
    fontSize: "base",
    fontFamily: "serif",
    showTranslation: false,
    showAppreciation: false,
    cardStyle: "minimalist",
    blurBackground: true,
    sajinGold: false,
    customSealText: "",
    aspectRatio: "1:1",
  });

  // Audio / Speech Recital state
  const [reciterVoice, setReciterVoice] = useState("Kore");
  const [reciterEngine, setReciterEngine] = useState<"ai" | "system">("ai");
  const [audioReciting, setAudioReciting] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  // Zen Ambient Soundscape state
  const [zenPlaying, setZenPlaying] = useState(false);
  const [zenVolume, setZenVolume] = useState(0.3);
  const zenAudioRef = useRef<ZenAudioEngine | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const getZenAudioEngine = () => {
    if (!zenAudioRef.current) {
      zenAudioRef.current = new ZenAudioEngine();
    }
    return zenAudioRef.current;
  };

  const handleToggleZen = () => {
    const engine = getZenAudioEngine();
    if (zenPlaying) {
      engine.stop();
      setZenPlaying(false);
    } else {
      engine.start();
      engine.setVolume(zenVolume);
      setZenPlaying(true);
    }
  };

  const handleZenVolumeChange = (vol: number) => {
    setZenVolume(vol);
    const engine = getZenAudioEngine();
    engine.setVolume(vol);
  };

  // Stop any reciting when poetry changes
  useEffect(() => {
    stopReciting();
  }, [poetry]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (zenAudioRef.current) {
        zenAudioRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSearch = async (queryToSearch?: string) => {
    const targetQuery = queryToSearch || searchQuery;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    stopReciting();

    try {
      const response = await fetch("/api/poetry/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: targetQuery }),
      });

      if (!response.ok) {
        throw new Error("检索诗词失败，请检查网络或稍后重试");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setPoetry(data);
      if (!queryToSearch) {
        setSearchQuery("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "未能检索到相关诗词，请换个词重试");
    } finally {
      setLoading(false);
    }
  };

  const stopReciting = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioReciting(false);
  };

  const startReciting = async () => {
    stopReciting();

    const fullText = poetry.content.join("。");

    if (reciterEngine === "system") {
      if (!window.speechSynthesis) {
        setErrorMsg("您的浏览器或设备不支持系统语音播放");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(fullText);
      const voices = window.speechSynthesis.getVoices();
      
      // Attempt to pick an elegant Chinese voice
      const zhVoice = voices.find(
        (v) => v.lang.includes("zh") || v.lang.includes("CN") || v.lang.includes("HK")
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      
      utterance.rate = 0.8; // Poetic slow speed
      utterance.pitch = 0.95; // Slightly deeper tone for classical rhythm

      utterance.onend = () => setAudioReciting(false);
      utterance.onerror = () => setAudioReciting(false);

      setAudioReciting(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioLoading(true);
      try {
        const response = await fetch("/api/poetry/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: fullText, voice: reciterVoice }),
        });

        if (!response.ok) {
          throw new Error("AI 语音服务不可用");
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => {
          setAudioReciting(false);
          audioRef.current = null;
        };
        newAudio.onerror = () => {
          setAudioReciting(false);
          audioRef.current = null;
        };

        audioRef.current = newAudio;
        setAudioReciting(true);
        newAudio.play();
      } catch (err: any) {
        console.error("AI TTS failed, switching to local engine:", err);
        // Silently fallback to system speech synthesis so experience is flawless
        setReciterEngine("system");
        setAudioLoading(false);
        // Start system recitation
        setTimeout(() => {
          const systemUtterance = new SpeechSynthesisUtterance(fullText);
          const voices = window.speechSynthesis.getVoices();
          const zhVoice = voices.find(v => v.lang.includes("zh") || v.lang.includes("CN"));
          if (zhVoice) systemUtterance.voice = zhVoice;
          systemUtterance.rate = 0.8;
          systemUtterance.onend = () => setAudioReciting(false);
          systemUtterance.onerror = () => setAudioReciting(false);
          setAudioReciting(true);
          window.speechSynthesis.speak(systemUtterance);
        }, 150);
      } finally {
        setAudioLoading(false);
      }
    }
  };

  const handleExportCard = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    let restoreStyles: (() => void) | null = null;
    try {
      // Delay slightly to let layout finish rendering
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Temporarily strip oklab/oklch rules to prevent html2canvas crashing
      restoreStyles = sanitizeStylesForExport();

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2.5, // Crisp high-definition output
        backgroundColor: null,
        logging: false,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `诗意卡片_${poetry.author}_${poetry.title}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to export card:", err);
      setErrorMsg("卡片导出图片失败，您可以尝试截屏分享");
    } finally {
      // Cleanly restore all CSS rules
      if (restoreStyles) {
        restoreStyles();
      }
      setExporting(false);
    }
  };

  const getMoodBadge = (mood: PoetryMood) => {
    const moods: Record<PoetryMood, { cn: string; color: string }> = {
      solitary: { cn: "孤独幽静", color: "bg-slate-800 text-slate-100" },
      joyful: { cn: "喜悦明朗", color: "bg-rose-800 text-rose-100" },
      melancholy: { cn: "忧伤凄美", color: "bg-indigo-950 text-indigo-100" },
      heroic: { cn: "豪放壮阔", color: "bg-amber-900 text-amber-100" },
      peaceful: { cn: "宁静闲适", color: "bg-emerald-900 text-emerald-100" },
      romantic: { cn: "浪漫唯美", color: "bg-purple-900 text-purple-100" },
      parting: { cn: "离别思念", color: "bg-amber-800 text-amber-50" },
    };
    return moods[mood] || { cn: "古典雅致", color: "bg-stone-800 text-stone-100" };
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-stone-800 bg-[#faf8f5] overflow-x-hidden font-serif">
      {/* 1. Immersive Dynamic Aesthetic Background */}
      <AestheticBackground mood={poetry.mood} theme={poetry.theme} />

      {/* Glass overlay covering the body content to guarantee maximum legibility of all controls */}
      <div className="relative z-10 w-full flex-grow flex flex-col min-h-screen">
        
        {/* Top Navigation in Sophisticated Light Theme */}
        <nav className="flex items-center justify-between px-6 md:px-10 h-20 border-b border-stone-200/60 shrink-0 bg-[#faf8f5]/65 backdrop-blur-md">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 border border-stone-300 flex items-center justify-center rotate-45 bg-white shadow-[0_4px_12px_rgba(139,115,85,0.06)]">
              <span className="-rotate-45 font-serif font-bold tracking-widest text-sm text-[#78350f]">墨</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.4em] font-semibold text-stone-700">Mo Ink Poetry</span>
              <span className="text-[10px] text-amber-800 tracking-widest uppercase font-mono mt-0.5">诗意卡片 · 雅致空间</span>
            </div>
          </div>

          {/* Quick Traditional Theme Info */}
          <div className="hidden md:flex items-center gap-2.5 text-[11px] text-stone-700 bg-stone-100/60 border border-stone-200/50 rounded-full px-4 py-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: poetry.theme?.accentColor || "#dc2626" }} />
            <span>意境：<strong>{getMoodBadge(poetry.mood).cn}</strong></span>
            <span className="opacity-35">|</span>
            <span>色系：<strong>{poetry.theme?.name || "素雅"}</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
            <span className="hidden sm:inline text-stone-600 hover:text-stone-900 transition-colors cursor-pointer">文雅集</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-stone-200 to-stone-300 border border-stone-300 shadow-inner"></div>
          </div>
        </nav>

        {/* Main Content Layout */}
        <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-grow items-start px-4 py-8 md:px-8 md:py-10">
          
          {/* LEFT SECTION: Beautiful Poetry Card live render & actions */}
          <section className="lg:col-span-7 flex flex-col items-center justify-center space-y-6 w-full">
            
            {/* The Poetry Card Canvas Container */}
            <div className="relative w-full group py-2 px-1 flex justify-center">
              {/* Soft atmospheric background glow behind the active card */}
              <div 
                className="absolute inset-0 max-w-xl mx-auto rounded-3xl opacity-30 blur-3xl transition-all duration-1000 -z-10 group-hover:scale-105"
                style={{ background: poetry.theme?.bgStyle || "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
              />
              
              <PoetryCard 
                poetry={poetry} 
                customization={customization} 
                innerRef={cardRef} 
              />
            </div>

            {/* Quick Actions Panel directly under the card */}
            <div className="w-full max-w-xl flex flex-wrap gap-3 justify-center bg-white/70 border border-stone-200/60 shadow-sm rounded-2xl p-4 backdrop-blur-md">
              
              {/* Recitation Button */}
              {audioReciting ? (
                <button
                  id="stop-recite-btn"
                  onClick={stopReciting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-full transition-all duration-300 font-serif text-xs tracking-wider"
                >
                  <VolumeX className="w-4 h-4 text-rose-700" />
                  停止朗诵
                </button>
              ) : (
                <button
                  id="start-recite-btn"
                  onClick={startReciting}
                  disabled={audioLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#78350f] hover:bg-[#9a3412] disabled:bg-stone-100 disabled:text-stone-400 text-white rounded-full transition-all duration-300 font-serif text-xs font-semibold tracking-wider shadow-md"
                >
                  {audioLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  {audioLoading ? "正在调音..." : "雅音朗诵"}
                </button>
              )}

              {/* Share Card Download Button */}
              <button
                id="export-card-btn"
                onClick={handleExportCard}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-full transition-all duration-300 font-serif text-xs tracking-wider"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-stone-600" />
                )}
                {exporting ? "正在研墨..." : "生成分享卡片"}
              </button>

              {/* Toggle panels short cuts */}
              <button
                onClick={() => setCustomization(prev => ({ ...prev, showTranslation: !prev.showTranslation }))}
                className={`px-4 py-2.5 rounded-full border text-xs font-serif transition-all duration-300 ${
                  customization.showTranslation 
                    ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold" 
                    : "bg-stone-50/50 border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                {customization.showTranslation ? "隐藏释义" : "显示释义"}
              </button>

              <button
                onClick={() => setCustomization(prev => ({ ...prev, showAppreciation: !prev.showAppreciation }))}
                className={`px-4 py-2.5 rounded-full border text-xs font-serif transition-all duration-300 ${
                  customization.showAppreciation 
                    ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold" 
                    : "bg-stone-50/50 border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                {customization.showAppreciation ? "隐藏赏析" : "显示赏析"}
              </button>
            </div>

            {/* Audio Wave Animator active when reciting */}
            {audioReciting && (
              <div className="flex items-center gap-3 bg-amber-50/90 border border-amber-200/65 px-5 py-2.5 rounded-2xl shadow-sm backdrop-blur-md">
                <span className="text-xs text-[#78350f] font-serif font-medium">雅音朗诵中...</span>
                <div className="flex items-end gap-1 h-4">
                  <div className="w-0.5 bg-amber-700 equalizer-bar" style={{ animationDelay: "0.1s", animationDuration: "0.8s" }} />
                  <div className="w-0.5 bg-amber-700 equalizer-bar" style={{ animationDelay: "0.4s", animationDuration: "1.1s" }} />
                  <div className="w-0.5 bg-amber-700 equalizer-bar" style={{ animationDelay: "0.2s", animationDuration: "0.7s" }} />
                  <div className="w-0.5 bg-amber-700 equalizer-bar" style={{ animationDelay: "0.6s", animationDuration: "1.2s" }} />
                  <div className="w-0.5 bg-amber-700 equalizer-bar" style={{ animationDelay: "0.3s", animationDuration: "0.9s" }} />
                </div>
              </div>
            )}
          </section>

          {/* RIGHT SECTION: Controls, custom searches, and details */}
          <section className="lg:col-span-5 space-y-6 w-full">
            
            {/* Poetry Intelligent Search Box */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold mb-3 flex items-center gap-2 font-serif">
                <Sparkles className="w-4 h-4 text-amber-700" />
                智能寻诗
              </h2>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="输入诗句（如：海内存知己）或题目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-white border border-stone-200 text-stone-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-amber-700/50 transition-all font-serif placeholder-stone-400 shadow-inner"
                />
                <button
                  id="search-btn"
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="absolute right-2 top-2 p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 disabled:bg-stone-50 disabled:text-stone-300 text-stone-700 rounded-lg transition-all"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-600" />
                  ) : (
                    <Search className="w-4 h-4 text-stone-600" />
                  )}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-700 mt-2 font-serif flex items-center gap-1 font-medium">
                  <Info className="w-3 h-3 text-rose-600" />
                  {errorMsg}
                </p>
              )}

              {/* Recommendation tags */}
              <div className="mt-4">
                <p className="text-[11px] text-stone-600 mb-2 font-serif font-medium">推荐试读：</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_POEMS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(p.query)}
                      disabled={loading}
                      className="text-[11px] font-serif bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 hover:text-[#78350f] px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium shadow-sm"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization controls Panel */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md space-y-5">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold flex items-center gap-2 pb-2 border-b border-stone-200 font-serif">
                <Settings className="w-4 h-4 text-[#78350f]" />
                排版与笺纸调设
              </h2>

              {/* Style Presets */}
              <div>
                <label className="text-[11px] text-stone-600 block mb-2 font-serif">纸笺风格</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCustomization(prev => ({ ...prev, cardStyle: "minimalist", blurBackground: false }))}
                    className={`px-3 py-2 text-xs font-serif rounded-lg border transition-all ${
                      customization.cardStyle === "minimalist" && !customization.blurBackground
                        ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    素雅极简
                  </button>
                  <button
                    onClick={() => setCustomization(prev => ({ ...prev, cardStyle: "painting", blurBackground: false }))}
                    className={`px-3 py-2 text-xs font-serif rounded-lg border transition-all ${
                      customization.cardStyle === "painting" && !customization.blurBackground
                        ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    水墨意境
                  </button>
                  <button
                    onClick={() => setCustomization(prev => ({ ...prev, cardStyle: "scroll", blurBackground: false }))}
                    className={`px-3 py-2 text-xs font-serif rounded-lg border transition-all ${
                      customization.cardStyle === "scroll" && !customization.blurBackground
                        ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold shadow-sm"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    宣纸古卷
                  </button>
                </div>
              </div>

              {/* Layout and Glass blur toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif font-medium">诗词排版</label>
                  <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                    <button
                      onClick={() => setCustomization(prev => ({ ...prev, layout: "centered" }))}
                      className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        customization.layout === "centered" ? "bg-white border-stone-200 text-[#78350f] font-semibold shadow-sm" : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                      居中排版
                    </button>
                    <button
                      onClick={() => setCustomization(prev => ({ ...prev, layout: "leftAligned" }))}
                      className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        customization.layout === "leftAligned" ? "bg-white border-stone-200 text-[#78350f] font-semibold shadow-sm" : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      齐头左排
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif font-medium">背景毛玻璃</label>
                  <button
                    onClick={() => setCustomization(prev => ({ ...prev, blurBackground: !prev.blurBackground }))}
                    className={`w-full py-1.5 text-xs font-serif rounded-md transition-all border ${
                      customization.blurBackground 
                        ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold shadow-sm" 
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {customization.blurBackground ? "已开启" : "已关闭"}
                  </button>
                </div>
              </div>

              {/* Advanced Customization Options: Aspect Ratio & Gold Leaf Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif font-medium">卡片画幅比例</label>
                  <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                    {(["1:1", "4:3", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setCustomization(prev => ({ ...prev, aspectRatio: ratio }))}
                        className={`flex-1 py-1.5 text-xs font-serif rounded-md transition-all ${
                          customization.aspectRatio === ratio ? "bg-white border-stone-200 text-[#78350f] font-semibold shadow-sm" : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {ratio === "1:1" ? "方1:1" : ratio === "4:3" ? "宽4:3" : "屏9:16"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif font-medium">金箔碎金笺</label>
                  <button
                    onClick={() => setCustomization(prev => ({ ...prev, sajinGold: !prev.sajinGold }))}
                    className={`w-full py-1.5 text-xs font-serif rounded-md transition-all border ${
                      customization.sajinGold 
                        ? "bg-amber-100/70 border-amber-300 text-[#78350f] font-semibold shadow-sm" 
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {customization.sajinGold ? "已附金砂" : "素纸无砂"}
                  </button>
                </div>
              </div>

              {/* Dynamic Seal / Soapstone Stamp maker */}
              <div>
                <label className="text-[11px] text-stone-600 block mb-1.5 font-serif font-medium">朱砂印章定制</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="自定义闲章文字（如：东坡雅玩、墨禅）"
                    value={customization.customSealText}
                    onChange={(e) => setCustomization(prev => ({ ...prev, customSealText: e.target.value }))}
                    className="flex-1 bg-white border border-stone-200 text-xs rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-700/50 font-serif placeholder-stone-400 shadow-inner"
                  />
                  {customization.customSealText && (
                    <button
                      onClick={() => setCustomization(prev => ({ ...prev, customSealText: "" }))}
                      className="px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-[10px] font-serif text-stone-500 hover:text-stone-800 transition-all"
                    >
                      重置
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-stone-600 font-medium mt-1 pl-1 font-serif">
                  输入 2 至 4 个中文字，即可在卡片右上角生成传统的定制篆刻朱红泥印。
                </p>
              </div>

              {/* Font Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif">字体风格</label>
                  <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                    {(["serif", "sans", "mono"] as const).map((font) => (
                      <button
                        key={font}
                        onClick={() => setCustomization(prev => ({ ...prev, fontFamily: font }))}
                        className={`flex-1 py-1 text-xs font-serif rounded-md transition-all ${
                          customization.fontFamily === font ? "bg-white border-stone-200 text-[#78350f] font-semibold shadow-sm" : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {font === "serif" ? "宋体" : font === "sans" ? "黑体" : "等宽"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 block mb-2 font-serif">字号大小</label>
                  <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                    {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setCustomization(prev => ({ ...prev, fontSize: sz }))}
                        className={`flex-1 py-1 text-[11px] rounded-md transition-all ${
                          customization.fontSize === sz ? "bg-white border-stone-200 text-[#78350f] font-semibold shadow-sm" : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        {sz === "sm" ? "小" : sz === "base" ? "中" : sz === "lg" ? "大" : "特"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Zen Ambient Soundscape Player */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold flex items-center gap-2 font-serif">
                  <Music className="w-4 h-4 text-amber-700" />
                  禅意环境白噪音
                </h2>
                <button
                  onClick={handleToggleZen}
                  className={`px-3 py-1 text-[10px] font-serif rounded-full transition-all border cursor-pointer ${
                    zenPlaying 
                      ? "bg-amber-100 border-amber-300 text-[#78350f] font-semibold shadow-sm animate-pulse" 
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800"
                  }`}
                >
                  {zenPlaying ? "播放中 · 暂停" : "空山新雨 · 开启"}
                </button>
              </div>
              <p className="text-[11px] text-stone-600 font-medium leading-relaxed font-serif">
                基于 Web Audio API 实时合成，真实模拟深山落雨 and 远院禅钟，营造深邃优雅的赏听环境。
              </p>
              {zenPlaying && (
                <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-serif shrink-0">钟雨音量</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={zenVolume}
                    onChange={(e) => handleZenVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-700 h-1 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-amber-800 font-mono w-6 text-right font-semibold">
                    {Math.round(zenVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Reciter Voice customization */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md space-y-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold flex items-center gap-2 font-serif">
                <Volume2 className="w-4 h-4 text-[#78350f]" />
                雅音配音引擎
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Voice engine selection */}
                <div>
                  <label className="text-[11px] text-stone-600 block mb-1.5 font-serif">播放引擎</label>
                  <select
                    value={reciterEngine}
                    onChange={(e) => {
                      stopReciting();
                      setReciterEngine(e.target.value as "ai" | "system");
                    }}
                    className="w-full bg-white border border-stone-200 text-stone-800 text-xs rounded-lg p-2 focus:outline-none font-serif"
                  >
                    <option value="ai">AI 诗意朗诵 (Gemini)</option>
                    <option value="system">系统自带语音 (快)</option>
                  </select>
                </div>

                {/* Specific Voice list */}
                {reciterEngine === "ai" && (
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1.5 font-serif">声音声线</label>
                    <select
                      value={reciterVoice}
                      onChange={(e) => {
                        stopReciting();
                        setReciterVoice(e.target.value);
                      }}
                      className="w-full bg-white border border-stone-200 text-stone-800 text-xs rounded-lg p-2 focus:outline-none font-serif"
                    >
                      <option value="Kore">山涛 (温润深沉 · 男声)</option>
                      <option value="Zephyr">清越 (高雅清朗 · 女声)</option>
                      <option value="Charon">松风 (苍劲豪迈 · 男声)</option>
                      <option value="Puck">竹韵 (灵动婉转 · 女声)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Textual Translation & Appreciation panel */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md space-y-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold flex items-center gap-2 border-b border-stone-200 pb-2 font-serif">
                <BookOpen className="w-4 h-4 text-amber-700" />
                诗境释义与赏析
              </h2>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                <div>
                  <h3 className="text-xs font-serif font-semibold text-[#78350f] flex items-center gap-1.5 mb-1.5">
                    【现代译文】
                  </h3>
                  <div className="text-xs text-stone-700 leading-relaxed font-serif pl-1.5 space-y-1">
                    {poetry.translation && poetry.translation.length > 0 ? (
                      poetry.translation.map((line, idx) => <p key={idx}>{line}</p>)
                    ) : (
                      <p className="opacity-60">暂无译文</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-serif font-semibold text-[#78350f] flex items-center gap-1.5 mb-1.5">
                    【国风艺术赏析】
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed font-serif text-justify pl-1.5">
                    {poetry.appreciation || "暂无赏析信息。"}
                  </p>
                </div>
              </div>
            </div>

            {/* Poet Background Panel */}
            <div className="bg-white/70 border border-stone-200/60 p-5 rounded-2xl backdrop-blur-lg shadow-md space-y-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#78350f] font-semibold flex items-center gap-2 border-b border-stone-200 pb-2 font-serif">
                <User className="w-4 h-4 text-amber-700" />
                诗人生平与代表作
              </h2>
              <div className="space-y-3 font-serif">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                  <span className="bg-amber-50/90 border border-amber-200/65 text-[#78350f] px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    【{poetry.dynasty || "未知"}】{poetry.author || "未知"}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed text-justify pl-0.5">
                  {poetry.authorBackground || `暂无关于 ${poetry.author || "该作者"} 的生平背景信息。可通过上方智能寻诗检索，即可智能生成并显示其生平与代表作。`}
                </p>
              </div>
            </div>

          </section>
        </main>

        {/* Sophisticated Light Bottom Status Bar */}
        <footer className="h-16 mt-auto border-t border-stone-200/60 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between shrink-0 bg-[#faf8f5]/80 backdrop-blur-md gap-4 md:gap-0 py-3 md:py-0">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="text-[10px] text-stone-600 tracking-widest uppercase">沉浸模式已开启</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-stone-500">朗读进度</span>
              <div className="w-24 md:w-32 h-px bg-stone-200 relative">
                <div 
                  className={`absolute left-0 top-0 h-full bg-amber-700 transition-all duration-1000 ${
                    audioReciting ? "w-full" : "w-1/4"
                  }`} 
                />
              </div>
              <span className="text-[10px] text-stone-500 italic font-mono">
                {audioReciting ? "朗诵进行中..." : "雅音就绪"}
              </span>
            </div>
          </div>
          
          <div className="flex gap-8 text-[10px] text-stone-500 tracking-widest">
            <span className="cursor-pointer hover:text-[#78350f] transition-colors">分享</span>
            <span className="cursor-pointer hover:text-[#78350f] transition-colors">收藏</span>
            <span className="cursor-pointer hover:text-[#78350f] transition-colors">古典专栏</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
