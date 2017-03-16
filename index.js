const express = require('express');
const app = express();
var spicedPg = require('spiced-pg');
var db = spicedPg(process.env.DATABASE_URL || 'postgres:kendr:soybean88@localhost:5432/social_network');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var passwordAuth = require('./src/passwordauth');
var multer = require('multer');
var csurf = require('csurf');

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

app.use(cookieSession({
    secret: 'working is for old people',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use("/uploads", express.static(__dirname + '/public/uploads'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(csurf());

app.get('/', function(req, res){
    if(req.session.user) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/welcome');
    }
});

app.get('/welcome', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', function(req, res){
    console.log(req.method, req.url);
    console.log(req.body.firstName, req.body.lastName, req.body.email, req.body.password);
    if(req.body.firstName && req.body.lastName && req.body.email && req.body.password) {
        passwordAuth.hashPassword(req.body.password, function(err, hashedPass) {
            if (err) {
                console.log(err);
            } else {
                var query = 'INSERT INTO users (first_name, last_name, email_address, password) VALUES ($1, $2, $3, $4) RETURNING id';
                db.query(query, [req.body.firstName, req.body.lastName, req.body.email, hashedPass], function(err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("data inserted");
                        req.session.user = {
                            userID: results.rows[0].id,
                            firstName: req.body.firstInput,
                            lastName: req.body.lastInput,
                            loggedin: 'yes'
                        };
                        res.json({
                            success: true
                        });
                    }
                });
            }
        });
    } else {
        console.log("not all the data was completed");
        res.json({
            success: "error"
        });
    }
});


app.post('/signin', function(req, res) {
    console.log("the sign in has initiated");
    console.log(req.body.email, req.body.password);
    if(req.body.email && req.body.password) {
        var query = 'SELECT first_name, last_name, id, email_address, password FROM users WHERE email_address = $1;';
        db.query(query, [req.body.email], function (err, results) {
            if(err || !results.rows[0]) {
                console.log(err);
            } else {
                passwordAuth.checkPassword(req.body.password, results.rows[0].password, function(err, doesMatch) {
                    if(err) {
                        console.log(err);
                    } else if (doesMatch) {
                        req.session.user = {
                            userID: results.rows[0].id,
                            firstName: results.rows[0].first_name,
                            lastName: results.rows[0].last_name,
                            loggedin: 'yes'
                        };
                        console.log(req.session.user);
                        res.json({
                            success: true
                        });
                    } else {
                        res.json({
                            success: "error"
                        });
                    }
                });
            }
        });
    } else {
        console.log("not all the data was completed");
        res.json({
            success: "error"
        });
    }
});


app.get('/userprofile', function(req, res) {
    if(req.session.user.loggedin == 'yes') {
        console.log(22);
        var query = 'SELECT profile_pics.id, profile_pics.user_id AS user_id, profile_pics.profile_pic AS profile_pic, users.first_name AS first_name, users.last_name AS last_name FROM profile_pics LEFT JOIN users on profile_pics.user_id = users.id WHERE profile_pics.user_id = $1 ORDER BY profile_pics.id DESC LIMIT 1;';
        db.query(query, [req.session.user.userID], function(err, results) {
            console.log(req.session.user);
            console.log(req.session.user.userID);
            if(err) {
                console.log(err);
            } else {
                if(results.rows[0]) {
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic
                    });
                } else {
                    res.json({
                        firstName: req.session.user.firstName,
                        lastName: req.session.user.lastName,
                        profilePicURL: '/man_heart.png'
                    });
                }
            }
        });
    } else {
        res.json({
            error: true
        });
    }
});


app.post('/fileupload', uploader.single('file'), function(req, res) {
    if(req.file) {
        var filename = '/uploads/' + req.file.filename;
        var query = 'INSERT INTO profile_pics (profile_pic, user_id) VALUES ($1, $2) RETURNING id;';
        db.query(query, [filename, req.session.user.userID], function(err, results) {
            if(err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                console.log("insert image complete");
                var query2 = 'SELECT profile_pic FROM profile_pics where id = $1;';
                db.query(query2, [results.rows[0].id], function(err, result) {
                    if(err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else {
                        res.json({
                            image: result.rows[0].profile_pic
                        });
                    }
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});


app.listen(8080, function() {
    console.log("I'm listening.");
});
