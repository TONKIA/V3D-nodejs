var mysql = require('mysql');

var connection = mysql.createPool({
    host: '127.0.0.1',//主机
    user: 'root',//MySQL认证用户名
    password: '123456',//MySQL认证用户密码
    port: '3306',//端口号
    database: '3dmodel'
});

//根据用户名获取user
module.exports.queryUserByAccount = function (account, callback) {
    //创建一个connection
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT id,name,account,password FROM user WHERE account = ?', [account], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                user = {
                    id: rows[0].id,
                    name: rows[0].name,
                    account: rows[0].account,
                    password: rows[0].password
                }
                callback(user);
                conn.release();
            });

        }
    });
};

module.exports.querySchemeByUid = function (uid, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT id,name,img FROM scheme WHERE uid = ?', [uid], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(rows);
                conn.release();
            });
        }
    });
};

module.exports.insertScheme = function (uid, name, data, img, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('INSERT INTO scheme(uid,name,data,img) VALUES(?,?,?,?)', [uid, name, data, img], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(rows);
                conn.release();
            });
        }
    });
};

module.exports.getSchemeById = function (uid, id, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT data FROM scheme WHERE uid=? AND id =?', [uid, id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(rows);
                conn.release();
            });
        }
    });
};