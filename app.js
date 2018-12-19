var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var gm = require('gm');

var app = express();

var storage = multer.diskStorage({
    destination: function (req, res, cb) {
        var fileType = req.params["fileType"];
        console.info(fileType);
        cb(null, 'uploads/' + fileType);
    }
});
var upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('static'));
app.use(session({
    secret: 'tonkia', // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
        maxAge: 1000 * 60 * 2, // 设置 session 的有效时间，单位毫秒
    }
}));

//权限判断
app.use(['/create', '/logout', '/home'], function (req, res, next) {
    if (req.session.user)
        next();
    else
        res.redirect('/');
});

//临时存储数据
var data = { name: '默认方案', components: [] };
var user = { account: 'tonkia', userName: 'tonkia xx', password: '123' };

//主页加载：登录页面
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/login.html");
});

//方案创建
app.get('/create', function (req, res) {
    res.sendFile(__dirname + "/views/createScheme.html");
});

//登录
app.post('/', function (req, res) {
    var account = req.body.account;
    var password = req.body.password;
    //用户验证
    if (account == user.account && password == user.password) {
        req.session.user = user;
        res.send('1');
    } else {
        res.send('0');
    }
});

//用户注销
app.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/');
});

//用户主页
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/views/home.html");
});

//接受文件上传，并且返回文件名
app.post('/upload/:fileType', upload.single('file'), function (req, res) {
    console.info(req.file)
    res.send(req.file);
});

//返回缩略图
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

//返回文件
app.get('/files/:fileType/:fileName', function (req, res) {
    //TODO 根据session判断是否有权限获取文件
    var fileType = req.params['fileType'];
    var fileName = req.params['fileName'];
    res.sendFile(__dirname + "/uploads/" + fileType + "/" + fileName);
});

//保存方案
app.post('/saveScheme', function (req, res) {
    data = req.body;
    console.info(data);
});

//获取方案
app.post('/getScheme', function (req, res) {
    res.send(data);
});

app.listen(80);