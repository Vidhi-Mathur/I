const express = require('express')
const router = express.Router()
const warehouseController = require('../controllers/warehouse-controller')
const { protectedRoute } = require('../controllers/authentication-controller')

//Create warehouse
router.post('/new', protectedRoute, warehouseController.createWarehouse)

//Retrieve a single warehouse using Id
router.get('/:id', warehouseController.getWarehouseById)

//Retrieve all warehouses
router.get('/', warehouseController.getWarehouses)

//Update warehouse
router.patch('/:id', protectedRoute, warehouseController.updateWarehouse)

//Delete warehouse
router.delete('/:id', protectedRoute, warehouseController.deleteWarehouse)

module.exports = router