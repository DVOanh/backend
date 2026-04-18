import express from 'express';
const router = express.Router();
import pool from '../connect_mysql/connect.js';

router.get('/', async (req, res) => {
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
) s ON s.product_id = p.product_id ORDER BY product_id ASC;`;
    const [rows] = await pool.query(sql);
    return res.json(rows);
});

router.get('/danhmuc/:iddanhmuc', async (req, res) => {
    const { iddanhmuc } = req.params;
    const sql = 'SELECT p.product_id, p.product_name, p.image_url, d.banner_image, v.id AS variant_id, MIN(v.price) FROM products p JOIN product_variant v ON v.product_id = p.product_id JOIN categories d ON d.danhmuc_id = p.category_id WHERE v.price = (SELECT MIN(price) FROM product_variant WHERE product_id = p.product_id) and category_id = ?';
    const [rows] = await pool.query(sql, [iddanhmuc]);
    return res.json(rows);
});

//GET product cho ADmin
router.get('/product_admin', async (req, res) => {
    const sql = 'select p.product_id, p.brand_id, p.image_url, p.product_name, MIN(v.price) as min_price, SUM(v.stock) as total_stock from products p left join product_variant v on p.product_id = v.product_id group by p.product_id order by p.product_id desc';
    const [rows] = await pool.query(sql);
    return res.json(rows);
})

router.get('/pr_admin', async (req, res) => {
    try {
        const sql = "select * from products";
        const [rows] = await pool.query(sql);
        return res.json(rows);
    }
    catch (error) {
        return res.status(400).json({ message: 'Loi server' });
    }
});

router.post('/insert_pr_admin', async (req, res) => {
    try {
        const { product_name, mota, danhmuc, nhanhieu, anh } = req.body;
        const sql = "INSERT INTO products (product_name, description, category_id, brand_id, image_url) VALUES (?, ?, ?, ?, ?)";
        const [rows] = await pool.execute(sql, [product_name, mota, danhmuc, nhanhieu, anh]);
        res.json({
            message: "Thêm sản phẩm thành công",
            product_id: rows.insertId
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
})

router.get('/search-suggest', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json([]);
    }
    const sql = 'SELECT product_id, product_name FROM products where product_name LIKE ? LIMIT 10';
    const [rows] = await pool.query(sql, [`%${keyword}%`]);
    return res.json(rows);
});

router.delete('/product_admin/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const sql = 'DELETE FROM products WHERE product_id = ?';
        const [rows] = await pool.execute(sql, [product_id]);
        if (rows.affectedRows === 0) {
            return res.status(400).json({ message: 'San pham ko ton tai' });
        }
        return res.status(200).json({ message: 'Xoa san pham thanh cong' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }

})

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const sql = `SELECT p.*, 
       v.id, 
       v.price
FROM products p
JOIN product_variant v 
  ON v.product_id = p.product_id
WHERE p.product_id = ?
AND v.price = (
    SELECT MIN(price)
    FROM product_variant
    WHERE product_id = ?
)`;
    const [rows] = await pool.query(sql, [id, id]);

    return res.json(rows[0]);
});


export default router;