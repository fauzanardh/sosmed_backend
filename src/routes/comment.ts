import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {createComment, getCommentByUUID, likeComment, deleteComment} from "../controllers/comment";

const router = Router();

router.get('/:uuid', getCommentByUUID);
router.post(
    '/:uuid/like',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    likeComment,
);
router.post(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    createComment,
);
router.delete(
    '/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    deleteComment,
)

export default router;
