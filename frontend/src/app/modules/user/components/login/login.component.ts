import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {LaravelErrorExtractorService} from '../../../../services/laravel-error-extractor.service';
import {environment} from '../../../../../environments/environment';

@UntilDestroy()

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  siteName = environment.appName;

  loginForm!: FormGroup;
  errorMessages: string[] = [];

  returnUrl: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.getReturnUrl();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    this.initForm();
  }

  getReturnUrl() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // trim the returnURL
    if (this.returnUrl) {
      this.returnUrl = this.returnUrl.trim();
    }
  }

  initForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  login() {
    this.toastr.clear();

    this.authService.login(this.loginForm.value).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        this.authService.sendToken(res.token);

        // If we have a return URL, Go to that, If not go to home page
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]).then();
          return;
        }

        this.router.navigate(['/']).then();
      },
      error: (error) => {
        const errorMessages = LaravelErrorExtractorService.extractErrorMessagesFromErrorResponse(error);
        if (errorMessages.length > 0) {
          for (const errorMessage of errorMessages) {
            this.toastr.error(errorMessage);
            this.loginForm.get('password')?.reset();
          }
        } else {
          this.toastr.error('Failed to login, Unknown error');
        }
      }
    });
  }
}
