import React, { useMemo } from "react";
import { PoetryData, CardCustomization } from "../types";

interface PoetryCardProps {
  poetry: PoetryData;
  customization: CardCustomization;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

// Stable coordinate grid for gold dust particles to prevent movement jitter during state updates
const GOLD_FOIL_PARTICLES = [
  { top: "6%", left: "14%", size: "4px", delay: "0.2s" },
  { top: "14%", left: "82%", size: "3px", delay: "0.8s" },
  { top: "25%", left: "48%", size: "5px", delay: "1.4s" },
  { top: "34%", left: "18%", size: "3px", delay: "0.5s" },
  { top: "45%", left: "88%", size: "4px", delay: "1.9s" },
  { top: "52%", left: "28%", size: "3px", delay: "2.3s" },
  { top: "62%", left: "72%", size: "6px", delay: "1.1s" },
  { top: "68%", left: "15%", size: "4px", delay: "1.6s" },
  { top: "76%", left: "84%", size: "3px", delay: "2.7s" },
  { top: "82%", left: "52%", size: "5px", delay: "0.1s" },
  { top: "89%", left: "22%", size: "4px", delay: "1.8s" },
  { top: "93%", left: "78%", size: "3px", delay: "0.9s" },
  { top: "4%", left: "62%", size: "5px", delay: "2.4s" },
  { top: "29%", left: "91%", size: "3px", delay: "1.3s" },
  { top: "78%", left: "7%", size: "4px", delay: "2.9s" },
];

export default function PoetryCard({ poetry, customization, innerRef }: PoetryCardProps) {
  const { title, author, dynasty, content, translation, appreciation, theme } = poetry;
  const { 
    layout, 
    fontSize, 
    fontFamily, 
    showTranslation, 
    showAppreciation, 
    cardStyle, 
    blurBackground,
    sajinGold,
    customSealText,
    aspectRatio
  } = customization;

  // Font family class helper
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "serif":
        return "font-serif tracking-[0.05em]";
      case "mono":
        return "font-mono tracking-wide";
      default:
        return "font-sans tracking-normal";
    }
  };

  // Font size mapping helper for standard horizontal readability
  const getContentFontSize = () => {
    switch (fontSize) {
      case "sm": return "text-sm md:text-base";
      case "lg": return "text-lg md:text-xl";
      case "xl": return "text-xl md:text-2xl";
      default: return "text-base md:text-lg";
    }
  };

  // Theme-based color values
  const textHex = theme.textColor || "#f5f5f0";
  const primaryHex = theme.primaryColor || "#2c4f39";
  const accentHex = theme.accentColor || "#b5c4b1";

  // Card background style
  const cardBgStyle = () => {
    if (blurBackground) {
      return {
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        border: "1px solid rgba(255, 255, 255, 0.45)",
        color: "#1c1917",
        boxShadow: "0 20px 45px rgba(139, 115, 85, 0.12)",
      };
    }

    switch (cardStyle) {
      case "scroll":
        // Fine Chinese Rice Paper / Parchment texture
        return {
          backgroundColor: "#fcf9f2",
          backgroundImage: `
            radial-gradient(rgba(180, 150, 110, 0.15) 1.5px, transparent 0),
            linear-gradient(to right, rgba(160, 130, 90, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 12px 100%",
          border: "4px double #d4b483",
          outline: "1px solid #e8dec9",
          outlineOffset: "-6px",
          color: "#2a221b",
          boxShadow: "0 20px 45px rgba(139, 115, 85, 0.15), inset 0 0 40px rgba(139, 115, 85, 0.1)",
        };
      case "painting":
        // Atmospheric Traditional Inkwash Landscape theme with warm/misty background
        return {
          background: `linear-gradient(135deg, #f5f2eb 0%, #e8e3d9 100%)`,
          border: `1.5px solid rgba(139, 115, 85, 0.25)`,
          color: "#24211e",
          boxShadow: "0 20px 45px rgba(139, 115, 85, 0.14)",
        };
      case "minimalist":
      default:
        // Elegant minimal bright card design respecting the theme bgStyle or custom light background
        return {
          background: theme.bgStyle && (theme.bgStyle.includes("#020617") || theme.bgStyle.includes("#0a0a0c") || theme.bgStyle.includes("#0f172a") || theme.bgStyle.includes("#0d0f14"))
            ? `linear-gradient(145deg, #fdfcfb 0%, #f4f0ea 100%)` // Fail-safe light gradient if api returns a dark one
            : theme.bgStyle || `linear-gradient(145deg, #fdfcfb 0%, #f4f0ea 100%)`,
          border: `1px solid rgba(139, 115, 85, 0.15)`,
          color: theme.textColor && (theme.textColor.includes("#f8fafc") || theme.textColor.includes("#f5f5f0") || theme.textColor.includes("#fff")) 
            ? "#292524" // Fail-safe dark text color
            : theme.textColor || "#292524",
          boxShadow: "0 20px 45px rgba(139, 115, 85, 0.12)",
        };
    }
  };

  const currentBgStyle = cardBgStyle();
  const isLightBackground = true;

  // Traditional seal texts based on mood
  const getSealText = () => {
    switch (poetry.mood) {
      case "solitary": return "幽境";
      case "joyful": return "同乐";
      case "melancholy": return "秋思";
      case "heroic": return "豪迈";
      case "peaceful": return "归真";
      case "romantic": return "心韵";
      case "parting": return "相思";
      default: return "雅赏";
    }
  };

  // Render traditional Soapstone / Cinnabar Red Seal stamp in elegant layouts
  const renderSeal = () => {
    const rawText = (customSealText || getSealText()).trim();
    if (!rawText) return null;

    let processedText = rawText;
    // Standardize text length for traditional seal layouts
    if (processedText.length === 2) {
      return (
        <div 
          className="w-8.5 h-8.5 border-2 border-red-700/70 rounded-md flex items-center justify-center font-serif rotate-3 select-none scale-95 shadow-[inset_0_0_4px_rgba(185,28,28,0.1)] transition-transform hover:scale-100"
          style={{ 
            color: isLightBackground ? "#991b1b" : "#f87171",
            borderColor: isLightBackground ? "#b91c1c" : "#f87171",
            backgroundColor: isLightBackground ? "rgba(185,28,28,0.06)" : "rgba(239,68,68,0.08)",
          }}
        >
          <div className="flex flex-row-reverse gap-0.5 text-[9px] font-bold leading-none">
            <span className="[writing-mode:vertical-rl]">{processedText[0]}</span>
            <span className="[writing-mode:vertical-rl]">{processedText[1]}</span>
          </div>
        </div>
      );
    }

    if (processedText.length === 3) {
      processedText += "印"; // Append "Seal" traditionally
    }

    // Traditional 2x2 seal grid, read from top-right down to bottom-left
    if (processedText.length >= 4) {
      const displayChars = processedText.slice(0, 4);
      return (
        <div 
          className="w-9 h-9 border-2 border-red-700/70 rounded-md flex items-center justify-center font-serif rotate-2 select-none scale-95 shadow-[inset_0_0_4px_rgba(185,28,28,0.1)] transition-transform hover:scale-100"
          style={{ 
            color: isLightBackground ? "#991b1b" : "#f87171",
            borderColor: isLightBackground ? "#b91c1c" : "#ef4444",
            backgroundColor: isLightBackground ? "rgba(185,28,28,0.06)" : "rgba(239,68,68,0.08)",
          }}
        >
          <div className="grid grid-cols-2 gap-0.5 text-[8.5px] font-bold leading-tight text-center">
            {/* Traditional read order: Col 2 (Char 2, 3) and Col 1 (Char 0, 1) */}
            <div className="flex flex-col">
              <span>{displayChars[2]}</span>
              <span>{displayChars[3]}</span>
            </div>
            <div className="flex flex-col">
              <span>{displayChars[0]}</span>
              <span>{displayChars[1]}</span>
            </div>
          </div>
        </div>
      );
    }

    // Default single or fallback
    return (
      <div 
        className="w-8.5 h-8.5 border-2 border-red-700/70 rounded-md flex items-center justify-center font-serif rotate-3 select-none"
        style={{ 
          color: isLightBackground ? "#991b1b" : "#f87171",
          borderColor: isLightBackground ? "#b91c1c" : "#f87171",
          backgroundColor: isLightBackground ? "rgba(185,28,28,0.06)" : "rgba(239,68,68,0.08)",
        }}
      >
        <span className="text-[10px] font-bold [writing-mode:vertical-rl] tracking-widest">{processedText}</span>
      </div>
    );
  };

  // Aspect ratio class mapper
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16] max-w-[400px] min-h-[660px] justify-between";
      case "4:3":
        return "aspect-[4/3] max-w-2xl min-h-[380px]";
      case "1:1":
      default:
        return "aspect-square max-w-xl min-h-[440px]";
    }
  };

  return (
    <div
      id="poetry-share-card"
      ref={innerRef}
      className={`relative w-full mx-auto rounded-2xl p-8 md:p-12 transition-all duration-1000 overflow-hidden flex flex-col ${getAspectRatioClasses()}`}
      style={currentBgStyle}
    >
      {/* Scattered Gold Dust Particles Overlay (洒金笺) */}
      {sajinGold && (
        <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden select-none">
          {GOLD_FOIL_PARTICLES.map((particle, idx) => (
            <div
              key={idx}
              className="absolute gold-shimmer rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)] opacity-55"
              style={{
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll style visual roller accents */}
      {cardStyle === "scroll" && !blurBackground && (
        <>
          <div className="absolute top-0 inset-x-8 h-2 bg-gradient-to-b from-[#b89050]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-8 h-2 bg-gradient-to-t from-[#b89050]/20 to-transparent pointer-events-none" />
          {/* Decorative Corner Filigree */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#c8a261]" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#c8a261]" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#c8a261]" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#c8a261]" />
        </>
      )}

      {/* Atmospheric backgrounds for Landscape style */}
      {cardStyle === "painting" && !blurBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-35 mix-blend-multiply">
          {/* Subtle Silhouette Mountains */}
          <svg className="absolute bottom-0 left-0 w-full h-40 text-stone-300" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L0,60 L20,30 L45,65 L70,40 L100,75 L100,100 Z" fill="currentColor" opacity="0.4" />
            <path d="M0,100 L0,75 L30,45 L60,80 L80,55 L100,85 L100,100 Z" fill="currentColor" opacity="0.6" />
          </svg>
          {/* Ambient red sun/moon */}
          <div 
            className="absolute top-12 right-12 w-14 h-14 rounded-full filter blur-[1px] opacity-20"
            style={{ backgroundColor: "#ef4444" }}
          />
        </div>
      )}

      {/* Modern minimalist soft glows */}
      {cardStyle === "minimalist" && !blurBackground && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent filter blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl from-teal-500/10 to-transparent filter blur-[80px]" />
        </div>
      )}

      {/* Main poetry contents */}
      <div className="relative z-10 flex flex-col flex-grow w-full justify-between">
        
        {/* Header App Brand / Info (Title, Dynasty, Author) */}
        <div 
          className="flex w-full border-b pb-5 mb-6 flex-row justify-between items-end shrink-0"
          style={{ borderColor: isLightBackground ? "rgba(180, 150, 110, 0.3)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span 
                className="px-1.5 py-0.2 text-[9px] font-serif rounded border shrink-0"
                style={{ 
                  borderColor: isLightBackground ? "#9a3412" : accentHex,
                  color: isLightBackground ? "#9a3412" : accentHex 
                }}
              >
                {dynasty}
              </span>
              <h1 className="text-lg md:text-xl font-serif font-bold tracking-[0.05em]">
                {title}
              </h1>
            </div>
            <p className="text-xs opacity-70 font-serif tracking-widest pl-0.5">
              {author}
            </p>
          </div>

          {/* Red Seal Stamp */}
          <div className="shrink-0">
            {renderSeal()}
          </div>
        </div>

        {/* Poetry Main Body - Fully Horizontal (From Left to Right, Top to Bottom) */}
        <div 
          className={`flex-grow w-full flex items-center justify-center py-4 ${getFontFamilyClass()}`}
        >
          {layout === "leftAligned" ? (
            /* Modern Elegant Left-Aligned Centered Block Layout */
            <div className="flex flex-col items-start text-left py-2 px-4 md:px-8 space-y-4 max-w-lg mx-auto w-full">
              {content.map((line, index) => (
                <p 
                  key={index} 
                  className={`${getContentFontSize()} tracking-[0.08em] font-normal leading-relaxed text-left border-l-2 pl-4 w-full`}
                  style={{ borderColor: isLightBackground ? "rgba(180, 150, 110, 0.4)" : `${accentHex}20` }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            /* Modern Elegant Centered Horizontal Layout - Beautifully Spaced and Proportionate */
            <div className="flex flex-col items-center w-full text-center py-2 space-y-4">
              {content.map((line, index) => (
                <p 
                  key={index} 
                  className={`${getContentFontSize()} tracking-[0.08em] font-normal max-w-lg leading-relaxed text-center`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Optional Collapsible panels (Translation & Appreciation) */}
        {(showTranslation || showAppreciation) && (
          <div 
            className="w-full mt-6 pt-5 border-t space-y-4 shrink-0"
            style={{ borderColor: isLightBackground ? "rgba(180, 150, 110, 0.3)" : "rgba(255,255,255,0.08)" }}
          >
            {showTranslation && translation && translation.length > 0 && (
              <div className="text-left">
                <h4 
                  className="text-xs font-serif font-semibold mb-2 flex items-center gap-1.5"
                  style={{ color: isLightBackground ? "#9a3412" : accentHex }}
                >
                  <span className="w-1 h-3 rounded-full bg-current opacity-70"></span>
                  【注释译文】
                </h4>
                <div className="text-xs leading-relaxed opacity-85 pl-2.5 space-y-1 font-serif">
                  {translation.map((trans, index) => (
                    <p key={index} className="indent-0">{trans}</p>
                  ))}
                </div>
              </div>
            )}

            {showAppreciation && appreciation && (
              <div className="text-left">
                <h4 
                  className="text-xs font-serif font-semibold mb-2 flex items-center gap-1.5"
                  style={{ color: isLightBackground ? "#9a3412" : accentHex }}
                >
                  <span className="w-1 h-3 rounded-full bg-current opacity-70"></span>
                  【意境赏析】
                </h4>
                <p className="text-xs leading-relaxed opacity-85 pl-2.5 text-justify font-serif">
                  {appreciation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Traditional card footer */}
        <div 
          className="w-full mt-6 pt-4 flex justify-between items-center border-t border-dashed shrink-0"
          style={{ borderColor: isLightBackground ? "rgba(180, 150, 110, 0.25)" : "rgba(255,255,255,0.05)" }}
        >
          <span className="text-[10px] opacity-50 font-serif">
            {theme.name || "水墨风雅"} · 沉浸雅玩
          </span>
          <span className="text-[9px] opacity-40 font-mono tracking-[0.2em] uppercase">
            Mo Ink Poetry Card
          </span>
        </div>
      </div>
    </div>
  );
}
