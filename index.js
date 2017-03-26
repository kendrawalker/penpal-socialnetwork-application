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
const server = require('http').Server(app);
const io = require('socket.io')(server);

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
    console.log(req.method, req.url);
    next();
});
app.use(csurf());
app.use(function(req, res, next) {
    res.cookie('ChocChip', req.csrfToken());
    next();
});

io.on('connect', function(socket) {
    socket.on('disconnect', function() {
    });
});

let online = [];
app.get('/present/:socketId', function(req, res) {
    console.log("socket obtained", req.session.user.userID);
    let exists = online.find((item) => {
        return item.socketId == req.params.socketId;
    });
    if (!exists) {
        online.push({
            id: req.session.user.userID,
            socketId: req.params.socketId
        });
        console.log(online);
    }
    res.send();
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
                        console.log("user data inserted");
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
    var age = req.body.age || null;
    var zip = req.body.postalCode || null;
    console.log(zip);
    var query = 'SELECT * FROM user_bios WHERE user_id=$1;';
    var query2 = 'UPDATE user_bios set bio=$1, age=$2, gender=$3, address_1=$4, address_2=$5, city=$6, state=$7, country=$8, postal_code=$9 WHERE user_id=$10;';
    var query3 = 'INSERT INTO user_bios (user_id, bio, age, gender, address_1, address_2, city, state, country, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;';
    db.query(query, [req.session.user.userID], function(err, results) {
        if(results.rows[0]) {
            db.query(query2, [req.body.bio, age, req.body.gender, req.body.address1, req.body.address2, req.body.city, req.body.state, req.body.country, zip, req.session.user.userID], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("bio data updated");
                    res.json({
                        success: true
                    });
                }
            });
        } else {
            db.query(query3, [req.session.user.userID, req.body.bio, age, req.body.gender,  req.body.address1, req.body.address2, req.body.city, req.body.state, req.body.country, zip], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("bio data inserted");
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
    user_bios.age AS age, user_bios.city AS city, user_bios.country AS country, profile_pics.profile_pic AS profile_pic, profile_pics.id
    FROM users
    LEFT JOIN user_bios ON user_bios.user_id = users.id
    LEFT JOIN profile_pics ON profile_pics.user_id = users.id
    WHERE users.id = $1 ORDER BY profile_pics.id DESC LIMIT 1;`;
    db.query(query, [req.params.id], function(err, results) {
        if(err) {
            console.log(err);
        } else {
            var query2 = `SELECT requestor_id, recipient_id, status FROM friend_status WHERE ((requestor_id=$1 AND recipient_id=$2) OR (requestor_id=$2 AND recipient_id=$1)) AND status != 400;`;
            db.query(query2, [req.session.user.userID, req.params.id], function(err, results2) {
                if(err) {
                    console.log(err);
                } else if (!results2.rows[0]) {
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic,
                        bio: results.rows[0].bio,
                        age: results.rows[0].age,
                        gender: results.rows[0].gender,
                        city: results.rows[0].city,
                        country: results.rows[0].country,
                        status: 0,
                        friendStatus: "Add Friend",
                        requestor: true,
                    });
                } else if ((results2.rows[0].requestor_id == req.session.user.userID) && (results2.rows[0].status == 200)) {
                    console.log(results2.rows[0].status, 9999999999999);
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic,
                        bio: results.rows[0].bio,
                        age: results.rows[0].age,
                        gender: results.rows[0].gender,
                        city: results.rows[0].city,
                        country: results.rows[0].country,
                        status: results2.rows[0].status,
                        friendStatus: "Friend Request Pending",
                        requestor: true
                    });
                } else if ((results2.rows[0].recipient_id == req.session.user.userID) && (results2.rows[0].status == 200)) {
                    console.log(results2.rows[0].status, 9999999999999);
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic,
                        bio: results.rows[0].bio,
                        age: results.rows[0].age,
                        gender: results.rows[0].gender,
                        city: results.rows[0].city,
                        country: results.rows[0].country,
                        status: results2.rows[0].status,
                        friendStatus: "Accept Pending Friend Request",
                        requestor: false
                    });
                } else if (results2.rows[0].status == 300) {
                    console.log(results2.rows[0].status, 9999999999999);
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic,
                        bio: results.rows[0].bio,
                        age: results.rows[0].age,
                        gender: results.rows[0].gender,
                        city: results.rows[0].city,
                        country: results.rows[0].country,
                        status: results2.rows[0].status,
                        friendStatus: "Remove Friend",
                        requestor: true
                    });
                } else if (results2.rows[0].status == 100) {
                    console.log(results2.rows[0].status, 9999999999999);
                    res.json({
                        firstName: results.rows[0].first_name,
                        lastName: results.rows[0].last_name,
                        profilePicURL: results.rows[0].profile_pic,
                        bio: results.rows[0].bio,
                        age: results.rows[0].age,
                        gender: results.rows[0].gender,
                        city: results.rows[0].city,
                        country: results.rows[0].country,
                        status: results2.rows[0].status,
                        friendStatus: "Add Friend",
                        requestor: true
                    });
                } else {
                    console.log(results2.rows[0].status, "didn't meet any criteria");
                }
            });
        }
    });
});

app.post('/updatefriendstatus', function(req, res) {
    console.log(req.body.status, 777777777777);
    var query1 = 'INSERT INTO friend_status (requestor_id, recipient_id, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id;';
    var query2 = 'UPDATE friend_status SET status=$1, updated_at=NOW() WHERE (recipient_id=$2 and requestor_id=$3) OR (recipient_id=$3 and requestor_id=$2) AND status !=400;';
    if(req.body.status==0) {
        db.query(query1, [req.session.user.userID, req.body.pal, 200], function(err) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    status: 200,
                    friendStatus: "Friend Request Pending",
                    requestor: true
                });
            }
        });
    } else if (req.body.status == 100) {
        db.query(query2, [200, req.session.user.userID, req.body.pal], function(err) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    status: 200,
                    friendStatus: "Friend Request Pending",
                    requestor: true
                });
            }
        });
    } else if (req.body.status==200 && req.body.requestor) {
        res.json({
            status: req.body.status,
            friendStatus: "Friend Request Pending",
            requestor: true
        });
    } else if (req.body.status==200 && !req.body.requestor) {
        db.query(query2, [300, req.session.user.userID, req.body.pal], function(err) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    status: 300,
                    friendStatus: "Remove Friend",
                    requestor: true
                });
            }
        });
    } else if (req.body.status==300) {
        db.query(query2, [400, req.session.user.userID, req.body.pal], function(err) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    status: 400,
                    friendStatus: "Removed",
                    requestor: true
                });
            }
        });
    }
});


app.get('/mypals/:friends', function(req, res) {
    var friendState = req.params.friends;
    console.log(friendState);
    console.log("starting to get the pals");
    var query = `SELECT users.id, users.first_name, users.last_name, users.id, MAX(profile_pics.profile_pic) AS image, user_bios.city
    FROM users
    LEFT JOIN profile_pics ON users.id = profile_pics.user_id
    LEFT JOIN user_bios ON users.id = user_bios.user_id
    LEFT JOIN friend_status ON (users.id = friend_status.recipient_id OR users.id = friend_status.requestor_id)
    WHERE (friend_status.requestor_id =$1 OR friend_status.recipient_id =$1) AND users.id !=$1 AND friend_status.status = 300
    GROUP BY users.id, users.first_name, users.last_name, users.id, user_bios.city;`;
    var query2 = `SELECT users.id, users.first_name, users.last_name, MAX(profile_pics.profile_pic) AS image, user_bios.city
    FROM users
    LEFT JOIN profile_pics ON users.id = profile_pics.user_id
    LEFT JOIN user_bios ON users.id = user_bios.user_id
    WHERE users.id not in ( SELECT users.id
    FROM users
    LEFT JOIN friend_status ON (users.id = friend_status.recipient_id OR users.id = friend_status.requestor_id)
    WHERE (recipient_id = $1 OR requestor_id = $1)) AND users.id !=$1
    GROUP BY users.id, users.first_name, users.last_name, users.id, user_bios.city;`;
    var query3 = `SELECT users.id, users.first_name, users.last_name, users.id, MAX(profile_pics.profile_pic) AS image, user_bios.city
    FROM users
    LEFT JOIN profile_pics ON users.id = profile_pics.user_id
    LEFT JOIN user_bios ON users.id = user_bios.user_id
    LEFT JOIN friend_status ON users.id = friend_status.requestor_id
    WHERE friend_status.recipient_id = $1 AND friend_status.status = 200
    GROUP BY users.id, users.first_name, users.last_name, users.id, user_bios.city;`;
    if (friendState == "friends") {
        db.query(query, [req.session.user.userID], function(err, results) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    pals: results.rows
                });
            }
        });
    } else if (friendState == "nonFriends") {
        db.query(query2, [req.session.user.userID], function(err, results2) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    pals: results2.rows
                });
            }
        });
    } else if (friendState == "pendingFriends") {
        db.query(query3, [req.session.user.userID], function(err, results3) {
            if(err) {
                console.log(err);
            } else {
                res.json({
                    pals: results3.rows
                });
            }
        });
    }
});

app.get('/onlinenow/pals', function(req, res) {
    let ids = online.map((item) => item.id);
    console.log(online);
    ids = ids.filter((id, idx) => ids.indexOf(id) == idx);
    var query = `SELECT users.id, users.first_name, users.last_name, users.id, MAX(profile_pics.profile_pic) AS image, user_bios.city
    FROM users
    LEFT JOIN profile_pics ON users.id = profile_pics.user_id
    LEFT JOIN user_bios ON users.id = user_bios.user_id
    WHERE users.id in (${ids})
    GROUP BY users.id, users.first_name, users.last_name, users.id, user_bios.city;`;
    db.query(query, function(err, results) {
        if(err) {
            console.log(err);
            res.json({
                error: true
            });
        } else {
            res.json({
                pals: results.rows
            });
        }
    });
});

//////logout
app.get('/signout/user', function(req, res) {
    console.log("signing user out");
    req.session = null;
    res.json({
        success: true
    });
    res.redirect('/welcome');
});

app.get('*', function(req, res) {
    if(req.session.user.loggedin == 'yes') {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/welcome');
    }
});

server.listen(8080, function() {
    console.log("I'm listening.");
});
