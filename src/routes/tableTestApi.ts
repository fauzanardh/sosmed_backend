import { Router } from "express";
import { create, drop } from '../controllers/tableTestController';
const router = Router();



/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/
// Create a new table if one doesn't exist
router.get('/', create);
// Drop the current table if it exist
router.delete('/', drop);

export default router;
