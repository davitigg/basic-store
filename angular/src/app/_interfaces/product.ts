import { UserModel } from './user-model';

export interface Product {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  seller?: UserModel;
}
