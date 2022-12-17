import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimesheetService } from '../../timesheet.service';

interface ItemData {
  _id: string;
  project_name: string;
  lead_name: string;
  manager_name: string;
}

@Component({
  selector: 'app-add-project-user',
  templateUrl: './add-project-user.component.html',
  styleUrls: ['./add-project-user.component.scss']
})
export class AddProjectUserComponent implements OnInit {

  constructor(private timeSheetService: TimesheetService,private msg: NzMessageService) { }

  
  ngOnInit(): void {
    this.timeSheetService.fetchProject().subscribe((data:  any) => {
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
        project_name: '',
        lead_name: '',
        manager_name: ''
      }
    ];
    this.i++;
    this.updateEditCache();
  }

  deleteRow(id: string,projectName: any): void {
    if(projectName == ""){
      this.listOfData = this.listOfData.filter(d => d._id !== id);
    }
    else{
      this.timeSheetService.deleteProject(id).subscribe((data: any) => {
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
    this.timeSheetService.addProject(this.editCache[id].data).subscribe((data: any) => {
      if(data.status == 'success'){
        this.editCache[data.id] = { ...this.editCache[id], data: { ...this.editCache[id].data, _id: data.id}}
        delete this.editCache[id]
        Object.assign(this.listOfData[index], this.editCache[data.id].data);
        this.msg.success("Project added successfully")
        this.editCache[data.id].edit = false;
      }
      else if(data.status == 'updated'){
        Object.assign(this.listOfData[index], this.editCache[id].data);
        this.msg.success("Project uppdated successfully")
        this.editCache[id].edit = false;
      }
    },(err) =>{
      console.log(err)
    })
  }

}
