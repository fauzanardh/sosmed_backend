import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {createPost, getOwnPosts, getPostsByUserUUID, getPostByUUID, likePost, deletePost} from "../controllers/post";

const router = Router();

router.get(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    getOwnPosts,
);
router.get('/userId/:uuid', getPostsByUserUUID);
router.get('/postId/:uuid', getPostByUUID);
router.delete(
    '/postId/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    deletePost,
)

router.post(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    createPost,
);
router.post(
    '/like',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    likePost,
)

export default router;
