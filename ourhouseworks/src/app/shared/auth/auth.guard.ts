import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { getAuth, onAuthStateChanged } from "firebase/auth";
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { } 

  /*canActivate() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if(isLoggedIn === 'true'){
      return true;
    }else{
      alert("Please sign in!")
      return false;
    }
  }*/
  canActivate( next: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log(user);
          resolve(true);
        } else {
          window.alert("Please sign in")
          console.log('User is not logged in');
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
  
}