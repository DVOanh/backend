import express from "express";
import Groq from "groq-sdk";
import pool from "../connect_mysql/connect.js";

const router = express.Router();
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Không có kí tự nào" });
    }
    const sql = `
      SELECT 
  p.product_id,
  p.product_name,
  p.image_url,
  v.id AS variant_id,
  v.price,
  s.total_sold
FROM products p
JOIN (
    SELECT product_id, MIN(price) AS min_price
    FROM product_variant
    GROUP BY product_id
) min_v ON min_v.product_id = p.product_id
JOIN product_variant v 
  ON v.product_id = p.product_id 
  AND v.price = min_v.min_price
JOIN (
    SELECT product_id, SUM(sold) AS total_sold
    FROM product_variant
    GROUP BY product_id
) s ON s.product_id = p.product_id ORDER BY product_id ASC LIMIT 3
    `;
    const [rows] = await pool.query(sql);
    const productsText = rows.map(item=>
      `${item.product_name} - ${item.price} VNĐ`
    ).join("\n");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: `Bạn là một trợ lý ảo tiếng Việt. 
          Hãy trả lời thật ngắn gọn, súc tích, đi thẳng vào vấn đề. 
          Tránh giải thích dài dòng trừ khi được yêu cầu.
          Danh sách sản phẩm ${productsText}` },
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
