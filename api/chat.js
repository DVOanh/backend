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
  p.sldaban
FROM products p
JOIN (
    SELECT product_id, MIN(price) AS min_price
    FROM product_variant
    GROUP BY product_id
) min_v ON min_v.product_id = p.product_id
JOIN product_variant v 
  ON v.product_id = p.product_id 
  AND v.price = min_v.min_price
 ORDER BY product_id ASC LIMIT 3
    `;
    const [rows] = await pool.query(sql);
    const productsText = rows.map(item =>
      `${item.product_name} - ${item.price} VNĐ`
    ).join("\n");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
Bạn là trợ lý bán điện thoại chuyên nghiệp, thân thiện và hiện đại.

MỤC TIÊU:

* Hỗ trợ khách tìm điện thoại phù hợp
* Trả lời tự nhiên như nhân viên tư vấn thật
* Ưu tiên trải nghiệm người dùng

QUY TẮC TRẢ LỜI:

* Ngắn gọn, dễ đọc
* Không lan man
* Không lặp ý
* Không nói kiểu AI/robot
* Không bịa thông tin ngoài dữ liệu được cung cấp
* Chỉ tư vấn sản phẩm có trong danh sách
* Nếu không có sản phẩm phù hợp thì nói rõ
* Có thể dùng emoji nhẹ 👌📱

FORMAT KHI LIỆT KÊ SẢN PHẨM:

* Mỗi sản phẩm 1 dòng

* Đúng format:

* [Tên sản phẩm] - [Giá]

VÍ DỤ:

* iPhone 15 Pro Max - 15.245.000 VNĐ
* Samsung Galaxy S24 Ultra - 21.000.000 VNĐ

KHI KHÁCH HỎI:

* "điện thoại gaming":
  => ưu tiên hiệu năng

* "pin trâu":
  => ưu tiên dung lượng pin

* "chụp ảnh đẹp":
  => ưu tiên camera

* "giá rẻ":
  => ưu tiên giá thấp

* "iphone":
  => chỉ lọc sản phẩm Apple nếu có

NẾU KHÁCH KHÔNG NÓI RÕ NHU CẦU:
Hãy hỏi ngắn gọn:

* Anh/chị thích chơi game, chụp ảnh hay pin lâu ạ?

DANH SÁCH SẢN PHẨM:

${productsText}
`
        },
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
