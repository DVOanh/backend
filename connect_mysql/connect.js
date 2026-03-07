import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: 'shinkansen.proxy.rlwy.net',
    port: 54972,
    user: 'root',
    password: 'omIJbfMboXxzGNANDnkwImQSCjGgOwNz',
    database: 'railway',

    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});
// console.log('Ket noi bang pool');

export default pool;