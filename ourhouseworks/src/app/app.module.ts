import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { FullCalendarModule } from '@fullcalendar/angular';

import { ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './views/pages/login/login.component';

import { FirebaseService } from './shared/services/firebase.service';
import { environment } from 'src/environments/environment';
import { RegisterComponent } from './views/pages/register/register.component';
import { MainComponent } from './views/pages/main/main.component';
import { SidenavComponent } from './shared/component/sidenav/sidenav.component';
import { ProfilesComponent } from './views/pages/profiles/profiles.component';
import { RecipesComponent } from './views/pages/recipes/recipes.component';
import { RecipeDetailsComponent } from './shared/component/recipe-details/recipe-details.component';
import { FridgeComponent } from './views/pages/fridge/fridge.component';
import { CalendarComponent } from './views/pages/calendar/calendar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
    SidenavComponent,
    ProfilesComponent,
    RecipesComponent,
    RecipeDetailsComponent,
    FridgeComponent,
    CalendarComponent
  ],
  imports: [
    BrowserModule,

    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule,
    MatListModule,
    FullCalendarModule,
    
    FormsModule,
    ReactiveFormsModule,

    AppRoutingModule,
    AngularFireModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
