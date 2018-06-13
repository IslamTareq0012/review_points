var router = require('express').Router();
var controller = require('./reviewController');
var expressJwt = require("express-jwt");

router.param('id', controller.params);

router.route('/search')
    .post(expressJwt({secret: process.env.SECRET}),controller.search);

router.route('/')
    .get(controller.get)
    .post(expressJwt({secret: process.env.SECRET}),controller.post)

router.route('/ranking')
        .get(controller.ranking)

router.route('/categoryRanking')
        .get(controller.categoryRanking)        

router.route('/:id')
    .get(controller.getOne)
    .delete(expressJwt({secret: process.env.SECRET}),controller.delete)

module.exports = router;