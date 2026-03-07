import express from 'express';
const router = express.Router();

import authorizeAdmin from "../middlewares/authorizeAdmin.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import pool from '../connect_mysql/connect.js';

router.get("/dashboard", authenticateToken, authorizeAdmin, (req, res)=>{
    res.json({message: "Chao mung admin"});
});
router.get('/product/:product_id', async (req, res)=>{
    try{
        const {product_id} = req.params;
        const sql = "select product_id, product_name, p.image_url, description, c.name as tendanhmuc, c.danhmuc_id, b.id as brand_id, b.name as tennhanhieu from products p join categories c on p.category_id = c.danhmuc_id join brand b on p.brand_id = b.id where product_id = ?";
        const [rows] = await pool.query(sql, [product_id]);
        return res.json(rows);
    }
    catch(error){
        console.error(error);
        res.status(400).json({message: 'Loi server'})
    }
});

router.get('/get_product', async (req, res)=>{
    try{
        const sql = 'select * from products';
        const [rows] = await pool.query(sql);
        return res.json(rows);
    }
    catch(error){
        console.error(error);
        res.status(400).json({message: "Loi server"});
    }
})

router.post('/insert_variant/:product_id', async (req, res)=>{
    try{
        const {product_id} = req.params;
        const {price, stock, storage, ram, sku} = req.body;
        if (!price || !stock || !storage || !ram || !sku){
            return res.json({message: 'Vui lòng nhập đầy đủ dữ liệu'})
        }
        const sql = " INSERT INTO product_variant (product_id, price, stock, storage, ram, sku) values (?, ?, ?, ?, ?, ?)";
        const[rows] = await pool.execute(sql, [product_id, price, stock, storage, ram, sku]);
        return res.json({message: 'Thêm biến thể thành công'});
    }
    catch(error){
        console.error(error);
        res.status(400).json({message: "Loi server"});
    }
})

router.get('/variant', async (req, res)=>{
    try{
        const sql = 'select * from product_variant join products on product_variant.product_id = products.product_id';
        const [rows] = await pool.query(sql);
        return res.json(rows);
    }
    catch(error){
        console.error(error);
        res.status(400).json({message: "Loi server"});
    }
    
});

router.put('/productedit/:product_id', async (req, res)=>{
    try{
        const {product_id} = req.params;
        const {name, mota, danhmuc_id, brand_id, anh} = req.body;
        const sql = "update products set product_name = ?, description = ?, category_id = ?, brand_id = ?, image_url = ? WHERE product_id = ?";
        const [rows] = await pool.execute(sql, [name, mota, danhmuc_id, brand_id, anh, product_id]);
        res.json({message: 'Cap nhat thanh cong', result: rows})
    }
    catch(error){
        console.error(error);
        res.status(400).json({"message":"Loi server"});
    }
    
})

export default router;