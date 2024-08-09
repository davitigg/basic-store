import { Component, Input } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserModel, UserRoles } from 'src/app/_interfaces/user-model';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./users.component.css'],
  providers: [ ],
})
export class UsersComponent {
  @Input() userRole?: UserRoles;

  users: UserModel[] = [];

  userDialog!: boolean;

  productDialog!: boolean;

  user?: UserModel;

  selectedUsers!: UserModel[] | null;

  submitted!: boolean;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService
      .getUsers()
      .subscribe(
        (data) =>
          (this.users = data.filter((val) => val.role === this.userRole))
      );
  }

  deleteSelectedUsers() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected users?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let ids: number[] = [];
        this.selectedUsers?.forEach((x) => ids.push(x.id!));
        this.userService.deleteUsers(ids).subscribe(() => {
          this.users = this.users.filter(
            (val) => !this.selectedUsers!.includes(val)
          );
          this.selectedUsers = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Users Deleted',
            life: 3000,
          });
        });
      },
    });
  }

  editUser(user: UserModel) {
    this.user = { ...user };
    this.userDialog = true;
  }

  displayUserProducts(user: UserModel) {
    this.user = { ...user };
    this.productDialog = true;
  }

  deleteUser(user: UserModel) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + user.email + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id!).subscribe(() => {
          this.users = this.users.filter((val) => val.id !== user.id);
          this.user = undefined;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Deleted',
            life: 3000,
          });
        });
      },
    });
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser(user: UserModel) {
    this.submitted = true;
    if (
      user.email!.trim() &&
      user.fName.trim() &&
      user.lName.trim() &&
      user.password.trim() &&
      user.role
    ) {
      if (user.id) {
        this.userService.updateUser(user).subscribe({
          next: () => {
            if (user.role != this.userRole) {
              this.users.splice(this.findIndexById(user.id!), 1);
            } else this.users[this.findIndexById(user.id!)] = user;
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Updated',
              life: 3000,
            });
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

      this.users = [...this.users];
      this.userDialog = false;
      this.user = undefined;
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }
}
