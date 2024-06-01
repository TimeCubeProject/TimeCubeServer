const DB = require('./database.js');
const app = require('./app.js');
const config = require("./config.js");

class Cube {
    constructor(cube_mac, cube_user_id, user_id) {
        this.cube_mac = cube_mac;
        this.cube_user_id = cube_user_id;
        this.user_id = user_id;
        this.previous_side = -1;
        this.interval_update = config.databes_project_time_update_interval;

        this.last_update_time = Date.now();
    }
}

Cube.prototype.save_time = function () {
    DB.add_time_to_project(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, ((Date.now() - this.last_update_time) / 1000));
    this.last_update_time = Date.now();
}

Cube.prototype.update = function (side) {
    if ((side == -1) && this.previous_side != -1) {
        clearInterval(this.save_time_call);
        this.save_time();
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, "Time stop");
        app.add_log(`Cube: Time stop at project - ${this.previous_side}: cube - ${JSON.stringify(this)}`);
        app.remove_cube(this);
        return 0;
    } else if ((side == -1 || side == 0)) {
        clearInterval(this.save_time_call);
        app.remove_cube(this);
        return 0;
    }

    if (this.previous_side == -1) {
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, side, "Time start");
        app.add_log(`Cube: Time start at project - ${side}: cube - ${JSON.stringify(this)}`);

        this.previous_side = side;
    } else if (this.previous_side != side) {
        this.save_time();

        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, this.previous_side, "Time stop");
        app.add_log(`Cube: Time stop at project - ${this.previous_side}: cube - ${JSON.stringify(this)}`);
        DB.add_event(this.user_id, this.cube_mac, this.cube_user_id, side, "Time start");
        app.add_log(`Cube: Time start at project - ${side}: cube - ${JSON.stringify(this)}`);


        this.previous_side = side;
    }

    clearInterval(this.save_time_call);

    this.save_time_call = setInterval((e) => {
        this.save_time();
    }, this.interval_update);
}

module.exports = Cube;
