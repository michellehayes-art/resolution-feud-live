import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
let aiClient = null;
function getAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.post("/api/generate-feud-question", async (req, res) => {
  try {
    const { topic, context } = req.body;
    const prompt = `You are the lead question writer for "Resolution Feud", a Family Feud style game show where couples, roommates, and friends learn the best, healthiest, and most practical ways to solve real everyday arguments.
The argument topic is: "${topic || "A couple arguing over chores and communication"}".
Context: "${context || "Everyday relationship friction"}".

Generate a Family Feud question and 6 to 8 top survey answers (as if 100 relationship counselors and couples were surveyed).
Rules:
1. The question must be phrased like Family Feud: "We surveyed 100 couples/counselors: If you and your partner are arguing about [X], what's the best way to resolve it?"
2. Provide 6 to 8 answers, sorted in descending order of points.
3. Points must be realistic positive integers summing up to approximately 90-100 total.
4. Each answer should be a punchy, actionable solution (e.g. "Take a 20-minute cooling timeout", "Use 'I feel' statements without blame", "Flip a coin or split the difference").
5. Include 3-5 alternative keywords/synonyms for each answer so matching is forgiving.
6. Provide a short, witty, and compassionate "Counselor Debrief" explaining why the top answers work.`;
    const response = await getAI().models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            question: { type: Type.STRING },
            counselorTip: { type: Type.STRING },
            answers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  synonyms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["text", "points", "synonyms"]
              }
            }
          },
          required: ["question", "category", "counselorTip", "answers"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.id) {
      parsed.id = `custom_${Date.now()}`;
    }
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Error generating question:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate dispute scenario with AI. Falling back to default library."
    });
  }
});
app.post("/api/match-guess", async (req, res) => {
  try {
    const { guess, unrevealedAnswers, question } = req.body;
    if (!guess || !unrevealedAnswers || !unrevealedAnswers.length) {
      return res.json({ matched: false, matchIndex: -1 });
    }
    const prompt = `You are a Family Feud judge for a game show about resolving arguments.
Question: "${question}"
Contestant's Guess: "${guess}"

Here is the list of remaining unrevealed survey answers:
${unrevealedAnswers.map((a, idx) => {
      return `[Index ${idx}] "${a.text}" (Synonyms/Concepts: ${a.synonyms?.join(", ") || "none"})`;
    }).join("\n")}

Task: Determine if the contestant's guess meaningfully and semantically matches one of the unrevealed answers above.
Rules:
- Accept close synonyms, paraphrases, and matching core intents (e.g. "Say sorry" matches "Apologize sincerely"; "Take a walk to calm down" matches "Take a 20-minute cooling timeout").
- Reject answers that are completely distinct or contradict the solution.
- Only return a match if you are reasonably confident (>= 75% semantic match).`;
    const response = await getAI().models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matched: { type: Type.BOOLEAN },
            matchedIndex: {
              type: Type.INTEGER,
              description: "The Index (0-based) from the list above that matches, or -1 if none matched."
            },
            explanation: { type: Type.STRING }
          },
          required: ["matched", "matchedIndex"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in semantic match:", error);
    return res.status(500).json({ matched: false, matchedIndex: -1 });
  }
});
import fs from "fs";
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3e3;
app.get("/.well-known/assetlinks.json", (_req, res) => {
  const prodPath = path.join(__dirname, "dist", ".well-known", "assetlinks.json");
  const publicPath = path.join(__dirname, "public", ".well-known", "assetlinks.json");
  const filePath = fs.existsSync(prodPath) ? prodPath : publicPath;
  if (fs.existsSync(filePath)) {
    res.type("application/json").sendFile(filePath);
  } else {
    res.status(404).json({ error: "assetlinks.json not found" });
  }
});
async function startServer() {
  const distPath = path.join(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  if (isProduction && hasDist) {
    app.use(express.static(distPath, { dotfiles: "allow" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Resolution Feud server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
