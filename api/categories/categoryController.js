var Category = require('./categoryModel');
var Site = require('../sites/siteModel');
var _ = require('lodash');

exports.params = function (req, res, next, id) {
    Category.findById(id).
        populate('site')
        .then(function (category) {
            if (!category) {
                next(new Error('No category with that id'));
            } else {
                req.categoryData = category;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
    Category.find({}).
        populate('site' , '-_id -__v -admin')
        .then(function (categories) {
            res.json(categories);
        }, function (err) {
            next(err);
        });
};

exports.getOne = function (req, res, next) {
    var category = req.categoryData;
    res.json(category);
};


exports.post = function (req, res, next) {
    console.log("category data :", req.body);
    var newCategory = req.body;
    var siteID = req.user.siteData._id;
    newCategory.site = siteID;
    Category.create(newCategory)
        .then(function (category) {
            res.json(category);
        }, function (err) {
            next(err);
        });
};
exports.delete = function (req, res, next) {
    req.categoryData.remove(function (err, removed) {
        if (err) {
            next(err);
        } else {
            res.json(removed);
        }
    });
};