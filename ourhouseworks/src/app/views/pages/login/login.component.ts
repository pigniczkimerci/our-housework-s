import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
  constructor(private asf: AngularFirestore, public firebaseService : FirebaseService) {

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
  
  ngOnInit(): void {
  }

}
