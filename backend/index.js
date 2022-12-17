const express = require('express')
const cors = require('cors')
const app = express()
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const timesheet = require('./controller/timesheet')
const addProjectUser = require('./controller/addProjectUser')
const authenticate = require('./controller/authenticate')
const cookieParser = require('cookie-parser');


async function dbConn(){
    try{
        await mongoose.connect('mongodb://localhost:27017/timeshiq')
        return true
    }
    catch(e){
        console.log(e.message)
        return false
    }
}
mongoose.set('strictQuery', false);
app.use(cors({
    origin: function (origin, callback) {
        console.log(`Origin ${origin} is being granted CORS access`);
        callback(null, true)
    },
    exposedHeaders: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('Origin'));
    console.log('Origin access cors', req.header('Origin'))
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true')
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, TOKEN');
        return res.status(200).json({});
    }
  
    next();
});
  
const createTestUser = require('./helpers/create-test-user');
createTestUser();

app.use('/test',(req,res) => {
    res.send('Working Fine')
})

app.use('/',timesheet)
app.use('/admin/',addProjectUser)
app.use('/authenticate/',authenticate)

app.listen(9000,async() => {
    let dbConnected = await dbConn()
    if(dbConnected){
        console.log("server started listening")
    }
    else{
        console.log("Server error cannot start")
    }
})
