require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongodbStore = require('connect-mongodb-session')(session)
const inventoryRoutes = require('./routes/inventory-routes')
const warehouseRoutes = require('./routes/warehouse-routes')
const authRoutes = require('./routes/authentication-routes')
const HttpError = require('./models/http-error')

//Setting views

//Parse
app.use(bodyParser.json())

const store = new MongodbStore({
    uri: process.env.URI,
    collection: 'sessions'
})

app.use(session({
    secret: process.env.SECRET,
    //Not saved on every request. But only is something changes
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        expiresIn: '1m' 
    },
    store: store
}))

//Forwarding
app.use('/inventory', inventoryRoutes)
app.use('/warehouse', warehouseRoutes)
app.use('/', authRoutes)

//Error handling
//Those coming after above routes are request basically that didn't got a response. 
app.use((req, res, next) => {
    throw new HttpError('Page not found', 404)
})

//To avoid code duplication for error handling each time as have to set header to 404 and send message each time. Middleware taking 4 arg. is treated by express as special middleware for error handling
app.use((error, req, res, next) => {
    //Headers set means already send a response
    if(res.headerSent){
        return next(error)
    }
    //Othewise set header and error msg
    res.status(error.code || 500).json({message: error.message || 'An unknown error occurred'})
})

//DataBase connection/ listen to server
mongoose.connect(process.env.URI).then(() => app.listen(3000)).catch((err) => console.log(err))