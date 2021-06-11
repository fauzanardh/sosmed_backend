import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {api_error_code, http_status, notification_type} from "../const/status";
import {Reply} from "../models/entity/Reply";
import {Post} from "../models/entity/Post";
import {User} from "../models/entity/User";
import {purgeReplyCache, purgePostCache, purgeNotificationCache} from "../utils/redis";
import {parseLikedBy} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Notification} from "../models/entity/Notification";

export const createReply = async (req: Request, res: Response) => {
    try {
        if (req.body.parentPostId && (req.body.text || req.body.dataId)) {
            const postRepository = getConnection().getRepository(Post);
            const replyRepository = getConnection().getRepository(Reply);
            const userRepository = getConnection().getRepository(User);
            const parent = await postRepository.findOneOrFail({
                relations: ["author"],
                where: {uuid: req.body.parentPostId},
                cache: {
                    id: `table_post_get_uuid_${req.body.parentPostId}`,
                    milliseconds: 25000
                }
            });
            // ignoring the error here since the typing doesn't work
            // @ts-ignore
            const userId = req.user.uuid
            const user = await userRepository.findOneOrFail({
                where: {uuid: userId},
                cache: {
                    id: `table_user_get_own_${userId}`,
                    milliseconds: 25000
                }
            });
            const newReply = new Reply();
            newReply.author = user;
            newReply.parent = parent;
            if (req.body.dataId) newReply.dataId = req.body.dataId;
            if (req.body.text) newReply.text = req.body.text;
            await replyRepository.save(newReply);
            await purgeReplyCache();
            await purgePostCache();
            const notificationRepository = getConnection().getRepository(Notification);
            const newNotification = new Notification();
            newNotification.from = user;
            newNotification.to = await userRepository.findOneOrFail({
                where: {uuid: parent.author.uuid},
                cache: {
                    id: `table_user_get_uuid_${parent.author.uuid}`,
                    milliseconds: 25000
                }
            });
            newNotification.type = notification_type.NewReply;
            newNotification.message = `You have a new reply by ${user.name}`;
            newNotification.uuidToData = parent.uuid;
            await notificationRepository.save(newNotification);
            await purgeNotificationCache();
            res.json({
                errorCode: api_error_code.no_error,
                message: "Successfully added a new reply.",
                data: {
                    id: newReply.uuid,
                    parentId: newReply.parent.uuid,
                    dataId: newReply.dataId,
                    text: newReply.text,
                },
            });
        } else {
            let message = "";
            if (req.body.text || req.body.dataId) message += "Required at least one to be defined (text, dataId)! "
            res.status(http_status.bad).json({
                errorCode: api_error_code.no_params,
                message: message,
                data: {
                    parentPostId: req.body.parentPostId ? "exists" : "not found",
                    text: req.body.text ? "exists" : "not found",
                    dataId: req.body.dataId ? "exists" : "not found",
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getReplyByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Reply);
        const reply = await repository.findOneOrFail({
            relations: ["author", "likedBy", "parent"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_reply_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Reply fetched successfully.",
            data: {
                id: reply.uuid,
                parentId: reply.parent.uuid,
                dataId: reply.dataId,
                text: reply.text,
                likedBy: parseLikedBy(reply.likedBy),
            },
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const likeReply = async (req: Request, res: Response) => {
    try {
        const userRepository = getConnection().getRepository(User);
        const replyRepository = getConnection().getRepository(Reply);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const user = await userRepository.findOneOrFail({
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_uuid_${uuid}`,
                milliseconds: 25000
            }
        });
        const reply = await replyRepository.findOneOrFail({
            relations: ["author", "likedBy"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_reply_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        const index = reply.likedBy.map((_u: User) => {
            return _u.uuid
        }).indexOf(user.uuid);
        if (req.body.likeStatus) {
            if (index === -1) {
                reply.likedBy.push(user);
                await replyRepository.save(reply);
                await purgeReplyCache();
                await purgePostCache();
                const notificationRepository = getConnection().getRepository(Notification);
                const newNotification = new Notification();
                newNotification.from = user;
                newNotification.to = await userRepository.findOneOrFail({
                    where: {uuid: req.params.uuid},
                    cache: {
                        id: `table_user_get_uuid_${req.params.uuid}`,
                        milliseconds: 25000
                    }
                });
                newNotification.type = notification_type.ReplyLiked;
                newNotification.message = `Your reply has been liked by ${user.name}`;
                newNotification.uuidToData = reply.uuid;
                await notificationRepository.save(newNotification);
                await purgeNotificationCache();
                res.json({
                    errorCode: api_error_code.no_error,
                    message: "Liked successfully.",
                    data: {}
                });
            } else {
                res.json({
                    errorCode: api_error_code.no_error,
                    message: "Already liked successfully.",
                    data: {}
                });
            }
        } else {
            if (index !== -1) {
                reply.likedBy.splice(index, 1);
                await replyRepository.save(reply);
                await purgeReplyCache();
                await purgePostCache();
                res.json({
                    errorCode: api_error_code.no_error,
                    message: "Like removed successfully.",
                    data: {}
                });
            } else {
                res.json({
                    errorCode: api_error_code.no_error,
                    message: "Not liked.",
                    data: {}
                });
            }
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const deleteReply = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Reply);
        const reply = await repository.findOneOrFail({
            relations: ["author"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_reply_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        if (uuid === reply.author.uuid) {
            await repository.delete(reply);
            await purgeReplyCache()
            await purgePostCache()
            res.json({
                errorCode: api_error_code.no_error,
                message: "Post successfully deleted.",
                data: {}
            });
        } else {
            res.json({
                errorCode: api_error_code.auth_error,
                message: "This user don't have the permission to delete this post.",
                data: {}
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}
