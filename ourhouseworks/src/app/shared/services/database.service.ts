import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Person } from '../models/person';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: AngularFirestore,private auth: AngularFireAuth) { }

  addTaskToFirestore(taskName: string, date: any, selectedMember: Person): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && taskName) {
          const task = { taskName: taskName, date: date, resperson: selectedMember };
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
                  .collection('task')
                  .add(task)
                  .then(() => {
                    console.log('Task added successfully to Firestore.');
                    resolve();
                  })
                  .catch((error) => {
                    console.error('Error adding task to Firestore: ', error);
                    reject(error);
                  });
              } else {
                console.log('House not found for the user.');
                reject('House not found for the user.');
              }
            })
            .catch((error) => {
              console.error('Error retrieving house from Firestore: ', error);
              reject(error);
            });
        }
      });
    });
  }

  addPersonToFirestore(personName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.currentUser.then((user) => {
        if (user && personName) {
          const person = { personName: personName };
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
                  .add(person)
                  .then(() => {
                    console.log('Person added successfully to Firestore.');
                    resolve();
                  })
                  .catch((error) => {
                    console.error('Error adding person to Firestore: ', error);
                    reject(error);
                  });
              } else {
                console.log('House not found for the user.');
                reject('House not found for the user.');
              }
            })
            .catch((error) => {
              console.error('Error retrieving person from Firestore: ', error);
              reject(error);
            });
        }
      });
    });
  }
}
