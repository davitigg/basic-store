import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form: FormGroup;

  userDialogToggle!: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login(form: FormGroup) {
    this.userService.login(form);
  }

  registerUser() {
    this.userDialogToggle = true;
  }
}
