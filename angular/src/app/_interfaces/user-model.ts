export interface UserModel {
  id?: number;
  email: string;
  password: string;
  fName: string;
  lName: string;
  role: UserRoles;
}

export enum UserRoles {
  Admin,
  Buyer,
  Seller,
}
