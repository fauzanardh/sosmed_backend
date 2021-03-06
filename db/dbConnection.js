const dbPool = require("./dbPool");
const dbQuery = require("./dbQuery");

dbPool.pool.on('connect', () => {
    console.log("Connected to the DB!")
});

const createTestTable = () => {
    const createTestQuery = `CREATE TABLE IF NOT EXISTS test
    (id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_on DATE NOT NULL)`;

    return new Promise((resolve, reject) => {
        dbQuery.query(createTestQuery)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            });
    });
};

const dropTestTable = () => {
    const dropTestQuery = 'DROP TABLE IF EXISTS test';
    return new Promise((resolve, reject) => {
        dbQuery.query(dropTestQuery)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            });
    });
};

dbPool.pool.on('remove', () => {
    console.log("Client removed!")
});

module.exports = {
    createTestTable,
    dropTestTable,
}
