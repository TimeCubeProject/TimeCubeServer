const DB = require('./database.js');
const jwt = require('jsonwebtoken');
const Cube = require('./cube_class.js');

require('dotenv').config()

let active_cubes = [];

let logs = [];
let max_log_length = 100;

module.exports.add_log = function(log) {
    if (!log instanceof String) {
        return false;
    }

    logs.unshift(log);

    if (logs.length > max_log_length) {
        logs.pop();
    }

    return logs;
}

module.exports.get_logs = function() {
    return logs;
}

const tokenSecret = `${process.env.JWT_SECRET}`;

module.exports.login = function (user_profile, res) {
    return new Promise((resolve, reject) => {
        DB.get_user(user_profile.id).then((result) => {
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

module.exports.get_id_from_token = function (token) {
    try {
        const decoded = jwt.verify(token, tokenSecret);
        var user_id = decoded.ID;

        return user_id;
    } catch {
        return false;
    }

}

module.exports.remove_cube = function (cube) {
    active_cubes.forEach((e, i) => {
        if (e.cube_mac == cube.cube_mac && e.cube_user_id == cube.cube_user_id) {
            active_cubes.splice(i, 1);
            module.exports.add_log(`Cube: Remove cube from tracking:  cube - mac: ${e.cube_mac} id:${e.cube_user_id}`);
        }
    });

}

module.exports.update_cube = async function (cube_mac, cube_user_id, side) {
    let exist = false;
    active_cubes.forEach((e) => {
        if (e.cube_mac == cube_mac && e.cube_user_id == cube_user_id) {
            e.update(side);
            exist = true;
        }
    });

    if (!exist) {
        DB.get_cube(cube_mac, cube_user_id).then((cb) => {
            exist = false;
            active_cubes.forEach((e) => {
                if (e.cube_mac == cube_mac && e.cube_user_id == cube_user_id) {
                    e.update(side);
                    exist = true;
                }
            });
            if (!exist && cb) {
                let cube = new Cube(cube_mac, cube_user_id, cb.UserID, cb.CubeID);
                active_cubes.push(cube);
                cube.update(side);
            }
        });
    }
}
