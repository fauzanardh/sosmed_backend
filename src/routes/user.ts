import {Router} from "express";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";
import {createUser, getUserByUUID, getUsers, updateUser, deleteUser, searchUser, getOwnUser} from "../controllers/user";

const router = Router();

router.get('/', getUsers);
router.get(
    '/me',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    getOwnUser
);
router.get('/:uuid', getUserByUUID);
router.get('/search/:searchString', searchUser)
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

export default router;
