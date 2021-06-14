import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {
    createPost,
    getOwnPosts,
    getPostsByUserUUID,
    getPostByUUID,
    likePost,
    deletePost,
    getPostsByUsername
} from "../controllers/post";

const router = Router();

router.get(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    getOwnPosts,
);
router.get('/userId/:uuid', getPostsByUserUUID);
router.get('/username/:username', getPostsByUsername);
router.get('/postId/:uuid', getPostByUUID);

router.post(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    createPost,
);
router.post(
    '/postId/:uuid/like',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    likePost,
)

router.delete(
    '/postId/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    deletePost,
)

export default router;
