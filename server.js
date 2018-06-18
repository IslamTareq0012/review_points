// TODO: make this work.
// if yuo go to localhost:3000 the app
// there is expected crud to be working here
var express = require('express');
var app = express();
var _ = require('lodash');
require('mongoose').connect("mongodb://admin:admin123456@ds263740.mlab.com:63740/reviewpoints_db");
require("dotenv").config();
require('./middelware/appMiddelwares')(app);
var api = require('./api/api');
var port = process.env.PORT || 3000;

app.use('/images/', express.static('images'));
app.use('/api/', api);


//global error handeling
app.use(function (err, req, res, next) {
    // if error thrown from jwt validation check
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid token');
        return;
    }
    res.status(500).send(err);
});


app.listen(port);
console.log('on port 3000');