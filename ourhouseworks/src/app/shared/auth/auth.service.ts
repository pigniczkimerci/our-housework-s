import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }
  isAuthenticated() {
    return !!sessionStorage.getItem("token")
  }

  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user) // Converts user to a boolean value
    );
  }
}
