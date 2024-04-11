const express = require('express')
const router = express.Router()
const warehouseController = require('../controllers/warehouse-controller')
const { protectedRoute } = require('../controllers/authentication-controller')

router.use(protectedRoute)

//Retrieve a single warehouse using Id
router.get('/:id', warehouseController.getWarehouseById)

//Retrieve all warehouses
router.get('/', warehouseController.getWarehouses)

//Create warehouse
router.post('/new', warehouseController.createWarehouse)

//Update warehouse
router.patch('/:id', warehouseController.updateWarehouse)

//Delete warehouse
router.delete('/:id', warehouseController.deleteWarehouse)

module.exports = router