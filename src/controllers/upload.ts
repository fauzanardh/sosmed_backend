import {Request, Response} from "express";
import {api_error_code, http_status} from "../const/status";
import {resizeAndConvertGif, resizeAndConvertImage} from "../utils/data";
import {unlinkSync} from "fs";
import {handleErrors} from "../utils/errors";

const allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

export const upload = async (req: Request, res: Response) => {
    try {
        if (typeof req.file !== "undefined") {
            // get the file extension using regex (the fastest one)
            // regex /[.]/ means search any .(dot) in req.file.originalname
            // regex /[^.]+$/ means search any .(dot) and any word in the end of req.file.originalname
            const ext = (/[.]/.exec(req.file.originalname)) ? /[^.]+$/.exec(req.file.originalname)[0] : undefined;
            const index = allowed_extensions.indexOf(ext);
            if (typeof ext !== "undefined" && index > -1) {
                // convert the image/gif to webp and resize them (max size 1080)
                if (allowed_extensions[index] === "gif") {
                    await resizeAndConvertGif(req.file.path, `/app/nginx/assets/${req.file.filename}.webp`);
                } else {
                    await resizeAndConvertImage(req.file.path, `/app/nginx/assets/${req.file.filename}.webp`);
                }
                // remove temp file
                unlinkSync(req.file.path);
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Uploaded successfully.",
                    data: {
                        dataId: req.file.filename,
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
        handleErrors(e, res);
    }
}
