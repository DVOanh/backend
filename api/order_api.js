import pool from '../connect_mysql/connect.js';
import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';

router.get('/', async(req, res)=>{
    const {status_id} = req.query;
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message: 'Chua dang nhap'});
    }
    try{
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, "SECRE_KEY");
        const user_id = decoded.id;
        let sql = `
            SELECT 
    o.order_id,
    o.user_id,
    o.tongtien,
    o.created_at,
    o.hoten,
    o.sdt,
    o.diachi,
    o.ghichu,
    o.phuongthuc_thanhtoan,
    o.order_code,
    o.status_id,
    (
        SELECT p.image_url
        FROM order_items oi2
        JOIN product_variant pv2 ON oi2.variant_id = pv2.id
        JOIN products p ON p.product_id = pv2.product_id
        WHERE oi2.order_id = o.order_id
        LIMIT 1
    ) AS image_url,

    SUM(oi.price * oi.soluong_sp) AS tongtien,
    COUNT(*) AS total_items

FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.user_id = 7
GROUP BY o.order_id;
        `;
        let params = [user_id];
        if(status_id){
            sql = sql + ' AND orders.status_id = ?';
            params.push(status_id);
        }
        sql += ' ORDER BY orders.order_id DESC';
        const [rows] = await pool.query(sql, params);
        return res.json(rows);
    }
    catch(error){
        console.log(error.message);
        return res.status(401).json({ message: "Token khong hop le" });
    }
});

router.post('/checkout', async (req, res) => {
    const { user_id, variant_id, quantity, price, total, hoten, phone, address, pttt, ghichu } = req.body;
    const connection = await pool.getConnection();
    const orderCode = '#LS' + Math.floor(100000000 + Math.random() * 900000000);
    try {
        await connection.beginTransaction();
        const [order] = await connection.query('INSERT INTO orders(user_id, tongtien, hoten, sdt, diachi, ghichu, phuongthuc_thanhtoan, order_code) values (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, total, hoten, phone, address, ghichu, pttt, orderCode]
        );
        const order_id = order.insertId;
    
        await connection.query('INSERT INTO order_items(order_id, soluong_sp, price, variant_id) values (?, ?, ?, ?)',
            [order_id, quantity, price, variant_id]
        );

        await connection.query('UPDATE product_variant set stock = stock - ? WHERE id = ?',
            [quantity, variant_id]
        );

        await connection.commit();
        res.status(200).json({message: 'Dat hang thanh cong'});
    }
    catch(error){
        await connection.rollback();
        res.status(500).json({ message: "Lỗi đặt hàng", error: error.message });
    }
    finally{
        connection.release();
    }
});

router.put('/huydon', async (req, res)=>{
    const connection = await pool.getConnection();
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(400).json({message: "Chua dang nhap"});
    }
    try{
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, 'SECRE_KEY');
        const user_id = decoded.id;
        await connection.beginTransaction();
        const {order_item_id, order_id, soluong_sp, variant_id} = req.body;
        const sqlhuydon = "UPDATE orders o join order_items oi ON o.order_id = oi.order_id set o.status_id = 10 WHERE user_id = ? and oi.order_id = ? and order_item_id = ?";
        const sqlsuaslkho = "UPDATE product_variant set stock = stock + ? WHERE id = ?"
        await connection.query(sqlhuydon, [user_id, order_id, order_item_id]);
        await connection.query(sqlsuaslkho, [soluong_sp, variant_id])
        await connection.commit();
        res.status(200).json({message: "Huỷ đơn thành công"});
    }
    catch(error){
        await connection.rollback();
        res.status(500).json({message: "Lối hủy đơn"});
    }
    finally{
        connection.release();
    }
})

export default router;