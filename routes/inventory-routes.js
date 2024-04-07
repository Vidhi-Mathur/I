const express = require('express')
const router = express.Router()
const invertoryController = require('../controllers/inventory-controller')
const { protectedRoute } = require('../controllers/authentication-controller')

//Create inventory product
router.post('/new', protectedRoute, invertoryController.createProduct)

//Retrieve single inventory item using id
router.get('/:id', invertoryController.getProductById)

//Retrieve all inventory items
router.get('/', invertoryController.getProducts)

//Update specific inventory item
router.patch('/:id', protectedRoute, invertoryController.updateProduct)

//Delete inventory item
router.delete('/:id', protectedRoute, invertoryController.deleteProduct)

module.exports = router