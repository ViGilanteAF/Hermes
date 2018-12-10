var express = require('express');
var app = express();
// body-parser 모듈
const bodyParser = require('body-parser');
// handlebars 모듈
const exphbs = require('express-handlebars');
// path 모듈
const path = require('path');                                                                                  
var fs = require('fs');
var csv = require('fast-csv');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })                           

var mysql = require('mysql');

// cookie parser 모듈
var cookie = require('cookie-parser');

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
app.use(cookie('!@$!@#!@#'));
// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/plugin',function(req,res){
    res.download('Hermesplugin.zip');
})
//로그인페이지

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log(req.file.filename);
    var filename = req.file.filename;
    var sql = 'INSERT INTO employee (emp_name, emp_email, Comp_No) VALUES(?, ?, ?)';
    var read = fs.createReadStream('C:/Homepage_Node/uploads/'+ filename)
        .pipe(csv())
        .on('data',function(data){
            console.log(data);
            conn.query(sql, [data[0], data[1], comp], function (err, result) {});
        })
        .on('end',function(data){
            console.log('Read finished');
    })
    res.redirect('User_manage');
})

app.get('/upload', function(req,res){
    res.render('upload');
})

app.get('/info',function(req,res){
    var comp = parseInt(req.signedCookies.Comp);
    var sql = 'select Comp_Name, Comp_EX, Comp_Domain, Comp_MID from Company, Company_Secure where Company.Comp_No = ? and Company.Comp_No = Company_Secure.Comp_No';
    conn.query(sql,[comp],function(err, tmp, fields){
        res.render('info', {
            tmp:tmp      
        });
    });
})

app.get('/setting',function(req,res){
    var comp = parseInt(req.signedCookies.Comp);
    var sql = 'select Comp_Name, Comp_EX, Comp_Domain, Comp_MID, Comp_MPW from Company, Company_Secure where Company.Comp_No = ? and Company.Comp_No = Company_Secure.Comp_No';
    conn.query(sql,[comp],function(err, tmp, fields){
        res.render('setting', {
            tmp:tmp      
        });
    });
})

app.post('/setting_change',function(req,res){
    var name = req.body.Comp_Name;
    var domain = req.body.Comp_Domain;
    var ip = req.body.Comp_ip;
    var comp = parseInt(req.signedCookies.Comp);
    var sql1 = 'update Company set Comp_Name = ?, Comp_Domain = ? where Comp_No = ?';
    var sql2 = 'update Company_Secure set Comp_EX = ? where Comp_No = ?';
    conn.query(sql1,[name,domain,comp],function(err, tmp, fields){
        conn.query(sql2,[ip,comp],function(err, tmp2, fields){
            console.log("update ok");
            res.redirect('/info');
        });
    });
})

app.post('/login_Check',function(req,res){
    console.log("로그인");
    var id = req.body.email;
    var password = req.body.password;
    
    var sql = 'select * from Company_Secure where Comp_ID = ?';
    conn.query(sql,[id],function(err, results, fields){
        if (results[0].Comp_PW == password)
        {
            res.cookie('Comp',results[0].Comp_No,{signed:true});
            res.redirect('/index.html');
        } else {
            res.redirect('/login.html');
        }
    });
});


app.get('/login.html',function(req,res){
    res.clearCookie('Comp');
    res.render('login');
})

app.get('/',function(req,res){
    res.render('login');
})


// 리포팅 페이지

app.get('/reporting.html',function(req,res){
    var comp = parseInt(req.signedCookies.Comp);
    if (comp == 999){
        var sql1 = "SELECT Train_No AS No, Train_Name AS Name from Training";
        conn.query(sql1,[comp], function (err, tmp, fields) {
            res.render('reporting', {
                   tmp:tmp          
            });
        });
    } else {
        var sql1 = "SELECT Train_No AS No, Train_Name AS Name, Comp_Name from Training, Company where Training.Comp_No = Company.Comp_No and Training.Comp_No = ?;";
        conn.query(sql1,[comp], function (err, tmp, fields) {
            res.render('reporting', {
                   tmp:tmp          
            });
        });
    }
});


app.post('/reporting_result.html',function(req,res){
    var comp = parseInt(req.signedCookies.Comp);
    var Train1 = req.body.train1;
    var Train2 = req.body.train2;
    var sql2 = "select 50-SUM(Train_ClickPeo)/SUM(Train_TotalPeo)*25-(SUM(Train_UrCliPeo)+SUM(Train_FileCliPeo)+SUM(Train_InfoPeo))/SUM(Train_TotalPeo)*25+SUM(Train_DelEmPeo)/SUM(Train_TotalPeo)+SUM(Train_SpamPeo)/SUM(Train_TotalPeo)*25 AS TotalPoint, (SUM(Train_UrCliPeo)+SUM(Train_FileCliPeo)+SUM(Train_InfoPeo))/SUM(Train_TotalPeo)*100 AS TotalAttack,SUM(Train_DelEmPeo)/SUM(Train_TotalPeo)*100 AS DelP, SUM(Train_SpamPeo)/SUM(Train_TotalPeo)*100 AS SpamP, SUM(Train_ClickPeo)/SUM(Train_TotalPeo)*100 AS ClickP from training;";
    var sql3 = "select CASE WHEN Train_Kind = 1 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_UrCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) WHEN Train_Kind = 2 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_FileCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) ELSE (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_InfoPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) END AS TrainPoint1 from training where Train_No = ?;";
    var sql4 = "select CASE WHEN Train_Kind = 1 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_UrCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) WHEN Train_Kind = 2 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_FileCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) ELSE (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_InfoPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) END AS TrainPoint2 from training where Train_No = ?;";
    if (comp == 999) {
        var sql1 = "SELECT Train_No AS No, Train_Name AS Name from Training;";
        // 전체 평균 점수
        var sql5 = 'Select Train_Name AS Name, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "정보입력훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type2, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", CASE WHEN Train_Kind = 1 THEN (Train_UrCliPeo/Train_TotalPeo)*100 WHEN Train_Kind = 2 THEN (Train_FileCliPeo/Train_TotalPeo)*100 ELSE (Train_InfoPeo/Train_TotalPeo)*100 END AS TrainAttack, Train_TotalPeo, Train_DelEmPeo, Train_ClickPeo, Train_SpamPeo, CASE WHEN Train_Kind = 1 THEN Train_UrCliPeo WHEN Train_Kind = 2 THEN Train_FileCliPeo ELSE Train_InfoPeo END AS AttackPeo, Train_DelEmPeo/Train_TotalPeo*100 AS DelP, Train_SpamPeo/Train_TotalPeo*100 AS SpamP, Train_ClickPeo/Train_TotalPeo*100 AS ClickP, Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, function (err, tmp, fields) {
            conn.query(sql2, function (err, tmp2, fields) {
                conn.query(sql3, [Train1], function (err, tmp3, fields) {
                    conn.query(sql4, [Train2], function (err, tmp4, fields) {
                        conn.query(sql5, [Train1], function (err, tmp5, fields) {
                            conn.query(sql5, [Train2], function (err, tmp6, fields) {
                                res.render('reporting_result', {
                                    tmp:tmp,
                                    tmp2:tmp2,
                                    tmp3:tmp3,
                                    tmp4:tmp4,
                                    tmp5:tmp5,
                                    tmp6:tmp6
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        var sql1 = "SELECT Train_No AS No, Train_Name AS Name from Training where Training.Comp_No = ?;";
        // 전체 평균 점수
        var sql5 = 'Select Train_Name AS Name, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "정보입력훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type2, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", CASE WHEN Train_Kind = 1 THEN (Train_UrCliPeo/Train_TotalPeo)*100 WHEN Train_Kind = 2 THEN (Train_FileCliPeo/Train_TotalPeo)*100 ELSE (Train_InfoPeo/Train_TotalPeo)*100 END AS TrainAttack, Train_TotalPeo, Train_DelEmPeo, Train_ClickPeo, Train_SpamPeo, CASE WHEN Train_Kind = 1 THEN Train_UrCliPeo WHEN Train_Kind = 2 THEN Train_FileCliPeo ELSE Train_InfoPeo END AS AttackPeo, Train_DelEmPeo/Train_TotalPeo*100 AS DelP, Train_SpamPeo/Train_TotalPeo*100 AS SpamP, Train_ClickPeo/Train_TotalPeo*100 AS ClickP, Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, [comp],function (err, tmp, fields) {
            conn.query(sql2, function (err, tmp2, fields) {
                conn.query(sql3, [Train1], function (err, tmp3, fields) {
                    conn.query(sql4, [Train2], function (err, tmp4, fields) {
                        conn.query(sql5, [Train1, comp], function (err, tmp5, fields) {
                            conn.query(sql5, [Train2, comp], function (err, tmp6, fields) {
                                res.render('reporting_result', {
                                    tmp:tmp,
                                    tmp2:tmp2,
                                    tmp3:tmp3,
                                    tmp4:tmp4,
                                    tmp5:tmp5,
                                    tmp6:tmp6
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});

// 템플릿 관리페이지
app.get('/template.html', function (req, res) {
    var sql1 = "SELECT * FROM Template where Template_Type=1";
    conn.query(sql1, function (err, tmp, fields) {
         res.render('template1', {
               tmp:tmp          
        });
    });
});
app.get('/template2.html', function (req, res) {
    var sql1 = "SELECT * FROM Template where Template_Type=2";
    conn.query(sql1, function (err, tmp, fields) {
         res.render('template2', {
               tmp:tmp          
        });
    });
});
app.get('/template3.html', function (req, res) {
    var sql1 = "SELECT * FROM Template where Template_Type=3";
    conn.query(sql1, function (err, tmp, fields) {
         res.render('template3', {
               tmp:tmp          
        });
    });
});


// 메인화면 페이지
app.get('/index.html', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);

    if (comp == 999){
        var sql1 = 'SELECT count(*) as count FROM training WHERE Train_State=0';
        var sql2 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=0 ORDER BY Train_No DESC LIMIT 3';
        var sql3 = 'SELECT count(*) as count FROM training WHERE Train_State=1 ';
        var sql4 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=1 ORDER BY Train_No DESC LIMIT 3';
        var sql5 = 'SELECT count(*) as count FROM training WHERE Train_State=2 ';
        var sql6 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=2 ORDER BY Train_No DESC LIMIT 3';
        conn.query(sql1, function (err, values1, fields) {
            conn.query(sql2, function (err, values2, fields) {
                conn.query(sql3, function (err, values3, fields) {
                    conn.query(sql4, function (err, values4, fields) {
                        conn.query(sql5, function (err, values5, fields) {
                            conn.query(sql6, function (err, values6, fields) {
                                res.render('index', {
                                    values1: values1,
                                    values2: values2,
                                    values3: values3,
                                    values4: values4,
                                    values5: values5,
                                    values6: values6
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        var sql1 = 'SELECT count(*) as count FROM training WHERE Train_State=0 and Comp_No = ?';
        var sql2 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=0 and Comp_No = ? ORDER BY Train_No DESC LIMIT 3';
        var sql3 = 'SELECT count(*) as count FROM training WHERE Train_State=1 and Comp_No = ? ';
        var sql4 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=1 and Comp_No = ? ORDER BY Train_No DESC LIMIT 3';
        var sql5 = 'SELECT count(*) as count FROM training WHERE Train_State=2 and Comp_No = ? ';
        var sql6 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training WHERE Train_State=2 and Comp_No = ? ORDER BY Train_No DESC LIMIT 3';
        conn.query(sql1, [comp], function (err, values1, fields) {
            conn.query(sql2, [comp], function (err, values2, fields) {
                conn.query(sql3, [comp], function (err, values3, fields) {
                    conn.query(sql4, [comp], function (err, values4, fields) {
                        conn.query(sql5, [comp], function (err, values5, fields) {
                            conn.query(sql6, [comp], function (err, values6, fields) {
                                res.render('index', {
                                    values1: values1,
                                    values2: values2,
                                    values3: values3,
                                    values4: values4,
                                    values5: values5,
                                    values6: values6
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});
// url click update
// id - Train_no
// no - Emp_no
app.get('/template_url_attack/:id/:no', function (req, res) {
    var id = req.params.id;
    var no = req.params.no;

    var sql1 = 'UPDATE Target set Targ_UrClick = 1, Targ_UrClick_Time = CURRENT_TIMESTAMP where Train_no = ? and Emp_No = ?';
    conn.query(sql1, [id, no], function (err, tmp, fields) {
        res.render('template_url_attack', {

        });
    });
});

app.get('/template_insert_value/:id/:no/:temp', function (req, res) {
    var id = req.params.id;
    var no = req.params.no;
    var temp = req.params.temp;

    res.render('template/template_insert_value_'+temp, {
        id:id,
        no:no
    });
});

app.get('/template_insert_attack/:id/:no',function(req,res){
    var id = req.params.id;
    var no = req.params.no;
    id = id*1;
    no = no*1;
    var sql1 = 'UPDATE Target set Targ_Info = 1, Targ_Info_Time = CURRENT_TIMESTAMP where Train_no = ? and Emp_No = ?';
    conn.query(sql1, [id, no], function (err, tmp, fields) {
        res.render('template_url_attack', {

        });
    });
});


// 훈련 종료
// id - Train_no
app.get('/train_quit/:id', function (req, res) {
    var id = req.params.id;

    var sql1 = 'update training set train_state = 1 where train_no = ?';
    conn.query(sql1, [id], function (err, tmp, fields) {
        res.redirect("/training_result.html");
    });
})

// 종료된 훈련 자세히보기
// id - Train_no
app.get('/training_result_traindetail/:id', function (req, res) {
    var id = req.params.id;
    var comp = parseInt(req.signedCookies.Comp);
    
    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "정보 입력 훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type2, CASE WHEN Train_Kind = 1 THEN "URL 미클릭" WHEN Train_Kind = 2 THEN "첨부 파일 미클릭" ELSE "정보 미입력" END as Train_Type3, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo*100 AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo*100 AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo*100 AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 1';
    var sql2 = 'select Employee.Emp_Name AS "Name", Target_Action AS "TAction", DATE_FORMAT(Action_Time, "%Y-%m-%d %k:%i") as "Action" from recent, employee  where Train_No = ? and recent.Emp_No = employee.Emp_No order by Action_Time DESC LIMIT 5';
    var sql3 = 'select CASE WHEN Train_Kind = 1 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_UrCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) WHEN Train_Kind = 2 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_FileCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) ELSE (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_InfoPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) END AS Point from training where train_no=?';
    if (comp == 999){
        var sql4 = 'select Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, [id], function (err, tmp, fields) {
            conn.query(sql2, [id], function (err, tmp1, fields) {
                conn.query(sql3,[id],function(err, tmp2,fields){
                    conn.query(sql4,[id],function(err,tmp3,fields){
                    res.render('training_result_traindetail', {
                        tmp: tmp,
                        tmp1:tmp1,
                        tmp2:tmp2,
                        tmp3:tmp3
                        });
                    });
                });
            });
        });
    } else {
        var sql4 = 'select Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, [id], function (err, tmp, fields) {
            conn.query(sql2, [id], function (err, tmp1, fields) {
                conn.query(sql3,[id],function(err, tmp2,fields){
                    conn.query(sql4,[id, comp],function(err,tmp3,fields){
                    res.render('training_result_traindetail', {
                        tmp: tmp,
                        tmp1:tmp1,
                        tmp2:tmp2,
                        tmp3:tmp3
                        });
                    });
                });
            });
        });
    }
})

// 종료된 훈련 사용자 자세히보기
// id - Train_no
app.get('/training_result_userdetail/:id', function (req, res) {
    var id = req.params.id;

    var sql1 = 'SELECT Emp_Name, Targ_Receve, Targ_Delete, Targ_Click, Targ_Spam, Targ_UrClick, Targ_FileClick, Targ_Info, DATE_FORMAT(Targ_Receve_Time, "%Y-%m-%d %k:%i") as "Receve_Time", DATE_FORMAT(Targ_Delete_Time, "%Y-%m-%d %k:%i") as "Delete_Time", DATE_FORMAT(Targ_Spam_Time, "%Y-%m-%d %k:%i") as "Spam_Time",DATE_FORMAT(Targ_Click_Time, "%Y-%m-%d %k:%i") as "Click_Time", DATE_FORMAT(Targ_UrClick_Time, "%Y-%m-%d %k:%i") as "UrClick_Time", DATE_FORMAT(Targ_FileClick_Time, "%Y-%m-%d %k:%i") as "FileClick_Time", DATE_FORMAT(Targ_Info_Time, "%Y-%m-%d %k:%i") as "Info_Time"  FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?';
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 1';
    conn.query(sql1, [id], function (err, tmp, fields) {
        conn.query(sql2, [id], function (err, tmp2, fields) {
            res.render('training_result_userdetail', {
                tmp: tmp,
                tmp2: tmp2
            });
        })
    });
})

// 훈련목록 자세히보기
app.get('/training_list_traindetail/:id', function (req, res) {
    var id = req.params.id;
    var comp = parseInt(req.signedCookies.Comp);
    
    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "정보 입력 훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type2, CASE WHEN Train_Kind = 1 THEN "URL 미클릭" WHEN Train_Kind = 2 THEN "첨부 파일 미클릭" ELSE "정보 미입력" END as Train_Type3, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo*100 AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo*100 AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo*100 AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 0';
    var sql2 = 'select Employee.Emp_Name AS "Name", Target_Action AS "TAction", DATE_FORMAT(Action_Time, "%Y-%m-%d %k:%i") as "Action" from recent, employee  where Train_No = ? and recent.Emp_No = employee.Emp_No order by Action_Time DESC LIMIT 5';
    var sql3 = 'select CASE WHEN Train_Kind = 1 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_UrCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) WHEN Train_Kind = 2 THEN (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_FileCliPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) ELSE (select 50 - Train_ClickPeo/Train_TotalPeo*25 - Train_InfoPeo/Train_TotalPeo*25 + Train_DelEmPeo/Train_TotalPeo*25 + Train_SpamPeo/Train_TotalPeo*25) END AS Point from training where train_no=?';
    if (comp == 999){
        var sql4 = 'select Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, [id], function (err, tmp, fields) {
            conn.query(sql2, [id], function (err, tmp1, fields) {
                conn.query(sql3,[id],function(err, tmp2,fields){
                    conn.query(sql4,[id],function(err,tmp3,fields){
                    res.render('training_list_traindetail', {
                        tmp: tmp,
                        tmp1:tmp1,
                        tmp2:tmp2,
                        tmp3:tmp3
                        });
                    });
                });
            });
        });
    } else {
        var sql4 = 'select Comp_Name from Training, Company where Train_No = ? and Training.Comp_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql1, [id], function (err, tmp, fields) {
            conn.query(sql2, [id], function (err, tmp1, fields) {
                conn.query(sql3,[id],function(err, tmp2,fields){
                    conn.query(sql4,[id, comp],function(err,tmp3,fields){
                    res.render('training_list_traindetail', {
                        tmp: tmp,
                        tmp1:tmp1,
                        tmp2:tmp2,
                        tmp3:tmp3
                        });
                    });
                });
            });
        });
    }
})

// 훈련목록 사용자 자세히보기
app.get('/training_list_userdetail/:id', function (req, res) {
    var id = req.params.id;

    var sql1 = 'SELECT Emp_Name, Targ_Receve, Targ_Delete, Targ_Click, Targ_Spam, Targ_UrClick, Targ_FileClick, Targ_Info, DATE_FORMAT(Targ_Receve_Time, "%Y-%m-%d %k:%i") as "Receve_Time", DATE_FORMAT(Targ_Delete_Time, "%Y-%m-%d %k:%i") as "Delete_Time", DATE_FORMAT(Targ_Spam_Time, "%Y-%m-%d %k:%i") as "Spam_Time",DATE_FORMAT(Targ_Click_Time, "%Y-%m-%d %k:%i") as "Click_Time", DATE_FORMAT(Targ_UrClick_Time, "%Y-%m-%d %k:%i") as "UrClick_Time", DATE_FORMAT(Targ_FileClick_Time, "%Y-%m-%d %k:%i") as "FileClick_Time", DATE_FORMAT(Targ_Info_Time, "%Y-%m-%d %k:%i") as "Info_Time"  FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?';
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "정보 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 0';
    conn.query(sql1, [id], function (err, tmp, fields) {
        conn.query(sql2, [id], function (err, tmp2, fields) {
            res.render('training_list_userdetail', {
                tmp: tmp,
                tmp2: tmp2
            });
        })
    });
})

// 사용자 페이지 get
// user_page.handlerbars 파일로 넘겨준다.
app.get('/User_page/:userid', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    var userid = req.params.userid;
    var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no';
    var sql3 = 'SELECT training.Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training JOIN target WHERE training.train_no = target.train_no AND emp_no = ?';
    if (comp == 999){
        var sql1 = 'SELECT * FROM employee, Company WHERE Emp_No=? and employee.Comp_No = Company.Comp_No';
        conn.query(sql1, [userid], function (err, values1, fields) {
            conn.query(sql2, [userid], function (err, values2, fields) {
                conn.query(sql3, [userid], function (err, values3, fields) {
                    res.render('User_page', {
                        values1: values1,
                        values2: values2,
                        values3: values3
                    });
                })
            });
        });
    } else {
        var sql1 = 'SELECT * FROM employee, Company WHERE Emp_No=? and employee.Comp_No = ? and employee.Comp_No = Company.Comp_No';
        conn.query(sql1, [userid, comp], function (err, values1, fields) {
            conn.query(sql2, [userid], function (err, values2, fields) {
                conn.query(sql3, [userid], function (err, values3, fields) {
                    res.render('User_page', {
                        values1: values1,
                        values2: values2,
                        values3: values3
                    });
                })
            });
        });
    }

});

// 그룹 페이지 get
// user_page.handlerbars 파일로 넘겨준다.
app.get('/Group_page/:groupid', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log("그룹 상세보기 페이지 접속");
    var groupid = req.params.groupid;
    var sql2 = 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?) ORDER BY employee.emp_no';
    if (comp == 999){
        var sql1 = 'SELECT * FROM groups, Company WHERE group_no=? and groups.Comp_No = Company.Comp_No';
        conn.query(sql1, [groupid], function (err, values1, fields) {
            conn.query(sql2, [groupid], function (err, values2, fields) {
                res.render('Group_page', {
                    values1: values1,
                    values2: values2
                });
            });
        });
    } else {
        var sql1 = 'SELECT * FROM groups, Company WHERE group_no=? and groups.Comp_No=? and groups.Comp_No = Company.Comp_No';
        conn.query(sql1, [groupid,comp], function (err, values1, fields) {
            conn.query(sql2, [groupid], function (err, values2, fields) {
                res.render('Group_page', {
                    values1: values1,
                    values2: values2
                });
            });
        });
    }

});

// 사용자 / 그룹관리 페이지 get
// ug_manage.handlerbars 파일로 넘겨준다.
app.get(['/User_manage'], function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log("사용자 관리 페이지 접속");
    if (comp == 999) {
        var sql1 = 'SELECT * FROM employee, Company WHERE employee.Comp_No = Company.Comp_No';
        conn.query(sql1, function (err, values1, fields) {
            res.render('User_manage', {
                values1: values1
            });
        });
    } else {
        var sql1 = 'SELECT * FROM employee, Company WHERE employee.Comp_No = ? and employee.Comp_No = Company.Comp_No';
        conn.query(sql1, [comp], function (err, values1, fields) {
            res.render('User_manage', {
                values1: values1
            });
        });
    }
});

app.get(['/Group_manage'], function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log("그룹 관리 페이지 접속");
    if (comp == 999){
        var sql2 = 'SELECT * FROM groups, Company WHERE groups.Comp_No = Company.Comp_No';
        conn.query(sql2, function (err, values2, fields) {
            res.render('Group_manage', {
                values2: values2
            });
        });  
    } else {
        var sql2 = 'SELECT * FROM groups, Company WHERE groups.Comp_No = ? and groups.Comp_No = Company.Comp_No';
        conn.query(sql2, [comp], function (err, values2, fields) {
            res.render('Group_manage', {
                values2: values2
            });
        });  
    }

});

// 그룹 - 사용자 할당 페이지 - 전체 그룹 할당
app.get('/GroupInGroupAllAdd/:groupid', function (req, res) {
    console.log("그룹 사용자 할당페이지 - 전체 사용자 할당");
    var groupid = req.params.groupid;
    var comp = parseInt(req.signedCookies.Comp);
    var sql1 = 'SELECT Emp_No from Employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?) and Comp_No = ?';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No, Comp_No) VALUES(?,?,?)';
    conn.query(sql1, [groupid, comp], function (err, value1, fields) {
        for (var i = 0; i < value1.length; i++) {
            conn.query(sql2, [groupid, value1[i].Emp_No, comp], function (err, result, fields) {});
        };
    })
    res.redirect("/GroupInGroupAddDelete/" + groupid + "/1/1")
});

// 그룹 - 사용자 할당 페이지 - 전체 그룹 제외
app.get('/GroupInGroupAllDelete/:groupid', function (req, res) {
    console.log("그룹 할당페이지 - 전체 그룹 제외");
    var groupid = req.params.groupid;
    var sql1 = 'DELETE FROM GroupsIn WHERE Group_No = ?'
    conn.query(sql1, [groupid], function (err, value1, fields) {

    })
    res.redirect("/GroupInGroupAddDelete/" + groupid + "/1/1")
});

// 사용자 그룹 할당페이지 - 전체 그룹 할당
app.get('/GroupInUserAllAdd/:userid', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log("그룹 할당페이지 - 전체 그룹 할당");
    var userid = req.params.userid;
    var sql1 = 'SELECT Group_No from Groups where Group_No NOT IN  (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ?) and Comp_No = ?';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No, Comp_No) VALUES(?,?,?)';
    conn.query(sql1, [userid,comp], function (err, value1, fields) {
        for (var i = 0; i < value1.length; i++) {
            conn.query(sql2, [value1[i].Group_No, userid, comp], function (err, result, fields) {});
        };
    })
    res.redirect("/GroupInUserAddDelete/" + userid + "/1/1")
});

// 사용자 그룹 할당페이지 - 전체 그룹 제외
app.get('/GroupInUserAllDelete/:userid', function (req, res) {
    console.log("그룹 할당페이지 - 전체 그룹 제외");
    var userid = req.params.userid;
    var sql1 = 'DELETE FROM GroupsIn WHERE Emp_No = ?'
    conn.query(sql1, [userid], function (err, value1, fields) {

    })
    res.redirect("/GroupInUserAddDelete/" + userid + "/1/1")
});


// 사용자 그룹 할당 페이지 입장
app.get('/GroupInUserAddDelete/:userid/:page1/:page2', function (req, res) {
    console.log("사용자 그룹 할당 페이지 접속");
    var comp = parseInt(req.signedCookies.Comp);
    if (comp == 999){
        res.redirect('/User_manage');
    } else {
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
        var sql1 = 'SELECT * FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no) and  groups.Comp_No = ? ORDER BY group_no ASC LIMIT ' + offset1 + ',' + limit;
        // 사용자가 소속되지 않은 그룹의 페이징 값
        var sql4 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? and groups.Comp_No = ? ORDER BY groups.group_no)';

        // 사용자가 소속된 그룹 페이징 제외
        // 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no;'
        // 사용자가 소속된 그룹
        var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? and groups.Comp_No = ? ORDER BY groups.group_no ASC LIMIT ' + offset2 + ',' + limit;
        // 사용자가 소속된 그룹의 페이징 값
        var sql5 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? and Groups.Comp_No = ?';

        // 사용자 이름
        var sql3 = 'SELECT * FROM employee WHERE emp_no = ? and Comp_No = ?';

        conn.query(sql1, [userid,comp], function (err, values1, fields) {
            conn.query(sql2, [userid,comp], function (err, values2, fields) {
                conn.query(sql3, [userid,comp], function (err, username, fields) {
                    conn.query(sql4, [userid,comp], function (err, pagecount1, fields) {
                        conn.query(sql5, [userid,comp], function (err, pagecount2, fields) {
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
    }

});

// 유저 그룹 할당 post
app.post('/GroupInUserAdd/:userid', function (req, res) {
    console.log("사용자 편집 - 사용자 할당");
    var comp = parseInt(req.signedCookies.Comp);
    var userid = req.params.userid;
    var id = req.body.checkboxtest;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'INSERT INTO groupsin (group_no, emp_no, Comp_No) VALUES (?, ?, ?)';
            conn.query(sql, [items, userid, comp], function (err, result) {});
        });
    } else {
        var sql = 'INSERT INTO groupsin (group_no, emp_no, Comp_No) VALUES (?, ?, ?)';
        conn.query(sql, [id, userid, comp], function (err, result) {});
    }
    var page = '/GroupInUserAddDelete/' + userid + '/1/1';
    res.redirect(page);
});

// 유저 그룹 제외 post
app.post('/GroupInUserDelete/:userid', function (req, res) {
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
    var repage = '/GroupInUserAddDelete/' + userid + '/1/1';
    res.redirect(repage);
});

// 그룹 할당제외 페이지 입장
app.get('/GroupInGroupAddDelete/:groupid/:page1/:page2', function (req, res) {
    console.log("그룹 편집 페이지 접속");
    var comp = parseInt(req.signedCookies.Comp);
    if (comp == 999){
    res.redirect('/Group_manage');
    } else {
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
        var sql1 = 'SELECT * FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? ORDER BY employee.emp_no) and Comp_No = ? ORDER BY emp_no ASC LIMIT ' + offset1 + ',' + limit;
        // 그룹에 소속되지 않은 사용자의 페이징 값
        var sql4 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?) and Comp_No = ?';

        // 그룹에 소속된 사용자 페이징 제외
        // 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?) ORDER BY employee.emp_no;'
        // 그룹에 소속된 사용자
        var sql2 = 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? and employee.Comp_No = ? ORDER BY employee.emp_no ASC LIMIT ' + offset2 + ',' + limit;
        // 그룹에 소속된 사용자의 페이징 값
        var sql5 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? and Comp_No = ?';

        // 그룹 데이터
        var sql3 = 'SELECT * FROM groups WHERE group_no = (?) and Comp_No = ?';
        conn.query(sql1, [groupid, comp], function (err, values1, fields) {
            conn.query(sql2, [groupid, comp], function (err, values2, fields) {
                conn.query(sql3, [groupid, comp], function (err, titlename, fields) {
                    conn.query(sql4, [groupid, comp], function (err, pagecount1, fields) {
                        conn.query(sql5, [groupid, comp], function (err, pagecount2, fields) {
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
    }
});

// 그룹 할당 post
app.post('/GroupInGroupAdd/:groupid', function (req, res) {
    console.log("그룹 편집 - 사용자 할당");
    var comp = parseInt(req.signedCookies.Comp);
    var groupid = req.params.groupid;
    var id = req.body.checkboxtest;
    console.log(id);
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            var sql = 'INSERT INTO groupsin (emp_no, group_no, Comp_No) VALUES (?, ?, ?)';
            conn.query(sql, [items, groupid, comp], function (err, result) {});
        });
    } else {
        var sql = 'INSERT INTO groupsin (emp_no, group_no, Comp_No) VALUES (?, ?, ?)';
        conn.query(sql, [id, groupid], function (err, result) {});
    }
    var repage = '/GroupInGroupAddDelete/' + groupid + '/1/1';
    res.redirect(repage);
});

// 그룹 제외 post
app.post('/GroupInGroupDelete/:groupid', function (req, res) {
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
    var repage = '/GroupInGroupAddDelete/' + groupid + '/1/1';
    res.redirect(repage);
});

// 훈련 목록 페이지 get
app.get('/training_list.html', function (req, res) {
    var comp = parseInt(req.signedCookies.Comp);
    console.log("훈련 목록 페이지 접속");
    
    if (comp == 999){
        var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", Comp_Name from Training, Company where Train_State = 0 and Training.Comp_No = Company.Comp_No';
        conn.query(sql, function (err, values, fields) {
            res.render('training_list', {
                values: values,
            });
        });
    } else {
        var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", Comp_Name from Training, Company where Train_State = 0 and Training.Comp_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql, [comp], function (err, values, fields) {
            res.render('training_list', {
                values: values,
            });
        });
    }

});

// 훈련 결과 페이지 get
app.get(['/training_result.html'], function (req, res) {
    console.log("훈련 결과 페이지 접속");
    var comp = parseInt(req.signedCookies.Comp);
    if (comp == 999){
        var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", Comp_Name from Training, Company where Train_State = 1 and Training.Comp_No = Company.Comp_No';
        conn.query(sql, function (err, values, fields) {
            res.render('training_result', {
                values: values,
            });
        });
    } else {
        var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time", Comp_Name from Training, Company where Train_State = 1 and Training.Comp_No = ? and Training.Comp_No = Company.Comp_No';
        conn.query(sql, [comp], function (err, values, fields) {
            res.render('training_result', {
                values: values,
            });
        });
    }
});

// 사용자 추가 post
// modal에서 submit한 내용을 db에 추가한다.
// 받는 값은 이름, 이메일 2가지이다.
app.post('/employeeadd', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 사용자 추가");
    var comp = parseInt(req.signedCookies.Comp);
    if (comp == 999){
        res.redirect('/User_manage');
    } else {
        var name = req.body.employee_name_add;
        var email = req.body.email_add;
        var sql = 'INSERT INTO employee (emp_name, emp_email, Comp_No) VALUES(?, ?, ?)';
        var params = [name, email, comp];
        conn.query(sql, params, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
        });
        res.redirect('/User_manage');
    }
});

// 그룹 추가 post
// modal에서 submit한 내용을 db에 추가한다.
// 받는 값은 이름, 이메일 2가지이다.
app.post('/groupadd', function (req, res) {
    console.log("사용자/그룹 관리 페이지 - 그룹 추가");
    var comp = parseInt(req.signedCookies.Comp);
    var name = req.body.group_name_add;
    var note = req.body.group_note_add;
    
    if (comp == 999){
        res.redirect('/Group_manage');
    } else {
        if (note != "") {
            var sql = 'INSERT INTO groups (group_name, group_note, Comp_No) VALUES(?, ?, ?)';
            var params = [name, note, comp];
            conn.query(sql, params, function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
            });
        } else {
            var sql = 'INSERT INTO groups (group_name, Comp_No) VALUES(?,?)';
            var params = [name, comp];
            conn.query(sql, params, function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
            });
        }
        res.redirect('/Group_manage');
    }

});


// 사용자 삭제 delete
// id의 값이 배열일때 즉 체크박스의 데이터가 1개 이상일때
// foreach문을 돌려서 여러개 처리를 하였다.
// 배열이 아닌 단순 값이면
// 그 id값을 이용하여 delete sql구문을 실행하였다.
app.post('/employeedelete', function (req, res) {
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
    res.redirect('/User_manage');
});

// 그룹 삭제 delete
// id의 값이 배열일때 즉 체크박스의 데이터가 1개 이상일때
// foreach문을 돌려서 여러개 처리를 하였다.
// 배열이 아닌 단순 값이면
// 그 id값을 이용하여 delete sql구문을 실행하였다.
app.post('/groupdelete', function (req, res) {
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
    res.redirect('/Group_manage');
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
})
app.get('/mailsend.html', (req, res) => {
    res.render('mailsend');
});

app.post('/send', (req, res) => {
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

app.get('/training_generate.html', (req, res) => {
    res.render('training_generate');
})

module.exports = app;