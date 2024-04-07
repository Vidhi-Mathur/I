const express = require('express')
const router = express.Router()
const authController = require('../controllers/authentication-controller')

router.post('/login', authController.postLogin)

router.post('/logout', authController.postLogout)

module.exports = router