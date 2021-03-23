const dbPool = require("./dbPool");

// This function is a helper function for retrieving data from the database
// returns a promise object
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
