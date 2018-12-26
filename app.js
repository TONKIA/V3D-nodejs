var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var gm = require('gm');

var db = require('./db');

var app = express();
var storage = multer.diskStorage({
    destination: function (req, res, cb) {
        var fileType = req.params["fileType"];
        //console.info(fileType);
        cb(null, 'uploads/' + fileType);
    }
});
var upload = multer({ storage: storage });
//共享页面

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('static'));
app.use(session({
    secret: 'tonkia', // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 设置 session 的有效时间，单位毫秒
    }
}));
//权限判断：拦截器
app.use(['/create', '/logout', '/home', '/saveScheme', '/getScheme', '/changeShareConfig'], function (req, res, next) {
    if (req.session.user)
        next();
    else
        res.redirect('/');
});

//自定义数据--------------------------------------------------------------------------
var shareLink = '127.0.0.1/share'

//主页加载：登录页面------------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/login.html");
});

//登录验证
app.post('/', function (req, res) {
    var account = req.body.account;
    var password = req.body.password;
    db.queryUserByAccount(account, function (user) {
        //用户验证
        if (account == user.account && password == user.password) {
            req.session.user = user;
            res.send('1');
        } else {
            res.send('0');
        }
    });
});

//主页请求----------------------------------------------------------------------------
//用户主页
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/views/home.html");
});

app.post('/home', function (req, res) {
    //初始化主页数据
    //用户信息
    var user = req.session.user;
    db.querySchemeByUid(user.id, function (schemeList) {
        //去除用户密码信息
        delete user.password;
        var homeData = {
            user: user,
            schemeList: schemeList,
            shareLink: shareLink
        }
        res.send(homeData);
    });
});

//用户注销
app.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/');
});

//方案创建
app.get('/create', function (req, res) {
    res.sendFile(__dirname + "/views/createScheme.html");
});

app.get('/create/:id', function (req, res) {
    res.sendFile(__dirname + "/views/createScheme.html");
});

// 方案分享配置
app.post('/changeShareConfig', function (req, res) {
    var user = req.session.user;
    var data = req.body;
    db.changeShareConfig(data.id, user.id, data.share_password, data.share_state, function (row) {
        if (row.affectedRows > 0) {
            var returnData = {
                affectedRows: row.affectedRows
            }
            res.send(returnData);
        } else {

        }
    });
});

//方案创建页面--------------------------------------------------------------------------------
//初始数据获取
//未创建的方案：获取初始方案
app.post('/getScheme', function (req, res) {
    var data = { name: '默认方案', components: [], img: null, id: null, maxHeight: 10, height: 2, maxDistance: 30, distance: 10 };
    replyData = {
        msg: 0,
        data: data
    }
    res.send(replyData);
});
//已经创建的方案：根据局ID获取初始方案
app.post('/getScheme/:id', function (req, res) {
    var id = req.params['id'];
    var user = req.session.user;
    if (id) {
        db.getSchemeById(user.id, id, function (row) {
            if (row.length > 0) {
                var data = JSON.parse(row[0].data);
                data.id = id;
                replyData = {
                    msg: 0,
                    data: data
                }
                res.send(replyData);
            } else {
                replyData = {
                    msg: 1
                }
                res.send(replyData);
            }
        })
    } else {
    }
});
//文件上传：分为model文件，texture文件
//接受文件上传，并且返回文件名
app.post('/upload/:fileType', upload.single('file'), function (req, res) {
    //console.info(req.file)
    res.send(req.file);
});
//文件返回
//贴图文件：返回缩略图
app.get('/files/thumbnail/:filename', function (req, res) {
    var filename = req.params['filename'];
    // fs.exists(__dirname + "/uploads/thumbnail/" + filename, function (exist) {
    //     if (exist) {
    //         res.sendFile(__dirname + "/uploads/thumbnail/" + filename);
    //     } else {
    //         gm('./uploads/' + filename).resize(40, 40).write("./uploads/thumbnail/" + filename, function (err) {
    //             if (!err)
    //                 console.info(err);
    //                 res.sendFile(__dirname + "/uploads/thumbnail/" + filename);
    //         })
    //     }
    // });
    res.sendFile(__dirname + "/uploads/texture/" + filename);
});

//其他文件（model文件，texture文件）：返回文件
app.get('/files/:fileType/:fileName', function (req, res) {
    //TODO 根据session判断是否有权限获取文件
    var fileType = req.params['fileType'];
    var fileName = req.params['fileName'];
    res.sendFile(__dirname + "/uploads/" + fileType + "/" + fileName);
});

//保存方案
app.post('/saveScheme', function (req, res) {
    var data = req.body;
    var id = data.id;
    var img = data.img;
    delete data.img;
    //如果有id存在就update
    if (id) {
        db.updateScheme(req.session.user.id, id, data.name, JSON.stringify(data), img, function (row) {
            if (row.affectedRows > 0) {
                var returnData = {
                    affectedRows: row.affectedRows
                }
                res.send(returnData);
            } else {

            }
        });
    } else {
        //如果id不存在就插入数据返回id
        db.insertScheme(req.session.user.id, data.name, JSON.stringify(data), img, function (row) {
            if (row.affectedRows > 0) {
                var returnData = {
                    affectedRows: row.affectedRows,
                    insertId: row.insertId
                }
                res.send(returnData);
            } else {
                //插入失败
            }
        });
    }
    // console.info(data);
});


//分享页面------------------------------------------------------------------------------------------------
//页面返回
app.get('/share/:id', function (req, res) {
    res.sendFile(__dirname + "/views/share.html");
});
//分享状态获取
app.post('/share/:id', function (req, res) {
    var id = req.params['id'];
    db.getShareById(id, function (row) {
        if (row.length > 0)
            res.send(row[0].share_state + "");
        else
            //如果没有则返回
            res.send(3 + "");
    });
});
//获取分享的data数据
app.post('/shareData/:id', function (req, res) {
    var id = req.params['id'];
    var reqData = req.body;
    // console.info(reqData);
    if (reqData.state == 1) {
        db.getShareData(id, function (row) {
            if (row.length > 0) {
                var data = JSON.parse(row[0].data);
                replyData = {
                    msg: 0,
                    data: data
                }
                res.send(replyData);
            } else {
                replyData = {
                    msg: 1
                }
                res.send(replyData);
            }
        })
    } else if (reqData.state == 2) {
        db.getShareDataByPassword(id, reqData.password, function (row) {
            if (row.length > 0) {
                var data = JSON.parse(row[0].data);
                replyData = {
                    msg: 0,
                    data: data
                }
                res.send(replyData);
            } else {
                replyData = {
                    msg: 1
                }
                res.send(replyData);
            }
        })
    }
});
//------------------------------------------------------------------------------------
app.listen(80);