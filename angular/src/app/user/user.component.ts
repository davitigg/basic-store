import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserModel } from '../_interfaces/user-model';
import { TokenService } from '../_services/token.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {
  @Input() userDialog = false;
  @Output() userDialogChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  sendNotification() {
    this.userDialogChange.emit(this.userDialog);
  }

  user: UserModel = { email: '', fName: '', lName: '', password: '', role: -1 };

  submitted!: boolean;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    if (this.userService.userLoggedIn()) {
      let userId = this.tokenService.getDecodedToken().id;
      this.userService.getUser(userId).subscribe((data) => {
        this.user = data;
      });
    }
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser(user: UserModel) {
    this.submitted = true;
    if (
      user.email.trim() &&
      user.fName.trim() &&
      user.lName.trim() &&
      user.password.trim() &&
      user.role > -1
    ) {
      if (user.id) {
        this.userService.updateUser(user).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Updated',
              life: 3000,
            });
            this.userDialog = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err.error,
              life: 3000,
            });
          },
        });
      } else {
        this.userService.postUser(user).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Created',
              life: 3000,
            });
            this.userDialog = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err.error,
              life: 3000,
            });
          },
        });
      }
    }
  }

  deleteUser(user: UserModel) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your account?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id!).subscribe({
          next: () => {
            localStorage.removeItem('jwt');
            alert('თქვენი მომხმარებელი წაიშალა!');
            this.router.navigate(['login']);
          },
        });
        this.userDialog = false;
      },
    });
  }
}
