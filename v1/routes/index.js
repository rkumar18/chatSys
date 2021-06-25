const express = require('express');
const userRoute = require('./user');
const router = express();
router.use('/', userRoute);

module.exports = router;