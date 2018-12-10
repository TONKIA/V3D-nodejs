var express = require('express');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var app = express();

app.use(express.static('static'));

//主页加载
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/createScheme.html");
});

//接受文件上传，并且返回文件名
app.post('/upload', upload.single('file'), function (req, res) {
    //console.info(req.file)
    res.send(req.file);
});

app.get('/files/:filename', function (req, res) {
    var filename = req.params['filename'];
    res.sendFile(__dirname + "/uploads/" + filename);
})

app.listen(80);