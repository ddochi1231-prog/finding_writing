import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";

dotenv.config();

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
});
const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Must be set in .env

const app = express();
const PORT = 3000;

// Set up Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON body parser with generous limit for base64 sketches
app.use(express.json({ limit: "15mb" }));

// ---------------------------------------------------------
// [API ROUTES]
// ---------------------------------------------------------

// Check API key status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Student Authentication (Simplified - now fetches from Google Sheets)
app.post("/api/student/login", async (req, res) => {
  const { classId, studentNo, name } = req.body;
  
  if (!classId || !studentNo || !name) {
    return res.status(400).json({ error: "모든 로그인 정보를 입력해주세요." });
  }

  // TODO: Implement Google Sheets reading logic
  res.json({
    success: true,
    student: { studentNo, name, classId },
    observations: [] // Placeholder
  });
});

// 3. Save Student Observation
app.post("/api/student/observation", async (req, res) => {
  const { classId, studentNo, studentName, title, date, weather, category, description, drawingDataUrl, tags, emoji } = req.body;

  if (!studentNo || !title || !description) {
    return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
  }

  // TODO: Implement Google Sheets appending logic
  res.json({ success: true, observation: { id: `obs-${Date.now()}`, classId, studentNo, studentName, title, date, weather, category, description, drawingDataUrl, tags, emoji } });
});

// Delete Student Observation
app.delete("/api/student/observation/:id", async (req, res) => {
  // TODO: Implement Google Sheets row deletion logic
  res.json({ success: true });
});


// ---------------------------------------------------------
// [GEMINI AI POWERED ENDPOINTS]
// ---------------------------------------------------------

// 1. AI 챗봇 대화 라우트 (AI 생물 박사)
app.post("/api/gemini/chatbot", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "메시지를 입력하세요." });
  }

  // Fallback response for offline / no api key mode
  if (!process.env.GEMINI_API_KEY) {
    const fallbacks = [
      "안녕! 나는 초록 숲속에서 온 '꼬마 생물 박사'야! 🍀 궁금한 식물이나 곤충 친구가 있다면 나한테 뭐든지 물어봐! 예를 들어 '강낭콩은 물을 얼마나 자주 줘야 해?' 하고 말이야!",
      "우와, 정말 호기심 가득한 멋진 질문이야! 🌻 보통 식물이나 곤충들을 잘 관찰하려면 매일 일정한 시간에 들여다보며 글과 그림으로 기록하는 게 최고야! 너가 관찰한 친구는 어떻게 생겼니?",
      "나비와 벌들은 꽃가루를 옮겨서 꽃들이 예쁜 열매와 씨앗을 맺게 도와주는 소중한 지구의 정원사란다! 🦋 우리가 야외 화단에서 나비를 보았을 때 조용히 지켜봐 주면 나비가 아주 기뻐할 거야!",
      "맞아! 비가 오는 날이면 지렁이들이 흙속의 숨구멍이 비로 막혀서 숨을 쉬기 위해 땅 위로 올라온단다. 🌧️ 정말 지혜로운 행동이지? 길가에 기어 나온 지렁이를 보면 밟지 않게 조심조심 피해서 가자!",
      "식물의 잎사귀가 초록색인 이유는 '엽록소'라는 초록색 친구들이 들어있기 때문이야. 이 칭구들은 햇빛과 물을 모아 아주 맛있는 영양분을 만드는 멋진 요리사란다! ☀️"
    ];
    const randomReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ reply: `[오프라인 모드] ${randomReply}` });
  }

  try {
    const formattedHistory = (history || []).map((h: { role: string; content: string }) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    }));

    // Add current user message
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: `당신은 초등학생용 교육 웹 서비스의 'AI 생물 박사 챗봇'입니다.
어린이 사용자의 눈높이에 맞춰 매우 따뜻하고 활기차며 다정한 이모티콘을 듬뿍 섞어 한국어 존댓말('해요체')로 친절하게 응답하세요.
과학적인 상식은 아주 쉽고 재미있게 비유를 들어 설명하고, 항상 끝에는 관찰을 장려하는 칭찬과 질문을 던져 탐구심을 길러주세요.
성장 마인드셋(Growth Mindset)을 자극하는 긍정적인 표현('정말 예리하고 멋진 관찰이군요!', '새로운 발견을 축하해요!')을 필수로 사용해야 합니다.`,
        temperature: 0.8
      }
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini Chatbot Error:", err);
    res.status(500).json({ error: "AI 생물 박사의 목소리가 들리지 않아요. 잠시 후에 다시 말해봐요!" });
  }
});

// 2. 손그림 분석 & 지능형 OCR 피드백 라우트
app.post("/api/gemini/analyze-drawing", async (req, res) => {
  const { title, description, category, drawingDataUrl } = req.body;

  if (!description) {
    return res.status(400).json({ error: "관찰 설명이 누락되었습니다." });
  }

  // Fallback response for offline / no api key mode
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      aiFeedback: `[오프라인 모드 피드백] 우와! '${title || '관찰 기록'}'을 아주 예리하게 지켜보았네요! ${
        category === 'plant' ? '식물 친구의 소중한 한 걸음을 아주 훌륭하게 찾아냈어요. 무럭무럭 자랄 수 있게 계속 보살펴 주세요!' :
        category === 'insect' ? '꼬물꼬물 움직이는 곤충들의 세상을 친근한 시선으로 포착했군요! 곤충 친구들은 참 흥미진진해요.' :
        '매일 다른 자연과 기상의 변화를 기록하다 보면 기후의 멋진 규칙을 발견할 수 있답니다!'
      } 매일 관찰하다 보면 놀라운 자연의 비밀을 더 많이 알게 될 거예요!`,
      detectedObject: title || "관찰 생물",
      funFact: "식물의 초록색 잎은 햇빛과 물을 결합하여 영양분을 만들어내는 놀라운 자가 공장 역할을 한답니다! 🌱"
    });
  }

  try {
    const contents: any[] = [];
    let promptText = `초등학교 어린이의 관찰 기록에 대한 다정한 멘토 'AI 생물 박사'로서 피드백을 작성해주세요.
어린이의 관찰 내용:
제목: ${title}
카테고리: ${category}
글: ${description}

요구사항:
1. 어린이의 관찰 노력을 적극 칭찬하고 성장 마인드셋을 고취시키는 따뜻하고 아기자기한 이모티콘 가득한 한국어 피드백(4~5문장 정도)을 작성해주세요.
2. 관찰 대상에 관한 신기하고 흥미로운 과학적 비하인드 상식(재미있는 사실) 한 가지를 설명해주세요.
3. 이 관찰과 관련된 간단한 퀴즈를 하나 제시해 주세요(예: "식물도 잠을 잘까요?").
4. 출력 형식은 오직 아래와 같은 JSON 구조로만 응답하세요. 백틱(\`\`\`)이나 마크다운 형식 없이 순수한 JSON 내용만 주세요.
{
  "aiFeedback": "다정한 격려 피드백...",
  "detectedObject": "식물/곤충 구체적 이름",
  "funFact": "재미있는 과학 상식...",
  "quiz": "흥미로운 퀴즈 내용..."
}`;

    // Include hand drawing if available (Multimodal Request)
    if (drawingDataUrl && drawingDataUrl.includes("base64,")) {
      const base64Data = drawingDataUrl.split("base64,")[1];
      const mimeType = drawingDataUrl.split(";")[0].split(":")[1] || "image/png";
      
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
      
      promptText += `\n\n추가로, 어린이가 직접 캔버스에 마우스를 이용해 그린 손그림 이미지가 함께 첨부되어 있습니다! 그림에서 묘사된 대상의 형태와 특징을 식별하여 칭찬해 주세요!`;
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Gemini Analyze Error:", err);
    res.status(500).json({ error: "그림을 더 들여다보고 있어요. 잠시만 기다려 주세요!" });
  }
});

// 3. 백과사전 도감 상세 설명 라우트
app.post("/api/gemini/encyclopedia", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "생물 이름을 입력하세요." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      description: `[오프라인 모드] ${name} 친구는 자연 속에서 우리와 함께 살아가는 멋진 친구예요! 물과 햇빛, 혹은 알맞은 먹이를 먹으면서 매일 조금씩 성장해 간답니다.`,
      funFact: "이 친구는 야외에서 흔히 볼 수 있으며, 건강한 흙과 깨끗한 공기를 만드는 데 꼭 필요한 역할을 한답니다! 🌱",
      ecology: "온화한 온도의 숲속이나 길가, 아파트 화단 등지에서 주로 발견돼요."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `'${name}'라는 식물 또는 곤충에 대해, 초등학교 3~4학년 수준으로 쉽고 흥미진진하게 백과사전 도감 설명문을 만들어주세요.
출력 형식은 오직 아래와 같은 JSON 구조로만 마크다운 없이 제공하세요.
{
  "description": "어린이 눈높이에 맞춰 다정하게 풀어서 쓴 전체적인 특징과 소개(3문장)",
  "funFact": "이 생물에 얽힌 초특급 비밀이나 재미있고 신기한 비하인드 사실(2문장)",
  "ecology": "이 친구가 주로 사는 곳, 먹이, 활동적인 계절 등 생태 정보(2문장)"
}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.error("Gemini Encyclopedia Error:", err);
    res.status(500).json({ error: "도감의 책장을 넘기다 살짝 걸렸어요. 다시 시도해 주세요!" });
  }
});

// ---------------------------------------------------------
// [VITE SERVING CONFIG]
// ---------------------------------------------------------
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
    console.log(`쑥쑥 관찰일지 서버가 실행 중입니다! http://localhost:${PORT}`);
  });
}

startServer();
