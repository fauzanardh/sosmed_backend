import {api_error_code, http_status} from "../const/status";
import {UnauthorizedError} from "express-jwt";

export const handleJWTError = async (err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
        res.status(http_status.unauthorized).json({
            errorCode: api_error_code.auth_error,
            message: "Error while authenticating.",
            data: {
                errorName: err.name,
                errorDetail: err.message
            }
        })
    } else {
        next();
    }
}
