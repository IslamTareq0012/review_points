var router = require('express').Router();
var controller = require('./userController');

//router.param('id', controller.params);

router.route('/all')
        .get(controller.get);

router.route('/getReviews')
        .all(controller.findUser)
        .get(controller.getUserID)

router.route('/updateFcmToken')
        .all(controller.findUser)
        .post(controller.updateFcmToken)

router.route('/me')
        .all(controller.findUser)
        .get(controller.getOne)
        .put(controller.put)
        .delete(controller.delete)


module.exports = router;