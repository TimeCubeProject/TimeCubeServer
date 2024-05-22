const DB = require('./database.js');
const app = require('./app.js');
const config = require("./config.js");

const express = require('express');
const cors = require('cors');
const exp = express();
const port = 3000;

require('dotenv').config();

const login_callback_address = config.login_callback_address;

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

if (!process.env.GOOGLE_API_ID || !process.env.GOOGLE_API_SECRET || !process.env.MYSQL_PASSWROD || !process.env.JWT_SECRET || !process.env.MYSQL_LOGIN) {
    throw new Error("One or more keys missing, check .env file for missing keys");
}

const GOOGLE_CLIENT_ID = `${process.env.GOOGLE_API_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_API_SECRET}`;

exp.use(express.json());
exp.use(cors());

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

exp.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

const passport = require('passport');
var userProfile;

exp.use(passport.initialize());
exp.use(passport.session());

exp.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

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

exp.post("/update", (req, res) => {
    app.update_cube(req.body.cube_mac, req.body.cube_id, req.body.cube_side, res).then((e) => {
        DB.get_user_projects(1).then((result) => {
            res.send(result)
        });
    });
});


function req_validator(token, fields = []) {
    if (token != null) {
        if (!app.get_id_from_token(token)) {
            return {
                success: false,
                code: 101,
                error: "Token invalid"
            };
        }
    }

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

exp.post('/get_user_projects', (req, res) => { //podajesz token dostajesz tablice projektów
    let validator_result = req_validator(req.body.token);

    if (!validator_result.success) {
        res.send(validator_result);
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
        });
    });
});

exp.post('/get_user_cubes', (req, res) => { //podajesz token dostajesz tablice kostek
    let validator_result = req_validator(req.body.token);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.get_cubes(app.get_id_from_token(req.body.token)).then((result) => {
        result.forEach((e) => {
            e.UserID = null;
            e.CubeID = null;
        });
        res.send(result);
    });
});

exp.post('/get_events', (req, res) => { //podajesz token i id projektu dostajesz tablice eventów (start czas, stop czasu) dla projektu
    let validator_result = req_validator(req.body.token, [req.body.project_id]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.get_events(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
    });
});

exp.post('/add_project', (req, res) => { // podajesz token, nazwę - dodaje projekt o tej nazwie
    let validator_result = req_validator(req.body.token, [req.body.name]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.add_project(app.get_id_from_token(req.body.token), req.body.name).then((result) => {
        res.send(result);
    });
});

exp.post('/remove_project', (req, res) => { // podajesz token, id projektu - usuwa projekt o danym id
    let validator_result = req_validator(req.body.token, [req.body.project_id]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.remove_project(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
    });
});

exp.post('/set_project_active', (req, res) => { // podajesz token, id projektu, id kostki, mac kostki i ściankę - ustawiasz projekt na danej ściance danej kostki, jeśli mac kostki i id kostki = null to usuwasz kostkę z projektu
    let validator_result = req_validator(req.body.token, [req.body.project_id]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    if (req.body.cube_mac == null && req.body.cube_id == null) {
        DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, null, -1).then((result) => {
            res.send(result);
        });
    } else if (req.body.cube_mac == null || req.body.cube_id == null) {
        res.send({
            success: false,
            code: 103,
            error: "Invalid request"
        });
    } else if (req.body.side) {
        DB.get_cube(req.body.cube_mac, req.body.cube_id).then((e) => {
            if (e) {
                DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, e.CubeID, req.body.side).then((result) => {
                    res.send(result);
                });
            } else {
                res.send(false);
            }
        });
    } else {
        res.send({
            success: false,
            code: 102,
            error: "Missing request fields"
        });
    }


});

exp.post('/add_cube', (req, res) => { // podajesz token, mac kostki i id kostki - dodajesz kostkę
    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.add_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
    });
});

exp.post('/remove_cube', (req, res) => { // podajesz token, mac kostki i id kostki - usuwasz kostkę
    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);

    if (!validator_result.success) {
        res.send(validator_result);
        return false;
    }

    DB.remove_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
    });
});
