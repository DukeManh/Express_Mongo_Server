const mongoose = require('mongoose');
const { loadType } = require('mongoose-currency');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        min: 1,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    feature: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

var Promotions = mongoose.model('Promotions', promotionSchema);
module.exports = Promotions;