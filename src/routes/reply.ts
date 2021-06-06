import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {createReply, getReplyByUUID, likeReply, deleteReply} from "../controllers/reply";

const router = Router();

router.get('/:uuid', getReplyByUUID);
router.post(
    '/:uuid/like',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    likeReply,
);
router.post(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    createReply,
);
router.delete(
    '/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    deleteReply,
)

export default router;
