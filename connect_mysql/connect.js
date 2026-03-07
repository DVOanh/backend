import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Dovanoanh@2004!!!',
    database: 'mobile_store_db',

    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});
// console.log('Ket noi bang pool');

export default pool;