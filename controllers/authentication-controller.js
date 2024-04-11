const HttpError = require('../models/http-error')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

//If is protected route
exports.protectedRoute = (req, res, next) => {
    if(req.session.user) next()
    else res.status(401).json({ message: 'Unauthorized' })
}

exports.postSignup = async(req, res, next) => {
    try {
        const { username, password } = req.body
        const existingUsername = await User.findOne({ username })
        if(existingUsername) return res.status(200).json({ message: 'User already exist. Try login instead.'})
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            username,
            password: hashedPassword
        })
        await newUser.save()
        res.status(201).json({ message: 'User created successfully!' });
    }
    catch(err){
        return next(new HttpError(err.message || 'Can\'t signup, try again later', 500));
    }
}

exports.postLogin = async(req, res, next) => {
    const { username, password } = req.body
    const existingUsername = await User.findOne({ username })
    if(!existingUsername) return next(new HttpError('No user found', 500));
    const validPassword = await bcrypt.compare(password, existingUsername.password)
    if(validPassword){
        req.session.user = existingUsername._id
        res.status(200).json({ message: 'Logged in successfully' })
    }
    else res.status(404).json({ message: 'Invalid credentials' })
}

exports.postLogout = (req, res, next) => {
    if(req.session.user){
        req.session.destroy(err => {
            if(err) return next(new HttpError('Can\'t logout, try again later', 500));
            res.clearCookie('connect.sid')
            res.status(200).json({message: 'Logged out successfully'})
        })
    }
    else res.status(401).json({message: 'Not logged in yet'})
}