import moment from 'moment';

import {api_error_code, http_status, postgres_error_codes} from '../const/status';
import rClient from '../redis/rClient';
import { RedisJobs } from '../redis/rClient';
import { pool as dbPool } from '../db/dbPool';
import { Request, Response } from "express";

// This functions is a helper function to update the redis cache that will be used in `getAll`
// returns a promise object
const updateTestGetAllRedis = () => {
    const key = "table_test_id_all";
    const getTestQuery = `SELECT * FROM test`;
    return new Promise((resolve, reject) => {
        dbPool.query(getTestQuery, null)
            .then((r: any) => {
                rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                resolve(r);
            })
            .catch((e) => {
                reject(e);
            });
    });
};

// This functions is a helper function to update the redis cache that will be used in `getOne`
// it only updates one key that's provided by the argument
// returns a promise object
const updateTestGetOneRedis = (test_id: string) => {
    const key = `table_test_id_${test_id}`;
    const getTestQuery = `SELECT * FROM test WHERE id = $1`;
    const values = [
        test_id
    ];
    return new Promise((resolve, reject) => {
        dbPool.query(getTestQuery, values)
            .then((r: any) => {
                rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                resolve(r);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

// Used to get all of the columns from the table
export const getTests = (req: Request, res: Response) => {
    const key = "table_test_id_all";
    rClient.get(key)
        .then((r: RedisJobs) => {
            if (r.using_cache) {
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Successfully getting the tests with redis.",
                    data: {
                        tests: JSON.parse(r.jobs),
                    }
                });
            } else {
                const getTestQuery = `SELECT * FROM test`;
                dbPool.query(getTestQuery, null)
                    .then((r: any) => {
                        rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                        res.json({
                            error_code: api_error_code.no_error,
                            message: "Successfully getting the test.",
                            data: {
                                tests: r.rows,
                            }
                        });
                    })
                    .catch((e) => {
                        res.status(http_status.error).json({
                            error_code: api_error_code.sql_error,
                            message: "Failed to get the test.",
                            data: {
                                severity: e.severity,
                                detail: postgres_error_codes[e.code],
                            },
                        });
                    });
            }
        })
        .catch((e) => {
            res.status(http_status.error).json({
                error_code: api_error_code.redis_error,
                message: "Redis went AWOL when retrieving the entry.",
                data: {
                    return_value: e,
                }
            });
        });
};

// Used to get one column from the table based on the column id
export const getTestById = (req: Request, res: Response) => {
    const key = `table_test_id_${req.params.id}`;
    rClient.get(key)
        .then((r: RedisJobs) => {
            if (r.using_cache) {
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Successfully getting the test with redis.",
                    data: {
                        tests: JSON.parse(r.jobs),
                    }
                });
            } else {
                const getTestQuery = `SELECT * FROM test WHERE id = $1`;
                const values = [
                    req.params.id
                ];
                dbPool.query(getTestQuery, values)
                    .then((r: any) => {
                        if (r.rows.length === 0) {
                            res.status(http_status.error).json({
                                error_code: api_error_code.sql_error,
                                message: "Failed to get the test.",
                                data: {
                                    severity: "NOT_FOUND",
                                    detail: `test with id ${req.params.id} not found.`,
                                },
                            });
                        } else {
                            rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                            res.json({
                                error_code: api_error_code.no_error,
                                message: "Successfully getting the test.",
                                data: {
                                    tests: r.rows,
                                }
                            });
                        }
                    })
                    .catch((e) => {
                        res.status(http_status.error).json({
                            error_code: api_error_code.sql_error,
                            message: "Failed to get the test.",
                            data: {
                                severity: e.severity,
                                detail: postgres_error_codes[e.code],
                            },
                        });
                    });
            }
        })
        .catch((e) => {
            res.status(http_status.error).json({
                error_code: api_error_code.redis_error,
                message: "Redis went AWOL when retrieving the entry.",
                data: {
                    return_value: e,
                }
            });
        });
};

// Used to create a new column
export const createTest = (req: Request, res: Response) => {
    if (req.body.name && req.body.description) {
        const addTestQuery = `INSERT INTO
        test(name, description, created_on)
        VALUES($1, $2, $3)
        returning *`;
        const values = [
            req.body.name,
            req.body.description,
            moment(new Date()),
        ];
        dbPool.query(addTestQuery, values)
            .then((r: any) => {
                updateTestGetAllRedis()
                    .then((_) => {
                        const key = `table_test_id_${r.rows[0].id}`;
                        rClient.client.set(key, JSON.stringify(r.rows), "EX", 600);
                        res.json({
                            error_code: api_error_code.no_error,
                            message: "Successfully added a new test.",
                            data: {
                                id: r.rows[0].id,
                                name: r.rows[0].name,
                                description: r.rows[0].description,
                                created_on: r.rows[0].created_on,
                            },
                        });
                    })
                    .catch((e) => {
                        res.status(http_status.error).json({
                            error_code: api_error_code.redis_error,
                            message: "Redis went AWOL when updating the table cache.",
                            data: {
                                return_value: e,
                            }
                        });
                    });
            })
            .catch((e) => {
                console.log(e);
                res.status(http_status.error).json({
                    error_code: api_error_code.sql_error,
                    message: "Failed to add a new test.",
                    data: {
                        severity: e.severity,
                        detail: postgres_error_codes[e.code] || e.detail,
                    },
                });
            });
    } else {
        res.status(http_status.error).json({
            error_code: api_error_code.no_params,
            message: "Fix the params!",
            data: {
                name: req.body.name ? "exists" : "not found",
                description: req.body.description ? "exists" : "not found",
            }
        });
    }
};

// Used to update the column using 'PUT' http method
export const updatePutTest = (req: Request, res: Response) => {
    if (req.params.id && req.body.name && req.body.description) {
        const updateTestQuery = `UPDATE test
        SET name = $1, description = $2
        WHERE id = $3`;
        const values = [
            req.body.name,
            req.body.description,
            req.params.id,
        ];
        dbPool.query(updateTestQuery, values)
            .then((_) => {
                updateTestGetAllRedis()
                    .then((_) => {
                        return updateTestGetOneRedis(req.params.id)
                    })
                    .then((_) => {
                        res.json({
                            error_code: api_error_code.no_error,
                            message: "Successfully updated the test.",
                            data: {},
                        });
                    })
                    .catch((e) => {
                        res.status(http_status.error).json({
                            error_code: api_error_code.redis_error,
                            message: "Redis went AWOL",
                            data: {
                                return_value: e,
                            }
                        });
                    });
            })
            .catch((e) => {
                console.log(e);
                res.status(http_status.error).json({
                    error_code: api_error_code.sql_error,
                    message: `Failed to update the test with id ${req.params.id}.`,
                    data: {
                        severity: e.severity,
                        detail: postgres_error_codes[e.code] || e.detail,
                    },
                });
            });
    } else {
        res.status(http_status.error).json({
            error_code: api_error_code.no_params,
            message: "Fix the params!",
            data: {
                id: req.params.id ? "exist": "not found",
                name: req.body.name ? "exists" : "not found",
                description: req.body.description ? "exists" : "not found",
            }
        });
    }
};

// Used to update the column using 'PATCH' http method
export const updatePatchTest = (req: Request, res: Response) => {
    if (req.params.id && (req.body.name || req.body.description)) {
        let updateTestQuery;
        let warning;
        const values = [];
        if (!req.body.name) {
            updateTestQuery = `UPDATE test
            SET description = $1
            WHERE id = $2`;
            values.push(req.body.description);
            values.push(req.params.id);
        } else if (!req.body.description) {
            updateTestQuery = `UPDATE test
            SET name = $1
            WHERE id = $2`;
            values.push(req.body.name);
            values.push(req.params.id);
        } else {
            updateTestQuery = `UPDATE test
            SET name = $1, description = $2
            WHERE id = $3`;
            values.push(req.body.name);
            values.push(req.body.description);
            values.push(req.params.id);
            warning = "Consider using PUT when you're supplying the entire entity."
        }
        dbPool.query(updateTestQuery, values)
            .then((_) => {
                updateTestGetAllRedis()
                    .then((_) => {
                        return updateTestGetOneRedis(req.params.id)
                    })
                    .then((_) => {
                        res.json({
                            error_code: api_error_code.no_error,
                            message: "Successfully updated the test.",
                            data: {
                                warning: warning,
                            },
                        });
                    })
                    .catch((e) => {
                        res.status(http_status.error).json({
                            error_code: api_error_code.redis_error,
                            message: "Redis went AWOL.",
                            data: {
                                return_value: e,
                            }
                        });
                    });
            })
            .catch((e) => {
                console.log(e);
                res.status(http_status.error).json({
                    error_code: api_error_code.sql_error,
                    message: `Failed to update the test with id ${req.params.id}.`,
                    data: {
                        severity: e.severity,
                        detail: postgres_error_codes[e.code] || e.detail,
                    },
                });
            });
    } else {
        res.status(http_status.error).json({
            error_code: api_error_code.no_params,
            message: "Fix the params!",
            data: {
                id: req.params.id ? "exist": "not found",
                name: req.body.name ? "exists" : "not found",
                description: req.body.description ? "exists" : "not found",
            }
        });
    }
};

module.exports = {
    getTests,
    getTestById,
    createTest,
    updatePutTest,
    updatePatchTest
}
