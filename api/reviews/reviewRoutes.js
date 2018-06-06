var router = require('express').Router();
var controller = require('./reviewController');
var expressJwt = require("express-jwt");

router.param('id', controller.params);

router.route('/')
    .get(controller.get)
    .post(expressJwt({secret: process.env.SECRET}),controller.post)

router.route('/:id')
    .get(controller.getOne)
    .delete(expressJwt({secret: process.env.SECRET}),controller.delete)

module.exports = router;