import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool(
    // host: process.env.MYSQLHOST,
    // user: process.env.MYSQLUSER,
    // password: process.env.MYSQLPASSWORD,
    // database: process.env.MYSQLDATABASE,
    // port: process.env.MYSQLPORT,

    process.env.MYSQL_URL,
);
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