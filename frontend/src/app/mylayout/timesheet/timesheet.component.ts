import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../timesheet.service';
import { AuthService } from '../../auth.service'
import { NzMessageService } from 'ng-zorro-antd/message';

interface ItemData {
  id: string,
  Date: string;
  Project: string;
  Entry_Time: string;
  prEntry_Time: Date;
  Exit_Time: string;
  prExit_Time: Date;
  Working_Hours: string;
  week: number;
}

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  month: string = '12';
  week: string = '0';
  year: string = '2022';
  date: string = '';
  dateList = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
  listProj = ['Demo']
  editCache: { [key: string]: { edit: boolean; data: ItemData } } = {};
  listOfData: ItemData[] = [];
  filteredData: ItemData[] = [];
  userID : any;

  entryTime = new Date(2022,12,1,0,0)

  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfData.findIndex(item => item.id === id);
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false
    };
  }

  ValidateTime(id: string){
    return this.editCache[id].data['prExit_Time'].getTime() > this.editCache[id].data['prEntry_Time'].getTime()
  }

  saveEdit(id: string): void {
    if(this.ValidateTime(id)){
      const index = this.listOfData.findIndex(item => item.id === id);
      this.timeSheetService.saveTimeSheetData(this.editCache[id].data,parseInt(id),this.userID).subscribe((data: any) => {
        if(data.status == 'success'){
          this.editCache[id].data['Entry_Time'] = data.Entry_Time
          this.editCache[id].data['Exit_Time'] = data.Exit_Time
          Object.assign(this.listOfData[index], this.editCache[id].data);
          this.editCache[id].edit = false;
        }
      },(err) =>{
        console.log(err)
      })
    }
    else{
      this.msg.error("Exit Time must be greater then Entry Time")
    }
  }

  updateEditCache(): void {
    this.listOfData.forEach(item => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item }
      };
    });
  }

  constructor(private timeSheetService: TimesheetService,private authService: AuthService,private msg: NzMessageService) { }

  ngOnInit(): void {
    this.userID = this.authService.userValue['id']
    this.timeSheetService.fetchTimeSheetData(this.userID).subscribe((data:  any) => {
      let prData = data.map((data: any) => {
        data['prEntry_Time'] = this.processStrToDate(data['prEntry_Time'])
        data['prExit_Time'] = this.processStrToDate(data['prExit_Time'])
        return data
      })
      this.listOfData = prData
      this.filteredData = prData
      this.updateEditCache();
    })
    this.timeSheetService.fetchProjectsList().subscribe((data: any) => {
      this.listProj = data
    })
  }

  processStrToDate(dateStr: string){
    if(dateStr){
      let dateArr = dateStr.split("/")
      return new Date(parseInt(dateArr[0]),parseInt(dateArr[1]),parseInt(dateArr[2]),parseInt(dateArr[3]),parseInt(dateArr[4]))
    }
    return dateStr
  }

  filterTimeSheet(){
    if(parseInt(this.week)){
      this.filteredData = this.listOfData.filter((data) => {
        return data['week'] == parseInt(this.week)
      })
    }
    else if(parseInt(this.date) == 0){
      this.resetTimeSheet()
    }
    else if(parseInt(this.week) == 0 && this.date == ''){
      this.resetTimeSheet()
    }
    else{
      this.filteredData = this.listOfData.filter((data) => {
        return data['Date'] == this.month + "/" + this.date + "/" + this.year
      })
    }
  }

  resetTimeSheet(){
    this.filteredData = this.listOfData
  }

  log(event: any,type: any,data: any){
    console.log(event)
    if(type == 'exit_time'){
      if(data['prEntry_Time'] instanceof Date){
        let exit_time = event.getTime()
        let entry_time = data['prEntry_Time'].getTime()
        data['Working_Hours'] = (exit_time - entry_time) / (1000 * 60 * 60)
      }
    }
    else if(type == 'entry_time')
    {
      if(data['prExit_Time'] instanceof Date){
        let entry_time = event.getTime()
        let exit_time = data['prExit_Time'].getTime()
        data['Working_Hours'] = (exit_time - entry_time) / (1000 * 60 * 60)
      }
    }
  }

}
