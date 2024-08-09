import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartProduct } from '../_interfaces/cart-product';
import { Product } from '../_interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  cart: BehaviorSubject<any> = new BehaviorSubject([]);
  products: BehaviorSubject<any> = new BehaviorSubject([]);

  updateCartSubject(product: CartProduct) {
    let list = this.cart.getValue();
    let i = this.findIndexById(product.id!, list);
    if (i < 0) {
      list.push(product);
    } else {
      list[i] = product;
    }
    this.cart.next(list);
  }

  updateProductsSubject(cartProduct: CartProduct, quantity: number) {
    let products: Product[] = this.products.getValue();
    let step = quantity - cartProduct.quantity!;
    products[
      this.findIndexById(cartProduct.product!.id!, products)
    ].quantity! -= step;

    this.products.next(products);
  }

  addProductsSubject(cartProduct: CartProduct) {
    let list = this.products.getValue();
    let i = this.findIndexById(cartProduct.product!.id!, list);
    let product = cartProduct.product;
    product!.quantity! += cartProduct.quantity!;
    list[i] = product;
    this.products.next(list);
  }

  addMultipleProductsSubject(cartProducts: CartProduct[]) {
    let list = this.products.getValue();
    cartProducts.forEach((cartProduct) => {
      let i = this.findIndexById(cartProduct.product!.id!, list);
      let product = cartProduct.product;
      product!.quantity! += cartProduct.quantity!;
      list[i] = product;
    });
    this.products.next(list);
  }

  findIndexById(id: number, list: any[]): number {
    let index = -1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  constructor(private http: HttpClient) {}

  // Get
  getProducts() {
    return this.http.get<Product[]>('https://localhost:5001/api/Products/', {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  // Get by Id
  getProductsBySellerId(id: number) {
    return this.http.get<Product[]>(
      `https://localhost:5001/api/Products/Seller/${id} `,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  // Post
  postProduct(userId: number, product: Product) {
    return this.http.post('https://localhost:5001/api/Products/', product, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params: { sellerId: userId },
    });
  }

  // Put
  updateProduct(sellerId: number, product: Product) {
    return this.http.put(
      `https://localhost:5001/api/Products/Seller/${sellerId}/${product.id}`,
      product,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  // Delete by id
  deleteProduct(id: number) {
    return this.http.delete(`https://localhost:5001/api/Products/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  // Delete many by ids
  deleteProducts(ids: number[]) {
    return this.http.delete(`https://localhost:5001/api/Products/`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids,
    });
  }

  // Get by Id
  getCartProductsBySellerId(id: number) {
    return this.http.get<CartProduct[]>(
      `https://localhost:5001/api/CartProducts/Buyer/${id} `,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  // Post
  postCartProduct(buyerId: number, product: Product) {
    return this.http.post('https://localhost:5001/api/CartProducts', product, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params: { buyerId: buyerId },
    });
  }

  // Delete by id
  deleteCartProduct(id: number) {
    return this.http.delete(`https://localhost:5001/api/CartProducts/${id}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  // Delete many by ids
  deleteCartProducts(ids: number[]) {
    return this.http.delete(`https://localhost:5001/api/CartProducts/`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids,
    });
  }

  // Put
  updateCartProduct(product: CartProduct, buyerId: number, quantity: number) {
    return this.http.put(
      `https://localhost:5001/api/CartProducts/Buyer/${buyerId}/${product.id}?quantity=${quantity}`,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }
}
