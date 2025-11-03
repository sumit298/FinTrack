const express = require('express')
const AuthController = require('../controller/auth.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const AuthRouter = express.Router();    

AuthRouter.post('/register', AuthController.register);
AuthRouter.post('/login', AuthController.login);  
AuthRouter.get('/verify-token', authenticate,  AuthController.verifyToken);  
AuthRouter.post('/refresh-token', AuthController.refreshToken);

module.exports = AuthRouter;