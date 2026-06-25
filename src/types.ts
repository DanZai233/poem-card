export interface PoetryTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgStyle: string;
}

export type PoetryMood = "solitary" | "joyful" | "melancholy" | "heroic" | "peaceful" | "romantic" | "parting";

export interface PoetryData {
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  translation: string[];
  appreciation: string;
  authorBackground?: string;
  mood: PoetryMood;
  theme: PoetryTheme;
  illustrationPrompt: string;
}

export interface CardCustomization {
  layout: "centered" | "leftAligned"; // Elegant horizontal options: "centered" or "leftAligned"
  fontSize: "sm" | "base" | "lg" | "xl"; // 字号大小
  fontFamily: "serif" | "sans" | "mono"; // 字体样式
  showTranslation: boolean; // 是否显示译文
  showAppreciation: boolean; // 是否显示赏析
  cardStyle: "minimalist" | "painting" | "scroll"; // 卡片样式模板
  blurBackground: boolean; // 毛玻璃背景
  sajinGold: boolean; // 洒金碎金笺 (金箔微光特效)
  customSealText: string; // 自定义印章 (2-4字)
  aspectRatio: "1:1" | "4:3" | "9:16"; // 卡片画幅比例
}
