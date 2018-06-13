var jwt = require("jsonwebtoken");
var User = require('../users/userModel');
var Site = require('../sites/siteModel');
var fs = require('fs');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var hbs = require('nodemailer-express-handlebars');
var email = 'islamwoow@gmail.com';
var pass = '123456789&@';
var nodemailer = require('nodemailer');
var path = require('path');
var async = require('async');
var crypto = require('crypto');

// nodemailer options
var smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
    auth: {
        user: email,
        pass: pass
    }
});

// mail template engine
var handlebarsOptions = {
    viewEngine: 'handlebars',
    viewPath: path.resolve('././templates/'),
    extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

exports.adminSignup = function (req, res, next) {
    console.log("request body : ", req.body);
    Site.findOne({ siteName: req.body.siteName, siteUrl: req.body.siteUrl }, (err, existingSite) => {
        if (err) {
            return res.status(500).send({ success: false, err });
        }
        if (existingSite !== null) {
            return res.status(400).send({ success: false, err: "That email already exists!" });
        }
        newSite = req.body;
        Site.create(newSite).then(function (site) {
            jwtPayload = {
                _id: site._id,
                siteName: site.siteName,
                adminEmail: site.admin.email,
            }
            const token = jwt.sign({ siteData: jwtPayload }, process.env.SECRET);
            return res.status(201).send({ success: true, site: { siteData: jwtPayload }, token: token });
        }, function (err) {
            next(err);
        });
    });
};

exports.adminLogin = function (req, res, next) {
    Site.findOne({ 'admin.email': req.body.email.toLowerCase(), siteName: req.body.siteName }, function (err, site) {
        if (err) return res.status(500).send({ success: false, err });
        if (site) {
            console.log("site admin ", site);
            bcrypt.compare(req.body.password, site.admin.password, (err, isMatch) => {
                if (err) {
                    next(err);
                }
                if (isMatch) {
                    // if so - they are logged in!
                    console.log("is matched", isMatch);
                    jwtPayload = {
                        _id: site._id,
                        siteName: site.siteName,
                        adminEmail: site.admin.email,
                    }
                    const token = jwt.sign({ siteData: jwtPayload }, process.env.SECRET);
                    return res.status(201).send({ success: true, site: { siteData: jwtPayload }, token });
                } else {
                    return res.status(403).send({ success: false, err: "Email or password are incorrect" });
                }
            });
        }
    })
}

exports.signUp = function (req, res, next) {
    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) return res.status(500).send({ success: false, err });
        if (existingUser !== null) {
            return res.status(400).send({ success: false, err: "That username already exists!" });
        }
    });
    var img = req.body.userImage;
    var imgBase64;

    if (!img) {
        var newUser = req.body;
        newUser.userImage = String(req.body.email) + "_avatar.png";
        User.create(newUser)
            .then(function (user) {
                const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                return res.status(201).send({ success: true, user: { _id: user._id, userData: user }, token });
            }, function (err) {
                next(err);
            });
    }
    if (String(img).includes("image/png;base64,")) {
        imgBase64 = img.split(';base64,').pop();
        fs.writeFile('././images/' + String(req.body.email) + "_image.png", imgBase64, { encoding: 'base64' }, function (err) {
            if (err) {
                console.log("saving image error", err);
            }
            else {
                var newUser = req.body;
                newUser.userImage = String(req.body.email) + "_image.png";
                User.create(newUser)
                    .then(function (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                        return res.status(201).send({ success: true, user: { _id: user._id, userData: user }, token });
                    }, function (err) {
                        next(err);
                    });
            }
        });
    } else {
        fs.writeFile('././images/' + String(req.body.email) + "_image.png", req.body.userImage, { encoding: 'base64' }, function (err) {
            if (err) {
                console.log("saving image error", err);
            }
            else {
                var newUser = req.body;
                newUser.userImage = String(req.body.email) + "_image.png";
                User.create(newUser)
                    .then(function (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                        return res.status(201).send({ success: true, user: { _id: user._id, userData: user }, token });
                    }, function (err) {
                        next(err);
                    });
            }
        });
    }

};

exports.login = function (req, res, next) {
    User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) {
            return res.status(403).send({ success: false, err: "Email or password are incorrect" })
        } else {
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (isMatch) {
                    // if so - they are logged in!
                    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
                    return res.send({ token: token, user: { _id: user._id }, success: true })
                } else {
                    return res.status(403).send({ success: false, err: "Email or password are incorrect" })
                }
            });
        }
    });
};

exports.forgotPassword = function (req, res, next) {
    async.waterfall([
        function (done) {
            User.findOne({
                email: req.body.email
            }).exec(function (err, user) {
                if (user) {
                    done(err, user);
                } else {
                    done('User not found.');
                }
            });
        },
        function (user, done) {
            // create the random token
            crypto.randomBytes(20, function (err, buffer) {
                var token = buffer.toString('hex');
                done(err, user, token);
            });
        },
        function (user, token, done) {
            User.findByIdAndUpdate({ _id: user._id }, { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 }).exec(function (err, new_user) {
                done(err, token, new_user);
            });
        },
        function (token, user, done) {
            var data = {
                to: user.email,
                from: email,
                template: 'forgot-password-email',
                subject: 'Password help has arrived!',
                context: {
                    url: 'http://localhost:3000/api/auth/reset_password?token=' + token,
                    name: user.fullName.split(' ')[0]
                }
            };

            smtpTransport.sendMail(data, function (err) {
                if (!err) {
                    return res.json({ message: 'Kindly check your email for further instructions' });
                } else {
                    return done(err);
                }
            });
        }
    ], function (err) {
        return res.status(403).json({ message: err });
    });
};

exports.renderResetPasswordTemplate = function (req, res) {
    return res.sendFile(path.resolve('././public/reset-password.html'));
};

exports.resetPassword = function (req, res, next) {
    User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }).exec(function (err, user) {
        if (!err && user) {
            if (req.body.newPassword === req.body.verifyPassword) {
                //user.password = bcrypt.hashSync(req.body.newPassword, 10);
                //console.log("new password hash is" , req.body.newPassword);
                user.password = req.body.newPassword;
                user.resetPasswordToken = "undefined";
                user.resetPasswordExpires = 0;
                user.save(function (err, saved) {
                    if (err) {
                        return res.status(422).send({
                            message: err
                        });
                    } else {
                        var data = {
                            to: user.email,
                            from: email,
                            template: 'reset-password-email',
                            subject: 'Password Reset Confirmation',
                            context: {
                                name: user.fullName.split(' ')[0]
                            }
                        };

                        smtpTransport.sendMail(data, function (err) {
                            if (!err) {
                                return res.json({ message: 'Password reset' });
                            } else {
                                console.log("error sending password reset confirmation mail", err);
                            }
                        });
                        console.log("user after edit password", saved);
                    }
                });
            } else {
                return res.status(422).send({
                    message: 'Passwords do not match'
                });
            }
        } else {
            return res.status(400).send({
                message: 'Password reset token is invalid or has expired.'
            });
        }
    });
};