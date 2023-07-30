var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require('mongoose')
const key=require('./config/key')
const errorMiddleware = require('./middleware/error')
var user_Route = require('./routes/user_Route');
var app = express();
const bodyp=require('body-parser')

mongoose.connect(key.url, (err, db)=>{
    console.log("Connectiong to db")
})
  

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyp.urlencoded({extended:true}))

app.use('/api/v1', user_Route);


app.use(errorMiddleware)
app.listen(8080, (req, res)=>{
  console.log("server running on 8080")
})