const express = require('express');
const router = express.Router();

const tokensController = require('../controllers/tokensController');

router.post('/', tokensController.login);

module.exports = router;