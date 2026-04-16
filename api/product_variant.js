import pool from '../connect_mysql/connect.js';
import express from 'express';
const router = express.Router(); 

router.post('/', async (req, res)=>{
    const {userid, variant_id, count} = req.body;
    const sql = 'INSERT into cart(user_id, variant_id, quantity) values (?, ?, ?)';
    await pool.query(sql, [userid, variant_id, count], (err, result)=>{
        if(err){
            return res.status(400).send('Loi truy van');
        }
        else{
            return res.json(result);
        }
    });
});

router.get('/:product_id', async (req, res)=>{
    try{
        const {product_id} = req.params;
        const sql = 'select id, storage, ram, price from product_variant where product_id = ?';
        const [rows] = await pool.query(sql, [product_id]);
        return res.status(200).json(rows);
    }   
    catch(error){
        return res.status(400).json("Loi server");
    }
});


export default router;
