// Importowanie wymaganych modułów i plików


// Wszystkie biblioteki używane w aplikacji zapisane są w pliku package.json, można je automatycznie zainstalować za pomocą polecenia(użytego w głównym katalogu projektu): npm i
// ZMienne środowiskowe dodać należy w pliku .env umieszczonym w głównym katalogu projektu

//Wymagana zawartość pliku .env

//GOOGLE_API_ID = XXX
//GOOGLE_API_SECRET = XXX
//MYSQL_LOGIN = XXX
//MYSQL_PASSWROD = XXX
//JWT_SECRET = XXX
//EXPRESS_SECRET = XXX

const DB = require('./database.js'); // Moduł bazy danych
const app = require('./app.js'); // Funkcje aplikacji
const config = require("./config.js"); // Dane konfiguracyjne

const express = require('express'); // Moduł Express do tworzenia serwera webowego
const cors = require('cors'); // Moduł Cors do obsługi zapytań z przeglądarek internetowych
const passport = require('passport'); // Moduł Passport do uwierzytelniania
const exp = express();
const port = config.port; 

var userProfile;
// Ładowanie zmiennych środowiskowych z pliku .env
require('dotenv').config();

// Konfiguracja uwierzytelniania Google OAuth2
const login_callback_address = config.login_callback_address;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Sprawdzenie, czy wymagane zmienne środowiskowe są dostępne
if (!process.env.GOOGLE_API_ID || !process.env.GOOGLE_API_SECRET || !process.env.MYSQL_PASSWROD || !process.env.JWT_SECRET || !process.env.MYSQL_LOGIN || !process.env.EXPRESS_SECRET) {
    throw new Error("One or more keys missing, check .env file for missing keys");
}

// Konfiguracja aplikacji Express
exp.set('view engine', 'ejs');
exp.use(express.static("./public"));
exp.use(express.json());
exp.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin', 'Authorization'], // Allow these headers
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));


const GOOGLE_CLIENT_ID = `${process.env.GOOGLE_API_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_API_SECRET}`;
const EXPRESS_SECRET = `${process.env.EXPRESS_SECRET}`;


// Nasłuchiwanie na żądania przychodzące do serwera
exp.listen(port, () => {
    console.log(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣶⠀⠀⢀⣄⠀⠀⣠⣶⣾⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⡛⣆⣰⣿⣿⣠⠞⣓⣿⣿⠶⠞⠛⣫⣿⣷⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⡥⣿⡏⣸⡿⠛⠉⠉⠉⠉⠉⠓⢲⣿⠿⢱⣿⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⡴⠶⢿⡋⠀⠟⠛⠁⣀⣀⣀⠀⠀⠀⠺⡷⠚⠉⢀⣾⣿⣶⣿⠗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣅⠙⠀⠀⢠⠞⢛⣿⣭⣙⠛⣦⡀⠹⣄⣀⡼⣻⣿⣯⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⣿⡏⣿⠀⠀⠀⢠⡞⠋⢹⡟⠟⢳⡈⢧⠀⠈⠙⠿⢻⠃⣷⠈⢻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⣸⡿⠿⠟⠲⠶⢤⣼⠀⢹⣿⠁⠀⢨⡇⠀⠀⠀⠀⠀⠉⠀⢿⣷⡾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡾⠹⠆⠀⠀⠀⠀⠀⠀⠈⠳⣼⣿⣷⣤⡾⠁⠀⠀⠀⠀⠀⠀⠀⣿⣏⠻⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣧⣀⡀⠀⠀⠐⠓⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⣰⠃⠘⣧⠀⠀⠀⠀⢠⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⢯⡉⠙⢦⣀⠀⠀⠀⠀⠀⢀⣰⠏⠀⠀⠀⠀⠀⠀⠀⠀⣶⣯⣤⢄⡿⠀⢀⣀⣠⣾⣏⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠹⢦⣀⣉⠒⠶⠶⠶⢶⣊⣡⣄⣀⣀⣀⣀⡤⠀⠀⠀⡿⠙⣯⣹⠷⣚⣋⣉⣡⡴⠟⢦⠈⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠛⠛⠉⠀⠀⢹⣯⠉⠁⢠⣄⡀⠀⢤⣤⣬⣿⣟⠉⠉⠁⢠⠀⠀⠀⢳⡸⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠋⠀⠀⠀⢺⡇⠙⢷⣽⣧⣠⣿⠿⢿⡉⠻⣾⣤⢤⣄⠀⣧⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡟⢀⡼⠁⠀⠀⠸⣇⢠⠘⢿⠙⢿⡏⠀⠈⠹⣄⠀⠀⠀⠈⢻⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣷⠞⠀⠀⠀⠀⠀⡇⢸⣿⢸⠀⠘⣏⠉⠳⢤⣘⣆⠀⠀⠀⠘⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠇⠀⠀⠀⠀⠀⠀⣧⣾⣾⡟⠀⠀⠙⣶⣶⡦⠿⠛⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣄⣤⡏⠀⠀⠀⠀⠀⠀⢰⣿⠟⠁⠀⠀⠀⠀⠛⣧⣀⡀⠀⠸⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣾⠛⢦⡀⠀⠀⠀⠀⣠⠞⠋⠉⠀⠈⣹⠃⠀⠀⠀⠀⠀⢠⡿⠋⠀⠀⠀⠀⠀⠀⠀⢻⣌⣙⢦⠀⠛⢷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣸⡇⠀⠀⠙⢦⠀⠀⣼⠇⠀⠀⠀⠀⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⠋⠉⠁⠀⠈⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⠀⢰⠻⡄⠈⢧⢰⡇⠀⠀⠀⠀⠀⠐⢻⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡄⠀⠀⢠⠀⢸⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢿⣤⣾⠀⠻⢿⡛⠉⣇⠀⠀⠀⠀⠀⠀⠘⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡃⣹⡆⠀⠈⡇⢸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠈⠉⠸⣆⢀⣨⡻⣄⡸⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⠆⠀⠀⠀⠀⠀⠀⢰⡿⠛⠉⠀⠀⣸⠁⡾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢿⡄⠹⣿⣎⡹⢿⣦⡀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠋⠁⠀⠀⠠⣿⡉⠉⢓⡾⠁⠀⠀⠀⢠⣿⠞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⢷⡀⠈⠳⣷⣴⣬⠉⠛⠛⠒⠲⠶⠚⠛⠋⠀⠀⢸⣿⠓⢤⡀⢸⣿⡴⠛⠀⠀⠀⠀⢠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠹⣦⠀⠈⠛⠮⡇⣠⡟⠓⣆⠀⢸⠏⠛⢶⠀⣾⣿⡤⠼⠃⠀⠀⠀⠀⠀⠀⠀⣴⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠳⣤⡀⠀⠀⠉⠙⠓⠻⠀⠛⠛⠒⠚⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⡶⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠲⠦⢤⣤⣤⣤⣤⣤⣤⡶⠶⠚⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`)
    console.log(`Server is listening at http://localhost:${port}`);
});

const session = require('express-session');

exp.set('view engine', 'ejs');

// Konfiguracja sesji dla serwera
exp.use(session({
    resave: false,
    saveUninitialized: true,
    secret: EXPRESS_SECRET
}));

// Konfiguracja Passport do uwierzytelniania
exp.use(passport.initialize());
exp.use(passport.session());

exp.get('/error', (req, res) => res.send("error logging in"));

// Serializacja i deserializacja użytkownika za pomocą Passport
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

// Konfiguracja uwierzytelniania google z użyciem passport
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.server_address}/auth/google/callback`
    },
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

// Ścieżki uwierzytelniania dla Google OAuth2
exp.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

exp.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/error'
    }),
    (req, res) => {
        app.login(userProfile, res).then((e) => {
            res.redirect(`${login_callback_address}?token=${e}`);
        });
    });

// Funkcja walidująca żądanie
function req_validator(token, fields = []) {
     // Sprawdzanie tokena
    if (token != null) {
        if (!app.get_id_from_token(token)) {
            return {
                success: false,
                code: 101,
                error: "Token invalid"
            };
        }
    }
    
    // Sprawdzanie czy istnieją wszystkie wymagane pola
    fields.forEach((e) => {
        if (!e) {
            return {
                success: false,
                code: 102,
                error: "Missing request fields"
            };
        }
    });

    return {
        success: true
    }
}


// Aktualizuj informacje o kostce(zmiana ścianki) pola: mac - mac kostki, id - id kostki, currentWall - aktywna ścianka
// Zapytanie z kostki
exp.post("/update", (req, res) => {
    app.add_log(`Endpoint: /update - Request: ${JSON.stringify(req.body)}`);
    app.update_cube(req.body.mac, req.body.id, req.body.currentWall, res).then((e) => {
            console.log(req.body);
            res.send(e);
    });
});

//Zapytania z aplikacji frontendowej

// Pobierz projekty użytkownika pola: token - token urzytkownika
exp.post('/get_user_projects', (req, res) => {
    app.add_log(`Endpoint: /get_user_projects - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /get_user_projects - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.get_user_projects(app.get_id_from_token(req.body.token)).then((result) => {
        DB.get_cubes(app.get_id_from_token(req.body.token)).then((cubes) => {
            result.forEach((e) => {
                cubes.forEach((el) => {
                    if (e.CubeID == el.CubeID) {
                        e.Cube_users_ID = el.Cube_users_ID;
                    }
                });
                if (!e.Cube_users_ID) {
                    e.Cube_users_ID = "";
                }
                e.UserID = null;
                e.CubeID = null;
            });
            res.send(result);
            app.add_log(`Endpoint: /get_user_projects - Response: ${JSON.stringify(result)}`);
        });
    });
});

  // Pobierz kostki użytkownika pola: token  - token urzytkownika
exp.post('/get_user_cubes', (req, res) => {
    app.add_log(`Endpoint: /get_user_cubes - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /get_user_cubes - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.get_cubes(app.get_id_from_token(req.body.token)).then((result) => {
        result.forEach((e) => {
            e.UserID = null;
            e.CubeID = null;
        });
        res.send(result);
        app.add_log(`Endpoint: /get_user_cubes - Response: ${JSON.stringify(result)}`);
    });
});

// Pobierz wydarzenia dla danego projektu pola: token  - token urzytkownika, project_id - id projektu dla którego pobieramy wydarzenia
exp.post('/get_events', (req, res) => {
    app.add_log(`Endpoint: /get_events - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /get_events - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.get_events(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
        app.add_log(`Endpoint: /get_events - Response: ${JSON.stringify(result)}`);
    });
});


// Dodaj nowy projekt pola: token  - token urzytkownika, name - nazwa projektu
exp.post('/add_project', (req, res) => {
    app.add_log(`Endpoint: /add_project - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.name]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /add_project - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.add_project(app.get_id_from_token(req.body.token), req.body.name).then((result) => {
        res.send(result);
        app.add_log(`Endpoint: /add_project - Response: ${JSON.stringify(result)}`);
    });
});

// Usuń projekt pola: token  - token urzytkownika, project_id - id projektu do usunięcia
exp.post('/remove_project', (req, res) => {
    app.add_log(`Endpoint: /remove_project - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /remove_project - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.remove_project(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
        app.add_log(`Endpoint: /remove_project - Response: ${JSON.stringify(result)}`);
    });
});

 // Ustaw aktywny projekt pola: token  - token urzytkownika, cube_mac - mac kostki, cube_id - id kostki, project_id - id projektu, side - ścianka kostki, do której przypisujemy projekt
// Wartości cube_mac == null && cube_id == null usuwają projekt z id = project_id z przypisanej wcześniej ścianki
exp.post('/set_project_active', (req, res) => {
    app.add_log(`Endpoint: /set_project_active - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    if (req.body.cube_mac == null && req.body.cube_id == null) {
        DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, null, -1).then((result) => {
            res.send(result);
            app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(result)}`);
        });
    } else if (req.body.cube_mac == null || req.body.cube_id == null) {
        const response = {
            success: false,
            code: 103,
            error: "Invalid request"
        };
        res.send(response);
        app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
    } else if (req.body.side) {
        DB.get_cube(req.body.cube_mac, req.body.cube_id).then((e) => {
            if (e) {
                DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, e.CubeID, req.body.side).then((result) => {
                    res.send(result);
                    app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(result)}`);
                });
            } else {
                const response = false;
                res.send(response);
                app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
            }
        });
    } else {
        const response = {
            success: false,
            code: 102,
            error: "Missing request fields"
        };
        res.send(response);
        app.add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
    }
});

// Dodaj kostkę pola: token  - token urzytkownika, cube_mac - mac kostki, cube_id - id kostki
exp.post('/add_cube', (req, res) => {
    app.add_log(`Endpoint: /add_cube - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /add_cube - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.add_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
        app.add_log(`Endpoint: /add_cube - Response: ${JSON.stringify(result)}`);
    });
});

// Usuń kostkę pola: token  - token urzytkownika, cube_mac - mac kostki, cube_id - id kostki
exp.post('/remove_cube', (req, res) => {
    app.add_log(`Endpoint: /remove_cube - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        app.add_log(`Endpoint: /remove_cube - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.remove_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
        app.add_log(`Endpoint: /remove_cube - Response: ${JSON.stringify(result)}`);
    });
});




// Wygenerowanie strony z konsolą logów
exp.get('/logs', (req, res) => {
    res.render('index', {
        logs: app.get_logs()
    });
});

// Wygenerowanie strony z menu dostępu do aplikacji i logów
exp.get('/', (req, res) => {
    res.render('launcher', {
        config: config
    });
});
