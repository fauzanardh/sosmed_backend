const dbQuery = require("./dbQuery");

// TODO: delete this file, it's useless

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

module.exports = {
    createTestTable,
    dropTestTable,
}
