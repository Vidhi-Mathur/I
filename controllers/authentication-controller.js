const HttpError = require('../models/http-error')
const mongoose = require('mongoose')

//If is protected route
exports.protectedRoute = (req, res, next) => {
    if(req.session.warehouse) next()
    else res.status(401).json({ message: 'Unauthorized' })
}

exports.postLogin = (req, res, next) => {
    const { username, password, warehouse } = req.body
    if(username === 'admin' && password === 'mypassword123' && mongoose.Types.ObjectId.isValid(warehouse)){
        //res.cookie('token', 'user_token', { httpOnly: true, expiresIn: '1m' })
        //Any key, here, storing warehouses access
        req.session.warehouse = new mongoose.Types.ObjectId(warehouse);
        res.status(200).json({ message: 'Logged in successfully' })
    }
    else res.status(404).json({ message: 'Invalid credentials' })
}

exports.postLogout = (req, res, next) => {
    if(req.session.warehouse){
        req.session.destroy(err => {
            if(err) return next(new HttpError('Can\'t logout, try again later', 500));
            res.clearCookie('connect.sid')
            res.status(200).json({message: 'Logged out successfully'})
        })
    }
    else res.status(401).json({message: 'Not logged in yet'})
}