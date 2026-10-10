const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' }); // Make sure docker create the file

const authMiddleware = require('../middlewares/authMiddleware');

const usersController = require('../controllers/usersController');

router.post('/', upload.single('logo'), usersController.createUser);
router.get('/:id', authMiddleware, usersController.getUserById);

module.exports = router;