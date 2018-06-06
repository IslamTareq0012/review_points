var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RviewSchema = new Schema({
    invoiceID :{
        type:String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productModel: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },

    review: {
        type: String,
        required: true
    },

    site: {
        type: String,
        required:true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    sentiment:{
        type: Number,
        default: -1,
        required: true
    }

});

module.exports = mongoose.model('review', RviewSchema);