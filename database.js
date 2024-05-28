const mysql = require('mysql2');

const config = require("./config.js");

const con = require("./connect.js");
const connection = con.connect(mysql);

//#Init
{
    module.exports.init = async function () {
        await connection.query("USE ?;", [config.database_table_name]);
    }
}
//#User management functions
{
    module.exports.add_user = async function (google_id, email) {
        try {
            const result = await connection.promise().query(`INSERT INTO Users (GoogleID, Email) VALUES (?, ?);`, [google_id, email]);
            return result;
        } catch (error) {
            console.error("Error while adding user: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_user = async function (google_id) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Users WHERE GoogleID = ?;`, [google_id]);
            return rows[0];
        } catch (error) {
            console.error("Error retrieving user: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_all_users = async function () {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Users;`);
            return rows;
        } catch (error) {
            console.error("Error retrieving users: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_user_by_cube = async function (cube_mac, cube_user_id) {
        try {
            const [cubes_rows, cubes_fields] = await connection.promise().query(`SELECT * FROM Cubes WHERE Mac = ? AND Cube_users_ID = ?;`, [cube_mac, cube_user_id]);
            if (cubes_rows[0]) {
                const [rows, fields] = await connection.promise().query(`SELECT * FROM Users WHERE UserID = ?;`, [cubes_rows[0].UserID]);
                return rows[0];
            }
            return [];
        } catch (error) {
            console.error("Error retrieving user: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_cubes = async function (user_id) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Cubes WHERE UserID = ?;`, [user_id]);
            return rows;
        } catch (error) {
            console.error("Error retrieving cube: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.add_cube = async function (user_id, cube_mac, cube_user_id) {
        try {
            const result = await connection.promise().query(`INSERT INTO Cubes (UserID, Mac, Cube_users_ID) VALUES (?, ?, ?);`, [user_id, cube_mac, cube_user_id]);
            return result;
        } catch (error) {
            console.error("Error retrieving cube: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.remove_cube = async function (user_id, cube_mac, cube_user_id) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Cubes WHERE UserID = ? AND Mac = ? AND Cube_users_ID = ?;`, [user_id, cube_mac, cube_user_id]);

            if (rows[0]) {
                rows.forEach((e) => {
                    const result = connection.promise().query(`UPDATE Projects
                        SET CubeID = null, Side = -1
                        WHERE CubeID = ? AND UserID = ?;`, [e.CubeID, user_id]);
                });

                const result = await connection.promise().query(`DELETE FROM Cubes WHERE UserID = ? AND Mac = ? AND Cube_users_ID = ?;`, [user_id, cube_mac, cube_user_id]);

                return result;
            }

            return {
                success: false,
                code: 202,
                error: "No matches"
            };
        } catch (error) {
            console.error("Error removing cube: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }
}
//#Projects management functions
{
    module.exports.add_project = async function (user_id, name, cube_id = null, side = -1) {
        if (cube_id && side < 0) {
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }

        try {
            const add = await connection.promise().query(`INSERT INTO Projects (UserID, Name, CubeID, Side) VALUES (?, ?, ?, ?);`, [user_id, name, cube_id, side]);

            const [rows, fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserID = ? AND Name = ?;`, [user_id, name, cube_id, side])

            return {
                ProjectID: rows[0].ProjectID
            };
        } catch (error) {
            console.error("Error adding project: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.remove_project = async function (user_id, project_id) {
        if (!user_id) {
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
        try {
            const remove_events = await connection.promise().query(`DELETE FROM Events WHERE ProjectID = ?;`, [project_id]);
            const result = await connection.promise().query(`DELETE FROM Projects WHERE UserID = ? AND ProjectID = ?;`, [user_id, project_id]);
            return result;
        } catch (error) {
            console.error("Error removing project: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.set_project_active = async function (user_id, project_id, cube_id, side) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Cubes WHERE CubeID = ?;`, [cube_id]);

            if (!rows[0]) {
                return {
                    success: false,
                    code: 202,
                    error: "No matches"
                };
            }

            const [rows_pr, fields_pr] = await connection.promise().query(`SELECT * FROM Projects WHERE CubeID = ? AND UserID = ? AND Side = ?;`, [cube_id, user_id, side]);

            if (rows_pr[0]) {
                return {
                    success: false,
                    code: 203,
                    error: "Multiple projects on single cube's side"
                };
            }

            const result = await connection.promise().query(`UPDATE Projects
                        SET CubeID = ?, Side = ?
                        WHERE ProjectID = ? AND UserID = ?;`, [cube_id, side, project_id, user_id]);
            return result;
        } catch (error) {
            console.error("Error changing project activity state: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_project = async function (project_id) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Projects WHERE ProjectID = ?;`, [project_id]);
            return rows;
        } catch (error) {
            console.error("Error getting user: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

    module.exports.get_user_projects = async function (user_id, active = null) {
        if (active == null) {
            try {
                const [rows, fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserID = ?;`, [user_id]);
                return rows;
            } catch (error) {
                console.error("Error retrieving user projects: ", error);
                return {
                    success: false,
                    code: 201,
                    error: "Invalid request"
                };
            }
        } else {
            try {
                const [rows, fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserID = ? AND Active = ?;`, [user_id, active]);
                return rows;
            } catch (error) {
                console.error("Error retrieving user projects: ", error);
                return {
                    success: false,
                    code: 201,
                    error: "Invalid request"
                };
            }
        }
    }

    module.exports.add_time_to_project = async function (user_id, cube_mac, cube_user_id, side, time_in_seconds) {
        module.exports.get_cube(cube_mac, cube_user_id).then(async (cube) => {
            try {
                const [pr_rows, pr_fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserID = ? AND CubeID = ? AND Side = ?;`, [user_id, cube.CubeID, side]);

                if (!pr_rows[0]) {
                    return {
                        error: "No project found on this side"
                    };
                }

                const result = await connection.promise().query(`UPDATE Projects
                        SET Time = ?
                        WHERE ProjectID = ?;`, [pr_rows[0].Time + time_in_seconds, pr_rows[0].ProjectID]);
                return result;
            } catch (error) {
                console.error("Error adding time: ", error);
                return {
                    success: false,
                    code: 201,
                    error: "Invalid request"
                };
            }
        });
    }

    module.exports.add_time_to_project_by_side = async function (cube_id, side, time_in_seconds) {
        try {
            const [rows, fields] = await connection.promise().query(`SELECT * FROM Projects WHERE CubeID = ? AND Side = ?;`, [cube_id, side]);

            if (!rows[0]) {
                return {
                    success: false,
                    code: 202,
                    error: "No matches"
                };
            }

            const result = await connection.promise().query(`UPDATE Projects
                        SET Time = ?
                        WHERE ProjectID = ?;`, [rows[0].Time + time_in_seconds, rows[0].ProjectID]);
            return result;
        } catch (error) {
            console.error("Error adding time: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }

}
//#Event management functions
{
    module.exports.add_event = async function (user_id, cube_mac, cube_user_id, side, event_name) {
        module.exports.get_cube(cube_mac, cube_user_id).then(async (cube) => {
            try {
                const [pr_rows, pr_fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserID = ? AND CubeID = ? AND Side = ?;`, [user_id, cube.CubeID, side]);

                if (!pr_rows[0]) {
                    return false;
                }

                const result = await connection.promise().query(`INSERT INTO Events (ProjectID, Name) VALUES (?, ?);`, [pr_rows[0].ProjectID, event_name]);
            } catch (error) {
                console.error("Error adding time: ", error);
                return {
                    success: false,
                    code: 201,
                    error: "Invalid request"
                };
            }
        });
    }

    module.exports.get_events = async function (user_id, project_id) {
        try {
            const [project_rows, projects_fields] = await connection.promise().query(`SELECT * FROM Projects WHERE UserId = ? AND ProjectID = ?;`, [user_id, project_id]);

            if (project_rows[0]) {
                if (project_rows[0].ProjectID == project_id) {
                    const [rows, fields] = await connection.promise().query(`SELECT * FROM Events WHERE ProjectID = ?;`, [project_id]);
                    return rows;
                }
            }
            return [];

        } catch (error) {
            console.error("Error retrieving events: ", error);
            return {
                success: false,
                code: 201,
                error: "Invalid request"
            };
        }
    }
}

module.exports.get_cube = async function (cube_mac, cube_user_id) {
    try {
        const [cubes_rows, cubes_fields] = await connection.promise().query(`SELECT * FROM Cubes WHERE Mac = ? AND Cube_users_ID = ?;`, [cube_mac, cube_user_id]);

        return cubes_rows[0];
    } catch (error) {
        console.error("Error retrieving cube: ", error);
        return {
            success: false,
            code: 201,
            error: "Invalid request"
        };
    }
}
