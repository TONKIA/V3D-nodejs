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

//获取方案数据
module.exports.querySchemeByUid = function (uid, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT id,name,img,share_state,share_password FROM scheme WHERE uid = ?', [uid], function (err, rows) {
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

//增加方案数据
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


module.exports.updateScheme = function (uid, id, name, data, img, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('UPDATE scheme SET name=?,data=?,img=? WHERE uid=? AND id =?', [name, data, img, uid, id], function (err, rows) {
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

module.exports.changeShareConfig = function (id, uid, share_password, share_state, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('UPDATE scheme SET share_password=?,share_state=? WHERE id =? AND uid =?', [share_password, share_state, id, uid], function (err, rows) {
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


module.exports.getShareById = function (id, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT share_state FROM scheme WHERE id =?', [id], function (err, rows) {
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

module.exports.getShareData = function (id, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT data FROM scheme WHERE id =? AND share_state=?', [id, 1], function (err, rows) {
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

module.exports.getShareDataByPassword = function (id, password, callback) {
    connection.getConnection(function (err, conn) {
        if (err) {
            console.info(err);
        } else {
            conn.query('SELECT data FROM scheme WHERE id =? AND share_state=? AND share_password=?', [id, 2, password], function (err, rows) {
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
