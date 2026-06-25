import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// Helper for calling generateContent with retries and fallback models
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  models?: string[];
}) {
  const modelsToTry = params.models || ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let retries = 3;
    let delay = 1000; // 1s initial delay

    while (retries > 0) {
      try {
        console.log(`[Gemini API] Attempting generateContent with model ${modelName} (${retries} retries remaining)...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Error using model ${modelName}:`, err.message || err);
        
        const errStr = String(err.message || "").toLowerCase();
        const statusCode = err.status || err.code || 0;
        
        // If it's a 404 (model not found), invalid request, or 503 (UNAVAILABLE / high demand), skip immediately to the next model
        if (
          statusCode === 404 || 
          statusCode === 503 ||
          errStr.includes("not found") || 
          errStr.includes("invalid") ||
          errStr.includes("unavailable") ||
          errStr.includes("high demand") ||
          errStr.includes("overloaded")
        ) {
          console.log(`[Gemini API] Model ${modelName} unavailable/overloaded. Switching immediately to fallback model...`);
          break;
        }

        retries--;
        if (retries > 0) {
          console.log(`[Gemini API] Retrying model ${modelName} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after all retries and fallback models.");
}

// Helper for calling TTS with retries
async function generateTTSWithRetry(params: {
  contents: any;
  config?: any;
}) {
  let retries = 3;
  let delay = 1000;
  let lastError: any = null;

  while (retries > 0) {
    try {
      console.log(`[Gemini TTS] Attempting TTS with gemini-3.1-flash-tts-preview (${retries} retries remaining)...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini TTS] Error in TTS call:`, err.message || err);
      retries--;
      if (retries > 0) {
        console.log(`[Gemini TTS] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  throw lastError || new Error("Failed to generate speech after all retries.");
}

// API: Search poetry by title or verse
app.post("/api/poetry/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "搜索内容不能为空" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
    }

    const systemInstruction = `你是一位精通中国古典文学与诗词美学的专家。
请根据用户输入的诗句、题目或作者，找出对应的完整且最准确的中国古典诗词。
如果用户输入的只是诗句，请自动找出其所在的整首诗。
请严格按照以下 JSON 格式返回结果，不要返回任何 Markdown 标记或多余的文字：
{
  "title": "诗词完整题目",
  "author": "作者姓名",
  "dynasty": "朝代（如：唐、宋、元、明、清、魏晋等）",
  "content": ["第一句", "第二句", ...],
  "translation": ["译文第一句/联", "译文第二句/联", ...],
  "appreciation": "一段深思熟虑、文笔优美、高度艺术化的诗词赏析（150-250字之间，语气儒雅文艺）",
  "authorBackground": "一两句话简要介绍作者的生平、字号、主要诗风或历史定位，以及其著名的代表作（80-150字，语气儒雅、学术文雅）",
  "mood": "从以下意境分类中选择最合适的一个：'solitary'（孤独幽静）| 'joyful'（喜悦明朗）| 'melancholy'（忧伤凄美）| 'heroic'（豪放壮阔）| 'peaceful'（宁静闲适）| 'romantic'（浪漫唯美）| 'parting'（离别思念）",
  "theme": {
    "name": "传统中式雅致光效色彩主题名称（如：杏花微雨、宣纸淡墨、幽篁听雨、秋水长天、落霞晚照、青绿江山、晴雪寻梅）",
    "primaryColor": "适合该意境的中国传统色彩十六进制色值（深色，用于主要的文字或深色点缀，如深红#9a3412、石绿#166534、深茶#78350f、靛蓝#1e3a8a）",
    "secondaryColor": "搭配的十六进制辅色（偏柔和明亮的过渡色，如浅草黄#fef08a、浅青绿#ccfbf1、浅绯粉#fce7f3）",
    "accentColor": "高亮的传统朱砂印泥红、琥珀金、翠竹绿十六进制点缀色（如朱砂红#dc2626、琥珀金#d97706、翡翠绿#15803d）",
    "textColor": "高对比度的墨色或深石色十六进制色值（必须是深色以保证在浅色背景上清晰易读，如#1c1c1a、#27272a、#292524）",
    "bgStyle": "一个极具画面感的CSS线性渐变字符串。必须采用高亮、淡雅、文人墨客喜爱的明亮宣纸色、淡淡茶水色、晴空色、春雨色背景渐变，禁止生成任何暗黑、深蓝、深灰背景色（如：'linear-gradient(135deg, #fdfbf7 0%, #f4ede1 100%)'、'linear-gradient(135deg, #f1f5f2 0%, #e2ece9 100%)'、'linear-gradient(135deg, #fcf5f7 0%, #f3e5eb 100%)'、'linear-gradient(135deg, #f0f4f8 0%, #e0e8f0 100%)'）"
  },
  "illustrationPrompt": "针对这首诗词画面意境的英文提示词，用于描述一幅极简的中式水墨画、山水写意或国风插画（如：'minimalist Chinese ink wash painting on clean warm cream rice paper, light green and pale orange watercolor accents, spacious composition'）"
}

如果用户输入的内容完全不符合诗词，或者确实找不到匹配的，请不要报错，而是**立刻为用户现场创作一首贴合他输入词意的原创中国古典诗词**，朝代写“当代”，并按照上述完整的 JSON 格式（包括译文、赏析、作者背景和极其高雅亮丽的色彩主题）返回。`;

    const response = await generateContentWithRetry({
      models: ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: `检索或创作关于此内容的诗词: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "未获取到AI返回的诗词内容" });
    }

    // Parse safety check
    try {
      const parsedPoetry = JSON.parse(text.trim());
      res.json(parsedPoetry);
    } catch (parseError) {
      console.error("JSON parse error:", text);
      res.status(500).json({ error: "诗词数据解析失败，请重试", raw: text });
    }
  } catch (error: any) {
    console.error("Poetry search error:", error);
    res.status(500).json({ error: error.message || "检索诗词时发生服务器错误" });
  }
});

// API: TTS (Text-to-Speech) using Gemini
app.post("/api/poetry/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "朗读内容不能为空" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API Key is not configured." });
    }

    const response = await generateTTSWithRetry({
      contents: [{
        parts: [{
          text: `请用非常有古典韵味、抑扬顿挫且情感充沛的声音，缓缓朗读以下中国诗词（不要念标题和作者，只念诗词正文）：\n\n${text}`
        }]
      }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || "Kore" // Puck, Charon, Kore, Fenrir, Zephyr
            }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: "语音生成失败" });
    }
  } catch (error: any) {
    console.error("TTS generation error:", error);
    res.status(500).json({ error: error.message || "朗诵语音生成失败" });
  }
});

// Configure Vite middleware or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
