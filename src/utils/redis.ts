import {client as rClient} from "../redis/rClient";
import {getConnection} from "../db/connection";

export const purgeUserCache = () => {
    const stream = rClient.scanStream({match: 'table_user_*'})
    stream.on('data', (keys) => {
        getConnection().queryResultCache.remove(keys)
            .catch((err) => {
                console.warn(err);
            });
    });
}

export const purgePostCache = () => {
    const stream = rClient.scanStream({match: 'table_post_*'})
    stream.on('data', (keys) => {
        getConnection().queryResultCache.remove(keys)
            .catch((err) => {
                console.warn(err);
            });
    });
}

export const purgeReplyCache = () => {
    const stream = rClient.scanStream({match: 'table_reply_*'})
    stream.on('data', (keys) => {
        getConnection().queryResultCache.remove(keys)
            .catch((err) => {
                console.warn(err);
            });
    });
}

export const purgeNotificationCache = () => {
    const stream = rClient.scanStream({match: 'table_notification_*'})
    stream.on('data', (keys) => {
        getConnection().queryResultCache.remove(keys)
            .catch((err) => {
                console.warn(err);
            });
    });
}
