import {api_error_code, http_status} from "../const/status";
import {UnauthorizedError} from "express-jwt";

export const handleJWTError = async (err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
        res.status(http_status.unauthorized).json({
            error_code: api_error_code.auth_error,
            message: "Error while authenticating.",
            data: {
                error_name: err.name,
                error_detail: err.message
            }
        })
    } else {
        next();
    }
}
