import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {User} from '../models/entity/User';
import {getConnection} from "../db/connection";
import {api_error_code, http_status} from "../const/status";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
    if (req.body.username && req.body.password) {
        try {
            const repository = getConnection().getRepository(User);
            const user = await repository.findOneOrFail({username: req.body.username});
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (validPassword) {
                const accessToken = jwt.sign({
                    uuid: user.uuid,
                    username: user.username
                }, process.env.JWT_SECRET, {expiresIn: '180d'});
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Logged in successfully.",
                    data: {
                        username: user.username,
                        accessToken: accessToken,
                    }
                });
            } else {
                res.status(http_status.bad).json({
                    error_code: api_error_code.auth_error,
                    message: "Invalid password!",
                    data: {}
                });
            }
        } catch (e) {
            res.status(http_status.not_found).json({
                error_code: api_error_code.sql_error,
                message: "User not found.",
                data: {}
            });
        }
    } else {
        res.status(http_status.error).json({
            error_code: api_error_code.no_params,
            message: "Fix the required params!",
            data: {
                username: req.body.username ? "exists" : "not found",
                password: req.body.password ? "exists" : "not found",
            }
        });
    }
}
