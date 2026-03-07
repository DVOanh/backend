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

export default router;