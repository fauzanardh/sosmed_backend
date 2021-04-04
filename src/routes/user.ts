import { Router } from "express";
import { createUser, getUserByUUID, getUsers } from "../controllers/user";
const router = Router();

router.get('/', getUsers);
router.get('/:uuid', getUserByUUID);
router.post('/', createUser);

export default router;
