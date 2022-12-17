import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  api_url = "http://localhost:9000"
  constructor(private http: HttpClient) { }

  fetchTimeSheetData(userID: any){
    return this.http.get(`${this.api_url}/${userID}`)
  }

  saveTimeSheetData(timeObj: Object,timeRow: Number,userID: any){
    return this.http.post(`${this.api_url}/`,{timeObj,timeRow,userID}).pipe(catchError(this.errorHandler))
  }

  errorHandler(err: any){
    return throwError(err.message || 'server Error')
  }

  addProject(projObj: any){
    return this.http.post(`${this.api_url}/admin/project`,{projObj}).pipe(catchError(this.errorHandler))
  }

  deleteProject(projID: any){
    return this.http.post(`${this.api_url}/admin/delproject`,{projID}).pipe(catchError(this.errorHandler))
  }

  fetchProject(){
    return this.http.get(`${this.api_url}/admin/project`).pipe(catchError(this.errorHandler))
  }

  addUser(userObj: any){
    return this.http.post(`${this.api_url}/admin/users`,{userObj}).pipe(catchError(this.errorHandler))
  }

  deleteUser(useriID: any){
    return this.http.post(`${this.api_url}/admin/deluser`,{useriID}).pipe(catchError(this.errorHandler))
  }

  fetchUser(){
    return this.http.get(`${this.api_url}/admin/users`).pipe(catchError(this.errorHandler))
  }

  downloadTimeSheet(userID: any){
    return this.http.get(`${this.api_url}/admin/downloadSheet/` + userID,{responseType: 'blob'}).pipe(catchError(this.errorHandler))
  }

  fetchProjectsList(){
    return this.http.get(`${this.api_url}/admin/project/list`).pipe(catchError(this.errorHandler))
  }
}
