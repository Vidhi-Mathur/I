const mongoose = require('mongoose')
const schema = mongoose.Schema

const inventory = new schema({
    warehouse: {
        type: mongoose.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('Inventory', inventory)