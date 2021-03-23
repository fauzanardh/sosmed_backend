import Redis from "ioredis";

export const client = new Redis(Number(process.env.REDIS_PORT), "redis");

export interface RedisJobs {
    using_cache: boolean,
    jobs: string
}

// This function is a helper function for retrieving data from the redis cache
// returns a promise object
export const get = (key: string) => {
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

export default {
    client,
    get
}
