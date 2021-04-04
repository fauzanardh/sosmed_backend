import { api_error_code, http_status } from '../const/status';
import rClient from '../redis/rClient';
import { pool as dbPool } from '../db/dbPool';
import { Request, Response } from "express";

// Used to create a new test table
export const create = (req: Request, res: Response) => {
    const createTestQuery = `CREATE TABLE IF NOT EXISTS test
    (id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_on DATE NOT NULL)`;
    dbPool.query(createTestQuery, null)
        .then((r) => {
            res.json({
                error_code: api_error_code.no_error,
                message: "Tables created!",
                data: {
                    return_value: r,
                },
            });
        })
        .catch((e) => {
            res.status(http_status.error).json({
                error_code: api_error_code.sql_error,
                message: "Failed creating the tables!",
                data: {
                    return_value: e,
                },
            });
        });
}

// Used to drop the current test table
export const drop = (req: Request, res: Response) => {
    const dropTestQuery = 'DROP TABLE IF EXISTS test';
    dbPool.query(dropTestQuery, null)
        .then((_) => {
            const stream = rClient.client.scanStream({match: 'table_test_id_*'});
            const deleted_key: string[] = [];
            stream.on('data', (resultKeys) => {
                resultKeys.forEach((r: string) => {
                    rClient.client.del(r);
                    deleted_key.push(r);
                });
            });
            stream.on('end', () => {
                res.json({
                    error_code: api_error_code.no_error,
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
            res.status(http_status.error).json({
                error_code: api_error_code.sql_error,
                message: "Failed dropping the tables!",
                data: {
                    detail: e.detail,
                },
            });
        });
}

export default {
    create,
    drop,
}
