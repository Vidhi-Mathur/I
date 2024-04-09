const mongoose = require('mongoose');
const schema = mongoose.Schema;

const user = new schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    warehouses: [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'Warehouse' 
    }] 
});

module.exports = mongoose.model('User', user);