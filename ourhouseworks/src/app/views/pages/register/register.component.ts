import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from 'src/app/shared/services/firebase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private asf: AngularFirestore, public firebaseService : FirebaseService) { }
  async onSignup(email:string,password:string, person:any){
    await this.firebaseService.signup(email,password, person)
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
