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

router.get('/product_variant', async (req, res)=>{
    const sql = 'SELECT * FROM product_variant'
})

export default router;
