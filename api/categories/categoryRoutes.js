var router = require('express').Router();
var controller = require('./categoryController');
var expressJwt = require("express-jwt");

router.param('id', controller.params);

router.route('/')
.get(controller.get)
.post(expressJwt({secret: process.env.SECRET}),controller.post)

router.route('/:id')
//.get(controller.getOne)
.delete(expressJwt({secret: process.env.SECRET}),controller.delete)

router.route('/get_categories').post(controller.getSiteID)

module.exports = router;
