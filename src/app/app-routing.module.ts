import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component'; //

// const routes: Routes = [
//   { path: '', component: LandingPageComponent } // 
// ];


const routes: Routes = [
  { path: '', component: LandingPageComponent },              // Load without changing URL
  { path: ':lang', component: LandingPageComponent } ,
  { path: 'payment-status', component: LandingPageComponent },        // Accept /en, /hi etc.
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
