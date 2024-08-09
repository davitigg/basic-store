import { Component, Input } from '@angular/core';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { CartProduct } from 'src/app/_interfaces/cart-product';
import { TokenService } from 'src/app/_services/token.service';
import { ProductService } from '../../_services/product.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  @Input() userId?: number;

  products: CartProduct[] = [];

  selectedProducts!: CartProduct[] | null;

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    const decodedToken = this.tokenService.getDecodedToken();
    if (this.userId == undefined) {
      this.userId = decodedToken.id;
    }
    this.productService
      .getCartProductsBySellerId(this.userId!)
      .subscribe((data) => this.productService.cart.next(data));

    this.productService.cart.subscribe((data) => (this.products = data));
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let ids: number[] = [];
        this.selectedProducts?.forEach((x) => ids.push(x.id!));
        this.productService.deleteCartProducts(ids).subscribe(() => {
          this.productService.addMultipleProductsSubject(
            this.selectedProducts!
          );

          this.products = this.products.filter(
            (val) => !this.selectedProducts!.includes(val)
          );
          this.productService.cart.next(this.products);
          this.selectedProducts = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Products Deleted',
            life: 3000,
          });
        });
      },
    });
  }

  deleteProduct(product: CartProduct) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.product!.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteCartProduct(product.id!).subscribe(() => {
          this.productService.addProductsSubject(product);

          this.products = this.products.filter((val) => val.id !== product.id);
          this.productService.cart.next(this.products);

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Deleted',
            life: 3000,
          });
        });
      },
    });
  }

  updateCartProduct(product: CartProduct, quantity: number) {
    if (quantity != null && quantity! > 0) {
      this.productService
        .updateCartProduct(product, this.userId!, quantity)
        .subscribe(() => {
          this.productService.updateProductsSubject(product, quantity);
          let step = quantity - product.quantity!;
          product.quantity = quantity;
          product.product!.quantity! -= step;
        });
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  customSort(event: SortEvent) {
    event.data!.sort((data1, data2) => {
      var value1;
      var value2;

      if (event.field == 'sum') {
        value1 = data1['product']['price'] * data1['quantity'];
        value2 = data2['product']['price'] * data2['quantity'];
      } else {
        let fields = event.field?.split('.');

        value1 = data1[fields![0]];
        value2 = data2[fields![0]];

        for (let i = 1; i < fields!.length; i++) {
          value1 = value1[fields![i]];
          value2 = value2[fields![i]];
        }
      }

      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1!.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order! * result;
    });
  }
}
