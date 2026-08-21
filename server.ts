import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// High body limits for receipt photos
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(process.env.GEMINI_API_KEY) });
});

// 2. Receipt Scanner OCR & AI Extraction
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body." });
    }

    // Strip header if present
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const promptText = `
You are an expert financial OCR receipt scanner for Qalta AI Expense Manager.
Analyze this receipt/bill/invoice image with high precision.
Extract:
1. Merchant/Store/Vendor Name (clean and concise, e.g. "Trader Joe's", "Starbucks", "Uber")
2. Total amount paid (number, including decimals)
3. Subtotal (number, or calculated from items)
4. Tax amount (if listed)
5. Tip amount (if listed)
6. Date of purchase (format YYYY-MM-DD; if year missing, use 2026)
7. Time of purchase (format HH:mm, or empty if not present)
8. Best matching category from: ["Food & Dining", "Groceries", "Shopping", "Transportation", "Housing & Utilities", "Entertainment", "Health & Fitness", "Travel", "Subscriptions", "Technology", "Education", "Personal Care", "Miscellaneous"]
9. Payment Method (e.g. "Apple Pay", "Credit Card", "Debit Card", "Cash", "Google Pay", "Bank Transfer", "Other")
10. Currency code (e.g. "USD", "EUR", "GBP", "CAD", "AUD", "JPY")
11. Individual line items (each with name, quantity, price, and optional sub-category)
12. Short summary notes (e.g., store location, receipt number, or notable items)
13. OCR confidence score (integer 0-100)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes("svg") ? "image/png" : mimeType,
              data: base64Data,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            total: { type: Type.NUMBER },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            tip: { type: Type.NUMBER },
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            category: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            currency: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            notes: { type: Type.STRING },
            rawTextSummary: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                },
                required: ["name", "quantity", "price"],
              },
            },
          },
          required: ["merchant", "total", "category", "date", "confidence"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error scanning receipt with Gemini:", error);
    return res.status(500).json({
      error: "Failed to scan receipt",
      details: error?.message || String(error),
    });
  }
});

// 3. Natural Language Expense Parser (Voice/Text Quick Log)
app.post("/api/parse-natural-expense", async (req, res) => {
  try {
    const { text, referenceDate = new Date().toISOString().slice(0, 10) } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Missing text description" });
    }

    const systemPrompt = `
You are an intelligent expense assistant. Convert natural language statements into structured expense data.
Today is ${referenceDate}.
Extract:
- merchant (string)
- amount (number)
- category (Choose one of: Food & Dining, Groceries, Shopping, Transportation, Housing & Utilities, Entertainment, Health & Fitness, Travel, Subscriptions, Technology, Education, Personal Care, Miscellaneous)
- date (YYYY-MM-DD, resolve relative dates like "yesterday", "last Friday", "today")
- paymentMethod (Apple Pay, Credit Card, Debit Card, Cash, Google Pay, Bank Transfer, Other)
- currency (USD by default unless specified like €, £, Yen, etc.)
- notes (additional context like who it was with or purpose)
- isSubscription (boolean, true if user mentions monthly/recurring/subscription)
- items (array of item names and prices if listed)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            currency: { type: Type.STRING },
            notes: { type: Type.STRING },
            isSubscription: { type: Type.BOOLEAN },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                },
                required: ["name", "price"],
              },
            },
          },
          required: ["merchant", "amount", "category", "date"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error parsing natural expense:", error);
    return res.status(500).json({
      error: "Failed to parse natural language expense",
      details: error?.message || String(error),
    });
  }
});

// 4. AI Financial Insights & Budget Diagnostics
app.post("/api/financial-insights", async (req, res) => {
  try {
    const { expenses = [], budgets = [], currency = "USD" } = req.body;

    const summaryPayload = {
      totalSpent: expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
      count: expenses.length,
      currency,
      expenses: expenses.slice(0, 30).map((e: any) => ({
        merchant: e.merchant,
        amount: e.amount,
        category: e.category,
        date: e.date,
        isSubscription: e.isSubscription,
      })),
      budgets,
    };

    const prompt = `
You are the Qalta AI Chief Financial Strategist.
Analyze the user's spending data and budget limits:
${JSON.stringify(summaryPayload, null, 2)}

Provide structured, actionable financial insights:
1. "insights": An array of 3-5 distinct insights. Each insight must have:
   - id (string)
   - type: one of ["alert", "tip", "celebration", "subscription", "trend"]
   - title: concise punchy headline (e.g. "Dining Budget at 85%", "Identified 3 Recurring Subscriptions", "Great Job on Grocery Savings")
   - message: clear analytical explanation with concrete numbers
   - category: the associated expense category, or null
   - impactAmount: approximate dollar impact or savings opportunity (number)
   - actionable: a direct 1-sentence tip on what to do next
2. "healthScore": financial health score from 1 to 100 based on budget adherence and discretionary spending ratio
3. "forecastSpend": estimated total monthly spend if current daily run rate continues
4. "summaryParagraph": a concise, encouraging 2-sentence summary of their current financial standing.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            forecastSpend: { type: Type.NUMBER },
            summaryParagraph: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  message: { type: Type.STRING },
                  category: { type: Type.STRING },
                  impactAmount: { type: Type.NUMBER },
                  actionable: { type: Type.STRING },
                },
                required: ["id", "type", "title", "message"],
              },
            },
          },
          required: ["healthScore", "insights", "summaryParagraph"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating financial insights:", error);
    return res.status(500).json({
      error: "Failed to generate financial insights",
      details: error?.message || String(error),
    });
  }
});

// 5. Conversational Financial Advisor Chat
app.post("/api/chat-advisor", async (req, res) => {
  try {
    const { messages = [], expenses = [], budgets = [], userQuestion } = req.body;

    const expenseContext = JSON.stringify({
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0),
      recentExpenses: expenses.slice(0, 25).map((e: any) => ({
        merchant: e.merchant,
        amount: e.amount,
        category: e.category,
        date: e.date,
        paymentMethod: e.paymentMethod,
      })),
      budgets,
    });

    const systemInstruction = `
You are Qalta AI, an intelligent, empathetic, and sharp personal financial advisor.
You help users understand their spending, spot trends, plan savings, check budget availability, and optimize their money.
Here is the user's real financial context:
${expenseContext}

Guidelines:
- Give direct, helpful, and concise answers.
- Use bullet points for breakdown when needed.
- If asked whether they can afford a purchase, look at their remaining budget and total monthly expenses.
- Suggest 2-3 short follow-up suggested action chips (e.g. "Show dining breakdown", "Ways to save $50 this week", "Review subscriptions").
`;

    const chatPrompt = `
Conversation history:
${messages.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")}
User: ${userQuestion}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: chatPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["reply"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in financial advisor chat:", error);
    return res.status(500).json({
      error: "Failed to process chat",
      details: error?.message || String(error),
    });
  }
});

// Vite Middleware & Static Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Qalta AI Expense Manager server running on http://0.0.0.0:${PORT}`);
  });
}

start();
