var User = require('./userModel');
var Review = require('../reviews/reviewModel')
var _ = require('lodash');
var fs = require('fs');

exports.findUser = function (req, res, next) {

    User.findById(req.user._id)
        .then(function (user) {
            if (!user) {
                next(new Error('No user with that id'));
            } else {
                req.userData = user;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
    User.find({})
        .then(function (users) {
            res.json(users);
        }, function (err) {
            next(err);
        });
};

exports.getOne = function (req, res, next) {
    var user = req.userData;
    res.json(user);
};

exports.getUserID = function (req, res, next) {
    console.log("workk", req.userData)
    Review.find({ user: req.userData._id })
        .then(function (reviews) {
            res.json(reviews)
        }, function (err) {
            next(err)
        });
}

exports.put = function (req, res, next) {
    var user = req.userData;

    var update = req.body;

    if (update.userImage != user.userImage) {
        fs.unlink('././images/' + String(update.email) + "_image.png", function (err) {
            if (err) {
                console.log("deleting image error", err);
            }
            var img = update.userImage;
            var imgBase64;
            if (String(img).includes("image/png;base64,")) {
                imgBase64 = img.split(';base64,').pop();
                fs.writeFile('././images/' + String(req.body.email) + "_image.png", imgBase64, { encoding: 'base64' }, function (err) {
                    if (err) {
                        console.log("saving image error", err);
                    }
                    else {
                        update.userImage = String(req.body.email) + "_image.png";
                        console.log("new user image url", update.userImage);
                        _.merge(user, update);
                        user.save(function (err, saved) {
                            if (err) {
                                next(err);
                            } else {
                                res.json(saved);
                            }
                        });
                    }
                });
            } else {
                fs.writeFile('././images/' + String(req.body.email) + "_image.png", img, { encoding: 'base64' }, function (err) {
                    if (err) {
                        console.log("saving image error", err);
                    }
                    else {
                        update.userImage = String(req.body.email) + "_image.png";
                        _.merge(user, update);
                        user.save(function (err, saved) {
                            if (err) {
                                next(err);
                            } else {
                                res.json(saved);
                            }
                        });
                    }
                });
            }
        });
    } else {
        _.merge(user, update);
        user.save(function (err, saved) {
            if (err) {
                next(err);
            } else {
                res.json(saved);
            }
        });
    }

};

exports.delete = function (req, res, next) {
    req.userData.remove(function (err, removed) {
        if (err) {
            next(err);
        } else {
            res.json(removed);
        }
    });
};

exports.updateFcmToken = function (req, res, next) {
    User.update({ _id: req.user._id }, { $set: { notificationToken: req.body.token } }, function (err, updateResult) {
        if (err) {
            next(err);
        } else {
            res.json({ update: "ok" });
        }
    });
}