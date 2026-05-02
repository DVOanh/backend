import express from "express";
import OpenAI from "openai";
import pool from "../connect_mysql/connect.js";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Không có kí tự nào" });
    }
    const [products] = await pool.query(
      `
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
) s ON s.product_id = p.product_id ORDER BY product_id ASC LIMIT 5
            `,
    );
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `
                Bạn là chatbot bán điện thoại.
                Chỉ được tư vấn dựa trên danh sách sản phẩm bên dưới.
                
                Nếu không có sản phẩm phù hợp thì nói "Hiện chưa có sản phẩm phù hợp".
                Danh sách sản phẩm:
                ${JSON.stringify(products)}

                Khách hỏi: ${message}

                Trả lời ngắn gọn dễ hiểu

            `,
    });
    res.json({
      reply: response.output_text,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
