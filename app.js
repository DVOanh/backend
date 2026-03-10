import express from 'express';
const app = express();
import productRouter from './api/product_api.js';
import bcrypt from 'bcrypt';
import userRouter from './api/user_api.js';
import productVariant from './api/product_variant.js';
import reviewRouter from './api/reviewpd_api.js';
import cartRouter from './api/cart_api.js';
import orderRouter from './api/order_api.js';
import orderStatusRouter from './api/order_status.js';
import adminRouter from './api/admin.js';
import categories from './api/categories.js';
import brand from './api/brand.js';
import cors from 'cors';
app.use(cors());
app.use(express.json());
app.use('/order_status', orderStatusRouter);
app.use('/user', userRouter);
app.use('/products', productRouter);
app.use('/variant', productVariant);
app.use('/review', reviewRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/categories', categories);
app.use('/brand', brand);
app.get("/", (req, res)=>{
    res.send("API OK");
});
app.get("/debug", async (req,res)=>{
    const [rows] = await pool.query("SELECT DATABASE()");
    res.json(rows);
});

const PORT = process.env.PORT || 3000

app.use('/admin', adminRouter);
app.listen(PORT, ()=>{
    console.log(`------------------------------------\nĐang chạy server ở PORT ${PORT}\n`);
});