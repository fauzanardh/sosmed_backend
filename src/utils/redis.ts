import {client as rClient} from "../redis/rClient";

export const removeUserCache = async () => {
    const stream = rClient.scanStream({match: 'table_user_*'})
    stream.on('data', (keys) => {
        keys.forEach((key) => {
            rClient.del(key);
        });
    });
}

export const removePostCache = async () => {
    const stream = rClient.scanStream({match: 'table_post_*'})
    stream.on('data', (keys) => {
        keys.forEach((key) => {
            rClient.del(key);
        });
    });
}
