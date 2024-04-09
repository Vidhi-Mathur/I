const express = require('express')
const router = express.Router()
const authController = require('../controllers/authentication-controller')

router.post('/signup', authController.postSignup)

router.post('/login', authController.postLogin)

router.post('/logout', authController.postLogout)

module.exports = router