import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { FirebaseService } from 'src/app/shared/services/firebase.service';

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
  constructor(public firebaseService : FirebaseService) {

  }
  async onSignin(email:string,password:string){
    await this.firebaseService.signin(email, password)
    .then(() => {
      sessionStorage.setItem('token',JSON.stringify(email));
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
  async onSignup(email:string,password:string){
    await this.firebaseService.signup(email,password)
    .then(() => {
      sessionStorage.setItem('token',JSON.stringify(email));
    }).catch((error) => {
      switch (error.code) {
        case "auth/email-already-exists":
        {
            alert("E-mail cím már foglalt!");
            break;
        }
        case "auth/invalid-password":
        {
           alert("Nem megfelelő jelszó: legalább 6 karakter.");
           break;
        }
           default:
        {
            alert("Email cím már foglalt, vagy nem megfelelő jelszó!");
            break;
        }
      }
    });
  }
  ngOnInit(): void {
  }

}
