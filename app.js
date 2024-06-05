// Importowanie modułów
const DB = require('./database.js');// Moduł bazy danych
const jwt = require('jsonwebtoken');// Moduł do obsługi JSON Web Token
const Cube = require('./cube_class.js'); // Klasa Cube

// Importowanie zmiennych środowiskowych
require('dotenv').config()

// Deklaracja zmiennych globalnych
let active_cubes = []; // Lista aktywnych kostek
let logs = []; // Lista logów
let max_log_length = 100; // Maksymalna długość listy logów

// Sekret używany do podpisywania tokenów JWT
const tokenSecret = `${process.env.JWT_SECRET}`;

// Funkcja do dodawania logów
module.exports.add_log = function(log) {
    if (!log instanceof String) {
        return false;
    }

    logs.unshift(log);

    // Usunięcie najstarszego logu, jeśli lista przekracza maksymalną długość
    if (logs.length > max_log_length) {
        logs.pop();
    }

    return logs;
}

// Funkcja do pobierania logów
module.exports.get_logs = function() {
    return logs;
}


// Funkcja do logowania użytkownika i generowania tokenu JWT
module.exports.login = function (user_profile, res) {
    return new Promise((resolve, reject) => {
        // Pobranie użytkownika z bazy danych
        DB.get_user(user_profile.id).then((result) => {
            // Jeśli użytkownik nie istnieje, dodaj go do bazy
            if (!result && user_profile.id) {
                DB.add_user(user_profile.id, user_profile.emails[0].value).then(() => {
                    DB.get_user(user_profile.id).then((result) => {
                        const token = jwt.sign({
                            ID: result.UserID,
                        }, tokenSecret, {
                            algorithm: 'HS256',
                            expiresIn: '12h',
                            issuer: 'my-api',
                            subject: result.UserID.toString()
                        });

                        resolve(token);
                    });


                });
            } else {
                // Generowanie tokenu JWT dla istniejącego użytkownika
                const token = jwt.sign({
                    ID: result.UserID,
                }, tokenSecret, {
                    algorithm: 'HS256',
                    expiresIn: '12h',
                    issuer: 'my-api',
                    subject: result.UserID.toString()
                });

                resolve(token);
            }
        });

    });
}

// Funkcja do pobierania ID użytkownika z tokenu JWT
module.exports.get_id_from_token = function (token) {
    try {
         // Dekodowanie tokenu JWT
        const decoded = jwt.verify(token, tokenSecret);
        var user_id = decoded.ID;

        return user_id;
    } catch {
        return false;
    }

}

// Funkcja do usuwania kostki z listy aktywnych kostek
module.exports.remove_cube = function (cube) {
    active_cubes.forEach((e, i) => {
        if (e.cube_mac == cube.cube_mac && e.cube_user_id == cube.cube_user_id) {
            active_cubes.splice(i, 1);
            module.exports.add_log(`Cube: Remove cube from tracking:  cube - mac: ${e.cube_mac} id:${e.cube_user_id}`);
        }
    });

}

// Funkcja do aktualizacji kostki
module.exports.update_cube = async function (cube_mac, cube_user_id, side) {
    let exist = false;
    // Sprawdzenie, czy kostka istnieje na liście aktywnych kostek
    active_cubes.forEach((e) => {
        // Aktualizacja strony kostki
        if (e.cube_mac == cube_mac && e.cube_user_id == cube_user_id) {
            e.update(side);
            exist = true;
        }
    });

    if (!exist) {
        // Pobranie kostki z bazy danych, jeśli nie istnieje na liście aktywnych kostek
        DB.get_cube(cube_mac, cube_user_id).then((cb) => {
            exist = false;
            active_cubes.forEach((e) => {
                // Aktualizacja strony kostki
                if (e.cube_mac == cube_mac && e.cube_user_id == cube_user_id) {
                    e.update(side);
                    exist = true;
                }
            });
            if (!exist && cb) {
                 // Dodanie kostki do listy aktywnych kostek i aktualizacja ścianki
                let cube = new Cube(cube_mac, cube_user_id, cb.UserID, cb.CubeID);
                active_cubes.push(cube);
                cube.update(side);
            }
        });
    }
}
