import {Router} from "express";
import {createUser, getUserByUUID, getUsers, updateUser} from "../controllers/user";
import jwt from "express-jwt";
import {handleJWTError} from "../middlewares/jwt";

const router = Router();

router.get('/', getUsers);
router.get('/:uuid', getUserByUUID);
router.post('/', createUser);
router.patch(
    '/',
    jwt({secret: process.env.JWT_SECRET, algorithms: ['HS256']}),
    handleJWTError,
    updateUser
);

export default router;
