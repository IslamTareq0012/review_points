var Review = require('./reviewModel');
var User = require('../users/userModel');
var _ = require('lodash');

exports.params = function (req, res, next, id) {
    Review.findById(id).
        populate('user')
        .then(function (review) {
            if (!review) {
                next(new Error('No review with that id'));
            } else {
                req.reviewData = review;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
    Review.find({}).
        populate('user')
        .then(function (reviews) {
            res.json(reviews);
        }, function (err) {
            next(err);
        });
};

exports.getOne = function (req, res, next) {
    var review = req.reviewData;
    res.json(review);
};

exports.post = function (req, res, next) {
    var newReview = req.body;
    var userID = req.user._id;
    newReview.user = userID;
    var dummyInovicePoints = Math.floor((Math.floor(Math.random() * 1001) + 1) * 0.25);
    var newPoints;
    var siteIsFounded = false;
    console.log("current user id", userID);
    User.findById(userID)
        .select({ "points": 1, "_id": 0 })
        .exec(function (err, result) {
            if (err) {
                next(err);
            } else {
                for (var i = 0; i < result.points.length; i++) {
                    if (result.points[i].siteName === newReview.site) {
                        siteIsFounded = true;
                        console.log("current points is "
                            + String(result.points[i].sitePoints)
                            + " for site " + String(result.points[i].siteName));

                        newPoints = result.points[i].sitePoints + dummyInovicePoints;
                        User.updateOne({ _id: userID, "points.siteName": newReview.site }, {
                            $set: { "points.$.sitePoints": newPoints }
                        }, function (err, queryResponse) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("update exist points", queryResponse);
                            }
                        });
                    }
                }
                if (!siteIsFounded) {
                    User.update(
                        { _id: userID },
                        {
                            $push: {
                                "points": {
                                    siteName: newReview.site,
                                    sitePoints: dummyInovicePoints
                                }
                            }
                        },
                        function (err, updateResult) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("insert new points", updateResult);
                            }
                        });
                }
            }
        });

    console.log("review :", newReview);
    Review.create(newReview)
        .then(function (review) {
            res.json(review);
        }, function (err) {
            next(err);
        });
};

exports.delete = function (req, res, next) {
    req.reviewData.remove(function (err, removed) {
        if (err) {
            next(err);
        } else {
            res.json(removed);
        }
    });
};

exports.ranking = function (req, res, next) {
    
    Review.aggregate([
        {
            $project: {
                site: 1,
                moreThan10: {  // Set to 1 if value > 10
                    $cond: [ { $gt: [ "$sentiment", 0.2 ] }, 1, 0]
                },
                negativeSentiement :{
                    $cond: [ { $lt: [ "$sentiment", 0.5 ] }, 1, 0]
                }
            }
        },
        {
            $group: {
                _id: "$site",
                category:"$category",
                postiveReview: { $sum: "$moreThan10" },
                negativeReview : {$sum: "$negativeSentiement"}
            }
        }
    ]).then(res => {console.log(res)})
    
    // Review.find({sentiment : {$gte:0.2 }})
    //     .sort({sentiment:-1})
    //     .then(function (reviews) {
    //         res.json(reviews);
    //         for(i=0;i<reviews.length;i++){
    //             console.log(reviews[i].site)
    //         }
    //         var responsJson = {
    //             siteName:reviews[0].site,
    //             postive:reviews.length
    //         }
    //        }, function (err) {
    //         next(err);
    //     });
};