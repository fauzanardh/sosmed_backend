import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {User} from '../models/entity/User';
import {getConnection} from "../db/connection";
import {api_error_code, http_status, postgres_error_codes} from "../const/status";


// I will do the redis stuff later
// const updateTestAllUsers = async () => {
//     // const key = 'table_user_all';
//     const repository = getConnection().getRepository(User);
//     const allUser = await repository.find();
//     console.log(allUser);
// }


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
            res.json({
                error_code: api_error_code.no_error,
                message: "Successfully added a new test.",
                data: {
                    id: newUser.uuid,
                    name: newUser.username,
                },
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
    } else {
        res.status(http_status.error).json({
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
        const users = await repository.find({take: limit, skip: page * limit});
        const returnVal = [];
        users.forEach((user) => {
            returnVal.push({
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePicturePath: user.profilePicturePath
            });
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Successfully getting the users.",
            data: returnVal
        });
    } catch (e) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.unknown_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

export const getUserByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        const user = await repository.findOneOrFail({uuid: req.params.uuid});
        res.json({
            error_code: api_error_code.no_error,
            message: "Successfully getting the user.",
            data: {
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePicturePath: user.profilePicturePath
            }
        });
    } catch (e) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.sql_error,
            message: "User not found!",
            data: {}
        });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const user = await repository.findOneOrFail({uuid: req.user.uuid});
        let additionalInfo;
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.bio) user.bio = req.body.bio
        if (req.body.newPassword && req.body.currentPassword) {
            const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
            if (validPassword) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(req.body.newPassword, salt);
            } else {
                additionalInfo = "Incorrect current password, password didn't change."
            }
        }
        await repository.save(user);
        res.json({
            error_code: api_error_code.no_error,
            message: "Updated successfully.",
            data: {
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePicturePath: user.profilePicturePath,
                additionalInfo: additionalInfo
            }
        });
    } catch (e) {
        console.log(e);
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

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        await repository.delete(req.user.uuid);
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

