import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: "switchback.proxy.rlwy.net",
    user: "root",
    password: "kMBOXSwKPlrwopiXbuGExifHtQaKXlan",
    database: "railway",
    port: 47621,

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