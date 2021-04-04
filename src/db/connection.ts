import 'reflect-metadata';
import {createConnection, getConnection as getConn} from "typeorm";

export const initConnection = async () => {
    try {
        await createConnection({
            type: "postgres",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            synchronize: true,
            logging: false,
            cache: {
                type: "ioredis",
                options: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT, 10)
                }
            },
            entities: [
                "src/models/entity/**/*.ts"
            ],
            migrations: [
                "src/models/migration/**/*.ts"
            ],
            subscribers: [
                "src/models/subscriber/**/*.ts"
            ]
        });
    } catch (e) {
        throw e;
    }
}

export const getConnection = () => {
    return getConn();
}
