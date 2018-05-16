// Based on https://github.com/mmacneil/AngularASPNETCore2WebApiAuth/blob/master/src/src/app/account/login-form/login-form.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Subscription } from 'rxjs';
import { Credentials } from '../shared/models/credentials.interface';
import { AccountService } from '../shared/services/account.service';
import { AuthService } from '../shared/services/auth-service';
import { ContentService } from '../shared/services/content.service';
import { LoginService } from '../shared/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {

  login_title = "LOGIN";

  private subscription: Subscription;

  brandNew: boolean;
  errors: string;
  isRequesting: boolean;
  submitted: boolean = false;
  credentials: Credentials = { userName: '', password: '' }

  constructor(
    private loginService: LoginService,
    private contentService: ContentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private accountService: AccountService
  ) { }

  login({ value, valid }: { value: Credentials, valid: boolean }) {
    this.submitted = true;
    this.isRequesting = true;
    this.errors = '';
    if (valid) {
      this.loginService.login(value.userName, value.password)
        .subscribe(result => {
          // Login succeeded
          if (result) {
            // Set user claims observable so they are
            // available for the entire application
            this.accountService.getUserClaims()
              // Navigate to root when done
              .finally(() => {
                this.isRequesting = false;
                this.contentService.setContent("Register User");
                this.router.navigate(['']);
              })
              .subscribe(result => {
                if (result) {
                  this.accountService.setUserClaims(result);
                  localStorage.setItem("user-claims", JSON.stringify(result));
                }
              })
          }
          // Login failed
        }, error => this.errors = error
        )
    }
  }

  ngOnInit() {
    // subscribe to router event
    this.subscription = this.activatedRoute.queryParams.subscribe(
      (param: any) => {
        this.brandNew = param['brandNew'];
        //this.credentials.userName = param['userName'];
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
