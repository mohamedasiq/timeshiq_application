const express = require('express')
const router = express.Router()
const project = require('../model/project.model')
const user = require('../model/users.model')
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs')
const fs = require('fs')
const monthJson = require('../helpers/month.json')
const dayJson = require('../helpers/days.json')
const decodeToken = require("../middleware/decode-token.middleware")
const authorize = require('../middleware/authorize.middleware')



async function createTimeSheetForThisUser(userID){
    let month = new Date().getMonth()
    let year = new Date().getFullYear()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(monthJson[month])
    worksheet.columns = [
        { header: 'Date',key: 'Date',width: 10 },
        { header: 'Project',key: 'Project',width: 10 },
        { header: 'Entry_Time',key: 'Entry_Time',width: 10 },
        { header: 'Exit_Time',key: 'Exit_Time',width: 10 },
        { header: 'Working_Hours',key: 'Working_Hours',width: 10 },
        { header: 'Status',key: 'Status',width: 10 }
    ]
    let days = dayJson[(month + 1)] 
    days = leapYear(year) ? days + 1 : days
    for(let i = 1 ;i <= days;i++){
        let date = new Date()
        date.setFullYear(year)
        date.setMonth(month)
        date.setDate(i)
        worksheet.addRow({Date: date, Project: '', Entry_Time: 0, Exit_Time: 0, Working_Hours: 0,Status: 'Active'})
    }
    await workbook.xlsx.writeFile(`./timesheet_storage/${userID}_timesheet.xlsx`);
    return true
}

function leapYear(year)
{
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

const isNotAlphaNumeric = str => /^[0-9]+$/gi.test(str);

router.post('/project',decodeToken.decodeToken,authorize(),async(req,res) => {
    const projObj = req.body.projObj
    const projID = projObj['_id']
    if(!isNotAlphaNumeric(projID))
    {
        const projUpdateRes = await project.findByIdAndUpdate(projID, projObj, { upsert: true });
        res.send({status: 'updated'})
    }
    else{
        delete projObj['_id']
        projObj ['isActive'] = true
        const projCrRes = await new project(projObj).save()
        res.send({id: projCrRes.id, status: 'success'})
    }
})

router.get('/project',decodeToken.decodeToken,authorize(),async(req,res) => {
    const proj = await project.aggregate([{ $match: { "isActive": true } }])
    res.send(proj)
})

router.post('/delproject',decodeToken.decodeToken,authorize(),async(req,res) => {
    const projID = req.body.projID
    const projRes = await project.findByIdAndUpdate(projID, { isActive: false }, { new: true });
    res.send({status: "success"})
})

router.post('/deluser',decodeToken.decodeToken,authorize(),async(req,res) => {
    const useriID = req.body.useriID
    const userRes = await user.findByIdAndUpdate(useriID, { isActive: false }, { new: true });
    res.send({status: "success"})
})

router.get('/project/list',decodeToken.decodeToken,authorize(),async(req,res) => {
    const proj = await project.find()
    const projList = proj.map((data) => data['project_name'])
    res.send(projList)
})

router.post('/users',decodeToken.decodeToken,authorize(),async(req,res) => {
    const userObj = req.body.userObj 
    const userID = userObj['_id']
    if(!isNotAlphaNumeric(userID))
    {
        const userUpdateRes = await user.findByIdAndUpdate(userID, userObj, { upsert: true });
        res.send({status: 'updated'})
    }
    else{
        delete userObj['_id']   
        userObj['passwordHash'] = bcrypt.hashSync(userObj['password'], 10)
        userObj['isActive'] = true
        const userCrObj = await new user(userObj).save()
        let excelCreated = await createTimeSheetForThisUser(userCrObj.id)
        res.send({id: userCrObj.id, status: 'success'})
    }
})

router.get('/users',decodeToken.decodeToken,authorize(),async(req,res) => {
    const userObj = await user.aggregate([{ $match: { "isActive": true } }])
    res.send(userObj)
})

router.get('/downloadSheet/:userID',decodeToken.decodeToken,authorize(),async(req,res) => {
    let userID = req.params.userID
    let workbook = new ExcelJS.Workbook()
    workbook = await workbook.xlsx.readFile(`./timesheet_storage/${userID}_timesheet.xlsx`)
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    workbook.xlsx.write(res).then(function () {
        res.end();
    });
})

module.exports = router