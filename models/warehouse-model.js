const mongoose = require('mongoose')
const schema = mongoose.Schema

const warehouse = new schema({
    name: {
        type: String,
        required: true
    }, 
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    inventoryStored: [{
        type: mongoose.Types.ObjectId,
        ref: 'Inventory'
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Warehouse', warehouse)