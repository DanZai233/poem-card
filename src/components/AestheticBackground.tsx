import React, { useMemo } from "react";
import { PoetryMood, PoetryTheme } from "../types";

interface AestheticBackgroundProps {
  mood: PoetryMood;
  theme: PoetryTheme;
}

export default function AestheticBackground({ mood, theme }: AestheticBackgroundProps) {
  // We can render custom elements based on mood
  const moodElements = useMemo(() => {
    switch (mood) {
      case "solitary":
        // A luminous full moon and gentle stardust
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Full Moon */}
            <div 
              className="absolute top-12 right-12 md:top-24 md:right-24 w-28 h-28 md:w-40 md:h-40 rounded-full blur-[1px] opacity-80 transition-all duration-1000"
              style={{
                background: "radial-gradient(circle, #fefce8 0%, rgba(254, 252, 232, 0.4) 50%, transparent 100%)",
                boxShadow: "0 0 40px rgba(254, 252, 232, 0.3)",
              }}
            />
            {/* Stars */}
            <svg className="absolute inset-0 w-full h-full opacity-60">
              <circle cx="15%" cy="20%" r="1" fill="#b45309" className="animate-pulse" style={{ animationDuration: "3s" }} />
              <circle cx="45%" cy="15%" r="1.5" fill="#b45309" className="animate-pulse" style={{ animationDuration: "5s" }} />
              <circle cx="75%" cy="25%" r="1" fill="#b45309" className="animate-pulse" style={{ animationDuration: "4s" }} />
              <circle cx="85%" cy="45%" r="2" fill="#d97706" className="animate-pulse" style={{ animationDuration: "6s" }} />
              <circle cx="25%" cy="60%" r="1.2" fill="#b45309" className="animate-pulse" style={{ animationDuration: "3.5s" }} />
              <circle cx="60%" cy="75%" r="1" fill="#d97706" className="animate-pulse" style={{ animationDuration: "4.5s" }} />
            </svg>
          </div>
        );

      case "joyful":
        // Falling pink peach blossom petals
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              {[...Array(12)].map((_, i) => {
                const delay = i * 1.5;
                const left = (i * 8) + 5;
                const duration = 8 + (i % 4) * 3;
                return (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-rose-200 rounded-full opacity-60 filter blur-[0.5px]"
                    style={{
                      left: `${left}%`,
                      top: `-5%`,
                      animationName: "fallAndSway",
                      animationDuration: `${duration}s`,
                      animationTimingFunction: "linear",
                      animationIterationCount: "infinite",
                      animationDelay: `${delay}s`,
                      transform: "rotate(45deg)",
                    }}
                  />
                );
              })}
            </div>
            <style>{`
              @keyframes fallAndSway {
                0% { top: -5%; transform: translateX(0) rotate(0deg); opacity: 0; }
                10% { opacity: 0.7; }
                90% { opacity: 0.7; }
                100% { top: 105%; transform: translateX(100px) rotate(360deg); opacity: 0; }
              }
            `}</style>
          </div>
        );

      case "melancholy":
        // Soft, vertical raindrops
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <line x1="10%" y1="-10" x2="8%" y2="110%" stroke="#cbd5e1" strokeWidth="0.5" className="animate-rain" style={{ animationDelay: "0s", animationDuration: "1.5s" }} />
              <line x1="30%" y1="-10" x2="28%" y2="110%" stroke="#cbd5e1" strokeWidth="0.5" className="animate-rain" style={{ animationDelay: "0.4s", animationDuration: "1.8s" }} />
              <line x1="50%" y1="-10" x2="48%" y2="110%" stroke="#cbd5e1" strokeWidth="0.5" className="animate-rain" style={{ animationDelay: "0.2s", animationDuration: "1.6s" }} />
              <line x1="70%" y1="-10" x2="68%" y2="110%" stroke="#cbd5e1" strokeWidth="0.5" className="animate-rain" style={{ animationDelay: "0.7s", animationDuration: "1.4s" }} />
              <line x1="90%" y1="-10" x2="88%" y2="110%" stroke="#cbd5e1" strokeWidth="0.5" className="animate-rain" style={{ animationDelay: "0.5s", animationDuration: "1.7s" }} />
            </svg>
            <style>{`
              .animate-rain {
                animation: rainFall linear infinite;
              }
              @keyframes rainFall {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
            `}</style>
          </div>
        );

      case "heroic":
        // Majestic cloud-like curves and strong wind-swept light streaks
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 800 600" preserveAspectRatio="none">
              {/* Waves/Mountains silhouette */}
              <path d="M-50,450 C200,380 400,520 850,420 L850,650 L-50,650 Z" fill={theme.secondaryColor} className="animate-pulse" style={{ animationDuration: "8s" }} />
              <path d="M-50,500 C150,450 350,550 850,480 L850,650 L-50,650 Z" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: "6s" }} />
              
              {/* Wind lines */}
              <path d="M100,100 Q400,50 700,200" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="5,15" className="animate-wind" style={{ animationDuration: "12s" }} />
              <path d="M50,250 Q350,300 750,150" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="10,20" className="animate-wind" style={{ animationDuration: "16s", animationDelay: "-4s" }} />
            </svg>
            <style>{`
              .animate-wind {
                animation: windSweep ease-in-out infinite alternate;
              }
              @keyframes windSweep {
                0% { stroke-dashoffset: 0; opacity: 0.2; }
                50% { opacity: 0.6; }
                100% { stroke-dashoffset: -100; opacity: 0.2; }
              }
            `}</style>
          </div>
        );

      case "peaceful":
        // Soft rolling mist / floating clouds
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute -left-1/4 bottom-12 w-[150%] h-80 rounded-full blur-[60px] opacity-30 transition-all duration-1000 animate-cloud-slow"
              style={{
                background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)`,
              }}
            />
            <div 
              className="absolute -right-1/4 top-1/4 w-[120%] h-64 rounded-full blur-[50px] opacity-20 transition-all duration-1000 animate-cloud-slower"
              style={{
                background: `radial-gradient(circle, ${theme.secondaryColor} 0%, transparent 70%)`,
              }}
            />
            <style>{`
              .animate-cloud-slow {
                animation: floatMist 25s ease-in-out infinite alternate;
              }
              .animate-cloud-slower {
                animation: floatMistSecondary 35s ease-in-out infinite alternate;
              }
              @keyframes floatMist {
                0% { transform: translate(0, 0) scale(1); }
                100% { transform: translate(10%, -10%) scale(1.1); }
              }
              @keyframes floatMistSecondary {
                0% { transform: translate(0, 0) scale(1); }
                100% { transform: translate(-8%, 5%) scale(1.15); }
              }
            `}</style>
          </div>
        );

      case "romantic":
        // Floating glowing embers
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              {[...Array(10)].map((_, i) => {
                const delay = i * 2;
                const left = (i * 10) + 2;
                const size = 3 + (i % 3) * 2;
                const duration = 12 + (i % 3) * 4;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${left}%`,
                      bottom: `-5%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: theme.accentColor,
                      boxShadow: `0 0 10px ${theme.accentColor}, 0 0 20px ${theme.accentColor}`,
                      animationName: "riseAndFade",
                      animationDuration: `${duration}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDelay: `${delay}s`,
                    }}
                  />
                );
              })}
            </div>
            <style>{`
              @keyframes riseAndFade {
                0% { bottom: -5%; opacity: 0; transform: scale(0.8); }
                20% { opacity: 0.8; }
                80% { opacity: 0.8; }
                100% { bottom: 105%; opacity: 0; transform: scale(1.5); }
              }
            `}</style>
          </div>
        );

      case "parting":
        // Willow leaves blowing sideways
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              {[...Array(8)].map((_, i) => {
                const delay = i * 2.5;
                const top = (i * 12) + 10;
                const duration = 10 + (i % 3) * 3;
                return (
                  <div
                    key={i}
                    className="absolute w-6 h-2 bg-emerald-800/60 rounded-full"
                    style={{
                      left: `-10%`,
                      top: `${top}%`,
                      animationName: "leafBlow",
                      animationDuration: `${duration}s`,
                      animationTimingFunction: "linear",
                      animationIterationCount: "infinite",
                      animationDelay: `${delay}s`,
                      transform: "rotate(15deg)",
                      boxShadow: "0 0 5px rgba(6, 78, 59, 0.2)",
                    }}
                  />
                );
              })}
            </div>
            <style>{`
              @keyframes leafBlow {
                0% { left: -10%; transform: rotate(15deg) translateY(0); opacity: 0; }
                15% { opacity: 0.7; }
                85% { opacity: 0.7; }
                100% { left: 110%; transform: rotate(180deg) translateY(50px); opacity: 0; }
              }
            `}</style>
          </div>
        );

      default:
        return null;
    }
  }, [mood, theme]);

  return (
    <div 
      className="absolute inset-0 transition-all duration-1000 ease-in-out z-0 bg-[#faf8f5]"
      style={{
        background: theme.bgStyle || "linear-gradient(135deg, #fdfbf7 0%, #f4ede1 100%)",
      }}
    >
      {/* Sophisticated Light Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full bg-[#f5efe4] blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[70%] rounded-full bg-[#edf1ed] blur-[120px] opacity-65"></div>
      </div>

      {/* Dynamic ambient texture/filter overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(139,115,85,0.06)_100%)] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.012] pointer-events-none mix-blend-overlay" />
      
      {/* Mood-specific ambient layers */}
      <div className="relative z-10 w-full h-full">
        {moodElements}
      </div>
    </div>
  );
}
