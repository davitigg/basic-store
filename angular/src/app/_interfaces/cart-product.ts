import { Product } from './product';
import { UserModel } from './user-model';

export interface CartProduct {
  id?: number;
  buyer?: UserModel;
  product?: Product;
  quantity?: number;
}
