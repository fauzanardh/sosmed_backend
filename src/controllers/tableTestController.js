const status = require('../const/status');
const rClient = require('../redis/rClient');
const dbQuery = require("../db/dbQuery");

// Used to create a new test table
const create = (req, res) => {
    const createTestQuery = `CREATE TABLE IF NOT EXISTS test
    (id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_on DATE NOT NULL)`;
    dbQuery.query(createTestQuery)
        .then((r) => {
            res.json({
                error_code: status.api_error_code.no_error,
                message: "Tables created!",
                data: {
                    return_value: r,
                },
            });
        })
        .catch((e) => {
            res.status(status.http_status.error).json({
                error_code: status.api_error_code.sql_error,
                message: "Failed creating the tables!",
                data: {
                    return_value: e,
                },
            });
        });
}

// Used to drop the current test table
const drop = (req, res) => {
    const dropTestQuery = 'DROP TABLE IF EXISTS test';
    dbQuery.query(dropTestQuery)
        .then((_) => {
            const stream = rClient.client.scanStream({match: 'table_test_id_*'});
            const deleted_key = [];
            stream.on('data', (resultKeys) => {
                resultKeys.forEach((r) => {
                    rClient.client.del(r);
                    deleted_key.push(r);
                });
            });
            stream.on('end', () => {
                res.json({
                    error_code: status.api_error_code.no_error,
                    message: "Tables dropped!",
                    data: {
                        redis: {
                            deleted_key: deleted_key,
                        }
                    },
                });
            });
        })
        .catch((e) => {
            res.status(status.http_status.error).json({
                error_code: status.api_error_code.sql_error,
                message: "Failed dropping the tables!",
                data: {
                    detail: e.detail,
                },
            });
        });
}

module.exports = {
    create,
    drop,
}
