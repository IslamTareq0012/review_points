var Site = require('./siteModel');



exports.findSite = function (req, res, next) {

    Site.findById(req.user.siteData._id)
        .then(function (site) {
            if (!site) {
                next(new Error('Site not found'));
            } else {
                req.siteData = site;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
    Site.find({})
        .then(function (sites) {
            res.json(sites);
        }, function (err) {
            next(err);
        });
};


exports.getOne = function (req, res, next) {
    console.log("token :", req.headers.authorization);
    var site = req.siteData;
    res.json(site);
};


exports.delete = function (req, res, next) {
    req.siteData.remove(function (err, removed) {
        if (err) {
            next(err);
        } else {
            res.json(removed);
        }
    });
};

exports.put = function (req, res, next) {
    var site = req.siteData;

    var update = req.body;

    _.merge(site, update);
    site.save(function (err, saved) {
        if (err) {
            next(err);
        } else {
            res.json(saved);
        }
    });

};


