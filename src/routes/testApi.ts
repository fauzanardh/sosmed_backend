import { Router } from "express";
import { getTests, getTestById, createTest, updatePutTest, updatePatchTest } from '../controllers/testController';
const router = Router();

/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/
// Retrieve all tests
router.get('/', getTests);
// Retrieve a single test with id
router.get('/:id', getTestById);
// Create a new test
// post body => {"name":"<test name>", "description":"<test description>"}
router.post('/', createTest);
// Update a test with id
router.put('/:id', updatePutTest)
router.patch('/:id', updatePatchTest)

export default router;
