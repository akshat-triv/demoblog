const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.securityCheck, authController.signup);

router.post('/login', authController.login);

router.post('/forgotPassword', authController.fogotPassword);

router.post(
  '/changePassword',
  authController.protect,
  authController.changePassword
);

router.post('/resetPassword/:resetToken', authController.resetPassword);

router.use(authController.protect);

router
  .route('/')
  .get(adminController.getAllUsers)
  .post(authController.securityCheck, adminController.createUser);

router
  .route('/:id')
  .get(adminController.getUser)
  .patch(authController.securityCheck, adminController.updateUser)
  .delete(authController.securityCheck, adminController.deleteUser);

module.exports = router;
