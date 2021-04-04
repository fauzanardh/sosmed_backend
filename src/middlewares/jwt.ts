import {api_error_code, http_status} from "../const/status";

export const handleJWTError = async (err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(http_status.unauthorized).json({
            error_code: api_error_code.auth_error,
            message: "Invalid access token",
            data: {}
        })
    } else {
        next();
    }
}
