import {Request, Response} from "express";
import {api_error_code, http_status, postgres_error_codes} from "../const/status";
import {cwebp, gif2webp} from "../utils/webp_converter";
import {unlinkSync} from "fs";

const allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

export const upload = async (req: Request, res: Response) => {
    try {
        if (typeof req.file !== "undefined") {
            // get the file extension using regex (the fastest one)
            const ext = (/[.]/.exec(req.file.originalname)) ? /[^.]+$/.exec(req.file.originalname)[0] : undefined;
            const index = allowed_extensions.indexOf(ext);
            if (typeof ext !== "undefined" && index > -1) {
                // convert the image/gif to webp
                if (allowed_extensions[index] === "gif") {
                    await gif2webp(req.file.path, `/app/nginx/assets/${req.file.filename}.webp`);
                } else {
                    await cwebp(req.file.path, `/app/nginx/assets/${req.file.filename}.webp`);
                }
                // remove temp file
                unlinkSync(req.file.path);
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Uploaded successfully.",
                    data: {
                        imageId: req.file.filename,
                    },
                });
            } else {
                res.status(http_status.bad).json({
                    error_code: api_error_code.image_error,
                    message: "Image upload failed, extension not allowed!",
                    data: {
                        allowed_extensions: allowed_extensions,
                    },
                });
            }
        } else {
            res.status(http_status.bad).json({
                error_code: api_error_code.image_error,
                message: "Image upload failed.",
                data: {},
            });
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
