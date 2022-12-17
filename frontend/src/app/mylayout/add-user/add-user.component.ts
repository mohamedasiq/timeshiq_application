import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimesheetService } from '../../timesheet.service';
import {saveAs} from 'file-saver';

interface ItemData {
  _id: string;
  display_name: string;
  email_id: string;
  password: string;
  role: string
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  constructor(private timeSheetService: TimesheetService,private msg: NzMessageService) { }

  ngOnInit(): void {
    this.timeSheetService.fetchUser().subscribe((data:  any) => {
      this.listOfData = data
      this.updateEditCache();
    })
  }

  i = 0;
  editCache: { [key: string]: { edit: boolean; data: ItemData } } = {};
  listOfData: ItemData[] = [];

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      {
        _id: `${this.i}`,
        display_name: '',
        email_id: '',
        password: '',
        role: ''
      }
    ];
    this.i++;
    this.updateEditCache();
  }

  deleteRow(id: string,email: any): void {
    if(email == ""){
      this.listOfData = this.listOfData.filter(d => d._id !== id);
    }
    else{
      this.timeSheetService.deleteUser(id).subscribe((data: any) => {
        if(data['status'] == 'success'){
          this.listOfData = this.listOfData.filter(d => d._id !== id);
        }
      })
    }
  }

  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfData.findIndex(item => item._id === id);
    this.editCache[id] = {
      data: { ...this.listOfData[index] },
      edit: false
    };
  }

  updateEditCache(): void {
    this.listOfData.forEach(item => {
      this.editCache[item._id] = {
        edit: false,
        data: { ...item }
      };
    });
  }

  saveEdit(id: string): void {
    const index = this.listOfData.findIndex(item => item._id === id);
    this.timeSheetService.addUser(this.editCache[id].data).subscribe((data: any) => {
      if(data.status == 'success'){
        this.editCache[data.id] = { ...this.editCache[id], data: { ...this.editCache[id].data, _id: data.id}}
        delete this.editCache[id]
        Object.assign(this.listOfData[index], this.editCache[data.id].data);
        this.msg.success("User added successfully")
        this.editCache[data.id].edit = false;
      }
      else if(data.status == 'updated'){
        Object.assign(this.listOfData[index], this.editCache[id].data);
        this.msg.success("User updated successfully")
        this.editCache[id].edit = false;
      }
    },(err) =>{
      console.log(err)
    })
  }

  downloadExcel(userID: any){
    this.timeSheetService.downloadTimeSheet(userID).subscribe((res) => {
      let fileBlob: any = res;
      let blob = new Blob([fileBlob], {
        type: "application/vnd.ms-excel"
      });
      saveAs(blob, `TimeSheet.xlsx`);
    })
  }

}
