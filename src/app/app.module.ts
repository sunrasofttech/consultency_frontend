import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AppRoutingModule } from './app-routing.module'; // ✅ Import Routing Module
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- ✅ Import this

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // ✅ Ensure AppRoutingModule is here
    FormsModule ,
    HttpClientModule  // <-- Add HttpClientModule here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
