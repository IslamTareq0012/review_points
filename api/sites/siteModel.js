var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

adminSchema.pre('save', function (next) {
  const admin = this;
  if (!admin.isModified('password')) {
    return next();
  }
  return bcrypt
    .hash(admin.password, 10)
    .then(hashedPassword => {
      admin.password = hashedPassword;
      return next();
    })
    .catch(err => {
      return next(err);
    });
});

var SiteSchema = new Schema({
  siteName: {
    type: String,
    required: true,
    unique: true
  },
  siteUrl: {
    type: String,
    required: true,
    unique: true
  },
  admin: adminSchema

});

module.exports = mongoose.model('site', SiteSchema);