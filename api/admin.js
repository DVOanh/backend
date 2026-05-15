import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import authorizeAdmin from "../middlewares/authorizeAdmin.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import pool from "../connect_mysql/connect.js";

router.get("/dashboard", authenticateToken, authorizeAdmin, (req, res) => {
    res.json({ message: "Chao mung admin" });
});
router.get("/product/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;
        const sql =
            "select product_id, product_name, p.image_url, description, c.name as tendanhmuc, c.danhmuc_id, b.id as brand_id, b.name as tennhanhieu from products p join categories c on p.category_id = c.danhmuc_id join brand b on p.brand_id = b.id where product_id = ?";
        const [rows] = await pool.query(sql, [product_id]);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.get("/get_product", async (req, res) => {
    try {
        const sql = "select * from products";
        const [rows] = await pool.query(sql);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.post("/insert_variant/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;
        const { price, stock, storage, ram, sku } = req.body;
        if (!price || !stock || !storage || !ram || !sku) {
            return res.json({ message: "Vui lòng nhập đầy đủ dữ liệu" });
        }
        const sql =
            " INSERT INTO product_variant (product_id, price, stock, storage, ram, sku) values (?, ?, ?, ?, ?, ?)";
        const [rows] = await pool.execute(sql, [
            product_id,
            price,
            stock,
            storage,
            ram,
            sku,
        ]);
        return res.json({ message: "Thêm biến thể thành công" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.get("/variant", async (req, res) => {
    try {
        const sql =
            "select * from product_variant join products on product_variant.product_id = products.product_id";
        const [rows] = await pool.query(sql);
        return res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.put("/productedit/:product_id", async (req, res) => {
    try {
        const { product_id } = req.params;
        const { name, mota, danhmuc_id, brand_id, anh } = req.body;
        const sql =
            "update products set product_name = ?, description = ?, category_id = ?, brand_id = ?, image_url = ? WHERE product_id = ?";
        const [rows] = await pool.execute(sql, [
            name,
            mota,
            danhmuc_id,
            brand_id,
            anh,
            product_id,
        ]);
        res.json({ message: "Cap nhat thanh cong", result: rows });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.get("/orders", async (req, res) => {
    try {
        const sql = `
            select o.order_id,
    o.hoten,
    o.status_id,
    o.order_code,
    o.user_id,
    o.created_at, 
    os.status_name,
  SUM(oi.price * oi.soluong_sp) as tongtien, (SELECT COUNT(*) FROM order_items oi2 WHERE oi2.order_id = o.order_id) as slitem from orders o 
  join order_items oi ON o.order_id = oi.order_id
  JOIN order_status os ON o.status_id = os.status_id
GROUP BY o.order_id, o.order_code, o.user_id, o.created_at, o.hoten,
    o.status_id
order by o.order_id desc
        `;
        const [rows] = await pool.execute(sql);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Loi server" });
    }
});

router.get("/tongdoanhthu", async (req, res) => {
    try {
        const sql = `
        SELECT SUM(oi.price * oi.soluong_sp) AS total_revenue
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.status_id = 9;
    `;
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Loi server" });
    }
});

router.get('/tongdonhang', async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) AS total_orders FROM orders";
        const [tongdonhang] = await pool.query(sql);
        return res.status(200).json(tongdonhang);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Loi server" });
    }
});

router.get('/tongdaban', async (req, res) => {
    try {
        const sql = "SELECT sldaban from products";
        const [tongdaban] = await pool.query(sql);
        return res.status(200).json(tongdaban);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Loi server" });
    }
});

router.get("/doanhthuthuonghieu", async (req, res) => {
    try {
        const sql = `
            SELECT 
    b.name AS brand_name, 
    SUM(oi.soluong_sp) AS total_quantity, 
    SUM(oi.soluong_sp * oi.price) AS total_revenue
FROM 
    orders o
JOIN 
    order_items oi ON o.order_id = oi.order_id
JOIN 
    product_variant pv ON oi.variant_id = pv.id -- Giả sử order_item liên kết với biến thể
JOIN 
    products p ON pv.product_id = p.product_id
JOIN 
    brand b ON p.brand_id = b.id
WHERE 
    o.status_id = 9 -- Chỉ tính đơn hàng thành công
GROUP BY 
    b.id, b.name
ORDER BY 
    total_revenue DESC;
     `
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    }

    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Loi server" });
    }
});
router.get("/sldontheotrangthai", async (req, res) => {
    try {
        const sql = `
            SELECT 
    os.status_name, 
    COUNT(o.order_id) AS total_orders
FROM 
    orders o
  JOIN order_status os ON os.status_id = o.status_id
GROUP BY 
    os.status_name;
     `
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    }

    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Loi server" });
    }
});

router.get("/spbanchay", async (req, res) => {
    try {
        const sql = `
            select SUM(pv.sold) AS total_sold, p.product_name from product_variant pv JOIN products p 
            ON pv.product_id = p.product_id
            GROUP BY p.product_id, p.product_name
            ORDER BY total_sold DESC
            LIMIT 5;
        `
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    }

    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Loi server" });
    }
});

router.get("/donhangmoinhat", async (req, res) => {
    try {
        const sql = `
            SELECT
                o.hoten,
                o.tongtien,
                o.order_code,
                os.status_name,
                o.created_at
            FROM orders o
            JOIN order_status os on os.status_id = o.status_id
            WHERE o.status_id = 6
            ORDER BY order_id DESC
            LIMIT 5;
        `
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    }

    catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Loi server" });
    }
});



export default router;
