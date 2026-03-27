import pool from "../connect_mysql/connect.js";
import express from "express";
const router = express.Router();

router.get('/:product_id', async (req, res)=>{
    try{
        const {product_id} = req.params;
        const sql = "SELECT * FROM product_descriptions WHERE product_id = ?";
        const [rows] = await pool.query(sql, [product_id]);
        return res.status(200).json(rows);
    }
    catch(error){
        return res.status(400).json({message: 'Loi server'}) 
    }
});

export default router;