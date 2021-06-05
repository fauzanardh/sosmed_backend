import {EntityNotFoundError} from "typeorm";
import {api_error_code, http_status, postgres_error_codes} from "../const/status";
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
            error_code: api_error_code.validation_error,
            message: "Something went wrong when validating the input.",
            data: {
                error_name: "ValidationError",
                error_detail: constraints
            }
        });
    } else if (e instanceof EntityNotFoundError) {
        res.status(http_status.not_found).json({
            error_code: api_error_code.sql_error,
            message: "Requested entity not found.",
            data: {}
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
