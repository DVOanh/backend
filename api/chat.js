import express from "express";
import Groq from "groq-sdk";
import pool from "../connect_mysql/connect.js";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const productsText = rows.map(item =>
      `${item.product_name} - ${item.price} VNĐ`
    ).join("\n");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system", content: `
            Bạn là trợ lý bán điện thoại chuyên nghiệp, thân thiện và hiện đại.

QUY TẮC TRẢ LỜI:
- Trả lời ngắn gọn, tự nhiên, dễ đọc
- Ưu tiên đúng trọng tâm
- Không lan man
- Không dùng từ quá robot
- Xưng hô lịch sự
- Có thể dùng emoji nhẹ nhàng khi phù hợp
- Nếu khách hỏi sản phẩm thì tư vấn như nhân viên bán hàng thật

KHI KHÁCH HỎI VỀ ĐIỆN THOẠI:
- Giới thiệu sản phẩm ngắn gọn
- Mỗi sản phẩm nằm trên 1 dòng
- Không viết thành đoạn văn dài
- Không đánh số
- Format đúng:
[Tên sản phẩm] - [Giá]

DANH SÁCH SẢN PHẨM HIỆN CÓ:

${productsText}

VÍ DỤ PHẢN HỒI ĐẸP:

Mình tìm thấy vài mẫu phù hợp cho bạn 👌

- iPhone 15 Pro Max - 15.245.000 VNĐ
- Samsung Galaxy S24 Ultra - 21.000.000 VNĐ
- Xiaomi 14 - 9.800.000 VNĐ

Bạn thích chơi game, chụp ảnh hay pin trâu để mình tư vấn chuẩn hơn nhé.
          ` },
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
