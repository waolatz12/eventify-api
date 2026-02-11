const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// router
//   .route('/')
//   .post(authController.createUser)
//   .get(authController.getAllUsers);
// router
//   .route('/:id')
//   .get(authController.getUsertById)
//   .patch(authController.updateUserById)
//   .delete(authController.deleteUserById);

module.exports = router;
