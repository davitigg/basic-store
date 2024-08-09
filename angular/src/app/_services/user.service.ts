import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthenticatedResponse } from '../_interfaces/authenticated-response';
import { LoginModel } from '../_interfaces/login-model';
import { UserModel } from '../_interfaces/user-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {}

  login(form: FormGroup) {
    var credentials: LoginModel = {
      email: form.get('email')?.value,
      password: form.get('password')?.value,
    };

    if (form.valid) {
      this.http
        .post<AuthenticatedResponse>(
          'https://localhost:5001/api/Users/login',
          credentials,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          }
        )
        .subscribe({
          next: (response: AuthenticatedResponse) => {
            const token = response.token;
            localStorage.setItem('jwt', token);
            this.router.navigate(['/']);
          },
          error: (err: HttpErrorResponse) => {
            alert(
              'დაფიქსირდა შეცდომა!\nგთხოვთ შეამოწმოთ მომხმარებელი და პაროლი.'
            );
          },
        });
    } else alert('დაფიქსირდა შეცდომა!\nგთხოვთ შეიყვანოთ ვალიდური მონაცმები.');
  }

  logOut() {
    localStorage.removeItem('jwt');
    this.router.navigate(['login']);
  }

  userLoggedIn() {
    const token = localStorage.getItem('jwt');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }
    return false;
  }

  getUsers() {
    return this.http.get<UserModel[]>('https://localhost:5001/api/Users', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  getUser(id: number) {
    return this.http.get<UserModel>(`https://localhost:5001/api/Users/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  deleteUser(id: number) {
    return this.http.delete(`https://localhost:5001/api/Users/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  deleteUsers(ids: number[]) {
    return this.http.delete('https://localhost:5001/api/Users/', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids,
    });
  }

  updateUser(updatedUser: UserModel) {
    return this.http.put(
      `https://localhost:5001/api/Users/${updatedUser.id}`,
      updatedUser,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  postUser(user: UserModel) {
    return this.http.post('https://localhost:5001/api/Users/', user, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }
}
