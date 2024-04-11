const express = require('express')
const router = express.Router()
const invertoryController = require('../controllers/inventory-controller')
const { protectedRoute } = require('../controllers/authentication-controller')

//Retrieve single inventory item using id
router.get('/:id', invertoryController.getProductById)

//Retrieve all inventory items
router.get('/', invertoryController.getProducts)

router.use(protectedRoute)

//Create inventory product
router.post('/new', invertoryController.createProduct)

//Update specific inventory item
router.patch('/:id', invertoryController.updateProduct)

//Delete inventory item
router.delete('/:id', invertoryController.deleteProduct)

module.exports = router