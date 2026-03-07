import express from 'express';
import pool from '../connect_mysql/connect.js';
const router = express.Router();

router.get('/:product_id', async (req, res) => {

    const { product_id } = req.params;
    const sql = 'select * from review_product join products ON review_product.product_id = products.product_id JOIN users on review_product.user_id = users.user_id where review_product.product_id = ?';
    const [rows] = await pool.query(sql, [product_id]);
    return res.status(200).json(rows);
});

router.get('/sl/:product_id', async (req, res) => {
    const { product_id } = req.params;
    const slstar = 'select ROUND(avg(star),1) as tbc from review_product where product_id = ?';
    const [rows] = await pool.query(slstar, [product_id]);

    return res.status(200).json(rows);

});

export default router;