// express 모듈
const express = require('express');
const app = express();

var page = require('./page');
app.use('/', page);
var training = require('./training');
app.use('/', training);
// mysql

app.listen(3000, () => console.log('server started...'));