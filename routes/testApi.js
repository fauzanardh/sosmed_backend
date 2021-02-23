const express = require('express');
const router = express.Router();


/*
API Response Structure
error_code => Error code for when something went wrong (0 means no error)
status => Will give detailed status of the error, otherwise success.
data => Data that will be given, there's no structure particular for the data given
*/

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Sosmed' });
});

/* GET home page. */
router.get('/test', function(req, res, next) {
    res.json({
        error_code: 0,
        status: "Success",
        data: [{
            description: "Test API For Backend!",
        }],
    });
});

module.exports = router;
