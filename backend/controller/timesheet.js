const express = require('express')
const router = express.Router()
const ExcelJS = require('exceljs');
const decodeToken = require("../middleware/decode-token.middleware")
const authorize = require('../middleware/authorize.middleware')

// router.use(authorize())

function convert_excel_to_json(excel_data){
    let jsonData = [];
    excel_data.worksheets.forEach(function(sheet) {
        let firstRow = sheet.getRow(1);
        if (!firstRow.cellCount) return;
        let keys = firstRow.values;
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber == 1) return;
            let values = row.values
            let obj = {};
            if(new Date().getTime() >= values[1].getTime())
            {
                for (let i = 1; i < keys.length; i ++) {
                    if(keys[i] == 'Date'){
                        obj[keys[i]] = values[i].getMonth() + 1 + "/" + values[i].getDate() + "/" + values[i].getFullYear();
                        obj['week'] = getWeekOfMonth(values[i])
                    }
                    else if(keys[i] == 'Entry_Time' || keys[i] == 'Exit_Time'){
                        obj[keys[i]] = values[i]
                        obj[`pr${keys[i]}`] = processStringToDate(values[i],new Date(obj['Date']))
                    }
                    else{
                        obj[keys[i]] = values[i]
                    }
                }
                obj['id'] = rowNumber - 1
                jsonData.push(obj);
            }
        })

    });
    return jsonData.reverse()
}

function processStringToDate(dateStr,date){
    if(dateStr){
        let hms,median,hours,minutes;
        let medSplit = dateStr.split(" ")
        hms = medSplit[0]
        median = medSplit[1]
        let hmsSplit = hms.split(":")
        hours = hmsSplit[0]
        minutes = hmsSplit[1]
        minutes = minutes == undefined || minutes == 00 ? 0 : minutes
        if(median == 'AM'){
            // return new Date(date.getFullYear(),date.getMonth(),date.getDate(),hours,minutes)
            return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${hours}/${minutes}`
        }
        else if(median == 'PM'){
            return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${parseInt(hours) + 12}/${minutes}`
        }
    }
    return dateStr
}

function getWeekOfMonth(date) {
    const startWeekDayIndex = 1; // 1 MonthDay 0 Sundays
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDay = firstDate.getDay();
  
    let weekNumber = Math.ceil((date.getDate() + firstDay) / 7);
    if (startWeekDayIndex === 1) {
      if (date.getDay() === 0 && date.getDate() > 1) {
        weekNumber -= 1;
      }
      if (firstDate.getDate() === 1 && firstDay === 0 && date.getDate() > 1) {
        weekNumber += 1;
      }
    }
    return weekNumber;
}

router.get('/:userID',decodeToken.decodeToken,authorize(),async(req,res) => {
  const userID = req.params.userID
  const workbook = new ExcelJS.Workbook();
  const excel_data = await workbook.xlsx.readFile(`./timesheet_storage/${userID}_timesheet.xlsx`);
  const excel_json = convert_excel_to_json(excel_data)
  res.send(excel_json)  
})

function processTimeToString(data){
    let dateObj = new Date(data)
    let hours = dateObj.getHours() >= 12 ? dateObj.getHours() - 12 : dateObj.getHours()
    let minutes = dateObj.getMinutes()
    let median = dateObj.getHours() >= 12 ? 'PM' : 'AM'
    return `${hours}:${minutes} ${median}`
}

router.post('/',decodeToken.decodeToken,authorize(),async(req,res) => {
    const { timeObj, timeRow, userID } = req.body
    let { Project, prEntry_Time , prExit_Time, Working_Hours} = timeObj
    let entry_time_to_string = processTimeToString(prEntry_Time)
    let exit_time_to_string = processTimeToString(prExit_Time)
    let workbook = new ExcelJS.Workbook()
    workbook = await workbook.xlsx.readFile(`./timesheet_storage/${userID}_timesheet.xlsx`)
    let workSheet = workbook.getWorksheet('December')
    let row = workSheet.getRow(timeRow+1)
    row.getCell(1).value = new Date(timeObj['Date'])
    row.getCell(2).value = Project
    row.getCell(3).value = entry_time_to_string
    row.getCell(4).value = exit_time_to_string
    row.getCell(5).value = Working_Hours
    // row.getCell(6).value = timeObj['Status']
    row.commit()
    await workbook.xlsx.writeFile(`./timesheet_storage/${userID}_timesheet.xlsx`)
    res.send({Entry_Time : entry_time_to_string, Exit_Time : exit_time_to_string , status: 'success'})
})

module.exports = router