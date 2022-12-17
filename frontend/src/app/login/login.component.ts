import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { first } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  passwordVisible = true;
  login = false;
  error = '';

  constructor(private authService: AuthService,private fb: FormBuilder,private router: Router,private msg: NzMessageService) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password: [ null, [ Validators.required ] ]
    });
  }

  submitForm(){
    let username: any = this.loginForm.get('userName')?.value
    let password: any = this.loginForm.get('password')?.value
    this.authService.SignIn(username,password).pipe(first())
    .subscribe({
        next: (data) => {
          console.log(data)
            this.router.navigate([`${data['role']}/main`]);
        },
        error: error => {
            this.error = error;
            this.msg.error("Login failed!")
        }
    });;
  }

}
