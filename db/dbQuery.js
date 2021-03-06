const dbPool = require("./dbPool");

const query = (queryText, params) => {
    return new Promise((resolve, reject) => {
        dbPool.pool.query(queryText, params)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

module.exports = {
    query,
}
