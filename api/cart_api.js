import express from 'express';
import pool from '../connect_mysql/connect.js';
const router = express.Router();
import jwt from 'jsonwebtoken';
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const sql = "select *, products.product_name from cart join product_variant on cart.variant_id = product_variant.id join products on products.product_id = product_variant.product_id where user_id = ? order by cart_id desc";
    const [rows] = await pool.query(sql, [user_id])
    return res.json(rows);
    });
router.get('/slgh/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const sql = "select sum(quantity) as slsp from cart where user_id = ?";
    const [rows] = await pool.query(sql, [user_id]);
    return res.json(rows);
});

router.post('/addcart', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Chua dang nhap" });
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, "SECRE_KEY");
        const user_id = decoded.id;
        const { variant_id, soluong } = req.body;
        const sql = "insert into cart(user_id, variant_id, quantity) values (?, ?, ?)";
        const [rows] = await pool.query(sql, [user_id, variant_id, soluong]);
        return res.json(rows);
    }
    catch(err){
        return res.status(401).json({message: err.message});
    }

});

export default router;