var router = require('express').Router();
var expressJwt = require("express-jwt");

router.use('/auth', require('./authentication/authRoutes'));
router.use("/users", expressJwt({ secret: process.env.SECRET }), require('./users/userRoutes'));
router.use("/reviews", require('./reviews/reviewRoutes'));
router.use("/sites", expressJwt({ secret: process.env.SECRET }), require('./sites/siteRoutes'));
router.use("/categories", require('./categories/categoryRoutes'));

module.exports = router;