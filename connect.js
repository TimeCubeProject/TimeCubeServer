// Importowanie zmiennych środowiskowych z pliku .env
require('dotenv').config();

// Importowanie pliku konfiguracyjnego
const config = require("./config.js");

// Pobieranie danych logowania do bazy danych z pliku .env
const login = `${process.env.MYSQL_LOGIN}`;
const password = `${process.env.MYSQL_PASSWROD}`;

// Funkcja do nawiązywania połączenia z bazą danych MySQL
module.exports.connect = function(mysql){
    return mysql.createConnection({
    host: config.database_host,
    user: login,
    password: password,
    database: config.database_name
});
}