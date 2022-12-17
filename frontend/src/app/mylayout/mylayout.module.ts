import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MylayoutComponent } from './mylayout.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../timesheet.service';
import { HttpClientModule } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AddProjectUserComponent } from './add-project-user/add-project-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzMessageModule } from 'ng-zorro-antd/message';

@NgModule({
  declarations: [
    MylayoutComponent,
    TimesheetComponent,
    AddProjectUserComponent,
    AddUserComponent,
  ],
  imports: [
    CommonModule,
    NzDividerModule,
    NzTableModule,
    NzLayoutModule,
    NzMenuModule,
    RouterModule,
    NzInputModule,
    FormsModule,
    HttpClientModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzPageHeaderModule,
    NzTimePickerModule,
    NzMessageModule
  ],
  providers:[TimesheetService]
})
export class MylayoutModule { }
