import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {
    createUser,
    getUserByUUID,
    getUsers,
    updateUser,
    deleteUser,
    getOwnUser,
    followUser, getUserByUsername
} from "../controllers/user";

const router = Router();

router.get('/', getUsers);
router.get(
    '/me',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    getOwnUser
);
router.get('/uuid/:uuid', getUserByUUID);
router.get('/username/:username', getUserByUsername);
router.post('/', createUser);
router.patch(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    updateUser
);
router.delete(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    deleteUser
);

// Following/Follower stuff
router.post(
    '/follow/:uuid',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    followUser
)

export default router;
