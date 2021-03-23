const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/
// Retrieve all tests
router.get('/', testController.getTests);
// Retrieve a single test with id
router.get('/:id', testController.getTestById);
// Create a new test
// post body => {"name":"<test name>", "description":"<test description>"}
router.post('/', testController.createTest);
// Update a test with id
router.put('/:id', testController.updatePutTest)
router.patch('/:id', testController.updatePatchTest)

module.exports = router;
