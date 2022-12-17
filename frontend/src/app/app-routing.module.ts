import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MylayoutComponent } from './mylayout/mylayout.component';
import { TimesheetComponent } from './mylayout/timesheet/timesheet.component';
import { LoginComponent } from './login/login.component';
import { AddProjectUserComponent } from './mylayout/add-project-user/add-project-user.component';
import { AddUserComponent } from './mylayout/add-user/add-user.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', canActivate: [LoginGuard], component: LoginComponent},
  { path: ':role/main', 
    canActivate: [AuthGuard],
    component: MylayoutComponent,
    children: [
      {
        path: 'timesheet',
        component: TimesheetComponent
      },
      {
        path: 'project',
        component: AddProjectUserComponent
      },
      {
        path: 'user',
        component: AddUserComponent
      }
    ]  
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
