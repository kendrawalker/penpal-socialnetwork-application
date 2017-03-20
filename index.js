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
app.use(function(req, res, next) {
    console.log(req.headers);
    next();
});
app.use(csurf());
app.use(function(req, res, next) {
    res.cookie('ChocChip', req.csrfToken());
    next();
});

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
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
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
        var query = `SELECT profile_pics.id, profile_pics.user_id AS user_id, profile_pics.profile_pic AS profile_pic,
        users.first_name AS first_name, users.last_name AS last_name
        FROM profile_pics
        LEFT JOIN users ON profile_pics.user_id = users.id
        WHERE profile_pics.user_id = $1 ORDER BY profile_pics.id DESC LIMIT 1;`;
        var query2 = `SELECT id, age, gender, bio, address_1, address_2, city, state, country, postal_code
        FROM user_bios
        WHERE user_bios.user_id = $1;`;
        db.query(query, [req.session.user.userID], function(err, results) {
            if(err) {
                console.log(err);
            } else {
                if(results.rows[0]) {
                    db.query(query2, [req.session.user.userID], function(err, result2) {
                        if(err) {
                            console.log(err);
                        } else {
                            if(result2.rows[0]) {
                                res.json({
                                    firstName: results.rows[0].first_name,
                                    lastName: results.rows[0].last_name,
                                    profilePicURL: results.rows[0].profile_pic,
                                    bio: result2.rows[0].bio,
                                    age: result2.rows[0].age,
                                    gender: result2.rows[0].gender,
                                    address1: result2.rows[0].address_1,
                                    address2: result2.rows[0].address_2,
                                    state: result2.rows[0].state,
                                    city: result2.rows[0].city,
                                    country: result2.rows[0].country,
                                    postalCode: result2.rows[0].postal_code
                                });
                            } else {
                                res.json({
                                    firstName: results.rows[0].first_name,
                                    lastName: results.rows[0].last_name,
                                    profilePicURL: results.rows[0].profile_pic,
                                    bio: 'No Bio Information Available',
                                    age: '',
                                    gender: '',
                                    address1: '',
                                    address2: '',
                                    city: '',
                                    state: '',
                                    country: '',
                                    postalCode: '',
                                });
                            }
                        }
                    });
                } else {
                    db.query(query2, [req.session.user.userID], function(err, result2) {
                        if(err) {
                            console.log(err);
                        } else {
                            if(result2.rows[0]) {
                                res.json({
                                    firstName: req.session.user.firstName,
                                    lastName: req.session.user.lastName,
                                    profilePicURL: '/man_heart.png',
                                    bio: result2.rows[0].bio,
                                    age: result2.rows[0].age,
                                    gender: result2.rows[0].gender,
                                    address1: result2.rows[0].address_1,
                                    address2: result2.rows[0].address_2,
                                    state: result2.rows[0].state,
                                    city: result2.rows[0].city,
                                    country: result2.rows[0].country,
                                    postalCode: result2.rows[0].postal_code
                                });
                            } else {
                                res.json({
                                    firstName: req.session.user.firstName,
                                    lastName: req.session.user.lastName,
                                    profilePicURL: '/man_heart.png',
                                    bio: 'No Bio Information Available',
                                    age: '',
                                    gender: '',
                                    address1: '',
                                    address2: '',
                                    city: '',
                                    state: '',
                                    country: '',
                                    postalCode: '',
                                });
                            }
                        }
                    });
                }
            }
        });
    } else {
        res.redirect('/welcome');
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

app.post('/updatebio', function(req, res){
    console.log("edit post initiated");
    console.log(req.method, req.url);
    console.log(req.body.bio, req.body.gender, req.body.age, req.body.city);
    var query = 'SELECT * FROM user_bios WHERE user_id=$1;';
    var query2 = 'UPDATE user_bios set bio=$1, age=$2, gender=$3, address_1=$4, address_2=$5, city=$6, state=$7, country=$8, postal_code=$9 WHERE user_id=$10;';
    var query3 = 'INSERT INTO user_bios (user_id, bio, age, gender, address_1, address_2, city, state, country, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;';
    db.query(query, [req.session.user.userID], function(err, results) {
        if(results.rows[0]) {
            db.query(query2, [req.body.bio, req.body.age, req.body.gender, req.body.address1, req.body.address2, req.body.city, req.body.state, req.body.country, req.body.postalCode, req.session.user.userID], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("data updated");
                    res.json({
                        success: true
                    });
                }
            });
        } else {
            db.query(query3, [req.session.user.userID, req.body.bio, req.body.age, req.body.gender,  req.body.address1, req.body.address2, req.body.city, req.body.state, req.body.country, req.body.postalCode], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("data inserted");
                    res.json({
                        success: true
                    });
                }
            });
        }
    });
});

app.get('/user/:id', function(req, res) {
    console.log(req.params.id);
    var query = `SELECT users.id, users.first_name AS first_name, users.last_name AS last_name, user_bios.bio AS bio, user_bios.gender AS gender,
    user_bios.age AS age, user_bios.city AS city, user_bios.country AS country, profile_pics.profile_pic AS profile_pic
    FROM users
    LEFT JOIN user_bios ON user_bios.user_id = users.id
    LEFT JOIN profile_pics ON profile_pics.user_id = users.id
    WHERE users.id = $1;`;
    db.query(query, [req.params.id], function(err, results) {
        if(err) {
            console.log(err);
        } else {
            res.json({
                firstName: results.rows[0].first_name,
                lastName: results.rows[0].last_name,
                profilePicURL: results.rows[0].profile_pic,
                bio: results.rows[0].bio,
                age: results.rows[0].age,
                gender: results.rows[0].gender,
                city: results.rows[0].city,
                country: results.rows[0].country
            });
        }
    });
});

app.get('*', function(req, res) {
    if(req.session.user.loggedin == 'yes') {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/welcome');
    }
});

app.listen(8080, function() {
    console.log("I'm listening.");
});
