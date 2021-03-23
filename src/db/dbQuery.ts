import { pool } from './dbPool'

// This function is a helper function for retrieving data from the database
// returns a promise object
export const query = (queryText: string, params: string[] | null) => {
    return new Promise((resolve, reject) => {
        pool.query(queryText, params)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

export default {
    query,
}
