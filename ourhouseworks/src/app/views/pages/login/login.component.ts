import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { NavbarService } from 'src/app/shared/services/navbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  public signUpForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  })
  constructor(public firebaseService : FirebaseService, private router: Router) {  }

  async onSignin(email:string,password:string){
    await this.firebaseService.signin(email, password)
    .then(() => {
      sessionStorage.setItem('token',JSON.stringify(email));
      sessionStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(["/main"]);
    }).catch((error) => {
      switch (error.code) {
        case "auth/invalid-email":
        case "auth/wrong-password":
        case "auth/user-not-found":
        {
           alert("Nem megfelelő jelszó vagy e-mail");
           break;
        }
           default:
        {
            alert("Váratlan hiba törlént!");
            break;
        }
      }
    });
  }
  
  ngOnInit(): void {
  }

}
