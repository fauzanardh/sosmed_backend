const status = require('../const/status');
const rClient = require('../redis/rClient');
const dbConnection = require('../db/dbConnection');

// Used to create a new test table
const create = (req, res) => {
    dbConnection.createTestTable()
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
    dbConnection.dropTestTable()
        .then((_) => {
            // Creating a new scanStream to retrieve all keys that match the search_string
            // the results of that will be used to delete all of the matching keys stored inside the cache
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
        .catch((err) => {
            res.status(status.http_status.error).json({
                error_code: status.api_error_code.sql_error,
                message: "Failed dropping the tables!",
                data: {
                    detail: err.detail,
                },
            });
        });
}

module.exports = {
    create,
    drop,
}
