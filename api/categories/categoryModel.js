var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    site: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('category', CategorySchema);