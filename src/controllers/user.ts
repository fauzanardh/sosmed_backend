import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from '../models/entity/User';
import { getConnection } from "../db/connection";
import { api_error_code, http_status } from "../const/status";



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
                    id: newUser.id,
                    name: newUser.username,
                },
            });
        } catch (e) {
            res.status(http_status.error).json({
               error_code: api_error_code.sql_error,
               message: "Something went wrong.",
               data: {}
            });
            throw e;
        }
    } else {
        res.status(http_status.error).json({
            error_code: api_error_code.no_params,
            message: "Fix the required params!",
            data: {
                name: req.body.name ? "exists": "not found",
                username: req.body.username ? "exists" : "not found",
                password: req.body.password ? "exists" : "not found",
            }
        });
    }
}
