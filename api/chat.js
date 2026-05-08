import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Không có kí tự nào" });
    }
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Bạn là một trợ lý ảo tiếng Việt hữu ích." },
        { role: "user", content: message }
      ],
      // Model Llama 3.3 này rất thông minh và hiểu tiếng Việt cực tốt
      model: "llama-3.3-70b-versatile", 
    });
    const reply = chatCompletion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
