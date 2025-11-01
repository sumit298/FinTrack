const mongoose = require('mongoose');


const CategorySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transaction: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    name: {
        type: String,
        required: true
    },
    budget: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    }],
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    color: {
        type: String,
    }

}, {
    timestamps: true
})

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;