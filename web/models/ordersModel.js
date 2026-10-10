const mongoose = require('mongoose');

const OrderStatus = Object.freeze({
    CLOSED: 'closed',
    ACTIVE: 'active',
    UNDEFINED: 'undefined'
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    restaurantId: {
        type: String,
        required: true
    },

    items: {
        type: [String],
        default: []
    },

    totalPrice: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.UNDEFINED
    }
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = {
    Order,
    OrderStatus
};