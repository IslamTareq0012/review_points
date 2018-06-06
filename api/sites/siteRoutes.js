var router = require('express').Router();
var controller = require('./siteController');
var expressJwt = require("express-jwt");

router.route('/my_site')
        .all(controller.findSite)
        .get(controller.getOne)
        .put(controller.put)
        .delete(controller.delete);
        

        
module.exports = router;