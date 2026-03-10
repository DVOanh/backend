import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,

    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});
// console.log('Ket noi bang pool');

export default pool;