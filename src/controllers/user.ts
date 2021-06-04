import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {ILike} from "typeorm";
import {User} from '../models/entity/User';
import {getConnection} from "../db/connection";
import {api_error_code, http_status, postgres_error_codes} from "../const/status";
import {client as rClient} from "../redis/rClient";
import {ValidationError} from "class-validator";

const removeUserCache = async () => {
    const stream = rClient.scanStream({match: 'table_user_*'})
    stream.on('data', (keys) => {
        keys.forEach((key) => {
            rClient.del(key);
        });
    });
}

const parseUsers = (users: User[]) => {
    const returnVal = [];
    users.forEach((user: User) => {
        const followers = [];
        user.followers.forEach((_follower: User) => {
            followers.push({
                uuid: _follower.uuid,
                name: _follower.name,
            });
        });
        const following = [];
        user.following.forEach((_following: User) => {
            following.push({
                uuid: _following.uuid,
                name: _following.name,
            });
        });
        returnVal.push({
            uuid: user.uuid,
            name: user.name,
            username: user.username,
            bio: user.bio,
            profilePicturePath: user.profilePicturePath,
            followers: followers,
            following: following,
        });
    });
    return returnVal;
}

export const createUser = async (req: Request, res: Response) => {
    if (req.body.name && req.body.username && req.body.password) {
        try {
            const repository = getConnection().getRepository(User);
            const newUser = new User();
            newUser.name = req.body.name;
            newUser.username = req.body.username;
            const salt = await bcrypt.genSalt(12);
            newUser.password = await bcrypt.hash(req.body.password, salt);
            await repository.save(newUser);
            await removeUserCache();
            res.json({
                error_code: api_error_code.no_error,
                message: "Successfully added a new user.",
                data: {
                    id: newUser.uuid,
                    name: newUser.username,
                },
            });
        } catch (e) {
            if (e instanceof Array) {
                const constraints = [];
                e.forEach((_e) => {
                    if (_e instanceof ValidationError) {
                        constraints.push({property: _e.property, constraint: _e.constraints})
                    }
                });
                res.status(http_status.bad).json({
                    error_code: api_error_code.validation_error,
                    message: "Something went wrong when validating the input.",
                    data: {
                        error_name: "ValidationError",
                        error_detail: constraints
                    }
                });
            } else {
                res.status(http_status.error).json({
                    error_code: api_error_code.sql_error,
                    message: "Something went wrong.",
                    data: {
                        error_name: e.name,
                        error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
                    }
                });
            }
        }
    } else {
        res.status(http_status.bad).json({
            error_code: api_error_code.no_params,
            message: "Fix the required params!",
            data: {
                name: req.body.name ? "exists" : "not found",
                username: req.body.username ? "exists" : "not found",
                password: req.body.password ? "exists" : "not found",
            }
        });
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
                milliseconds: 300000
            }
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Users fetched successfully.",
            data: parseUsers(users)
        });
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.unknown_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

export const getOwnUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const user = await repository.findOneOrFail({
            relations: ["following", "followers"],
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_own_${uuid}`,
                milliseconds: 300000
            }
        });
        const followers = [];
        user.followers.forEach((_follower: User) => {
            followers.push({
                uuid: _follower.uuid,
                name: _follower.name,
            });
        });
        const following = [];
        user.following.forEach((_following: User) => {
            following.push({
                uuid: _following.uuid,
                name: _following.name,
            });
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "User fetched successfully.",
            data: {
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicturePath: user.profilePicturePath,
                followers: followers,
                following: following,
            }
        });
    } catch (e) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong when querying the data.",
            data: {
                error_name: e.name,
                error_detail: "User not found.",
            }
        });
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
                milliseconds: 300000
            }
        });
        const followers = [];
        user.followers.forEach((_follower: User) => {
            followers.push({
                uuid: _follower.uuid,
                name: _follower.name,
            });
        });
        const following = [];
        user.following.forEach((_following: User) => {
            following.push({
                uuid: _following.uuid,
                name: _following.name,
            });
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "User fetched successfully.",
            data: {
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePicturePath: user.profilePicturePath,
                followers: followers,
                following: following
            }
        });
    } catch (e) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong when querying the data.",
            data: {
                error_name: e.name,
                error_detail: "User not found.",
            }
        });
    }
}

export const searchUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100);
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        const users = await repository.find({
            relations: ["following", "followers"],
            where: [
                {name: ILike(`%${req.params.searchString}%`)},
                {username: ILike(`%${req.params.searchString}%`)}
            ],
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_user_search_${req.params.searchString}_${limit}_${page}`,
                milliseconds: 300000
            }
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Users fetched successfully.",
            data: parseUsers(users)
        });
    } catch (e) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong when querying the data.",
            data: {
                error_name: e.name,
                error_detail: "User not found.",
            }
        });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const user = await repository.findOneOrFail({uuid: req.user.uuid});
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
                    await removeUserCache();
                    res.json({
                        error_code: api_error_code.no_error,
                        message: "Updated successfully.",
                        data: {
                            uuid: user.uuid,
                            name: user.name,
                            username: user.username,
                            bio: user.bio,
                            profilePicturePath: user.profilePicturePath,
                        }
                    });
                }
            } else {
                res.json({
                    error_code: api_error_code.auth_error,
                    message: "Wrong current password!",
                    data: {}
                });
            }
        } else {
            res.json({
                error_code: api_error_code.auth_error,
                message: "Current password is not provided!",
                data: {}
            });
        }

    } catch (e) {
        if (e instanceof Array) {
            const constraints = [];
            e.forEach((_e) => {
                if (_e instanceof ValidationError) {
                    constraints.push({property: _e.property, constraint: _e.constraints})
                }
            });
            res.status(http_status.bad).json({
                error_code: api_error_code.validation_error,
                message: "Something went wrong when validating the input.",
                data: {
                    error_name: "ValidationError",
                    error_detail: constraints
                }
            });
        } else {
            res.status(http_status.error).json({
                error_code: api_error_code.sql_error,
                message: "Something went wrong.",
                data: {
                    error_name: e.name,
                    error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
                }
            });
        }
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        await repository.delete(req.user.uuid);
        await removeUserCache();
        res.json({
            error_code: api_error_code.no_error,
            message: "User deleted successfully.",
            data: {}
        });
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
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
                error_code: api_error_code.validation_error,
                message: "Can't follow yourself.",
                data: {}
            });
        } else {
            const userFrom = await repository.findOneOrFail({
                relations: ["following", "followers"],
                where: {uuid: uuid},
                cache: {
                    id: `table_user_get_uuid_${uuid}`,
                    milliseconds: 300000
                }
            });
            const userTo = await repository.findOneOrFail({
                relations: ["following", "followers"],
                where: {uuid: req.params.uuid},
                cache: {
                    id: `table_user_get_uuid_${req.params.uuid}`,
                    milliseconds: 300000
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
                    await removeUserCache();
                    res.json({
                        error_code: api_error_code.no_error,
                        message: "User successfully followed.",
                        data: {}
                    });
                } else {
                    res.json({
                        error_code: api_error_code.no_error,
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
                    await removeUserCache();
                    res.json({
                        error_code: api_error_code.no_error,
                        message: "User successfully unfollowed.",
                        data: {}
                    });
                } else {
                    res.json({
                        error_code: api_error_code.no_error,
                        message: "User not followed.",
                        data: {}
                    });
                }
            }
        }
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

