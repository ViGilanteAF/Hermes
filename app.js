const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const app = express();

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

var userids;
var groupids;

app.get('/public/template_url_attack/:id/:no',function(req,res){
    var id = req.params.id;
    var no = req.params.no;
    
    var sql1 = 'UPDATE Target set Targ_UrClick = 1 where Train_no = ? and Emp_No = ?';
    conn.query(sql1,[id,no], function(err,tmp,fields){
        res.render('template_url_attack',{

        });
    })
})

app.get('/public/pages/train_quit/:id',function (req, res){
    var id = req.params.id;
    
    var sql1 = 'update training set train_state = 1 where train_no = ?';
    conn.query(sql1,[id], function(err,tmp,fields){
        res.redirect("../training_result.html");
    });
})

// 훈련 결과 자세히보기
app.get('/public/pages/training_result_traindetail/:id',function (req, res){
    var id = req.params.id;
    
    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "자격증명 훈련" END as Train_Type, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 1';
    conn.query(sql1,[id], function(err,tmp,fields){
            res.render('training_result_traindetail',{
            tmp:tmp
        });
    });

})

// 훈련결과 사용자 자세히보기
app.get('/public/pages/training_result_userdetail/:id',function (req, res){
    var id = req.params.id;
    
    var sql1 = "SELECT * FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?";
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 1';
    conn.query(sql1,[id], function(err,tmp,fields){
        conn.query(sql2,[id],function(err,tmp2,fields){
            res.render('training_result_userdetail',{
                tmp:tmp,
                tmp2:tmp2
            });
        })
    });
})

// 훈련목록 자세히보기
app.get('/public/pages/training_list_traindetail/:id',function (req, res){
    var id = req.params.id;
    
    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "자격증명 훈련" END as Train_Type, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 0';
    conn.query(sql1,[id], function(err,tmp,fields){
            res.render('training_list_traindetail',{
            tmp:tmp
        });
    });

})

// 훈련목록 사용자 자세히보기
app.get('/public/pages/training_list_userdetail/:id',function (req, res){
    var id = req.params.id;
    
    var sql1 = "SELECT * FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?";
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 0';
    conn.query(sql1,[id], function(err,tmp,fields){
        conn.query(sql2,[id],function(err,tmp2,fields){
            res.render('training_list_userdetail',{
                tmp:tmp,
                tmp2:tmp2
            });
        })
    });
})

// 훈련 생성 템플릿 페이지
app.post('/public/pages/training_generate_template',function (req, res){
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    console.log(training_name, training_type);
    
    var sql1 = "SELECT * FROM Template where template_type = ?";
    
    conn.query(sql1,[training_type],function(err,tmp,fields){
        res.render('training_generate_template',{
            training_name:training_name,
            training_type:training_type,
            tmp:tmp
        });
    });
});

app.post('/public/pages/training_generate_sender',function (req, res){
    var training_name = req.body.Training_name;
    var training_type = req.body.Training_type;
    var training_product = req.body.Training_product;
    console.log(training_name, training_type);
    
    var sql1 = "SELECT * FROM Template where template_No = ?";
    conn.query(sql1,[training_product],function(err,tmp,fields){
        res.render('training_generate_sender',{
            training_name:training_name,
            training_type:training_type,
            training_product:training_product,
            tmp:tmp
        })
    });

});

app.post('/public/pages/training_generate_useradd',function (req, res){
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
            training_name:training_name,
            training_type:training_type,
            training_product:training_product,
            training_sender:training_sender,
            training_sendermail:training_sendermail,
            training_title:training_title,
            training_message:training_message,
        });
    });
});

app.post('/public/pages/training_generate_groupadd',function (req, res){
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
            training_name:training_name,
            training_type:training_type,
            training_product:training_product,
            training_sender:training_sender,
            training_sendermail:training_sendermail,
            training_title:training_title,
            training_message:training_message,
        });
    });
});


app.post('/public/pages/training_generate_result',function (req, res){
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
        training_name:training_name,
        training_type:training_type,
        training_product:training_product,
        training_sender:training_sender,
        training_sendermail:training_sendermail,
        training_title:training_title,
        training_message:training_message,
    });

});

// 훈련생성
app.post('/public/pages/training_generate_end',function (req, res){
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
    
    console.log(userids,groupids);
    
    var path1 ='public/template/tmp/' + training_product + '_1.html';
    var path2 ='public/template/subtmp/' + training_product + '_2.html';
    var givemedataplz1 = fs.readFileSync(path1,'utf8');
    var givemedataplz2 = fs.readFileSync(path2,'utf8');
    
    if (groupids==null)
    {
        if(userids != null)
            training_length = userids.length;
        console.log("add employee databases");    
        var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
        var sql2 = "SELECT Train_No AS TNUM FROM Training where Train_Name = ?";
        var sql3 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
        var sql4 = "SELECT Emp_No AS Eno, Emp_Email AS Mail FROM Employee where Emp_No = ?";
        
        conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, training_length],       function (err, result, fields) {
            console.log(result);
        });
        
        var num;
        conn.query(sql2, [training_name], function(err,result1,fields){
            num = result1[0].TNUM;
            for(var i=0; i<userids.length; i++){
                conn.query(sql3, [userids[i], num], function(err, result2, fields){
                    
                });
            }
        })
        

        for(var i=0; i<userids.length; i++){

            conn.query(sql4, [userids[i]], function(err,result3,fields){
                
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
    }
    else if (userids==null)
    {
        console.log("add groups databases");    
         
        var allemp;
        var sql2 = "select Count(Emp_No) AS cempno from groupsin where group_no = ?";
        var sql3 = "select Emp_No AS empno from groupsin where group_no = ?";
        var sql4 = "INSERT INTO CountNum VALUES(?)";

        function func1 (groupid){
            conn.query(sql2, [groupid], function(err, result1, fields){
                var empcount = result1[0].cempno;
                conn.query(sql3, [groupid], function(err, result2, fields){
                    for (var j=0; j<empcount; j++){
                        conn.query(sql4, [result2[j].empno], function(err, result3, fields){

                        });
                    }
                });
            });
        }

        function func2(){
            var sql1 = "Insert INTO Training (Train_Name, Train_Kind, Train_Template, Train_Sender, Train_Email, Train_EmSub, Train_EmContent ,Train_TotalPeo) VALUES (?,?,?,?,?,?,?,?)";
            var sql5 = "select Count(DISTINCT emp_no) AS cempno from countnum";
            conn.query(sql5, function(err, value, fields){
                allemp = value[0].cempno;
                conn.query(sql1, [training_name, training_type, training_product, training_sender, training_sendermail, training_title, training_message, value[0].cempno], function (err, result, fields) {
                    func3();
                });  
            })
        }

        for (var i=0; i<groupids.length; i++){
            var groupid = groupids[i];
            func1(groupid);
        }

        setTimeout(func2, 1000);

        function func3(){
            var sql6 = "SELECT Train_No AS tnum FROM Training where Train_Name = ?";
            var sql7 = "SELECT DISTINCT Emp_No AS empno from countnum";
            var sql8 = "Insert INTO Target (Emp_No, Train_No) VALUES (?,?)";
            var sql9 = "SELECT Emp_Email AS Mail FROM Employee where Emp_No = ?";
            var num;
            conn.query(sql6, [training_name], function(err,result4,fields){
                num = result4[0].tnum;
            })
            conn.query(sql7, function(err, result5, fields){
            for(var i=0; i<allemp; i++){
                conn.query(sql8, [result5[i].empno, num], function(err, result6, fields){
                });
                conn.query(sql9, [result5[i].empno],function(err,result7,fields){
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

        function func4 (){
            var sql9 = "DELETE FROM countnum";
            conn.query(sql9,function(err,result){
            })
        }
    }
        
    
    res.redirect("training_list.html");
});

// 템플릿 관리페이지
app.get('/public/pages/template.html',function (req, res){
    var sql1 = "SELECT * FROM Template";
    
    conn.query(sql1,function(err,tmp,fields){
        res.render('template',{
            tmp:tmp
        });
    });
});

// 사용자 페이지 get
// user_page.handlerbars 파일로 넘겨준다.
app.get('/public/pages/User_page/:userid', function (req, res) {
    console.log("유저 상세보기 페이지 접속");
    var userid = req.params.userid;
    var sql1 = 'SELECT * FROM employee WHERE Emp_No=(?)';
    var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no';
    var sql3 = 'SELECT training.Train_No, Train_Name, Train_Persent, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training JOIN target WHERE training.train_no = target.train_no AND emp_no = ?';
    conn.query(sql1, [userid], function (err, values1, fields) {
        conn.query(sql2, [userid], function (err, values2, fields) {
            conn.query(sql3, [userid], function(err, values3, fields){
                res.render('User_page', {
                    values1: values1,
                    values2: values2,
                    values3: values3
                });  
            })
        });
    });
});

// 그룹 페이지 get
// user_page.handlerbars 파일로 넘겨준다.
app.get('/public/pages/Group_page/:groupid', function (req, res) {
    console.log("그룹 상세보기 페이지 접속");
    var groupid = req.params.groupid;
    var sql1 = 'SELECT * FROM groups WHERE group_no=(?)';
    var sql2 = 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?) ORDER BY employee.emp_no';
    conn.query(sql1, [groupid], function (err, values1, fields) {
        conn.query(sql2, [groupid], function (err, values2, fields) {
            res.render('Group_page', {
                values1: values1,
                values2: values2
            });
        });
    });
});

// 사용자 / 그룹관리 페이지 get
// ug_manage.handlerbars 파일로 넘겨준다.
app.get(['/public/pages/User_manage'], function (req, res) {
    console.log("사용자 관리 페이지 접속");
    var sql1 = 'SELECT * FROM employee';
    conn.query(sql1, function (err, values1, fields) {
        res.render('User_manage', {
            values1: values1
        });
    });
});

app.get(['/public/pages/Group_manage'], function (req, res) {
    console.log("그룹 관리 페이지 접속");
    var sql2 = 'SELECT * FROM groups';
    conn.query(sql2, function (err, values2, fields) {
        res.render('Group_manage', {
            values2: values2
        });
    });
});

// 그룹 - 사용자 할당 페이지 - 전체 그룹 할당
app.get('/public/pages/GroupInGroupAllAdd/:groupid',function(req,res){
    console.log("그룹 사용자 할당페이지 - 전체 사용자 할당");
    var groupid = req.params.groupid;
    var sql1 = 'SELECT Emp_No from Employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?)';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No) VALUES(?,?)';
    conn.query(sql1, [groupid],function(err, value1, fields){
        for(var i=0; i<value1.length; i++){
            conn.query(sql2, [groupid,value1[i].Emp_No], function (err, result, fields) {});
        };
    })
    res.redirect("/public/pages/GroupInGroupAddDelete/"+groupid+"/1/1")
});

// 그룹 - 사용자 할당 페이지 - 전체 그룹 제외
app.get('/public/pages/GroupInGroupAllDelete/:groupid',function(req,res){
    console.log("그룹 할당페이지 - 전체 그룹 제외");
    var groupid = req.params.groupid;
    var sql1 = 'DELETE FROM GroupsIn WHERE Group_No = ?'
    conn.query(sql1, [groupid],function(err, value1, fields){

    })
    res.redirect("/public/pages/GroupInGroupAddDelete/"+groupid+"/1/1")
});

// 사용자 그룹 할당페이지 - 전체 그룹 할당
app.get('/public/pages/GroupInUserAllAdd/:userid',function(req,res){
    console.log("그룹 할당페이지 - 전체 그룹 할당");
    var userid = req.params.userid;
    var sql1 = 'SELECT Group_No from Groups where Group_No NOT IN  (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ?)';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No) VALUES(?,?)';
    conn.query(sql1, [userid],function(err, value1, fields){
        for(var i=0; i<value1.length; i++){
            conn.query(sql2, [value1[i].Group_No, userid], function (err, result, fields) {});
        };
    })
    res.redirect("/public/pages/GroupInUserAddDelete/"+userid+"/1/1")
});

// 사용자 그룹 할당페이지 - 전체 그룹 제외
app.get('/public/pages/GroupInUserAllDelete/:userid',function(req,res){
    console.log("그룹 할당페이지 - 전체 그룹 제외");
    var userid = req.params.userid;
    var sql1 = 'DELETE FROM GroupsIn WHERE Emp_No = ?'
    conn.query(sql1, [userid],function(err, value1, fields){

    })
    res.redirect("/public/pages/GroupInUserAddDelete/"+userid+"/1/1")
});
    


// 사용자 그룹 할당 페이지 입장
app.get('/public/pages/GroupInUserAddDelete/:userid/:page1/:page2', function (req, res) {
    console.log("사용자 그룹 할당 페이지 접속");
    // 페이징 리미트
    var limit = 10;
    // 사용자가 소속되지 않은 그룹 페이징 번호
    var page1 = req.params.page1;
    // 사용자가 소속된 그룹 페이징 번호
    var page2 = req.params.page2;
    // 사용자가 소속되지 않은 그룹 오프셋
    var offset1 = (limit * page1) - limit;
    // 사용자가 소속된 그룹 오프셋
    var offset2 = (limit * page2) - limit;
    // 사용자 기본키
    var userid = req.params.userid;
    
    // 사용자가 소속되지 않은 그룹 페이징 제외
    // 'SELECT * FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no);';
    // 사용자가 소속되지 않은 그룹
    var sql1 = 'SELECT * FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no) ORDER BY group_no ASC LIMIT ' + offset1 + ','+limit;
    // 사용자가 소속되지 않은 그룹의 페이징 값
    var sql4 = 'SELECT Ceil(Count(*)/'+limit+') AS "counts" FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no)';
    
    // 사용자가 소속된 그룹 페이징 제외
    // 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no;'
    // 사용자가 소속된 그룹
    var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no ASC LIMIT ' + offset2 + ','+limit;
    // 사용자가 소속된 그룹의 페이징 값
    var sql5 = 'SELECT Ceil(Count(*)/'+limit+') AS "counts" FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ?';
    
    // 사용자 이름
    var sql3 = 'SELECT * FROM employee WHERE emp_no = ?';
    
    conn.query(sql1, [userid], function (err, values1, fields) {
        conn.query(sql2, [userid], function (err, values2, fields) {
            conn.query(sql3, [userid], function (err, username, fields) {
                conn.query(sql4, [userid], function (err, pagecount1, fields) {
                    conn.query(sql5, [userid], function(err,pagecount2, fields){
                        res.render('GroupInUserAddDelete', {
                            values1: values1,
                            values2: values2,
                            username: username,
                            pagecount1: pagecount1,
                            pagecount2: pagecount2
                        })
                    })
                })
            })
        })
    });
});

// 유저 그룹 할당 post
app.post('/public/GroupInUserAdd/:userid', function (req, res) {
    console.log("사용자 편집 - 사용자 할당");
    var userid = req.params.userid;
    var id = req.body.checkboxtest;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'INSERT INTO groupsin (group_no, emp_no) VALUES (?, ?)';
            conn.query(sql, [items, userid], function (err, result) {});
        });
    } else {
        var sql = 'INSERT INTO groupsin (group_no, emp_no) VALUES (?, ?)';
        conn.query(sql, [id, userid], function (err, result) {});
    }
    var page = '/public/pages/GroupInUserAddDelete/' + userid+'/1/1';
    res.redirect(page);
});

// 유저 그룹 제외 post
app.post('/public/GroupInUserDelete/:userid', function (req, res) {
    console.log("사용자 편집 - 사용자 제외");
    var userid = req.params.userid;
    var id = req.body.checkboxtestGroupsIN;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'DELETE FROM groupsin WHERE emp_no = ? AND group_no = ?';
            conn.query(sql, [userid, items], function (err, result) {});
        });
    } else {
        var sql = 'DELETE FROM groupsin WHERE emp_no = ? AND group_no = ?';
        conn.query(sql, [userid, id], function (err, result) {});
    }
    var repage = '/public/pages/GroupInUserAddDelete/' + userid+'/1/1';
    res.redirect(repage);
});

// 그룹 할당제외 페이지 입장
app.get('/public/pages/GroupInGroupAddDelete/:groupid/:page1/:page2', function (req, res) {
    console.log("그룹 편집 페이지 접속");
    // 페이징 리미트
    var limit = 10;
    // 그룹에 소속되어있지 않은 사용자 페이징 번호
    var page1 = req.params.page1;
    // 그룹에 소속된 사용자 페이징 번호
    var page2 = req.params.page2;
    // 그룹에 소속되어있지 않은 사용자 오프셋
    var offset1 = (limit * page1) - limit;
    // 그룹에 소속된 사용자 오프셋
    var offset2 = (limit * page2) - limit;
    // 그루비룸
    var groupid = req.params.groupid;
    
    // 그룹에 소속되지 않은 사용자 페이징 제외
    // 'SELECT * FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?));'; 
    // 그룹에 소속되지 않은 사용자
    var sql1 = 'SELECT * FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? ORDER BY employee.emp_no) ORDER BY emp_no ASC LIMIT ' + offset1 + ','+limit;
    // 그룹에 소속되지 않은 사용자의 페이징 값
    var sql4 = 'SELECT Ceil(Count(*)/'+limit+') AS "counts" FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?)';
    
    // 그룹에 소속된 사용자 페이징 제외
    // 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?) ORDER BY employee.emp_no;'
    // 그룹에 소속된 사용자
    var sql2 = 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? ORDER BY employee.emp_no ASC LIMIT ' + offset2 + ','+limit;
    // 그룹에 소속된 사용자의 페이징 값
    var sql5 = 'SELECT Ceil(Count(*)/'+limit+') AS "counts" FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?';
    
    // 그룹 데이터
    var sql3 = 'SELECT * FROM groups WHERE group_no = (?)'
    conn.query(sql1, [groupid], function (err, values1, fields) {
        conn.query(sql2, [groupid], function (err, values2, fields) {
            conn.query(sql3, [groupid], function (err, titlename, fields) {
                conn.query(sql4,[groupid], function (err, pagecount1, fields){
                    conn.query(sql5,[groupid], function(err,pagecount2, fields){
                        res.render('GroupInGroupAddDelete', {
                            values1: values1,
                            values2: values2,
                            titlename: titlename,
                            pagecount1: pagecount1,
                            pagecount2: pagecount2
                        })
                    })
                })
            })
        })
    });
});

// 그룹 할당 post
app.post('/public/GroupInGroupAdd/:groupid', function (req, res) {
    console.log("그룹 편집 - 사용자 할당");
    var groupid = req.params.groupid;
    var id = req.body.checkboxtest;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'INSERT INTO groupsin (emp_no, group_no) VALUES (?, ?)';
            conn.query(sql, [items, groupid], function (err, result) {});
        });
    } else {
        var sql = 'INSERT INTO groupsin (emp_no, group_no) VALUES (?, ?)';
        conn.query(sql, [id, groupid], function (err, result) {});
    }
    var repage = '/public/pages/GroupInGroupAddDelete/' + groupid+'/1/1';
    res.redirect(repage);
});

// 그룹 제외 post
app.post('/public/GroupInGroupDelete/:groupid', function (req, res) {
    console.log("그룹 편집 - 사용자 제외");
    var groupid = req.params.groupid;
    var id = req.body.checkboxtestGroupsIN;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'DELETE FROM groupsin WHERE emp_no = ? AND group_no = ?';
            conn.query(sql, [items, groupid], function (err, result) {});
        });
    } else {
        var sql = 'DELETE FROM groupsin WHERE emp_no = ? AND group_no = ?';
        conn.query(sql, [id, groupid], function (err, result) {});
    }
    var repage = '/public/pages/GroupInGroupAddDelete/' + groupid+'/1/1';
    res.redirect(repage);
});

// 훈련 목록 페이지 get
app.get(['/public/pages/training_list.html'], function (req, res) {
    console.log("훈련 목록 페이지 접속");
    var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" from Training where Train_State = 0';
    conn.query(sql, function (err, values, fields) {
        res.render('training_list', {
            values: values,
        });
    });
});

// 훈련 결과 페이지 get
app.get(['/public/pages/training_result.html'], function (req, res) {
    console.log("훈련 목록 페이지 접속");
    var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" from Training where Train_State = 1';
    conn.query(sql, function (err, values, fields) {
        res.render('training_result', {
            values: values,
        });
    });
});

// 사용자 추가 post
// modal에서 submit한 내용을 db에 추가한다.
// 받는 값은 이름, 이메일 2가지이다.
app.post('/public/employeeadd', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 사용자 추가");
    var name = req.body.employee_name_add;
    var email = req.body.email_add;
    var sql = 'INSERT INTO employee (emp_name, emp_email) VALUES(?, ?)';
    var params = [name, email];
    conn.query(sql, params, function (err, results, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    });
    res.redirect('/public/pages/User_manage');
});

// 그룹 추가 post
// modal에서 submit한 내용을 db에 추가한다.
// 받는 값은 이름, 이메일 2가지이다.
app.post('/public/groupadd', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 그룹 추가");
    var name = req.body.group_name_add;
    var note = req.body.group_note_add;
    if (note != "") {
        var sql = 'INSERT INTO groups (group_name, group_note) VALUES(?, ?)';
        var params = [name, note];
        conn.query(sql, params, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
        });
    } else {
        var sql = 'INSERT INTO groups (group_name) VALUES(?)';
        var params = [name];
        conn.query(sql, params, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
        });
    }
    res.redirect('/public/pages/Group_manage');
});


// 사용자 삭제 delete
// id의 값이 배열일때 즉 체크박스의 데이터가 1개 이상일때
// foreach문을 돌려서 여러개 처리를 하였다.
// 배열이 아닌 단순 값이면
// 그 id값을 이용하여 delete sql구문을 실행하였다.
app.post('/public/employeedelete', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 사용자 삭제");
    var id = req.body.checkboxtest;
    console.log(id);
    var sql1 = 'DELETE FROM employee WHERE emp_no=?';
    var sql2 = 'DELETE FROM groupsin WHERE emp_no=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            conn.query(sql1, [items], function (err, result) {});
            conn.query(sql2, [items], function (err, result) {});
        });
    } else {
        conn.query(sql1, [id], function (err, result) {});
        conn.query(sql2, [id], function (err, result) {});
    }
    res.redirect('/public/pages/User_manage');
});

// 그룹 삭제 delete
// id의 값이 배열일때 즉 체크박스의 데이터가 1개 이상일때
// foreach문을 돌려서 여러개 처리를 하였다.
// 배열이 아닌 단순 값이면
// 그 id값을 이용하여 delete sql구문을 실행하였다.
app.post('/public/groupdelete', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 그룹 삭제");
    var id = req.body.checkboxtestgroup;
    console.log(id);
    var sql1 = 'DELETE FROM groups WHERE group_no=?';
    var sql2 = 'DELETE FROM groupsin WHERE groups_no=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            conn.query(sql1, [items], function (err, result) {});
            conn.query(sql2, [items], function (err, result) {});
        });
    } else {
        conn.query(sql1, [id], function (err, result) {});
        conn.query(sql2, [id], function (err, result) {});
    }
    res.redirect('/public/pages/Group_manage');
});

app.get('/', (req, res) => {
    res.redirect('/public/index.html');
})
app.get('/public/mailsend.html', (req, res) => {
    res.render('contact');
});

app.post('/public/pages/send', (req, res) => {
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>받는사람이름: ${req.body.recvname}</li>
      <li>받는사람메일: ${req.body.recvmail}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
    let transporter = nodemailer.createTransport({
        host: '58.141.234.99',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'test@hermesmail.xyz', // generated ethereal user
            pass: 'kit2017!' // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: req.body.sendermail, // sender address
        to: req.body.recvmail, // list of receivers
        subject: req.body.title, // Subject line
        html: output // html body
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

app.listen(3000, () => console.log('server started...'));
