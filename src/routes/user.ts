import {Router} from "express";
import {createUser, getUserByUUID, getUsers, updateUser, deleteUser, searchUser} from "../controllers/user";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";

const router = Router();

router.get('/', getUsers);
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
