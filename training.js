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
// scheduler
var schedule = require('node-schedule');

require('date-utils');

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
    var comp = parseInt(req.signedCookies.Comp);
    var sql1 = "SELECT * FROM Template where template_No = ?";
    var sql2 = "Select * from Company, Company_Secure where Company.Comp_No = ? and Company.Comp_No = Company_Secure.Comp_No";
    conn.query(sql1, [training_product], function (err, tmp, fields) {
        conn.query(sql2, [comp], function (err, tmp2, fields) {
            res.render('training_generate_sender', {
                training_name: training_name,
                training_type: training_type,
                training_product: training_product,
                tmp: tmp,
                tmp2: tmp2
            })
        });
    });

});

app.post('/training_generate_useradd', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    var training_sender = req.body.Training_sender;
    var training_sendermail = req.body.Training_sendermail;
    var training_title = req.body.Training_title;
    var training_message = req.body.Training_message;
    var sql1 = 'SELECT * FROM employee where Comp_No = ?';
    conn.query(sql1, [comp], function (err, values1, fields) {
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
    var comp = parseInt(req.signedCookies.Comp);
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    var training_sender = req.body.Training_sender;
    var training_sendermail = req.body.Training_sendermail;
    var training_title = req.body.Training_title;
    var training_message = req.body.Training_message;
    var sql2 = 'SELECT * FROM Groups where Comp_No = ?';
    conn.query(sql2, [comp], function (err, values2, fields) {
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
    var mysyear = req.body.syear;
    var mysmonth = req.body.smonth;
    var mysday = req.body.sday;
    var myshour = req.body.shour;
    var mysminute = req.body.sminute;
    
    var myeyear = req.body.eyear;
    var myemonth = req.body.emonth;
    var myeday = req.body.eday;
    var myehour = req.body.ehour;
    var myeminute = req.body.eminute;

    mysmonth = mysmonth - 1;
    myemonth = myemonth - 1;
    var mystime = req.body.start;
    var myetime = req.body.end;

    // nowdate
    var s1 = new Date();
    var s2 = new Date();
    var e1 = new Date();
    var e2 = new Date();
    if (mystime==1){
        s1 = new Date(mysyear,mysmonth,mysday,myshour,mysminute,0);
        s2 = new Date(mysyear,mysmonth,mysday,myshour,mysminute,0);
        s2.addMinutes(1);
        s1.addMonths(-1);
        s2.addMonths(-1);
        console.log("3333333");
        
        if (myetime==1){
        e1 = new Date(myeyear,myemonth,myeday,myehour,myeminute,0);
        e2 = new Date(myeyear,myemonth,myeday,myehour,myeminute,0);
        e2.addMinutes(1);
        e2.addMonths(-1);
        e1.addMonths(-1);
        console.log("3333333");
        } else {

        e1 = new Date(mysyear,mysmonth,mysday,myshour,mysminute,0);
        e2 = new Date(mysyear,mysmonth,mysday,myshour,mysminute,0);
        // month is -1
        
        e1.addDays(7);
        e2.addDays(7);
        e2.addMinutes(1);
        console.log(e2);
        }
    } else {
        var nYear = s2.toFormat('YYYY');
        var nMonth = s2.toFormat('MM');
        nMonth = nMonth-1;
        var nDay = s2.toFormat('DD');
        var nHour = s2.toFormat('HH24');
        var nMinute = s2.toFormat('MI');
        // month is -1
        s2 = new Date(nYear, nMonth, nDay, nHour, nMinute, 0);
        console.log(s2);

        s2.addMinutes(1);
        console.log(nYear, nMonth, nDay, nHour, nMinute);
        console.log(s2);
          
        if (myetime==1){
        e1 = new Date(myeyear,myemonth,myeday,myehour,myeminute,0);
        e2 = new Date(myeyear,myemonth,myeday,myehour,myeminute,0);
        e2.addMinutes(1);
        e2.addMonths(-1);
        console.log("3333333");
        } else {
        var nYear = e2.toFormat('YYYY');
        var nMonth = e2.toFormat('MM');
        var nDay = e2.toFormat('DD');
        var nHour = e2.toFormat('HH24');
        var nMinute = e2.toFormat('MI');
        nMonth = nMonth - 1;
        // month is -1
        e2 = new Date(nYear, nMonth, nDay, nHour, nMinute, 0);
        e1.addDays(7);
        e2.addDays(7);
        e2.addMinutes(1);
        console.log("그냥 실행");
        }

    }

    
   
    var Tsql = "select Template_Html AS TH from template where Template_No = ?";
    // template_html 파일명
    var template_html;
    var comp = parseInt(req.signedCookies.Comp);
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
                var sql1 = "Insert INTO Training (Train_Name,Train_Start,Train_Finish,Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo, Comp_No) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                var sql2 = "SELECT Train_No AS TNUM FROM Training where Train_Name = ?";
                var sql3 = "Insert INTO Target (Emp_No, Train_No, Comp_No) VALUES (?,?,?)";
                var sql4 = "SELECT Emp_No AS Eno, Emp_Email AS Mail, Comp_EX, Comp_MPW FROM Employee, Company_Secure where Emp_No = ? and Employee.Comp_No = Company_Secure.Comp_No";

                conn.query(sql1, [training_name, s1,e1, training_type, training_product, training_sender, training_sendermail, training_title, training_message, training_length, comp], function (err, result, fields) {
                });

                var num;
                conn.query(sql2, [training_name], function (err, result1, fields) {
                    num = result1[0].TNUM;
                    for (var i = 0; i < userids.length; i++) {
                        conn.query(sql3, [userids[i], num, comp], function (err, result2, fields) {

                        });
                    }
                })
                var jbd = schedule.scheduleJob(s2, function(){
                for (var i = 0; i < userids.length; i++) {
                    conn.query(sql4, [userids[i]], function (err, result3, fields) {

                        let transporter = nodemailer.createTransport({
                            host: result3[0].Comp_EX,
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: training_sendermail, // generated ethereal user
                                pass: result3[0].Comp_MPW // generated ethereal password
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
                            html: givemedataplz1 + num + '/' + result3[0].Eno + givemedataplz2 + 'α' + result3[0].Eno + 'β' + num + 'γ' // html body
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
            });
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
                    var sql1 = "Insert INTO Training (Train_Name,Train_Start,Train_Finish, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo, Comp_No) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                    var sql5 = "select Count(DISTINCT emp_no) AS cempno from countnum";
                    conn.query(sql5, function (err, value, fields) {
                        allemp = value[0].cempno;
                        conn.query(sql1, [training_name,s1,e1, training_type, training_product, training_sender, training_sendermail, training_title, training_message, value[0].cempno,comp], function (err, result, fields) {
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
                    var sql7 = "SELECT DISTINCT Emp_No AS empnos from countnum";
                    var sql8 = "Insert INTO Target (Emp_No, Train_No, Comp_No) VALUES (?,?,?)";
                    var sql9 = "SELECT Emp_No AS sendNo, Emp_Email AS Mail, Comp_EX, Comp_MPW FROM Employee, Company_Secure where Emp_No = ? and Employee.Comp_No = Company_Secure.Comp_No";
                    var num;
                    conn.query(sql6, [training_name], function (err, result4, fields) {
                        num = result4[0].tnum;
                    })
                    var j = schedule.scheduleJob(s2, function(){
                    conn.query(sql7, function (err, result5, fields) {
                        for (var i = 0; i < allemp; i++) {
                            conn.query(sql8, [result5[i].empnos, num, comp], function (err, result6, fields) {});
                            conn.query(sql9, [result5[i].empnos], function (err, result7, fields) {
                                let transporter = nodemailer.createTransport({
                                    host: result7[0].Comp_EX,
                                    port: 587,
                                    secure: false, // true for 465, false for other ports
                                    auth: {
                                        user: training_sendermail, // generated ethereal user
                                        pass: result7[0].Comp_MPW // generated ethereal password
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
                                    html: givemedataplz1 + num + '/' + result7[0].sendNo + givemedataplz2 + 'α' + result7[0].sendNo + 'β' + num + 'γ' // html body
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
                });
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
                var sql1 = "Insert INTO Training (Train_Name, Train_Start, Train_Finish, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo, Comp_No) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                var sql2 = "SELECT Train_No AS TNUM FROM Training where Train_Name = ?";
                var sql3 = "Insert INTO Target (Emp_No, Train_No, Comp_No) VALUES (?,?,?)";
                var sql4 = "SELECT Emp_No AS Eno, Emp_Email AS Mail, Comp_EX, Comp_MPW FROM Employee, Company_Secure where Emp_No = ? and Employee.Comp_No = Company_Secure.Comp_No";
                var sql5 = "SELECT Template_Attach AS TAs From Template where Template_No = ?";

                var attach;
                conn.query(sql5, [training_product], function (err, result8, fields) {
                    attach = result8[0].TAs;
                });

                conn.query(sql1, [training_name, s1,e1,training_type, training_product, training_sender, training_sendermail, training_title, training_message, training_length,comp], function (err, result, fields) {
                    console.log(result);
                });

                var num;
                conn.query(sql2, [training_name], function (err, result1, fields) {
                    num = result1[0].TNUM;
                    for (var i = 0; i < userids.length; i++) {
                        conn.query(sql3, [userids[i], num, comp], function (err, result2, fields) {

                        });
                    }
                })

                var j = schedule.scheduleJob(s2,function(){
                for (var i = 0; i < userids.length; i++) {

                    conn.query(sql4, [userids[i]], function (err, result3, fields) {

                        let transporter = nodemailer.createTransport({
                            host: result3[0].Comp_EX,
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: training_sendermail, // generated ethereal user
                                pass: result3[0].Comp_MPW // generated ethereal password
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
                            html: givemedataplz1 + 'α' + result3[0].Eno + 'β' + num + 'γ', // html body
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
             });
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
                    var sql1 = "Insert INTO Training (Train_Name, Train_Start, Train_Finish, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo,Comp_No) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                    var sql5 = "select Count(DISTINCT emp_no) AS cempno from countnum";
                    conn.query(sql5, function (err, value, fields) {
                        allemp = value[0].cempno;
                        conn.query(sql1, [training_name, s1, e1, training_type, training_product, training_sender, training_sendermail, training_title, training_message, value[0].cempno, comp], function (err, result, fields) {
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
                    var sql7 = "SELECT DISTINCT Emp_No AS empno5 from countnum";
                    var sql8 = "Insert INTO Target (Emp_No, Train_No, Comp_No) VALUES (?,?,?)";
                    var sql9 = "SELECT Emp_No AS sendNo, Emp_Email AS Mail, Comp_EX, Comp_MPW FROM Employee, Company_Secure where Emp_No = ? and Employee.Comp_No = Company_Secure.Comp_No";
                    var sql10 = "SELECT Template_Attach AS TAv FROM Template where Template_NO = ?";

                    var num;
                    var empnum;
                    conn.query(sql6, [training_name], function (err, result4, fields) {
                        num = result4[0].tnum;
                    })
                    var attach;
                    conn.query(sql10, [training_product], function (err, result9, fields) {
                        attach = result9[0].TAv;
                    })
                    
                    var j = schedule.scheduleJob(s2,function(){
                    conn.query(sql7, function (err, result5, fields) {
                        for (var i = 0; i < allemp; i++) {
                            var empnum = result5[i].empno5;
                            conn.query(sql8, [empnum, num, comp], function (err, result6, fields) {});
                            conn.query(sql9, [empnum], function (err, result7, fields) {
                                let transporter = nodemailer.createTransport({
                                    host: result7[0].Comp_EX,
                                    port: 587,
                                    secure: false, // true for 465, false for other ports
                                    auth: {
                                        user: training_sendermail, // generated ethereal user
                                        pass: result7[0].Comp_MPW // generated ethereal password
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
                                    html: givemedataplz1 + 'α' + result7[0].sendNo + 'β' + num + 'γ', // html body
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
                });
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