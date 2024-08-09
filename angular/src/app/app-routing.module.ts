import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { BuyComponent } from './buy/buy.component';
import { LoginComponent } from './login/login.component';
import { SellComponent } from './sell/sell.component';
import { AdminGuard } from './_guards/admin.guard';
import { AuthGuard } from './_guards/auth-guard.guard';
import { BuyerGuard } from './_guards/buyer.guard';
import { OnlyLoggedOffUsersGuard } from './_guards/only-logged-off-users.guard';
import { SellerGuard } from './_guards/seller.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [OnlyLoggedOffUsersGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'buy',
    component: BuyComponent,
    canActivate: [AuthGuard, BuyerGuard],
  },
  {
    path: 'sell',
    component: SellComponent,
    canActivate: [AuthGuard, SellerGuard],
  },
 
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
