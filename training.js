// express 모듈
const express = require('express');
// body-parser 모듈
const bodyParser = require('body-parser');
// handlebars 모듈
const exphbs = require('express-handlebars');
// path 모듈
const path = require('path');
// node mailer
const nodemailer = require('nodemailer');
// fs
const fs = require('fs');
const app = express();

// mysql
var mysql = require('mysql');

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'o2',
    noBackslashEscapes: true,
})
conn.connect();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.locals.pretty = true;

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use(bodyParser.text());


// use in training generate
var userids;
var groupids;

// 훈련 생성 템플릿 페이지
app.post('/training_generate_template', function (req, res) {
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    console.log(training_name, training_type);

    var sql1 = "SELECT * FROM Template where template_type = ?";

    conn.query(sql1, [training_type], function (err, tmp, fields) {
        res.render('training_generate_template', {
            training_name: training_name,
            training_type: training_type,
            tmp: tmp
        });
    });
});

app.post('/training_generate_sender', function (req, res) {
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    console.log(training_name, training_type);

    var sql1 = "SELECT * FROM Template where template_No = ?";
    conn.query(sql1, [training_product], function (err, tmp, fields) {
        res.render('training_generate_sender', {
            training_name: training_name,
            training_type: training_type,
            training_product: training_product,
            tmp: tmp
        })
    });

});

app.post('/training_generate_useradd', function (req, res) {
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    var training_sender = req.body.Training_sender;
    var training_sendermail = req.body.Training_sendermail;
    var training_title = req.body.Training_title;
    var training_message = req.body.Training_message;
    var sql1 = 'SELECT * FROM employee';
    conn.query(sql1, function (err, values1, fields) {
        res.render('training_generate_useradd', {
            values1: values1,
            training_name: training_name,
            training_type: training_type,
            training_product: training_product,
            training_sender: training_sender,
            training_sendermail: training_sendermail,
            training_title: training_title,
            training_message: training_message,
        });
    });
});

app.post('/training_generate_groupadd', function (req, res) {
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    var training_sender = req.body.Training_sender;
    var training_sendermail = req.body.Training_sendermail;
    var training_title = req.body.Training_title;
    var training_message = req.body.Training_message;
    var sql2 = 'SELECT * FROM Groups';
    conn.query(sql2, function (err, values2, fields) {
        res.render('training_generate_groupadd', {
            values2: values2,
            training_name: training_name,
            training_type: training_type,
            training_product: training_product,
            training_sender: training_sender,
            training_sendermail: training_sendermail,
            training_title: training_title,
            training_message: training_message,
        });
    });
});


app.post('/training_generate_result', function (req, res) {
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    var training_sender = req.body.Training_sender;
    var training_sendermail = req.body.Training_sendermail;
    var training_title = req.body.Training_title;
    var training_message = req.body.Training_message;
    var userid = req.body.checkboxtest;
    var groupid = req.body.checkboxtestgroup;
    userids = userid;
    groupids = groupid;
    res.render('training_generate_result', {
        training_name: training_name,
        training_type: training_type,
        training_product: training_product,
        training_sender: training_sender,
        training_sendermail: training_sendermail,
        training_title: training_title,
        training_message: training_message,
    });

});

// 훈련생성
app.post('/training_generate_end', function (req, res) {
    // 훈련 이름
    var training_name = req.body.Training_name;
    // 훈련 타입
    var training_type = req.body.Training_type;
    // 훈련 템플릿 번호
    var training_product = req.body.Training_product;
    // 훈련 발신자
    var training_sender = req.body.Training_sender;
    // 훈련 발신자 이메일
    var training_sendermail = req.body.Training_sendermail;
    // 훈련 이메일 제목
    var training_title = req.body.Training_title;
    // 훈련 이메일 내용
    var training_message = req.body.Training_message;
    // 유저 수
    var training_length;

    var Tsql = "select Template_Html AS TH from template where Template_No = ?";
    // template_html 파일명
    var template_html;
    conn.query(Tsql, [training_product], function (err, result, fields) {
        template_html = result[0].TH;
        setTimeout(sendmail, 1000);
    });
    console.log(userids, groupids);

    function sendmail() {
        if (training_type == 1 || training_type == 3) {
            var path1 = 'public/template/tmp/' + template_html + '_1.html';
            var path2 = 'public/template/subtmp/' + template_html + '_2.html';
            var givemedataplz1 = fs.readFileSync(path1, 'utf8');
            var givemedataplz2 = fs.readFileSync(path2, 'utf8');

            if (groupids == null) {
                if (userids != null)
                    training_length = userids.length;
                console.log("add employee databases");
                var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
                var sql2 = "SELECT Train_No AS TNUM FROM Training where Train_Name = ?";
                var sql3 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
                var sql4 = "SELECT Emp_No AS Eno, Emp_Email AS Mail FROM Employee where Emp_No = ?";

                conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, training_length], function (err, result, fields) {
                    console.log(result);
                });

                var num;
                conn.query(sql2, [training_name], function (err, result1, fields) {
                    num = result1[0].TNUM;
                    for (var i = 0; i < userids.length; i++) {
                        conn.query(sql3, [userids[i], num], function (err, result2, fields) {

                        });
                    }
                })


                for (var i = 0; i < userids.length; i++) {

                    conn.query(sql4, [userids[i]], function (err, result3, fields) {

                        let transporter = nodemailer.createTransport({
                            host: '58.141.234.99',
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: training_sendermail, // generated ethereal user
                                pass: 'kit2017!' // generated ethereal password
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: training_sendermail, // sender address
                            to: result3[0].Mail, // list of receivers
                            subject: training_title, // Subject line
                            html: givemedataplz1 + num + '/' + result3[0].Eno + givemedataplz2 // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        });
                    });
                }
            } else if (userids == null) {
                console.log("add groups databases");

                var allemp;
                var sql2 = "select Count(Emp_No) AS cempno from groupsin where group_no = ?";
                var sql3 = "select Emp_No AS empno from groupsin where group_no = ?";
                var sql4 = "INSERT INTO CountNum VALUES(?)";

                function func1(groupid) {
                    conn.query(sql2, [groupid], function (err, result1, fields) {
                        var empcount = result1[0].cempno;
                        conn.query(sql3, [groupid], function (err, result2, fields) {
                            for (var j = 0; j < empcount; j++) {
                                conn.query(sql4, [result2[j].empno], function (err, result3, fields) {

                                });
                            }
                        });
                    });
                }

                function func2() {
                    var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
                    var sql5 = "select Count(DISTINCT emp_no) AS cempno from countnum";
                    conn.query(sql5, function (err, value, fields) {
                        allemp = value[0].cempno;
                        conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, value[0].cempno], function (err, result, fields) {
                            func3();
                        });
                    })
                }

                for (var i = 0; i < groupids.length; i++) {
                    var groupid = groupids[i];
                    func1(groupid);
                }

                setTimeout(func2, 1000);

                function func3() {
                    var sql6 = "SELECT Train_No AS tnum FROM Training where Train_Name = ?";
                    var sql7 = "SELECT DISTINCT Emp_No AS empno from countnum";
                    var sql8 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
                    var sql9 = "SELECT Emp_Email AS Mail FROM Employee where Emp_No = ?";
                    var num;
                    conn.query(sql6, [training_name], function (err, result4, fields) {
                        num = result4[0].tnum;
                    })
                    conn.query(sql7, function (err, result5, fields) {
                        for (var i = 0; i < allemp; i++) {
                            conn.query(sql8, [result5[i].empno, num], function (err, result6, fields) {});
                            conn.query(sql9, [result5[i].empno], function (err, result7, fields) {
                                let transporter = nodemailer.createTransport({
                                    host: '58.141.234.99',
                                    port: 587,
                                    secure: false, // true for 465, false for other ports
                                    auth: {
                                        user: training_sendermail, // generated ethereal user
                                        pass: 'kit2017!' // generated ethereal password
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });
                                // setup email data with unicode symbols
                                let mailOptions = {
                                    from: training_sendermail, // sender address
                                    to: result7[0].Mail, // list of receivers
                                    subject: training_title, // Subject line
                                    html: givemedataplz1 + num + '/' + result3[0].Eno + givemedataplz2 // html body
                                };

                                // send mail with defined transport object
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message sent: %s', info.messageId);
                                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                });
                            })
                        }
                        setTimeout(func4, 500);
                    })
                }

                function func4() {
                    var sql9 = "DELETE FROM countnum";
                    conn.query(sql9, function (err, result) {})
                }
            }
        } else {
            var path1 = 'public/template/tmp/' + template_html + '_1.html';
            var givemedataplz1 = fs.readFileSync(path1, 'utf8');

            if (groupids == null) {
                if (userids != null)
                    training_length = userids.length;

                console.log("add employee databases");
                var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
                var sql2 = "SELECT Train_No AS TNUM FROM Training where Train_Name = ?";
                var sql3 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
                var sql4 = "SELECT Emp_No AS Eno, Emp_Email AS Mail FROM Employee where Emp_No = ?";
                var sql5 = "SELECT Template_Attach AS TA From Template where Template_No = ?";

                var attach;
                conn.query(sql5, [training_product], function (err, result8, fields) {
                    attach = result8[0].TA;
                });

                conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, training_length], function (err, result, fields) {
                    console.log(result);
                });

                var num;
                conn.query(sql2, [training_name], function (err, result1, fields) {
                    num = result1[0].TNUM;
                    for (var i = 0; i < userids.length; i++) {
                        conn.query(sql3, [userids[i], num], function (err, result2, fields) {

                        });
                    }
                })


                for (var i = 0; i < userids.length; i++) {

                    conn.query(sql4, [userids[i]], function (err, result3, fields) {

                        let transporter = nodemailer.createTransport({
                            host: '58.141.234.99',
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: training_sendermail, // generated ethereal user
                                pass: 'kit2017!' // generated ethereal password
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: training_sendermail, // sender address
                            to: result3[0].Mail, // list of receivers
                            subject: training_title, // Subject line
                            html: givemedataplz1, // html body
                            attachments: [
                                {
                                    path: 'public/template/attach/' + attach
                        }
                        ]
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        });
                    });
                }
            } else if (userids == null) {
                console.log("add groups databases");

                var allemp;
                var sql2 = "select Count(Emp_No) AS cempno from groupsin where group_no = ?";
                var sql3 = "select Emp_No AS empno from groupsin where group_no = ?";
                var sql4 = "INSERT INTO CountNum VALUES(?)";

                function func1(groupid) {
                    conn.query(sql2, [groupid], function (err, result1, fields) {
                        var empcount = result1[0].cempno;
                        conn.query(sql3, [groupid], function (err, result2, fields) {
                            for (var j = 0; j < empcount; j++) {
                                conn.query(sql4, [result2[j].empno], function (err, result3, fields) {

                                });
                            }
                        });
                    });
                }

                function func2() {
                    var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
                    var sql5 = "select Count(DISTINCT emp_no) AS cempno from countnum";
                    conn.query(sql5, function (err, value, fields) {
                        allemp = value[0].cempno;
                        conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, value[0].cempno], function (err, result, fields) {
                            func3();
                        });
                    })
                }

                for (var i = 0; i < groupids.length; i++) {
                    var groupid = groupids[i];
                    func1(groupid);
                }

                setTimeout(func2, 1000);

                function func3() {
                    var sql6 = "SELECT Train_No AS tnum FROM Training where Train_Name = ?";
                    var sql7 = "SELECT DISTINCT Emp_No AS empno from countnum";
                    var sql8 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
                    var sql9 = "SELECT Emp_Email AS Mail FROM Employee where Emp_No = ?";
                    var sql10 = "SELECT Template_Attach AS TA FROM Template_NO = ?";

                    var num;
                    conn.query(sql6, [training_name], function (err, result4, fields) {
                        num = result4[0].tnum;
                    })
                    var attach;
                    conn.query(sql10, [training_product], function (err, result9, fields) {
                        attach = result9[0].TA;
                    })

                    conn.query(sql7, function (err, result5, fields) {
                        for (var i = 0; i < allemp; i++) {
                            conn.query(sql8, [result5[i].empno, num], function (err, result6, fields) {});
                            conn.query(sql9, [result5[i].empno], function (err, result7, fields) {
                                let transporter = nodemailer.createTransport({
                                    host: '58.141.234.99',
                                    port: 587,
                                    secure: false, // true for 465, false for other ports
                                    auth: {
                                        user: training_sendermail, // generated ethereal user
                                        pass: 'kit2017!' // generated ethereal password
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });
                                // setup email data with unicode symbols
                                let mailOptions = {
                                    from: training_sendermail, // sender address
                                    to: result7[0].Mail, // list of receivers
                                    subject: training_title, // Subject line
                                    html: givemedataplz1, // html body
                                    attchments: [
                                        {
                                            path: 'public/template/attach/' + attach
                            }
                            ]
                                };

                                // send mail with defined transport object
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message sent: %s', info.messageId);
                                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                });
                            })
                        }
                        setTimeout(func4, 500);
                    })
                }

                function func4() {
                    var sql9 = "DELETE FROM countnum";
                    conn.query(sql9, function (err, result) {})
                }
            }
        }
    }

    res.redirect("training_list.html");
});

module.exports = app;