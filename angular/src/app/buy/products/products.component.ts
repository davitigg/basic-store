import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TokenService } from 'src/app/_services/token.service';
import { Product } from '../../_interfaces/product';
import { ProductService } from '../../_services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  @Input() userId?: number;

  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    const decodedToken = this.tokenService.getDecodedToken();
    if (this.userId == undefined) {
      this.userId = decodedToken.id;
    }

      this.productService
        .getProducts()
        .subscribe((data) => this.productService.products.next(data));

    this.productService.products.subscribe((data) => (this.products = data));
  }

  addProductToCart(product: Product) {
    this.productService.postCartProduct(this.userId!, product).subscribe({
      next: (p) => {
        this.productService.updateCartSubject(p);

        product.quantity! -= 1;
        this.products[this.findIndexById(product.id!)] = product;
        this.productService.products.next(this.products);

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Added to Cart',
          life: 1000,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: err.error,
          life: 1000,
        });
      },
    });
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
