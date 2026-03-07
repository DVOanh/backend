import express from 'express';
import pool from '../connect_mysql/connect.js';
const router = express.Router();

router.get('/', async (req, res)=>{
    try{
        const sql = "SELECT * FROM brand";
        const [rows] = await pool.query(sql);
        return res.json(rows);
    }
    catch(error){
        return res.json({message: 'Loi server'});
    }
});

export default router;