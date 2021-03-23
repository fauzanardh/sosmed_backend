const redis = require("ioredis");
const client = new redis(process.env.REDIS_PORT, "redis")

// This function is a helper function for retrieving data from the redis cache
// returns a promise object
const get = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, jobs) => {
            if (err) reject(err);

            if (jobs) {
                resolve({using_cache: true, jobs: jobs});
            } else {
                resolve({using_cache: false, jobs: jobs});
            }
        });
    });
}

module.exports = {
    client,
    get
}
