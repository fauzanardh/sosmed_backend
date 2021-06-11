import {Router} from "express";
import {getAll, read} from "../controllers/notification";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";

const router = Router();
router.get(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    getAll
);
router.post(
    '/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    read
);

export default router;
