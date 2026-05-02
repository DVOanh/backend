import pool from '../connect_mysql/connect.js';
import express from 'express';
const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        const sql = 'SELECT * FROM order_status ORDER BY status_id ASC';
        const [rows] = await pool.query(sql);
        return res.json(rows);
    }
    catch(error){
        return res.status(400).json({message: 'Loi truy van'})
    }

});

router.get('/chitietdonhang/:order_item_id', async (req, res)=>{
    try{
        const {order_item_id} = req.params;
        const sql = `select * from order_items oi join orders o ON oi.order_id = o.order_id 
        JOIN product_variant pv ON oi.variant_id = pv.id 
        JOIN products p ON pv.product_id = p.product_id
        where order_item_id = ?`;
        const [rows] = await pool.query(sql, [order_item_id]);
        return res.status(200).json(rows);
    }
    catch(error){
        res.status(400).json({message: "Loi server"});
    }
})

export default router;