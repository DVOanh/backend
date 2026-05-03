import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../connect_mysql/connect.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Không có kí tự nào" });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
