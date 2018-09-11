var express = require('express');
var app = express();
// body-parser 모듈
const bodyParser = require('body-parser');
// handlebars 모듈
const exphbs = require('express-handlebars');
// path 모듈
const path = require('path');

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

// 템플릿 관리페이지
app.get('/template.html', function (req, res) {
    var sql1 = "SELECT * FROM Template";

    conn.query(sql1, function (err, tmp, fields) {
        res.render('template', {
            tmp: tmp
        });
    });
});


// 메인화면 페이지
app.get('/index.html', function (req, res) {
    console.log("메인화면 페이지 접속");
    var sql1 = 'SELECT count(*) as count FROM training';
    var sql2 = 'SELECT Train_No, Train_Name, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training ORDER BY Train_No DESC LIMIT 3';
    conn.query(sql1, function (err, values1, fields) {
        conn.query(sql2, function (err, values2, fields) {
            res.render('index', {
                values1: values1,
                values2: values2
            });
        });
    });
});

// url click update
// id - Train_no
// no - Emp_no
app.get('/template_url_attack/:id/:no', function (req, res) {
    var id = req.params.id;
    var no = req.params.no;

    var sql1 = 'UPDATE Target set Targ_UrClick = 1 where Train_no = ? and Emp_No = ?';
    conn.query(sql1, [id, no], function (err, tmp, fields) {
        res.render('template_url_attack', {

        });
    })
})

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

    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "자격증명 훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type2, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 1';
    conn.query(sql1, [id], function (err, tmp, fields) {
        res.render('training_result_traindetail', {
            tmp: tmp
        });
    });

})

// 종료된 훈련 사용자 자세히보기
// id - Train_no
app.get('/training_result_userdetail/:id', function (req, res) {
    var id = req.params.id;

    var sql1 = "SELECT * FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?";
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 1';
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

    var sql1 = 'select Train_No, CASE WHEN Train_Kind = 1 THEN "피싱 훈련" WHEN Train_Kind = 2 THEN "첨부 파일 훈련" ELSE "자격증명 훈련" END as Train_Type, CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type2, Train_Name, Train_TotalPeo, FLOOR((Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo)/Train_TotalPeo*100) as "Train_Totalattackrate" ,Train_FileCliPeo+Train_UrCliPeo+Train_InfoPeo as "Train_Totalattackno" , DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" , Train_RecvMailPeo, Train_DelEmPeo/Train_TotalPeo AS "Train_DelEmPeoRate",Train_DelEmPeo, Train_ClickPeo/Train_TotalPeo AS "Train_ClickPeoRate", Train_ClickPeo, Train_SpamPeo/Train_TotalPeo AS "Train_SpamPeoRate", Train_SpamPeo from Training where Train_No = ? and Train_State = 0';
    conn.query(sql1, [id], function (err, tmp, fields) {
        res.render('training_list_traindetail', {
            tmp: tmp
        });
    });

})

// 훈련목록 사용자 자세히보기
app.get('/training_list_userdetail/:id', function (req, res) {
    var id = req.params.id;

    var sql1 = "SELECT * FROM Employee, Target where Target.Emp_No = Employee.Emp_No and Train_No = ?";
    var sql2 = 'SELECT CASE WHEN Train_Kind = 1 THEN "URL 클릭" WHEN Train_Kind = 2 THEN "첨부 파일 클릭" ELSE "자격 증명 입력" END as Train_Type, Train_No, Train_Name FROM training where Train_No = ? and Train_State = 0';
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
    console.log("유저 상세보기 페이지 접속");
    var userid = req.params.userid;
    var sql1 = 'SELECT * FROM employee WHERE Emp_No=(?)';
    var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no';
    var sql3 = 'SELECT training.Train_No, Train_Name, Train_Persent, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(Train_Finish, "%Y-%m-%d %k:%i") as "Finish_Time" FROM training JOIN target WHERE training.train_no = target.train_no AND emp_no = ?';
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
});

// 그룹 페이지 get
// user_page.handlerbars 파일로 넘겨준다.
app.get('/Group_page/:groupid', function (req, res) {
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
app.get(['/User_manage'], function (req, res) {
    console.log("사용자 관리 페이지 접속");
    var sql1 = 'SELECT * FROM employee';
    conn.query(sql1, function (err, values1, fields) {
        res.render('User_manage', {
            values1: values1
        });
    });
});

app.get(['/Group_manage'], function (req, res) {
    console.log("그룹 관리 페이지 접속");
    var sql2 = 'SELECT * FROM groups';
    conn.query(sql2, function (err, values2, fields) {
        res.render('Group_manage', {
            values2: values2
        });
    });
});

// 그룹 - 사용자 할당 페이지 - 전체 그룹 할당
app.get('/GroupInGroupAllAdd/:groupid', function (req, res) {
    console.log("그룹 사용자 할당페이지 - 전체 사용자 할당");
    var groupid = req.params.groupid;
    var sql1 = 'SELECT Emp_No from Employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?)';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No) VALUES(?,?)';
    conn.query(sql1, [groupid], function (err, value1, fields) {
        for (var i = 0; i < value1.length; i++) {
            conn.query(sql2, [groupid, value1[i].Emp_No], function (err, result, fields) {});
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
    console.log("그룹 할당페이지 - 전체 그룹 할당");
    var userid = req.params.userid;
    var sql1 = 'SELECT Group_No from Groups where Group_No NOT IN  (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ?)';
    var sql2 = 'INSERT INTO GroupsIn (Group_No, Emp_No) VALUES(?,?)';
    conn.query(sql1, [userid], function (err, value1, fields) {
        for (var i = 0; i < value1.length; i++) {
            conn.query(sql2, [value1[i].Group_No, userid], function (err, result, fields) {});
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
    var sql1 = 'SELECT * FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no) ORDER BY group_no ASC LIMIT ' + offset1 + ',' + limit;
    // 사용자가 소속되지 않은 그룹의 페이징 값
    var sql4 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM groups WHERE group_no NOT IN (SELECT groups.group_no FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no)';

    // 사용자가 소속된 그룹 페이징 제외
    // 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no;'
    // 사용자가 소속된 그룹
    var sql2 = 'SELECT * FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ? ORDER BY groups.group_no ASC LIMIT ' + offset2 + ',' + limit;
    // 사용자가 소속된 그룹의 페이징 값
    var sql5 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM groups JOIN groupsin WHERE groups.group_no = groupsin.group_no AND groupsin.emp_no = ?';

    // 사용자 이름
    var sql3 = 'SELECT * FROM employee WHERE emp_no = ?';

    conn.query(sql1, [userid], function (err, values1, fields) {
        conn.query(sql2, [userid], function (err, values2, fields) {
            conn.query(sql3, [userid], function (err, username, fields) {
                conn.query(sql4, [userid], function (err, pagecount1, fields) {
                    conn.query(sql5, [userid], function (err, pagecount2, fields) {
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
app.post('/GroupInUserAdd/:userid', function (req, res) {
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
    var sql1 = 'SELECT * FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? ORDER BY employee.emp_no) ORDER BY emp_no ASC LIMIT ' + offset1 + ',' + limit;
    // 그룹에 소속되지 않은 사용자의 페이징 값
    var sql4 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM employee WHERE emp_no NOT IN (SELECT employee.emp_no FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?)';

    // 그룹에 소속된 사용자 페이징 제외
    // 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = (?) ORDER BY employee.emp_no;'
    // 그룹에 소속된 사용자
    var sql2 = 'SELECT * FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ? ORDER BY employee.emp_no ASC LIMIT ' + offset2 + ',' + limit;
    // 그룹에 소속된 사용자의 페이징 값
    var sql5 = 'SELECT Ceil(Count(*)/' + limit + ') AS "counts" FROM employee JOIN groupsin WHERE employee.emp_no = groupsin.emp_no AND group_no = ?';

    // 그룹 데이터
    var sql3 = 'SELECT * FROM groups WHERE group_no = (?)'
    conn.query(sql1, [groupid], function (err, values1, fields) {
        conn.query(sql2, [groupid], function (err, values2, fields) {
            conn.query(sql3, [groupid], function (err, titlename, fields) {
                conn.query(sql4, [groupid], function (err, pagecount1, fields) {
                    conn.query(sql5, [groupid], function (err, pagecount2, fields) {
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
app.post('/GroupInGroupAdd/:groupid', function (req, res) {
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
    console.log("훈련 목록 페이지 접속");
    var sql = 'select Train_No, Train_Name, Train_TotalPeo, DATE_FORMAT(Train_Start, "%Y-%m-%d %k:%i") as "Start_Time", DATE_FORMAT(date_add(Train_Finish, Interval 7 day), "%Y-%m-%d %k:%i") as "Finish_Time" from Training where Train_State = 0';
    conn.query(sql, function (err, values, fields) {
        res.render('training_list', {
            values: values,
        });
    });
});

// 훈련 결과 페이지 get
app.get(['/training_result.html'], function (req, res) {
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
app.post('/employeeadd', function (req, res) {
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
    res.redirect('/User_manage');
});

// 그룹 추가 post
// modal에서 submit한 내용을 db에 추가한다.
// 받는 값은 이름, 이메일 2가지이다.
app.post('/groupadd', function (req, res) {
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
    res.redirect('/Group_manage');
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