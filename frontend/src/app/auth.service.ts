import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  password: string;
  jwtToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  api_url = "http://localhost:9000"
  private userSubject: BehaviorSubject<any>;
  public user: Observable<User>;
  private refreshTokenTimeout:  any;
  constructor(private http: HttpClient,private router: Router) { 
    this.userSubject = new BehaviorSubject<any>(null);
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): any {
    return this.userSubject.value;
  }

  //for signing in the user
  SignIn(email: string, password: string) {
    return this.http.post<any>(`${this.api_url}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(user => {
                this.userSubject.next(user);
                this.startRefreshTokenTimer();
                return user;
            }))
  }

  //for signing out the application
  SignOut() {
    // this.http.post<any>(`http://localhost:9000/revoke-token`, {}).subscribe();
    this.stopRefreshTokenTimer();
    this.userSubject.next(null);
    this.router.navigate(['']);
  }

  refreshToken() {
    return this.http.post<any>(`${this.api_url}/authenticate/refresh-token`, {}, { withCredentials: true })
        .pipe(map((user) => {
            this.userSubject.next(user);
            this.startRefreshTokenTimer();
            return user;
        }));
  }

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.userValue.jwtToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

}
