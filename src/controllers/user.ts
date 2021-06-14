import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {User} from '../models/entity/User';
import {getConnection} from "../db/connection";
import {api_error_code, http_status, notification_type} from "../const/status";
import {purgeNotificationCache, purgeUserCache} from "../utils/redis";
import {parseFollow, parsePosts, parseUsers} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Notification} from "../models/entity/Notification";

export const createUser = async (req: Request, res: Response) => {
    try {
        if (req.body.name && req.body.username && req.body.password) {
            const repository = getConnection().getRepository(User);
            const newUser = new User();
            newUser.name = req.body.name;
            newUser.username = req.body.username;
            const salt = await bcrypt.genSalt(12);
            newUser.password = await bcrypt.hash(req.body.password, salt);
            await repository.save(newUser);
            await purgeUserCache();
            res.json({
                errorCode: api_error_code.no_error,
                message: "Successfully added a new user.",
                data: {
                    id: newUser.uuid,
                    name: newUser.username,
                },
            });
        } else {
            res.status(http_status.bad).json({
                errorCode: api_error_code.no_params,
                message: "Fix the required params!",
                data: {
                    name: req.body.name ? "exists" : "not found",
                    username: req.body.username ? "exists" : "not found",
                    password: req.body.password ? "exists" : "not found",
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100);
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        const users = await repository.find({
            relations: ["following", "followers"],
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_user_all_users_${limit}_${page}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "Users fetched successfully.",
            data: parseUsers(users)
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getOwnUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const user = await repository.findOneOrFail({
            relations: ["following", "followers", "posts", "posts.likedBy"],
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_own_${uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "User fetched successfully.",
            data: {
                id: user.uuid,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePictureDataId: user.profilePictureDataId,
                followers: parseFollow(user.followers),
                following: parseFollow(user.following),
                posts: parsePosts(user.posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getUserByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        const user = await repository.findOneOrFail({
            relations: ["following", "followers"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_user_get_uuid_${req.params.uuid}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "User fetched successfully.",
            data: {
                id: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePictureDataId: user.profilePictureDataId,
                followers: parseFollow(user.followers),
                following: parseFollow(user.following),
                posts: parsePosts(user.posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getUserByUsername = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        const user = await repository.findOneOrFail({
            relations: ["following", "followers"],
            where: {username: req.params.username},
            cache: {
                id: `table_user_get_username_${req.params.username}`,
                milliseconds: 25000
            }
        });
        res.json({
            errorCode: api_error_code.no_error,
            message: "User fetched successfully.",
            data: {
                id: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePictureDataId: user.profilePictureDataId,
                followers: parseFollow(user.followers),
                following: parseFollow(user.following),
                posts: parsePosts(user.posts),
            }
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const user = await repository.findOneOrFail({
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_uuid_${uuid}`,
                milliseconds: 25000
            },
        });
        if (req.body.currentPassword) {
            const isPasswordValid = await bcrypt.compare(req.body.currentPassword, user.password);
            if (isPasswordValid) {
                if (req.body.name) user.name = req.body.name;
                if (req.body.email) user.email = req.body.email;
                if (req.body.bio) user.bio = req.body.bio
                if (req.body.newPassword) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(req.body.newPassword, salt);
                    await repository.save(user);
                    await purgeUserCache();
                    res.json({
                        errorCode: api_error_code.no_error,
                        message: "Updated successfully.",
                        data: {
                            id: user.uuid,
                            name: user.name,
                            username: user.username,
                            bio: user.bio,
                            profilePictureDataId: user.profilePictureDataId,
                        }
                    });
                }
            } else {
                res.json({
                    errorCode: api_error_code.auth_error,
                    message: "Wrong current password!",
                    data: {}
                });
            }
        } else {
            res.json({
                errorCode: api_error_code.auth_error,
                message: "Current password is not provided!",
                data: {}
            });
        }

    } catch (e) {
        handleErrors(e, res);
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        await repository.delete(req.user.uuid);
        await purgeUserCache();
        res.json({
            errorCode: api_error_code.no_error,
            message: "User deleted successfully.",
            data: {}
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const followUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        if (uuid === req.params.uuid) {
            res.status(http_status.error).json({
                errorCode: api_error_code.validation_error,
                message: "Can't follow yourself.",
                data: {}
            });
        } else {
            const userFrom = await repository.findOneOrFail({
                relations: ["following", "followers"],
                where: {uuid: uuid},
                cache: {
                    id: `table_user_get_uuid_${uuid}`,
                    milliseconds: 25000
                }
            });
            const userTo = await repository.findOneOrFail({
                relations: ["following", "followers"],
                where: {uuid: req.params.uuid},
                cache: {
                    id: `table_user_get_uuid_${req.params.uuid}`,
                    milliseconds: 25000
                }
            });
            if (req.body.followStatus) {
                const indexFrom = userFrom.following.map((_u: User) => {
                    return _u.uuid
                }).indexOf(userTo.uuid);
                const indexTo = userTo.followers.map((_u: User) => {
                    return _u.uuid
                }).indexOf(userFrom.uuid);
                if (indexFrom === -1 && indexTo === -1) {
                    userFrom.following.push(userTo);
                    userTo.followers.push(userFrom);
                    await repository.save(userTo);
                    await repository.save(userFrom);
                    await purgeUserCache();
                    const notificationRepository = getConnection().getRepository(Notification);
                    const newNotification = new Notification();
                    newNotification.from = userFrom;
                    newNotification.to = userTo;
                    newNotification.type = notification_type.NewFollower;
                    newNotification.message = `You have been followed by ${userFrom.name}`;
                    newNotification.uuidToData = userTo.uuid;
                    await notificationRepository.save(newNotification);
                    await purgeNotificationCache();
                    res.json({
                        errorCode: api_error_code.no_error,
                        message: "User successfully followed.",
                        data: {}
                    });
                } else {
                    res.json({
                        errorCode: api_error_code.no_error,
                        message: "User already followed.",
                        data: {}
                    });
                }
            } else {
                const indexFrom = userFrom.following.map((_u: User) => {
                    return _u.uuid
                }).indexOf(userTo.uuid);
                const indexTo = userTo.followers.map((_u: User) => {
                    return _u.uuid
                }).indexOf(userFrom.uuid);
                console.log(indexFrom, indexTo);
                if (indexFrom !== -1 && indexTo !== -1) {
                    userFrom.following.splice(indexFrom, 1);
                    userTo.followers.splice(indexTo, 1);
                    await repository.save(userFrom);
                    await repository.save(userTo);
                    await purgeUserCache();
                    res.json({
                        errorCode: api_error_code.no_error,
                        message: "User successfully unfollowed.",
                        data: {}
                    });
                } else {
                    res.json({
                        errorCode: api_error_code.no_error,
                        message: "User not followed.",
                        data: {}
                    });
                }
            }
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

