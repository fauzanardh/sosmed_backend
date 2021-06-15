import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {api_error_code, http_status, notification_type} from "../const/status";
import {Post} from "../models/entity/Post";
import {User} from "../models/entity/User";
import {purgeReplyCache, purgePostCache, purgeNotificationCache, purgeUserCache} from "../utils/redis";
import {parseReplies, parseLikedBy, parsePosts} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Notification} from "../models/entity/Notification";

export const createPost = async (req: Request, res: Response) => {
    try {
        if (req.body.dataId) {
            try {
                const userRepository = getConnection().getRepository(User);
                const postRepository = getConnection().getRepository(Post);
                // ignoring the error here since the typing doesn't work
                // @ts-ignore
                const uuid = req.user.uuid;
                const user = await userRepository.findOneOrFail({
                    where: {uuid: uuid},
                    cache: {
                        id: `table_user_get_own_${uuid}`,
                        milliseconds: 25000
                    }
                });
                const newPost = new Post();
                newPost.dataId = req.body.dataId;
                newPost.author = user;
                if (req.body.text) newPost.text = req.body.text;
                await postRepository.save(newPost);
                await purgeReplyCache()
                await purgePostCache()
                res.json({
                    errorCode: api_error_code.no_error,
                    message: "Successfully added a new test.",
                    data: {
                        postId: newPost.uuid,
                        authorId: newPost.author.uuid,
                        dataId: newPost.dataId,
                        text: newPost.text,
                    },
                });
            } catch (e) {
                handleErrors(e, res);
            }
        } else {
            res.status(http_status.bad).json({
                errorCode: api_error_code.no_params,
                message: "Fix the required params!",
                data: {
                    dataId: req.body.dataId ? "exists" : "not found",
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getOwnPosts = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100)
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const posts = await repository.find({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {author: {uuid: uuid}},
            order: {
                createdAt: "DESC",
            },
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_post_get_own_${uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                posts: parsePosts(posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getPostsByUserUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100)
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        const posts = await repository.find({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {author: {uuid: req.params.uuid}},
            order: {
                createdAt: "DESC",
            },
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_post_get_user_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                posts: parsePosts(posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getPostsByUsername = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100)
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        const posts = await repository.find({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {author: {username: req.params.username}},
            order: {
                createdAt: "DESC",
            },
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_post_get_user_username_${req.params.username}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                posts: parsePosts(posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getPostByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        const post = await repository.findOneOrFail({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {uuid: req.params.uuid},
            order: {
                createdAt: "DESC",
            },
            cache: {
                id: `table_post_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                postId: post.uuid,
                dataId: post.dataId,
                authorId: post.author.uuid,
                text: post.text,
                likedBy: parseLikedBy(post.likedBy),
                replies: parseReplies(post.replies),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const likePost = async (req: Request, res: Response) => {
    try {
        const userRepository = getConnection().getRepository(User);
        const postRepository = getConnection().getRepository(Post);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const user = await userRepository.findOneOrFail({
            relations: ["sendNotifications", "recvNotifications"],
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_uuid_${uuid}`,
                milliseconds: 25000
            }
        });
        const post = await postRepository.findOneOrFail({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_post_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        const index = post.likedBy.map((_u: User) => {
            return _u.uuid
        }).indexOf(user.uuid);
        if (req.body.likeStatus) {
            if (index === -1) {
                post.likedBy.push(user);
                await postRepository.save(post);
                await purgeReplyCache();
                await purgePostCache();
                const notificationRepository = getConnection().getRepository(Notification);
                const newNotification = new Notification();
                const userTo = await userRepository.findOneOrFail({
                    relations: ["sendNotifications", "recvNotifications"],
                    where: {uuid: post.author.uuid},
                    cache: {
                        id: `table_user_get_uuid_${post.author.uuid}`,
                        milliseconds: 25000
                    }
                });
                newNotification.to = userTo;
                newNotification.from = user;
                newNotification.type = notification_type.PostLiked;
                newNotification.message = `Your post has been liked by ${user.name}`;
                newNotification.uri = `/posts/${post.uuid}`;
                await notificationRepository.save(newNotification);
                user.sendNotifications.push(newNotification);
                userTo.recvNotifications.push(newNotification);
                await userRepository.save(user);
                await userRepository.save(userTo);
                await purgeNotificationCache();
                await purgeUserCache();
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
                post.likedBy.splice(index, 1);
                await postRepository.save(post);
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

export const deletePost = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        const post = await repository.findOneOrFail({
            relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_post_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        if (uuid === post.author.uuid) {
            await repository.delete(post);
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
