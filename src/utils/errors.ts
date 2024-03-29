import {EntityNotFoundError, QueryFailedError} from "typeorm";
import {api_error_code, http_status} from "../const/status";
import {Response} from "express";
import {ValidationError} from "class-validator";

export const handleErrors = (e, res: Response) => {
    console.warn(e);
    if (e instanceof Array) {
        const constraints = [];
        e.forEach((_e) => {
            if (_e instanceof ValidationError) {
                constraints.push({property: _e.property, constraint: _e.constraints})
            }
        });
        res.status(http_status.bad).json({
            errorCode: api_error_code.validation_error,
            message: "Something went wrong when validating the input.",
            data: {}
        });
    } else if (e instanceof EntityNotFoundError) {
        res.status(http_status.not_found).json({
            errorCode: api_error_code.sql_error,
            message: "Requested entity not found.",
            data: {}
        });
    } else if (e instanceof QueryFailedError) {
        // @ts-ignore
        if (e.detail.indexOf("username") > -1) {
            res.status(http_status.bad).json({
                errorCode: api_error_code.user_registered,
                message: "Username already registered",
                data: {
                    username: e.parameters[1],
                }
            });
        } else {
            res.status(http_status.error).json({
                errorCode: api_error_code.sql_error,
                message: "Error when querying data.",
                data: {}
            });
        }
    } else {
        res.status(http_status.error).json({
            errorCode: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {}
        });
    }
}
