import pg from 'pg';

export const pool = new pg.Pool();

pool.on('connect', () => {
    console.log("Connected to the DB!")
});

pool.on('remove', () => {
    console.log("Client removed!")
});

export default {
    pool,
}