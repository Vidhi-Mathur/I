const axios = require('axios')
const Warehouse = require('../models/warehouse-model')
const Inventory = require('../models/inventory-model')
const HttpError = require('../models/http-error')
const mongoose = require('mongoose')

//Create warehouse
exports.createWarehouse = async(req, res, next) => {
    try{
    const { name, location, inventoryStored } = req.body
    //Find location
    const result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`)
    if(result.data.length === 0) return next(new HttpError('Invalid location', 400))
    const {lat, lon} = result.data[0]
    //Create new 
    const newWarehouse = await Warehouse.create({name, location: { lat, lng: lon }, inventoryStored: [inventoryStored] })
    //Find associated inventory
    const inventoryItem = await Inventory.findById(inventoryStored)
    //No inventory found
    if(!inventoryItem) return next(new HttpError('No inventory found', 404))
    //Update Inventory for warehouse id
    inventoryItem.warehouse = newWarehouse._id
    await inventoryItem.save()
    res.status(200).json({warehouse: newWarehouse})
    }
    catch(err) {
        return next(new HttpError(err.message, 400));
    }
}



//Retrieve a single warehouse using Id
exports.getWarehouseById = async (req, res, next) => {
    const { id } = req.params;
    let storedWarehouse;
    try {
        storedWarehouse = await Warehouse.findById(id);
        if (!storedWarehouse) return next(new HttpError('No warehouse found for given id', 404));
        res.status(200).json({ warehouse: storedWarehouse });
    } catch (err) {
        if (err instanceof mongoose.CastError) {  
            return next(new HttpError('No product found', 404));
         }
        return next(new HttpError('Can\'t fetch warehouse, try again later' , 400));
    }    
};

//Retrieve all warehouses
exports.getWarehouses = async(req, res, next) => {
    let storedWarehouses
    try {
        storedWarehouses = await Warehouse.find()
    }
    catch(err){
        return next(new HttpError('Can\'t fetch warehouses, try again later', 400));
    }
    res.status(200).json({ warehouses: storedWarehouses })
}

//Update warehouse
exports.updateWarehouse = async(req, res, next) => {
    const { id } = req.params;
    const { name, location, inventoryStored } = req.body;
    let storedWarehouse;

    try {
        // Find warehouse by id
        storedWarehouse = await Warehouse.findById(id);
        if (!storedWarehouse) return next(new HttpError('Warehouse not found', 404));
        // Fetch latitude and longitude based on new location
        const result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
        if (result.data.length === 0) return next(new HttpError('Invalid location', 400));
        const { lat, lon } = result.data[0];
        // Update warehouse details
        storedWarehouse.name = name;
        storedWarehouse.location = { lat, lng: lon };
        //Pull out old reference, and store new 
        await Warehouse.updateMany(
            { inventoryStored: { $in: inventoryStored } },
            { $pull: { inventoryStored: { $in: inventoryStored } } }
        );
        // Iterate through the inventoryStored array to update the warehouse field in each inventory item
        for (const inventoryId of inventoryStored) {
            const inventoryItem = await Inventory.findById(inventoryId);
            if (inventoryItem) {
                inventoryItem.warehouse = id;
                await inventoryItem.save();
            }
        }
        // Update inventoryStored array in warehouse
        storedWarehouse.inventoryStored = inventoryStored;
        // Save updated warehouse
        await storedWarehouse.save();
        // Response
        res.status(200).json({ warehouse: storedWarehouse });
    } catch (err) {
        if (err instanceof mongoose.CastError) {  
            return next(new HttpError('No product found', 404));
         }
        return next(new HttpError('Can\'t update warehouse, try again later', 404));
    }
};

//Delete warehouse
exports.deleteWarehouse = async(req, res, next) => {
    const { id } = req.params
    let deleteWarehouse;
    try {
        deleteWarehouse = await Warehouse.findById(id);
        if(!deleteWarehouse)  return next(new HttpError('No warehouse found', 404));
        //Remove inventory associated with deleted warehouse
        await Inventory.deleteMany({ warehouse: id })
        //Delete warehouse
        await Warehouse.findByIdAndDelete(id);
    }
    catch(err){
        if (err instanceof mongoose.CastError) {  
            return next(new HttpError('No product found', 404));
         }
        return next(new HttpError('Can\'t delete warehouse, try again later', 400));
    }
    res.status(200).json({ message: `Deleted warehouse with id ${id}` })
}