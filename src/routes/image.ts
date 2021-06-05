import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import multer from "multer";
import {upload} from "../controllers/image"

const router = Router();

const imageUpload = multer({
    dest: '/app/nginx/assets/tmp'
});

router.post(
    '/upload',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    imageUpload.single('image'),
    upload
);

export default router;
