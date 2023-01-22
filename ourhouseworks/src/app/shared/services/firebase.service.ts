import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { House } from '../models/house';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(public firebaseAuth: AngularFireAuth, private afs: AngularFirestore) {

   }
  async signin(email: string, password: string) {
    await this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then(res => {
        sessionStorage.setItem("user", JSON.stringify(res.user))

      })
  }
  async signup(email: string, password: string, person: any) {
    await this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then(res => {
        sessionStorage.setItem("user", JSON.stringify(res.user))
        console.log(person)
        this.afs.collection('house').add({
          email: email,
          person: person
        });
      })
  }
}
