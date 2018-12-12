var express = require('express');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var bodyParser = require('body-parser');
var fs = require('fs');
var gm = require('gm');


var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('static'));

//临时存储数据
var data = { name: '默认方案', components: [] };


//主页加载
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/createScheme.html");
});

//接受文件上传，并且返回文件名
app.post('/upload', upload.single('file'), function (req, res) {
    //console.info(req.file)
    res.send(req.file);
});

//返回文件
app.get('/files/:filename', function (req, res) {
    //TODO 根据session判断是否有权限获取文件
    var filename = req.params['filename'];
    res.sendFile(__dirname + "/uploads/" + filename);
});
//返回缩略图
app.get('/files/thumbnail/:filename', function (req, res) {
    var filename = req.params['filename'];
    fs.exists(__dirname + "/uploads/thumbnail/" + filename, function (exist) {
       
        if (exist) {
            res.sendFile(__dirname + "/uploads/thumbnail/" + filename);
        } else {
            gm('./uploads/' + filename).resize(40, 40).write("./uploads/thumbnail/" + filename, function (err) {
                if (!err)
                    console.info(err);
                    res.sendFile(__dirname + "/uploads/thumbnail/" + filename);
            })
        }
    });
});

//保存方案
app.post('/saveScheme', function (req, res) {
    data = req.body;
});

//获取方案
app.post('/getScheme', function (req, res) {
    res.send(data);
});

app.listen(80);