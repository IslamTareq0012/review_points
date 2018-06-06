var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    site: { type: Schema.Types.ObjectId, ref: 'site' }
});

module.exports = mongoose.model('category', CategorySchema);