
require('dotenv').config();
const oracledb = require('oracledb');

async function getConnection() {
    const connection = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING
    });

    return connection;
}

module.exports = getConnection;
