require('dotenv').config();

const config = require("./config.js");

const login = `${process.env.MYSQL_LOGIN}`;
const password = `${process.env.MYSQL_PASSWROD}`;

module.exports.connect = function(mysql){
    return mysql.createConnection({
    host: config.database_host,
    user: login,
    password: password,
    database: config.database_name
});
}