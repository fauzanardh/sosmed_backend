import Redis from "ioredis";

export const client = new Redis(Number(process.env.REDIS_PORT), "redis");
