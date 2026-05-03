import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "MDf71m7cYLSHrK5.root",
    password: "nbtPU1HLFtr7r82K",
    database: "mobile_store_db",
    ssl: {
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});
// console.log('Ket noi bang pool');
// TEST CONNECTION
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL connected!");
        conn.release();
    } catch (err) {
        console.error("❌ MySQL connection failed:", err);
    }
})();
export default pool;