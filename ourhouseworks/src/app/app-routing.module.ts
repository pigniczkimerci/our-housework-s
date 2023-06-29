import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { MainComponent } from './views/pages/main/main.component';
import { ProfilesComponent } from './views/pages/profiles/profiles.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { SidenavComponent } from './shared/component/sidenav/sidenav.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'main', component: MainComponent , canActivate: [AuthGuard]},
  { path: 'profile', component: ProfilesComponent , canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
