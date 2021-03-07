const express = require('express');
const router = express.Router();

const tableTestController = require('../controllers/tableTestController');

/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/
// Create a new table if one doesn't exist
router.get('/', tableTestController.create);
// Drop the current table if it exist
router.delete('/', tableTestController.drop);

module.exports = router;
