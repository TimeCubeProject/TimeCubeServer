// Importowanie modułów
const DB = require('./database.js'); // Moduł bazy danych
const app = require('./app.js'); // Moduł funkcji aplikacji
const config = require("./config.js"); // Plik konfiguracyjny

// Definicja klasy Cube - kostka, która jest w użyciu i nalicza czas na projekcie
class Cube {
    constructor(cube_mac, cube_user_id, user_id) {
        this.cube_mac = cube_mac;
        this.cube_user_id = cube_user_id;
        this.user_id = user_id;
        this.previous_side = -1;
        this.interval_update = config.databes_project_time_update_interval;

        this.last_update_time = Date.now(); // Czas ostatniej aktualizacji
    }
}

// Metoda do zapisywania czasu
Cube.prototype.save_time = function () {
    // Dodanie czasu do projektu w bazie danych
    DB.add_time_to_project(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, ((Date.now() - this.last_update_time) / 1000));
    this.last_update_time = Date.now(); // Aktualizacja czasu ostatniej aktualizacji
}

// Metoda do aktualizacji stanu kostki
Cube.prototype.update = function (side) {
    if ((side == -1) && this.previous_side != -1) {
        // Kostka została wyłączona - zapis czasu i usunięcie kostki z listy aktywnych
        clearInterval(this.save_time_call);
        this.save_time();
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, "Time stop");
        app.add_log(`Cube: Time stop at project - ${this.previous_side}: cube - mac: ${this.cube_mac} id:${this.cube_user_id}`);
        app.remove_cube(this);
        return 0;
    } else if (side == -1) {
        // Usunięcie kostki bez aktywnego proejktu z listy aktywnych
        clearInterval(this.save_time_call);
        app.remove_cube(this);
        return 0;
    }

    if (this.previous_side == -1) {
        // Rozpoczęcie naliczania czasu nad projektem na wcześniej nieaktywnej kostce
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, side, "Time start");
        app.add_log(`Cube: Time start at project - ${side}: cube - mac: ${this.cube_mac} id:${this.cube_user_id}`);

        this.previous_side = side;
    } else if (this.previous_side != side) {
        // Zmiana ścianki kostki, która liczyła czas pracy nad innym projektem
        this.save_time();

        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, "Time stop");
        app.add_log(`Cube: Time stop at project - ${this.previous_side}: cube - mac: ${this.cube_mac} id:${this.cube_user_id}`);
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, side, "Time start");
        app.add_log(`Cube: Time start at project - ${side}: cube - mac: ${this.cube_mac} id:${this.cube_user_id}`);


        this.previous_side = side;
    }

    clearInterval(this.save_time_call);// Wyczyść interwał zapisywania czasu

    // Ustawienie nowego interwału zapisywania czasu - cykliczny zapis aktualnego czasu do bazy danych - do ustawienia w pliku config
    this.save_time_call = setInterval((e) => {
        this.save_time();
    }, this.interval_update);
}

// Eksportowanie klasy Cube, aby można było jej użyć w innych plikach
module.exports = Cube;
