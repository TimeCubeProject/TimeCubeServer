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

exp.set('view engine', 'ejs');


let logs = [];
let max_log_length = 100;

function add_log (log) {
    if (!log instanceof String) {
        return false;
    }

    logs.push(log);

    if (logs.length > max_log_length) {
        logs.shift();
    }

    return logs;
}

exp.get('/', (req, res) => {
    res.render('page', { logs: logs });
});



const GOOGLE_CLIENT_ID = `${process.env.GOOGLE_API_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_API_SECRET}`;

exp.use(express.json());
exp.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin', 'Authorization'], // Allow these headers
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));
// const corsOptions = {
// origin: 'https://timecubeproject.github.io/',//(https://your-client-app.com)
// optionsSuccessStatus: 200,
//};

//exp.use(cors(corsOptions));

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
        callbackURL: `${config.server_address}/auth/google/callback`
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
    add_log(`Endpoint: /update - Request: ${JSON.stringify(req.body)}`);
    app.update_cube(req.body.mac, req.body.id, req.body.currentWall, res).then((e) => {
            console.log(req.body);
            res.send(e);
    });
});

//exp.get("/update", (req, res) => {
//app.update_cube(req.query.mac, req.query.id, req.query.currentWall, res).then((e) => {
// DB.get_user_projects(1).then((result) => {
//        console.log(req.query)
//          res.send(result)
//    });
//  });
//});

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

exp.post('/get_user_projects', (req, res) => {
    add_log(`Endpoint: /get_user_projects - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /get_user_projects - Response: ${JSON.stringify(validator_result)}`);
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
            add_log(`Endpoint: /get_user_projects - Response: ${JSON.stringify(result)}`);
        });
    });
});

exp.post('/get_user_cubes', (req, res) => {
    add_log(`Endpoint: /get_user_cubes - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /get_user_cubes - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.get_cubes(app.get_id_from_token(req.body.token)).then((result) => {
        result.forEach((e) => {
            e.UserID = null;
            e.CubeID = null;
        });
        res.send(result);
        add_log(`Endpoint: /get_user_cubes - Response: ${JSON.stringify(result)}`);
    });
});

exp.post('/get_events', (req, res) => {
    add_log(`Endpoint: /get_events - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /get_events - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.get_events(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
        add_log(`Endpoint: /get_events - Response: ${JSON.stringify(result)}`);
    });
});

exp.post('/add_project', (req, res) => {
    add_log(`Endpoint: /add_project - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.name]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /add_project - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.add_project(app.get_id_from_token(req.body.token), req.body.name).then((result) => {
        res.send(result);
        add_log(`Endpoint: /add_project - Response: ${JSON.stringify(result)}`);
    });
});

exp.post('/remove_project', (req, res) => {
    add_log(`Endpoint: /remove_project - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /remove_project - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.remove_project(app.get_id_from_token(req.body.token), req.body.project_id).then((result) => {
        res.send(result);
        add_log(`Endpoint: /remove_project - Response: ${JSON.stringify(result)}`);
    });
});

exp.post('/set_project_active', (req, res) => {
    add_log(`Endpoint: /set_project_active - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.project_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    if (req.body.cube_mac == null && req.body.cube_id == null) {
        DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, null, -1).then((result) => {
            res.send(result);
            add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(result)}`);
        });
    } else if (req.body.cube_mac == null || req.body.cube_id == null) {
        const response = {
            success: false,
            code: 103,
            error: "Invalid request"
        };
        res.send(response);
        add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
    } else if (req.body.side) {
        DB.get_cube(req.body.cube_mac, req.body.cube_id).then((e) => {
            if (e) {
                DB.set_project_active(app.get_id_from_token(req.body.token), req.body.project_id, e.CubeID, req.body.side).then((result) => {
                    res.send(result);
                    add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(result)}`);
                });
            } else {
                const response = false;
                res.send(response);
                add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
            }
        });
    } else {
        const response = {
            success: false,
            code: 102,
            error: "Missing request fields"
        };
        res.send(response);
        add_log(`Endpoint: /set_project_active - Response: ${JSON.stringify(response)}`);
    }
});

exp.post('/add_cube', (req, res) => {
    add_log(`Endpoint: /add_cube - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /add_cube - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.add_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
        add_log(`Endpoint: /add_cube - Response: ${JSON.stringify(result)}`);
    });
});

exp.post('/remove_cube', (req, res) => {
    add_log(`Endpoint: /remove_cube - Request: ${JSON.stringify(req.body)}`);

    let validator_result = req_validator(req.body.token, [req.body.cube_mac, req.body.cube_id]);
    if (!validator_result.success) {
        res.send(validator_result);
        add_log(`Endpoint: /remove_cube - Response: ${JSON.stringify(validator_result)}`);
        return false;
    }

    DB.remove_cube(app.get_id_from_token(req.body.token), req.body.cube_mac, req.body.cube_id).then((result) => {
        res.send(result);
        add_log(`Endpoint: /remove_cube - Response: ${JSON.stringify(result)}`);
    });
});







exp.get('/logs', (req, res) => {
    res.render('index', {
        logs: logs
    });
});
