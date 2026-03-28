import pool from '../connect_mysql/connect.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const router = express.Router();

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sql = await 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);
    const users = rows[0];

    const isMatch = await bcrypt.compare(password, users.password); // Ket qua lenh nay tra ve : true hoac false

    if (!isMatch) {
        return res.status(401).json({ message: 'Password sai' });
    }

    const token = await jwt.sign(
        {
            id: users.user_id, 
            username: users.username,
            role: users.role
        },
        "SECRE_KEY",
        { expiresIn: "3d" }
    )

    res.json(
        {
            token,
            user: {
                user_id: users.user_id,
                username: users.username,
                avatar: users.avatar,
                role: users.role
            }
        }
    )
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'select * from users where user_id = ?';
    const [rows] = await pool.query(sql, [id]);
    return res.json(rows[0]);
});

router.post('/', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const sql = 'INSERT into users(username, email, password) values (?, ?, ?)';

    if (password != confirmPassword) {
        return res.status(400).json({ message: 'Mat khau khong trung nhau, hay thu lai!' });
    }

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Vui long nhap day du du lieu" });
    }

    const checkEmail = "SELECT * FROM users where email = ?";
    const [rowcheckEmail] = await pool.query(checkEmail, [email]);

    if (rowcheckEmail.length > 0) {
        return res.status(400).json({ message: 'Email da ton tai' });
    }
    const hash = await bcrypt.hash(password, 10);

    await pool.query(sql, [username, email, hash]);
    return res.status(200).json({ message: 'Dang ky thanh cong' });

})

export default router;