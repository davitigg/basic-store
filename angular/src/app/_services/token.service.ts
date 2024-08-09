import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserModel, UserRoles } from '../_interfaces/user-model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  // user: UserModel | undefined;

  getDecodedToken() {
    var token = localStorage.getItem('jwt');
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token!);
    return decodedToken;
  }

}
