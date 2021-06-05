import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import multer from "multer";
import {upload} from "../controllers/upload"

const router = Router();

const uploadHandler = multer({
    dest: '/app/nginx/assets/tmp'
});

router.post(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    uploadHandler.single('data'),
    upload
);

export default router;
