import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { MainComponent } from './views/pages/main/main.component';
import { ProfilesComponent } from './views/pages/profiles/profiles.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { SidenavComponent } from './shared/component/sidenav/sidenav.component';
import { RecipesComponent } from './views/pages/recipes/recipes.component';
import { RecipeDetailsComponent } from './shared/component/recipe-details/recipe-details.component';
import { FridgeComponent } from './views/pages/fridge/fridge.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'main', component: MainComponent , canActivate: [AuthGuard]},
  { path: 'profile', component: ProfilesComponent , canActivate: [AuthGuard]},
  { path: 'fridge', component: FridgeComponent , canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recipe', component: RecipesComponent },
  { path: 'recipe/:name', component: RecipeDetailsComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
