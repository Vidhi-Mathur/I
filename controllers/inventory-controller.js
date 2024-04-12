const Inventory = require('../models/inventory-model')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const HttpError = require('../models/http-error');
const Warehouse = require('../models/warehouse-model');

exports.createProduct = async (req, res, next) => {
   try {
       const { title, price, description, quantity, imageUrl, warehouse } = req.body;
       // Update warehouse to update inventory stored
       const reqWarehouse = await Warehouse.findById(warehouse);
       //Warehouse doesn't exist
       if (!reqWarehouse) {
           return next(new HttpError('No warehouse found', 404));
       }
       //Missing field
       if(!title || !price ||  !description || !quantity || !imageUrl || !warehouse){
            return next(new HttpError('Missing field', 400));
       }
       //Save product
       const newProduct = new Inventory({ title, price, description, quantity, imageUrl, warehouse });
       await newProduct.save();
       //Update inventoryStored[] in warehouse
       reqWarehouse.inventoryStored.push(newProduct._id);
       await Warehouse.findByIdAndUpdate(reqWarehouse._id, {
           inventoryStored: reqWarehouse.inventoryStored
       });
       //Return response
       res.status(200).json({ product: newProduct });
   } catch (err) {
      //Error handling
       return next(new HttpError('Can\'t save product, try again later', 500));
   }
};

//Retrieve single inventory item using id
exports.getProductById = async(req, res, next) => {
   const  { id }  = req.params
   let storedProduct, correspondingWarehouse;
   try {
      //Search
      storedProduct = await Inventory.findById(id);
      correspondingWarehouse = await Warehouse.findById(storedProduct.warehouse)
      if(!storedProduct || !correspondingWarehouse || !correspondingWarehouse.user.equals(req.session.user)) return next(new HttpError('No product found for given id', 404))
   }
   catch(err){
      if (err instanceof mongoose.CastError) {  
         return next(new HttpError('No product found for given id', 404));
      }
      return next(new HttpError('Can\'t fetch inventory, try again later', 500));
   }
   res.status(200).json({product: storedProduct})
}

//Retrieve all inventory items
exports.getProducts = async(req, res, next) => {
   let storedProducts, correspondingWarehouse;
   try {
      correspondingWarehouse = await Warehouse.find({ user: req.session.user })
      //Get all products, so no criteria
      storedProducts = await Inventory.find({ warehouse: correspondingWarehouse })
   }
   catch(err){
      return next(new HttpError('Can\'t fetch inventory, try again later', 500))
   }
   res.status(200).json({products: storedProducts})
}

//Update specific inventory item
exports.updateProduct = async(req, res, next) => {
   const { id } = req.params
   const { title, price, description, quantity, imageUrl, warehouse } = req.body
   let inventory, oldWarehouse, newWarehouse
   try {
   //Find id in database
   inventory = await Inventory.findById(id)
   if(!inventory) return next(new HttpError('Inventory Not found', 404))
   //Find warehouse such that in Warehouse, ObjectId of inventoryStored[] matched what we searched
   oldWarehouse = await Warehouse.findOne({ inventoryStored: inventory._id });
   if(!oldWarehouse) return next(new HttpError('Warehouse Not found', 404))
   //Update
   inventory.title = title
   inventory.price = price
   inventory.description = description
   inventory.quantity = quantity
   inventory.imageUrl = imageUrl
   inventory.warehouse = warehouse
   //Save
   await inventory.save()
   //Remove Id of inventory updated from old warehouse
   oldWarehouse.inventoryStored = oldWarehouse.inventoryStored.filter(itemId => itemId.toString() !== id);
   await oldWarehouse.save();
   newWarehouse = await Warehouse.findById(warehouse);
   //Update reference of inventoryStored[] in new Warehouse
   if (!newWarehouse.inventoryStored.includes(inventory._id)) {
      newWarehouse.inventoryStored.push(inventory._id);
      await newWarehouse.save();
  }
   //Response
   res.status(200).json({product: inventory})
   }
   catch(err){
      if (err instanceof mongoose.CastError) {  
         return next(new HttpError('No product found', 404));
      }
      return next(new HttpError('Can\'t update inventory, try again later', 500))
   }
}

//Delete inventory item
exports.deleteProduct = async(req, res, next) => {
   const { id } = req.params;
   let deleteInventory;
   try {
      deleteInventory = await Inventory.findById(id);
      // No id found
      if (!deleteInventory) {
         return next(new HttpError('No product found for given id', 404));
      }
      const warehouse = await Warehouse.findById(deleteInventory.warehouse);
      // Remove reference of same inventory stored with Warehouse model, and save
      warehouse.inventoryStored = warehouse.inventoryStored.filter(item => item.toString() !== id);
      await warehouse.save()
      await Inventory.findByIdAndDelete(id);
   } catch (err) {
      if (err instanceof mongoose.CastError) {  
         return next(new HttpError('No product found for given id', 404));
      }
      return next(new HttpError('Can\'t delete from inventory, try again later', 500));
   }
   res.status(200).json({message: `Deleted product with id ${id}`});
}