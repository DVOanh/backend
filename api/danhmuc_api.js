import pool from '../connect_mysql/connect.js';
import express from "express";
const router = express.Router();

router.get('/', async (req, res)=>{
    const sql = "SELECT * from categories order by danhmuc_id desc";
    const [rows] = await pool.query(sql);
    return res.json(rows);
});

export default router;