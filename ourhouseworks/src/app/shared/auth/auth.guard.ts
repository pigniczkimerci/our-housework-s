import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { } 

  canActivate( next: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise((resolve, reject) => {
      const app = initializeApp(environment.firebase);
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(true);
        } else {
          window.alert("Please sign in")
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}