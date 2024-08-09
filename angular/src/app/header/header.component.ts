import { Component } from '@angular/core';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  userDialogToggle!: boolean;

  constructor(
    private userService: UserService
  ) {}

  userLoggedIn() {
    return this.userService.userLoggedIn();
  }

  logOut() {
    this.userService.logOut();
  }

  editUser() {
    this.userDialogToggle = true;
  }
}
