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
router.get('/', testController.getAll);
// Retrieve a single test with id
router.get('/:id', testController.getOne);
// Create a new test
// post body => {"name":"<test name>", "description":"<test description>"}
router.post('/', testController.create);
// Update a test with id
router.patch('/:id', testController.update_patch)
router.put('/:id', testController.update_put)

module.exports = router;
