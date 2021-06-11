import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {api_error_code} from "../const/status";
import {parseNotification} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Notification} from "../models/entity/Notification";
import {purgeNotificationCache} from "../utils/redis";

export const getAll = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Notification);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const notifications = await repository.find({
            relations: ["from", "to"],
            where: {
                to: {uuid: uuid},
                isRead: false,
            },
            cache: {
                id: `table_notification_get_own_${uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Notifications fetched successfully.",
            data: parseNotification(notifications),
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const read = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Notification);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const notification = await repository.findOneOrFail({
            relations: ["from", "to"],
            where: {
                uuid: req.params.uuid,
                to: {uuid: uuid},
                isRead: false,
            },
            cache: {
                id: `table_notification_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        notification.isRead = true
        await repository.save(notification);
        await purgeNotificationCache();
        res.json({
            errorCode: api_error_code.no_error,
            message: "Notification read.",
            data: {}
        });
    } catch (e) {
        handleErrors(e, res);
    }
}
