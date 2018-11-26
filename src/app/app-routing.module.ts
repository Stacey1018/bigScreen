import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/index';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/panel', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: 'app/core#CoreModule',
    // canActivate: [AuthGuardService]
  },
  {
    path: 'iframe',
    loadChildren: 'app/layout-iframe#LayoutIframeModule',
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true, useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
