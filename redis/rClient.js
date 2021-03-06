const redis = require("ioredis");
const client = new redis(process.env.REDIS_PORT, "redis")

// const client = redis.createClient({
//     host: "redis",
//     port: process.env.REDIS_PORT
// })

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
