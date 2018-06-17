var router = require('express').Router();
var controller = require('./siteController');
var expressJwt = require("express-jwt");

router.route('/my_site')
        .all(expressJwt({ secret: process.env.SECRET }),controller.findSite)
        .get(expressJwt({ secret: process.env.SECRET }),controller.getOne)
        .put(expressJwt({ secret: process.env.SECRET }),controller.put)
        .delete(expressJwt({ secret: process.env.SECRET }),controller.delete);
        
router.route('/').get(controller.get);
        
module.exports = router;