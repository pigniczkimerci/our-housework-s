import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Person } from 'src/app/shared/models/person';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent {
  personName!: string;
  //TODO any
  people: Observable<Person[]> | undefined;
  peopleSource!: Person[];
  constructor( private firestore: AngularFirestore, private auth: AngularFireAuth) {  }
  
  ngOnInit(): void {
    this.people = this.firestore.collectionGroup('people').valueChanges() as Observable<Person[]>;
    this.people.subscribe((data) => {
      this.peopleSource = data;
    });
  }

  createPerson() {
    this.auth.currentUser.then((user) => {
      if (user && this.personName) {
        const task = {name: this.personName};
        console.log(this.peopleSource);
        this.firestore
          .collection('house', (ref) => ref.where('email', '==', user.email))
          .get()
          .toPromise()
          .then((querySnapshot) => {
            if (!querySnapshot!.empty) {
              const houseId = querySnapshot!.docs[0].id;
              this.firestore
                .collection('house')
                .doc(houseId)
                .collection('people')
                .add(task)
                .then(() => {
                  console.log('Person added successfully to Firestore.');
                })
                .catch((error) => {
                  console.error('Error adding person to Firestore: ', error);
                });
            } else {
              console.log('House not found for the user.');
            }
          })
          .catch((error) => {
            console.error('Error retrieving person from Firestore: ', error);
          });
      }
    });
  }
}
