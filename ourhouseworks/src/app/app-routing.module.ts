import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { MainComponent } from './views/pages/main/main.component';
import { AuthGuard } from './shared/auth/auth.guard';

const routes: Routes = [
  {path:"", component: LoginComponent},
  {path:"home", component:LoginComponent},
  {path: "register", component:RegisterComponent},
  {path: "main", component:MainComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
