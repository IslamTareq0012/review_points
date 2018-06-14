const bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
  },
  notificationToken: {
    type: String,
    required: true
  },
  points: {
    type: [{ siteName: String, sitePoints: Number }],
    required: true
  },
  resetPasswordToken: {
    type: String,
    default: "undefined"
  },
  resetPasswordExpires: {
    type: Number,
    default: 0
  },
  dateOfBirth: {
    type: Date,
    required: true
  }

});

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt
    .hash(user.password, 10)
    .then(hashedPassword => {
      user.password = hashedPassword;
      return next();
    })
    .catch(err => {
      return next(err);
    });
});

userSchema.methods.comparePassword = function (candidatePassword, next) {
  return bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return next(err);
    }
    return next(null, isMatch);
  });
};

module.exports = mongoose.model('user', userSchema);