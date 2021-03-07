const express = require('express');
const router = express.Router();

const status = require('../helpers/status');
const dbConnection = require('../db/dbConnection');
const dbQuery = require('../db/dbQuery');
const rClient = require('../redis/rClient')

const moment = require('moment');

/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/

router.get('/', (req, res) => {
    res.render('index', { title: 'Sosmed' });
});

/* GET home page. */
router.get('/test', (req, res) => {
    res.json({
        error_code: status.api_error_code.no_error,
        message: "Success",
        data: {
            description: "Test API For Backend!",
        },
    });
});

router.get('/test/create_table', (req, res) => {
    dbConnection.createTestTable()
        .then(r => {
            res.json({
                error_code: status.api_error_code.no_error,
                message: "Tables created!",
                data: {
                    return_value: r,
                },
            });
        })
        .catch(err => {
            res.status(status.http_status.error).json({
                error_code: status.api_error_code.sql_error,
                message: "Failed creating the tables!",
                data: {
                    return_value: err,
                },
            });
        });
});

router.get('/test/drop_table', (req, res) => {
    dbConnection.dropTestTable()
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
        .catch((err) => {
            res.status(status.http_status.error).json({
                error_code: status.api_error_code.sql_error,
                message: "Failed dropping the tables!",
                data: {
                    detail: err.detail,
                },
            });
        });
});

router.get('/test/add_test', (req, res) => {
    if (req.query.name && req.query.description) {
        const addTestQuery = `INSERT INTO
        test(name, description, created_on)
        VALUES($1, $2, $3)
        returning *`;
        const values = [
            req.query.name,
            req.query.description,
            moment(new Date()),
        ];
        dbQuery.query(addTestQuery, values)
            .then((r) => {
                res.json({
                    error_code: status.api_error_code.no_error,
                    message: "Successfully added a new test.",
                    data: {
                        id: r.rows[0].id,
                        name: r.rows[0].name,
                        description: r.rows[0].description,
                        created_on: r.rows[0].created_on,
                    },
                });
            })
            .catch((err) => {
                res.status(status.http_status.error).json({
                   error_code: status.api_error_code.sql_error,
                   message: "Failed to add a new test.",
                   data: {
                       severity: err.severity,
                       detail: status.postgres_error_codes[err.code],
                   },
                });
            });
    } else {
        res.status(status.http_status.error).json({
           error_code: status.api_error_code.no_params,
           message: "Fix the params!",
            data: {
                name: req.query.name ? "exists" : "not found",
                description: req.query.description ? "exists" : "not found",
            }
        });
    }
});

router.get('/test/get_test', (req, res) => {
    if (req.query.id) {
        const key = `table_test_id_${req.query.id}`;
        rClient.get(key)
            .then((r) => {
                if (r.using_cache) {
                    res.json({
                        error_code: status.api_error_code.no_error,
                        message: "Successfully getting the test with redis.",
                        data: {
                            tests: JSON.parse(r.jobs),
                        }
                    });
                } else {
                    const getTestQuery = `SELECT * FROM test WHERE id = $1`;
                    const values = [
                        req.query.id
                    ];
                    dbQuery.query(getTestQuery, values)
                        .then((r) => {
                            rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                            res.json({
                                error_code: status.api_error_code.no_error,
                                message: "Successfully getting the test.",
                                data: {
                                    tests: r.rows,
                                }
                            });
                        })
                        .catch((err) => {
                            res.status(status.http_status.error).json({
                                error_code: status.api_error_code.sql_error,
                                message: "Failed to get the test.",
                                data: {
                                    severity: err.severity,
                                    detail: status.postgres_error_codes[err.code],
                                },
                            });
                        });
                }
            })
            .catch((err) => {
                res.status(status.http_status.error).json({
                    error_code: status.api_error_code.redis_error,
                    message: "Redis went AWOL",
                    data: {
                        return_value: err,
                    }
                });
            });
    } else {
        res.status(status.http_status.error).json({
            error_code: status.api_error_code.no_params,
            message: "Fix the params!",
            data: {
                id: req.query.id ? "exists" : "not found",
            }
        });
    }
});

module.exports = router;
