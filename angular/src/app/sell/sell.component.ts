import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product } from '../_interfaces/product';
import { ProductService } from '../_services/product.service';
import { TokenService } from '../_services/token.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./sell.component.css'],
})
export class SellComponent implements OnInit {
  @Input() userId?: number;

  productDialog!: boolean;

  products: Product[] = [];

  product!: Product;

  selectedProducts!: Product[] | null;

  submitted!: boolean;

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
      .getProductsBySellerId(this.userId!)
      .subscribe((data: Product[]) => (this.products = data));
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let ids: number[] = [];
        this.selectedProducts?.forEach((x) => ids.push(x.id!));
        this.productService.deleteProducts(ids).subscribe(() => {
          this.products = this.products.filter(
            (val) => !this.selectedProducts!.includes(val)
          );
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

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(product.id!).subscribe(() => {
          this.products = this.products.filter((val) => val.id !== product.id);
          this.product = {};
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

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;
    if (
      this.product.name!.trim() &&
      this.product.price &&
      this.product.quantity! >= 0
    ) {
      if (this.product.id) {
        let product = this.product;
        this.productService
          .updateProduct(this.userId!, this.product)
          .subscribe(() => {
            this.products[this.findIndexById(product.id!)] = product;
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Product Updated',
              life: 3000,
            });
          });
      } else {
        this.productService
          .postProduct(this.userId!, this.product)
          .subscribe((product) => {
            this.products.push(product);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Product Created',
              life: 3000,
            });
          });
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
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
}
